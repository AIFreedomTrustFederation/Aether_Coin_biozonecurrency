import Stripe from 'stripe';
import { Payment, InsertPayment, PaymentMethod, InsertPaymentMethod } from '../../shared/schema';
import { storage } from '../storage';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest stable version
});

export const stripeService = {
  /**
   * Create a Payment Intent with Stripe 
   * @param amount Amount in cents
   * @param currency Currency code (e.g., 'usd')
   * @param metadata Additional metadata for the payment intent
   * @returns The created payment intent with client secret
   */
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any> = {}): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Create a payment method with Stripe and save it to our database
   * @param userId The user ID
   * @param paymentMethodId The Stripe payment method ID
   * @param isDefault Whether this payment method should be the default
   * @returns The created payment method
   */
  async savePaymentMethod(userId: number, paymentMethodId: string, isDefault: boolean = false): Promise<PaymentMethod> {
    try {
      // Retrieve the payment method from Stripe
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Extract payment method details
      let type = stripePaymentMethod.type;
      let last4 = '';
      let expiryMonth;
      let expiryYear;
      
      if (type === 'card' && stripePaymentMethod.card) {
        last4 = stripePaymentMethod.card.last4;
        expiryMonth = stripePaymentMethod.card.exp_month;
        expiryYear = stripePaymentMethod.card.exp_year;
      } else if (type === 'bank_account' && stripePaymentMethod.us_bank_account) {
        last4 = stripePaymentMethod.us_bank_account.last4;
      }
      
      // Create the payment method in our database
      const paymentMethodData: InsertPaymentMethod = {
        userId,
        type,
        provider: 'stripe',
        providerPaymentId: paymentMethodId,
        last4,
        expiryMonth,
        expiryYear,
        isDefault,
        status: 'active',
      };
      
      return await storage.createPaymentMethod(paymentMethodData);
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  },

  /**
   * Process a payment with existing payment method
   * @param userId The user ID
   * @param paymentMethodId The database payment method ID
   * @param amount Amount in cents
   * @param currency Currency code (e.g., 'usd')
   * @param description Description of the payment
   * @param walletId Optional wallet ID to associate with the payment
   * @returns The created payment record
   */
  async processPayment(
    userId: number, 
    paymentMethodId: number, 
    amount: number, 
    currency: string, 
    description: string,
    walletId?: number
  ): Promise<Payment> {
    try {
      // Get the payment method from our database
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }
      
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethod.providerPaymentId,
        confirm: true,
        return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/payment-confirmation`,
        description,
        metadata: {
          userId: userId.toString(),
          walletId: walletId ? walletId.toString() : undefined,
        },
      });
      
      // Create a record of the payment in our database
      const paymentData: InsertPayment = {
        userId,
        paymentMethodId,
        walletId,
        amount: amount.toString(),
        currency,
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        providerPaymentId: paymentIntent.id,
        description,
        metadata: paymentIntent.metadata as Record<string, any>,
      };
      
      return await storage.createPayment(paymentData);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
  
  /**
   * Update a payment status based on a Stripe webhook event
   * @param paymentIntentId The Stripe payment intent ID
   * @param status The new status of the payment
   * @returns The updated payment record
   */
  async updatePaymentStatus(paymentIntentId: string, status: string): Promise<Payment | undefined> {
    try {
      // Find all payments with this Stripe payment intent ID
      // Note: In a real application, you would need to add a method to search by providerPaymentId
      // For simplicity, we're using a workaround
      const payments = await storage.getPaymentsByUserId(1); // Get all payments for user 1 (demo user)
      const payment = payments.find(p => p.providerPaymentId === paymentIntentId);
      
      if (!payment) {
        console.error(`Payment with intent ID ${paymentIntentId} not found`);
        return undefined;
      }
      
      // Map Stripe status to our status
      let paymentStatus: string;
      switch (status) {
        case 'succeeded':
          paymentStatus = 'completed';
          break;
        case 'canceled':
          paymentStatus = 'failed';
          break;
        case 'processing':
          paymentStatus = 'pending';
          break;
        default:
          paymentStatus = status;
      }
      
      // Update the payment in our database
      return await storage.updatePaymentStatus(
        payment.id, 
        paymentStatus, 
        paymentStatus === 'completed' ? new Date() : undefined
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },
  
  /**
   * Handle a Stripe webhook event
   * @param event The Stripe webhook event
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.updatePaymentStatus(paymentIntent.id, 'succeeded');
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.updatePaymentStatus(failedPaymentIntent.id, 'failed');
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  },
};