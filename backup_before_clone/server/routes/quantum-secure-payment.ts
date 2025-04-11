import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertPaymentSchema } from '@shared/schema';
import { stripeService } from '../services/stripe';
import { openSourcePaymentService } from '../services/openSourcePayment';
import { quantumSecurePaymentService } from '../services/quantumSecurePayment';

// Schema for quantum secure payment request
const quantumPaymentSchema = z.object({
  // Accept amount as string or number, will be converted to number later
  amount: z.union([z.string(), z.number()]),
  currency: z.string(),
  description: z.string().optional(),
  securityLevel: z.enum(['standard', 'enhanced', 'quantum']).default('quantum'),
  walletId: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  paymentDetails: z.record(z.any()).optional(),
});

export function registerQuantumSecurePaymentRoutes(app: Express) {
  // Process a quantum-secured payment through Stripe
  app.post('/api/payments/quantum-secure/stripe', async (req: Request, res: Response) => {
    try {
      const paymentData = quantumPaymentSchema.parse(req.body);
      const userId = 1; // For demo purposes, ideally this would come from auth
      
      // First, create a regular payment intent with Stripe
      const amountAsNumber = typeof paymentData.amount === 'string' 
        ? parseFloat(paymentData.amount) 
        : paymentData.amount;
        
      const stripeIntent = await stripeService.createPaymentIntent(
        amountAsNumber, // Amount as number
        paymentData.currency,
        paymentData.description || 'Quantum secured payment',
        userId,
        paymentData.walletId || undefined,
        paymentData.metadata || {}
      );
      
      if (!stripeIntent || !stripeIntent.paymentIntentId) {
        return res.status(500).json({ message: 'Failed to create Stripe payment intent' });
      }
      
      // Apply quantum security enhancement
      const securedPayment = await quantumSecurePaymentService.secureStripePayment(
        stripeIntent.paymentIntentId,
        paymentData.securityLevel,
        paymentData
      );
      
      // Return the enhanced payment information
      res.status(200).json({
        success: true,
        message: 'Quantum secured payment intent created',
        paymentIntentId: stripeIntent.paymentIntentId,
        clientSecret: stripeIntent.clientSecret, // Fix property name
        amount: paymentData.amount,
        currency: paymentData.currency,
        securityLevel: paymentData.securityLevel,
        quantumSecured: true,
        temporalEntanglementId: securedPayment.temporalEntanglementId,
        payment: securedPayment.payment,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid payment data', errors: error.errors });
      }
      console.error('Error processing quantum secure Stripe payment:', error);
      res.status(500).json({ 
        message: 'Failed to process quantum secure payment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Process a quantum-secured payment through open source payment methods
  app.post('/api/payments/quantum-secure/open-source', async (req: Request, res: Response) => {
    try {
      const paymentData = quantumPaymentSchema.parse(req.body);
      const userId = 1; // For demo purposes
      
      // Process open source payment
      const amountAsNumber = typeof paymentData.amount === 'string' 
        ? parseFloat(paymentData.amount) 
        : paymentData.amount;
        
      const openSourcePayment = await openSourcePaymentService.processPayment(
        amountAsNumber, // Amount as number
        paymentData.currency,
        paymentData.description || 'Quantum secured open source payment',
        userId,
        paymentData.walletId || undefined,
        paymentData.metadata || {}
      );
      
      if (!openSourcePayment || !openSourcePayment.id) {
        return res.status(500).json({ message: 'Failed to process open source payment' });
      }
      
      // Apply quantum security enhancement
      const securedPayment = await quantumSecurePaymentService.secureOpenSourcePayment(
        openSourcePayment.id,
        paymentData.securityLevel,
        paymentData
      );
      
      // Return the enhanced payment information
      res.status(200).json({
        success: true,
        message: 'Quantum secured open source payment processed',
        transactionId: openSourcePayment.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        securityLevel: paymentData.securityLevel,
        quantumSecured: true,
        temporalEntanglementId: securedPayment.temporalEntanglementId,
        payment: securedPayment.payment,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid payment data', errors: error.errors });
      }
      console.error('Error processing quantum secure open source payment:', error);
      res.status(500).json({ 
        message: 'Failed to process quantum secure open source payment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Verify a quantum-secured payment
  app.get('/api/payments/quantum-secure/verify/:paymentId', async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.paymentId;
      
      if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required' });
      }
      
      // Verify the quantum security of the payment
      const verificationResult = await quantumSecurePaymentService.verifyPaymentSecurity(paymentId);
      
      res.status(200).json({
        valid: verificationResult.valid,
        securityLevel: verificationResult.securityLevel,
        message: verificationResult.message,
        details: verificationResult.details,
      });
    } catch (error) {
      console.error('Error verifying quantum secure payment:', error);
      res.status(500).json({ 
        message: 'Failed to verify quantum secure payment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}