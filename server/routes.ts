import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWalletSchema, insertTransactionSchema, insertSmartContractSchema, insertAiMonitoringLogSchema, insertCidEntrySchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
