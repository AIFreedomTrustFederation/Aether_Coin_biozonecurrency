/**
 * Storage interface for the server.
 * This module provides a unified interface for interacting with the database.
 */

import dotenv from 'dotenv';
import { 
  User, InsertUser,
  LlmPrompt, InsertLlmPrompt,
  LlmConversation, InsertLlmConversation,
  LlmMessage, InsertLlmMessage,
  LlmFineTuningJob, InsertLlmFineTuningJob,
  SacredPatternRecord, InsertSacredPatternRecord
} from '../shared/schema-proxy';

// Import the storage instance from fixed-storage.ts
// This allows us to maintain backwards compatibility
import { storage } from './fixed-storage';

// Re-export the storage instance
export { storage };

// Export the interfaces for the storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // LLM Prompt methods
  getLlmPrompt(id: number): Promise<LlmPrompt | undefined>;
  getLlmPromptsByCategory(category: string): Promise<LlmPrompt[]>;
  createLlmPrompt(prompt: InsertLlmPrompt): Promise<LlmPrompt>;
  updateLlmPrompt(id: number, prompt: Partial<InsertLlmPrompt>): Promise<LlmPrompt | undefined>;
  
  // LLM Conversation methods
  getLlmConversation(id: number): Promise<LlmConversation | undefined>;
  getLlmConversationsByUserId(userId: number): Promise<LlmConversation[]>;
  createLlmConversation(conversation: InsertLlmConversation): Promise<LlmConversation>;
  updateLlmConversation(id: number, conversation: Partial<InsertLlmConversation>): Promise<LlmConversation | undefined>;
  
  // LLM Message methods
  getLlmMessage(id: number): Promise<LlmMessage | undefined>;
  getLlmMessagesByConversationId(conversationId: number): Promise<LlmMessage[]>;
  createLlmMessage(message: InsertLlmMessage): Promise<LlmMessage>;
  getLlmConversationWithMessages(conversationId: number): Promise<{ conversation: LlmConversation, messages: LlmMessage[] } | undefined>;
  
  // LLM Fine-tuning methods
  getLlmFineTuningJob(id: number): Promise<LlmFineTuningJob | undefined>;
  getLlmFineTuningJobsByUserId(userId: number): Promise<LlmFineTuningJob[]>;
  createLlmFineTuningJob(job: InsertLlmFineTuningJob): Promise<LlmFineTuningJob>;
  updateLlmFineTuningJobStatus(id: number, status: string, metrics?: any): Promise<LlmFineTuningJob | undefined>;
  
  // Sacred Pattern methods
  getSacredPatternRecord(id: number): Promise<SacredPatternRecord | undefined>;
  getSacredPatternRecordsByUserId(userId: number): Promise<SacredPatternRecord[]>;
  createSacredPatternRecord(record: InsertSacredPatternRecord): Promise<SacredPatternRecord>;
  getSacredPatternAnalytics(userId: number): Promise<{ averageGoldenRatio: number, averageHarmonicScore: number, dominantPrinciples: string[] }>;
  
  // AI Monitoring methods
  logAiActivity(userId: number, action: string, details: any): Promise<void>;
  getAiActivityLogsByUserId(userId: number, limit?: number): Promise<any[]>;
  getAiMonitoringLogs(userId: number, limit?: number): Promise<any[]>;
  getAiActivitySummary(userId: number): Promise<{ totalInteractions: number, lastInteractionDate: Date | null }>;
  createAiMonitoringLog(logData: any): Promise<any>;
  getAiMonitoringLogById(logId: number): Promise<any | undefined>;
  
  // Smart Contract methods
  getSmartContractsByUserId(userId: number): Promise<any[]>;
  createSmartContract(data: any): Promise<any>;
  updateSmartContractStatus(id: number, status: string): Promise<any>;
  
  // CID/IPFS methods
  getCidEntriesByUserId(userId: number): Promise<any[]>;
  createCidEntry(data: any): Promise<any>;
  updateCidEntryMetadata(id: number, metadata: any): Promise<any>;
  
  // Payment methods
  getPaymentMethodsByUserId(userId: number): Promise<any[]>;
  createPaymentMethod(data: any): Promise<any>;
  getPaymentHistory(userId: number, limit?: number): Promise<any[]>;
  createPayment(data: any): Promise<any>;
  getPayment(id: number): Promise<any | undefined>;
  getPaymentByExternalId(externalId: string): Promise<any[]>;
  updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<any | undefined>;
  
  // Wallet methods
  getWalletsByUserId(userId: number): Promise<any[]>;
  getWallet(walletId: number): Promise<any | undefined>;
  
  // Transaction methods
  getRecentTransactions(userId: number, limit?: number): Promise<any[]>;
  getTransactionsByWalletId(walletId: number): Promise<any[]>;
  createTransaction(transactionData: any): Promise<any>;
  updateTransactionDescription(id: number, description: string): Promise<any | undefined>;
  updateTransactionLayer2Info(id: number, isLayer2: boolean, layer2Type?: string, layer2Data?: any): Promise<any | undefined>;
  getLayer2Transactions(userId: number, layer2Type?: string): Promise<any[]>;
  
  // Quantum Security Event methods
  createQuantumSecurityEvent(event: any): Promise<any>;
  getQuantumSecurityEvents(limit?: number, offset?: number): Promise<any[]>;
  getQuantumSecurityEventsByUserId(userId: number, limit?: number): Promise<any[]>;
  getQuantumSecurityEventById(eventId: string): Promise<any | undefined>;
  
  // Quantum Security Recommendation methods
  createQuantumSecurityRecommendation(recommendation: any): Promise<any>;
  getQuantumSecurityRecommendations(limit?: number, offset?: number): Promise<any[]>;
  getQuantumSecurityRecommendationsByEventId(eventId: string): Promise<any[]>;
  applyQuantumSecurityRecommendation(recommendationId: string): Promise<any | undefined>;
  updateQuantumSecurityRecommendation(recommendationId: string, data: any): Promise<any | undefined>;
  
  // Quantum Security Learning methods
  createQuantumSecurityLearning(learning: any): Promise<any>;
  getQuantumSecurityLearnings(limit?: number, offset?: number): Promise<any[]>;
  getQuantumSecurityLearningsByType(learningType: string): Promise<any[]>;
}

// Re-export types for convenience
export type { 
  User, InsertUser,
  LlmPrompt, InsertLlmPrompt,
  LlmConversation, InsertLlmConversation,
  LlmMessage, InsertLlmMessage,
  LlmFineTuningJob, InsertLlmFineTuningJob,
  SacredPatternRecord, InsertSacredPatternRecord
};