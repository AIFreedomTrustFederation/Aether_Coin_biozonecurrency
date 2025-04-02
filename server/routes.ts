import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWalletSchema, 
  insertTransactionSchema, 
  insertSmartContractSchema, 
  insertAiMonitoringLogSchema, 
  insertCidEntrySchema,
  insertPaymentMethodSchema,
  insertPaymentSchema 
} from "@shared/schema";
import { stripeService } from "./services/stripe";
import { z } from "zod";
import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Use the latest stable version
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get user wallets
  app.get("/api/wallets", async (req, res) => {
    try {
      // For demo purposes, use userId 1
      const userId = 1;
      const wallets = await storage.getWalletsByUserId(userId);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  // Get recent transactions
  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const userId = 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const transactions = await storage.getRecentTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get transactions by wallet ID
  app.get("/api/wallets/:walletId/transactions", async (req, res) => {
    try {
      const walletId = parseInt(req.params.walletId);
      if (isNaN(walletId)) {
        return res.status(400).json({ message: "Invalid wallet ID" });
      }
      
      const transactions = await storage.getTransactionsByWalletId(walletId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  // Create a new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Get smart contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      const userId = 1;
      const contracts = await storage.getSmartContractsByUserId(userId);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch smart contracts" });
    }
  });

  // Create a new smart contract
  app.post("/api/contracts", async (req, res) => {
    try {
      const contractData = insertSmartContractSchema.parse(req.body);
      const contract = await storage.createSmartContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create smart contract" });
    }
  });

  // Update smart contract status
  app.patch("/api/contracts/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedContract = await storage.updateSmartContractStatus(id, status);
      
      if (!updatedContract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      res.json(updatedContract);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contract status" });
    }
  });

  // Get AI monitoring logs
  app.get("/api/ai/logs", async (req, res) => {
    try {
      const userId = 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getAiMonitoringLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI monitoring logs" });
    }
  });

  // Create a new AI monitoring log
  app.post("/api/ai/logs", async (req, res) => {
    try {
      const logData = insertAiMonitoringLogSchema.parse(req.body);
      const log = await storage.createAiMonitoringLog(logData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create AI monitoring log" });
    }
  });

  // Get CID entries
  app.get("/api/cids", async (req, res) => {
    try {
      const userId = 1;
      const entries = await storage.getCidEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CID entries" });
    }
  });

  // Create a new CID entry
  app.post("/api/cids", async (req, res) => {
    try {
      const entryData = insertCidEntrySchema.parse(req.body);
      const entry = await storage.createCidEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid CID entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CID entry" });
    }
  });

  // Update CID entry status
  app.patch("/api/cids/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid CID entry ID" });
      }
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedEntry = await storage.updateCidEntryStatus(id, status);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "CID entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update CID entry status" });
    }
  });

  // Payment routes
  
  // Get payment methods for a user
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const userId = 1; // For demo purposes
      const paymentMethods = await storage.getPaymentMethodsByUserId(userId);
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });
  
  // Create a new payment method
  app.post("/api/payment-methods", async (req, res) => {
    try {
      const { stripePaymentMethodId, isDefault } = req.body;
      
      if (!stripePaymentMethodId || typeof stripePaymentMethodId !== 'string') {
        return res.status(400).json({ message: "Invalid payment method ID" });
      }
      
      const userId = 1; // For demo purposes
      const paymentMethod = await stripeService.savePaymentMethod(
        userId, 
        stripePaymentMethodId, 
        isDefault === true
      );
      
      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create payment method",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update a payment method (set as default)
  app.patch("/api/payment-methods/:id/default", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isDefault } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment method ID" });
      }
      
      if (typeof isDefault !== 'boolean') {
        return res.status(400).json({ message: "isDefault must be a boolean" });
      }
      
      const updatedMethod = await storage.updatePaymentMethodDefault(id, isDefault);
      
      if (!updatedMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      res.json(updatedMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });
  
  // Delete a payment method
  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment method ID" });
      }
      
      const success = await storage.deletePaymentMethod(id);
      
      if (!success) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });
  
  // Get payments for a user
  app.get("/api/payments", async (req, res) => {
    try {
      const userId = 1; // For demo purposes
      const payments = await storage.getPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  
  // Create a payment intent
  app.post("/api/payments/intent", async (req, res) => {
    try {
      const { amount, currency, metadata } = req.body;
      
      if (!amount || isNaN(parseInt(amount))) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      if (!currency || typeof currency !== 'string') {
        return res.status(400).json({ message: "Invalid currency" });
      }
      
      const paymentIntent = await stripeService.createPaymentIntent(
        parseInt(amount), 
        currency,
        metadata || {}
      );
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create payment intent",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Process a payment
  app.post("/api/payments/process", async (req, res) => {
    try {
      const { paymentMethodId, amount, currency, description, walletId } = req.body;
      
      if (!paymentMethodId || isNaN(parseInt(paymentMethodId))) {
        return res.status(400).json({ message: "Invalid payment method ID" });
      }
      
      if (!amount || isNaN(parseInt(amount))) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      if (!currency || typeof currency !== 'string') {
        return res.status(400).json({ message: "Invalid currency" });
      }
      
      if (!description || typeof description !== 'string') {
        return res.status(400).json({ message: "Invalid description" });
      }
      
      const userId = 1; // For demo purposes
      
      const payment = await stripeService.processPayment(
        userId,
        parseInt(paymentMethodId),
        parseInt(amount),
        currency,
        description,
        walletId ? parseInt(walletId) : undefined
      );
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process payment",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Handle Stripe webhook events
  app.post("/api/webhooks/stripe", async (req, res) => {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ message: "Missing Stripe signature" });
    }
    
    try {
      // Raw body needed for webhook signature verification
      const rawBody = (req as any).rawBody;
      
      if (!rawBody) {
        return res.status(400).json({ message: "Missing request body" });
      }
      
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
      
      await stripeService.handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ 
        message: "Webhook error",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
