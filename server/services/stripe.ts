import Stripe from 'stripe';
import { Payment, InsertPayment } from '../../shared/schema';
import { storage } from '../storage';

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

try {
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey);
    console.log('Stripe initialized successfully');
  } else {
    console.warn('Stripe secret key not provided, Stripe functionality will be disabled');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

export const stripeService = {
  /**
   * Create a payment intent with Stripe
   * 
   * @param userId The user ID
   * @param amount Amount in cents
   * @param currency Currency code (e.g., 'usd')
   * @param description Description of the payment
   * @param metadata Additional metadata for the payment
   * @param walletId Optional wallet ID to associate with the payment
   * @returns The payment intent client secret or an error
   */
  async createPaymentIntent(
    userId: number,
    amount: number,
    currency: string,
    description: string,
    metadata: Record<string, any> = {},
    walletId?: number
  ): Promise<{ clientSecret: string, paymentIntentId: string }> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }
      
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        description,
        metadata: {
          ...metadata,
          userId: userId.toString(),
          walletId: walletId ? walletId.toString() : null,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      if (!paymentIntent || !paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent');
      }
      
      // Create a pending payment record in our database
      const paymentData: InsertPayment = {
        userId,
        amount: amount.toString(),
        currency,
        status: 'pending',
        provider: 'stripe',
        providerPaymentId: paymentIntent.id,
        description,
        metadata: {
          ...metadata,
          processor: 'stripe',
          userId: userId.toString(),
          walletId: walletId ? walletId.toString() : null,
        },
        walletId,
      };
      
      await storage.createPayment(paymentData);
      
      return { 
        clientSecret: paymentIntent.client_secret, 
        paymentIntentId: paymentIntent.id 
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  },
  
  /**
   * Handle a Stripe webhook event
   * This is used to update payment status in our database when Stripe sends webhook events
   * 
   * @param payload The raw request body from Stripe
   * @param signature The Stripe signature header
   * @returns The updated payment or null
   */
  async handleWebhookEvent(payload: string, signature: string): Promise<Payment | null> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }
      
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }
      
      // Verify the event came from Stripe
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      // Handle specific event types
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update our payment record
        const payment = await updatePaymentStatus(paymentIntent.id, 'completed');
        return payment;
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update our payment record
        const payment = await updatePaymentStatus(paymentIntent.id, 'failed');
        return payment;
      }
      
      return null;
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  },
  
  /**
   * Check the status of a payment intent
   * 
   * @param paymentIntentId The Stripe payment intent ID
   * @returns The payment status ('succeeded', 'processing', 'requires_payment_method', etc.)
   */
  async checkPaymentStatus(paymentIntentId: string): Promise<string> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // If the payment is succeeded, update our database
      if (paymentIntent.status === 'succeeded') {
        await updatePaymentStatus(paymentIntentId, 'completed');
      } else if (paymentIntent.status === 'requires_payment_method') {
        await updatePaymentStatus(paymentIntentId, 'failed');
      }
      
      return paymentIntent.status;
    } catch (error) {
      console.error('Error checking Stripe payment status:', error);
      throw error;
    }
  },
  
  /**
   * Save a payment method for a user
   * 
   * @param userId The user ID
   * @param stripePaymentMethodId The Stripe payment method ID
   * @param isDefault Whether this is the default payment method
   * @returns The saved payment method
   */
  async savePaymentMethod(
    userId: number,
    stripePaymentMethodId: string,
    isDefault: boolean = false
  ) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }
      
      // Retrieve the payment method from Stripe to get details
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);
      
      // Extract card details if it's a card
      const cardDetails = stripePaymentMethod.type === 'card' && stripePaymentMethod.card 
        ? {
            last4: stripePaymentMethod.card.last4,
            brand: stripePaymentMethod.card.brand,
            expMonth: stripePaymentMethod.card.exp_month,
            expYear: stripePaymentMethod.card.exp_year
          }
        : {};
      
      // Save to our database
      const paymentMethod = await storage.createPaymentMethod({
        userId,
        type: stripePaymentMethod.type,
        provider: 'stripe',
        providerPaymentId: stripePaymentMethodId,
        isDefault,
        details: {
          ...cardDetails,
          billingDetails: stripePaymentMethod.billing_details
        }
      });
      
      // If this is set as default, update other payment methods to not be default
      if (isDefault) {
        const userPaymentMethods = await storage.getPaymentMethodsByUserId(userId);
        for (const method of userPaymentMethods) {
          if (method.id !== paymentMethod.id && method.isDefault) {
            await storage.updatePaymentMethodDefault(method.id, false);
          }
        }
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error saving Stripe payment method:', error);
      throw error;
    }
  },
};

/**
 * Helper function to update payment status in our database
 */
async function updatePaymentStatus(
  providerPaymentId: string,
  status: string
): Promise<Payment | null> {
  try {
    // Find the payment by provider payment ID
    const payments = await storage.getPaymentsByProviderPaymentId(providerPaymentId);
    if (!payments || payments.length === 0) {
      return null;
    }
    
    const payment = payments[0];
    
    // Update the status
    const updatedPayment = await storage.updatePaymentStatus(
      payment.id,
      status,
      status === 'completed' || status === 'failed' ? new Date() : undefined
    );
    
    // If payment is completed and has a wallet ID, update wallet balance
    if (status === 'completed' && payment.walletId) {
      const wallet = await storage.getWallet(payment.walletId);
      if (wallet) {
        const amount = parseFloat(payment.amount);
        const currentBalance = parseFloat(wallet.balance);
        const newBalance = currentBalance + (amount / 100); // amount is in cents
        await storage.updateWalletBalance(payment.walletId, newBalance.toString());
      }
    }
    
    return updatedPayment || null;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return null;
  }
}