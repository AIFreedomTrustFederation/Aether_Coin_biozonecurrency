"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerQuantumSecurePaymentRoutes = registerQuantumSecurePaymentRoutes;
const zod_1 = require("zod");
const stripe_1 = require("../services/stripe");
const openSourcePayment_1 = require("../services/openSourcePayment");
const quantumSecurePayment_1 = require("../services/quantumSecurePayment");
// Schema for quantum secure payment request
const quantumPaymentSchema = zod_1.z.object({
    // Accept amount as string or number, will be converted to number later
    amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    currency: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    securityLevel: zod_1.z.enum(['standard', 'enhanced', 'quantum']).default('quantum'),
    walletId: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    paymentDetails: zod_1.z.record(zod_1.z.any()).optional(),
});
function registerQuantumSecurePaymentRoutes(app) {
    // Process a quantum-secured payment through Stripe
    app.post('/api/payments/quantum-secure/stripe', async (req, res) => {
        try {
            const paymentData = quantumPaymentSchema.parse(req.body);
            const userId = 1; // For demo purposes, ideally this would come from auth
            // First, create a regular payment intent with Stripe
            const amountAsNumber = typeof paymentData.amount === 'string'
                ? parseFloat(paymentData.amount)
                : paymentData.amount;
            const stripeIntent = await stripe_1.stripeService.createPaymentIntent(amountAsNumber, // Amount as number
            paymentData.currency, paymentData.description || 'Quantum secured payment', userId, paymentData.walletId || undefined, paymentData.metadata || {});
            if (!stripeIntent || !stripeIntent.paymentIntentId) {
                return res.status(500).json({ message: 'Failed to create Stripe payment intent' });
            }
            // Apply quantum security enhancement
            const securedPayment = await quantumSecurePayment_1.quantumSecurePaymentService.secureStripePayment(stripeIntent.paymentIntentId, paymentData.securityLevel, paymentData);
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    app.post('/api/payments/quantum-secure/open-source', async (req, res) => {
        try {
            const paymentData = quantumPaymentSchema.parse(req.body);
            const userId = 1; // For demo purposes
            // Process open source payment
            const amountAsNumber = typeof paymentData.amount === 'string'
                ? parseFloat(paymentData.amount)
                : paymentData.amount;
            const openSourcePayment = await openSourcePayment_1.openSourcePaymentService.processPayment(amountAsNumber, // Amount as number
            paymentData.currency, paymentData.description || 'Quantum secured open source payment', userId, paymentData.walletId || undefined, paymentData.metadata || {});
            if (!openSourcePayment || !openSourcePayment.id) {
                return res.status(500).json({ message: 'Failed to process open source payment' });
            }
            // Apply quantum security enhancement
            const securedPayment = await quantumSecurePayment_1.quantumSecurePaymentService.secureOpenSourcePayment(openSourcePayment.id, paymentData.securityLevel, paymentData);
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    app.get('/api/payments/quantum-secure/verify/:paymentId', async (req, res) => {
        try {
            const paymentId = req.params.paymentId;
            if (!paymentId) {
                return res.status(400).json({ message: 'Payment ID is required' });
            }
            // Verify the quantum security of the payment
            const verificationResult = await quantumSecurePayment_1.quantumSecurePaymentService.verifyPaymentSecurity(paymentId);
            res.status(200).json({
                valid: verificationResult.valid,
                securityLevel: verificationResult.securityLevel,
                message: verificationResult.message,
                details: verificationResult.details,
            });
        }
        catch (error) {
            console.error('Error verifying quantum secure payment:', error);
            res.status(500).json({
                message: 'Failed to verify quantum secure payment',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
