/**
 * Storage interface for the server.
 * This module provides a unified interface for interacting with the database.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from '../shared/schema';
import { PgStorage } from './pg-storage';

// Load environment variables
dotenv.config();

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

// Create postgres connection
const client = postgres(databaseUrl, { max: 1 });

// Create drizzle instance with our schema
export const db = drizzle(client, { schema });

// Create and export the storage instance
export const storage = new PgStorage();

// Export schema types for convenience
export type { User, Wallet, Transaction, SmartContract, AiMonitoringLog, CidEntry, PaymentMethod, Payment, 
               StakingPosition, Proposal, ProposalOption, Vote, GovernanceReward,
               WalletHealthScore, WalletHealthIssue, NotificationPreference,
               AdminAction, AdminPermission, Fund, FundAllocation, FundTransaction,
               TokenomicsConfig, TokenDistribution, Widget, WidgetTemplate, Dashboard,
               IcoParticipation, IcoPhase, StakingRecord, EscrowTransaction, EscrowProof,
               MatrixRoom, MatrixMessage, EscrowDispute, MysterionAssessment, UserReputation,
               TransactionRating, RecursionLog, AiCoinCompensation, UserApiKey, MysterionTrainingData,
               // Bridge types
               BridgeConfiguration, BridgeValidator, BridgeSupportedToken, BridgeTransaction,
               BridgeNetwork, BridgeStatus, BridgeTransactionStatus } from '../shared/schema';

// Export storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(insertUser: schema.InsertUser): Promise<schema.User>;
  
  // Wallet methods
  getWallet(id: number): Promise<schema.Wallet | undefined>;
  getWalletsByUserId(userId: number): Promise<schema.Wallet[]>;
  createWallet(insertWallet: schema.InsertWallet): Promise<schema.Wallet>;
  updateWalletBalance(id: number, balance: string): Promise<schema.Wallet | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<schema.Transaction | undefined>;
  getTransactionsByWalletId(walletId: number): Promise<schema.Transaction[]>;
  getRecentTransactions(userId: number, limit: number): Promise<schema.Transaction[]>;
  createTransaction(insertTransaction: schema.InsertTransaction): Promise<schema.Transaction>;
  getLayer2Transactions(userId: number, layer2Type?: string): Promise<schema.Transaction[]>;
  updateTransactionDescription(id: number, description: string): Promise<schema.Transaction | undefined>;
  updateTransactionLayer2Info(
    id: number, 
    isLayer2: boolean, 
    layer2Type?: string, 
    layer2Data?: Record<string, any>
  ): Promise<schema.Transaction | undefined>;
  
  // Payment methods
  getPayment(id: number): Promise<schema.Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<schema.Payment[]>;
  getPaymentsByProviderPaymentId(providerPaymentId: string): Promise<schema.Payment[]>;
  createPayment(payment: schema.InsertPayment): Promise<schema.Payment>;
  updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<schema.Payment | undefined>;
  
  // User API Keys for Mysterion LLM training
  getUserApiKey(id: number): Promise<schema.UserApiKey | undefined>;
  getUserApiKeysByUserId(userId: number): Promise<schema.UserApiKey[]>;
  getUserApiKeysByService(userId: number, service: string): Promise<schema.UserApiKey[]>;
  createUserApiKey(insertUserApiKey: schema.InsertUserApiKey): Promise<schema.UserApiKey>;
  updateUserApiKeyStatus(id: number, isActive: boolean): Promise<schema.UserApiKey | undefined>;
  updateUserApiKeyTrainingStatus(id: number, isTrainingEnabled: boolean): Promise<schema.UserApiKey | undefined>;
  incrementUserApiKeyUsage(id: number): Promise<schema.UserApiKey | undefined>;
  deleteUserApiKey(id: number): Promise<boolean>;
  
  // Mysterion Training Data
  getMysterionTrainingData(id: number): Promise<schema.MysterionTrainingData | undefined>;
  getMysterionTrainingDataByApiKeyId(apiKeyId: number): Promise<schema.MysterionTrainingData[]>;
  createMysterionTrainingData(insertTrainingData: schema.InsertMysterionTrainingData): Promise<schema.MysterionTrainingData>;
  updateMysterionTrainingDataStatus(id: number, status: string, notes?: string): Promise<schema.MysterionTrainingData | undefined>;
  updateMysterionTrainingDataPoints(id: number, points: number): Promise<schema.MysterionTrainingData | undefined>;
  
  // Multi-Chain Bridge methods
  // Bridge Configuration
  getBridgeConfiguration(id: number): Promise<schema.BridgeConfiguration | undefined>;
  getBridgeConfigurations(status?: schema.BridgeStatus): Promise<schema.BridgeConfiguration[]>;
  getBridgeConfigurationByNetworks(sourceNetwork: string, targetNetwork: string): Promise<schema.BridgeConfiguration | undefined>;
  createBridgeConfiguration(config: schema.InsertBridgeConfiguration): Promise<schema.BridgeConfiguration>;
  updateBridgeConfigurationStatus(id: number, status: schema.BridgeStatus): Promise<schema.BridgeConfiguration | undefined>;
  updateBridgeConfiguration(id: number, updates: Partial<schema.BridgeConfiguration>): Promise<schema.BridgeConfiguration | undefined>;
  
  // Bridge Validators
  getBridgeValidator(id: number): Promise<schema.BridgeValidator | undefined>;
  getBridgeValidatorsByBridgeId(bridgeId: number): Promise<schema.BridgeValidator[]>;
  createBridgeValidator(validator: schema.InsertBridgeValidator): Promise<schema.BridgeValidator>;
  updateBridgeValidatorStatus(id: number, status: string): Promise<schema.BridgeValidator | undefined>;
  updateBridgeValidatorHeartbeat(id: number): Promise<schema.BridgeValidator | undefined>;
  updateBridgeValidatorReputation(id: number, reputation: number): Promise<schema.BridgeValidator | undefined>;
  
  // Bridge Supported Tokens
  getBridgeSupportedToken(id: number): Promise<schema.BridgeSupportedToken | undefined>;
  getBridgeSupportedTokensByBridgeId(bridgeId: number): Promise<schema.BridgeSupportedToken[]>;
  getBridgeSupportedTokenBySymbol(bridgeId: number, tokenSymbol: string): Promise<schema.BridgeSupportedToken | undefined>;
  createBridgeSupportedToken(token: schema.InsertBridgeSupportedToken): Promise<schema.BridgeSupportedToken>;
  updateBridgeSupportedTokenStatus(id: number, isEnabled: boolean): Promise<schema.BridgeSupportedToken | undefined>;
  
  // Bridge Transactions
  getBridgeTransaction(id: number): Promise<schema.BridgeTransaction | undefined>;
  getBridgeTransactionsByBridgeId(bridgeId: number, limit?: number): Promise<schema.BridgeTransaction[]>;
  getBridgeTransactionsByUserId(userId: number, limit?: number): Promise<schema.BridgeTransaction[]>;
  getBridgeTransactionsBySourceHash(sourceTransactionHash: string): Promise<schema.BridgeTransaction | undefined>;
  getBridgeTransactionsByStatus(status: schema.BridgeTransactionStatus, limit?: number): Promise<schema.BridgeTransaction[]>;
  createBridgeTransaction(transaction: schema.InsertBridgeTransaction): Promise<schema.BridgeTransaction>;
  updateBridgeTransactionStatus(id: number, status: schema.BridgeTransactionStatus, errorMessage?: string): Promise<schema.BridgeTransaction | undefined>;
  updateBridgeTransactionTargetHash(id: number, targetTransactionHash: string): Promise<schema.BridgeTransaction | undefined>;
  addBridgeTransactionValidation(id: number, validatorId: number, signature: string): Promise<schema.BridgeTransaction | undefined>;
  completeBridgeTransaction(id: number, targetTransactionHash: string): Promise<schema.BridgeTransaction | undefined>;
  
  // And other necessary methods...
}