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
               TransactionRating, RecursionLog, AiCoinCompensation } from '../shared/schema';

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
  
  // Payment methods
  getPayment(id: number): Promise<schema.Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<schema.Payment[]>;
  getPaymentsByProviderPaymentId(providerPaymentId: string): Promise<schema.Payment[]>;
  createPayment(payment: schema.InsertPayment): Promise<schema.Payment>;
  updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<schema.Payment | undefined>;
  
  // And other necessary methods...
}