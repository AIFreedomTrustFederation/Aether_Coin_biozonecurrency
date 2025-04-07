/**
 * Storage interface for the server.
 * This module provides a unified interface for interacting with the database.
 */

import dotenv from 'dotenv';
import * as schema from '../shared/schema';
import { DatabaseStorage } from './storage-database';

// Load environment variables
dotenv.config();

// Create and export the storage instance
export const storage = new DatabaseStorage();

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
               BridgeNetwork, BridgeStatus, BridgeTransactionStatus,
               // Domain Hosting types
               DomainConfiguration, DomainDeployment, FilecoinStorageAllocation, 
               DomainTrustWalletConnection, DomainActivityLog, DnsRecord,
               // Recurve Fractal Reserve types
               InsurancePolicy, InsertInsurancePolicy, RecurveToken, InsertRecurveToken,
               FractalLoan, InsertFractalLoan, TorusSecurityNode, InsertTorusSecurityNode,
               NetworkInsurancePolicy, InsertNetworkInsurancePolicy, MandelbrotRecursionEvent, 
               InsertMandelbrotRecursionEvent, InsurancePolicyType, InsurancePolicyStatus,
               BeneficiaryType, FractalLoanStatus, FractalLoanCollateralType, RecurveSyncStatus,
               RecurveTokenTier, TorusNodeType,
               // AI Assistant Training types
               TrainingFeedbackType, TrainingProcessingStatus,
               AiTrainingData, InsertAiTrainingData,
               AiTrainingJob, InsertAiTrainingJob,
               AiTrainingContributor, InsertAiTrainingContributor } from '../shared/schema';

// Export storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<schema.User | undefined>;
  getUserById(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  createUser(insertUser: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, updates: Partial<schema.User>): Promise<schema.User | undefined>;
  updateUserLastLogin(id: number): Promise<schema.User | undefined>;
  verifyUserPassword(username: string, password: string): Promise<schema.User | null>;
  getTrustMembers(): Promise<schema.User[]>;
  setUserAsTrustMember(id: number, level: string): Promise<schema.User | undefined>;
  isTrustMember(id: number): Promise<boolean>;
  
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
  
  // Recurve Fractal Reserve System methods
  
  // Insurance Policy methods
  getInsurancePolicy(id: number): Promise<schema.InsurancePolicy | undefined>;
  getInsurancePoliciesByUserId(userId: number): Promise<schema.InsurancePolicy[]>;
  getInsurancePoliciesByStatus(status: schema.InsurancePolicyStatus): Promise<schema.InsurancePolicy[]>;
  createInsurancePolicy(policy: schema.InsertInsurancePolicy): Promise<schema.InsurancePolicy>;
  updateInsurancePolicyStatus(id: number, status: schema.InsurancePolicyStatus): Promise<schema.InsurancePolicy | undefined>;
  updateInsuranceCashValue(id: number, cashValue: number): Promise<schema.InsurancePolicy | undefined>;
  updateInsuranceSyncStatus(id: number, status: schema.RecurveSyncStatus): Promise<schema.InsurancePolicy | undefined>;
  
  // Recurve Tokens methods
  getRecurveToken(id: number): Promise<schema.RecurveToken | undefined>;
  getRecurveTokensByUserId(userId: number): Promise<schema.RecurveToken[]>;
  getRecurveTokensByPolicyId(policyId: number): Promise<schema.RecurveToken[]>;
  getRecurveTokensByTier(tier: schema.RecurveTokenTier): Promise<schema.RecurveToken[]>;
  createRecurveToken(token: schema.InsertRecurveToken): Promise<schema.RecurveToken>;
  updateRecurveTokenStatus(id: number, status: string): Promise<schema.RecurveToken | undefined>;
  updateRecurveTokenAmount(id: number, amount: number): Promise<schema.RecurveToken | undefined>;
  
  // Fractal Loans methods
  getFractalLoan(id: number): Promise<schema.FractalLoan | undefined>;
  getFractalLoansByUserId(userId: number): Promise<schema.FractalLoan[]>;
  getFractalLoansByStatus(status: schema.FractalLoanStatus): Promise<schema.FractalLoan[]>;
  getFractalLoansByPolicyId(policyId: number): Promise<schema.FractalLoan[]>;
  createFractalLoan(loan: schema.InsertFractalLoan): Promise<schema.FractalLoan>;
  updateFractalLoanStatus(id: number, status: schema.FractalLoanStatus): Promise<schema.FractalLoan | undefined>;
  
  // Torus Security nodes methods
  getTorusSecurityNode(id: number): Promise<schema.TorusSecurityNode | undefined>;
  getTorusSecurityNodesByUserId(userId: number): Promise<schema.TorusSecurityNode[]>;
  getTorusSecurityNodesByTokenId(tokenId: number): Promise<schema.TorusSecurityNode[]>;
  getTorusSecurityNodesByType(nodeType: schema.TorusNodeType): Promise<schema.TorusSecurityNode[]>;
  createTorusSecurityNode(node: schema.InsertTorusSecurityNode): Promise<schema.TorusSecurityNode>;
  updateTorusSecurityNodeStatus(id: number, status: string): Promise<schema.TorusSecurityNode | undefined>;
  updateTorusNodeLastVerified(id: number): Promise<schema.TorusSecurityNode | undefined>;
  
  // Network Insurance Policies methods
  getNetworkInsurancePolicy(id: number): Promise<schema.NetworkInsurancePolicy | undefined>;
  getNetworkInsurancePoliciesByStatus(status: schema.InsurancePolicyStatus): Promise<schema.NetworkInsurancePolicy[]>;
  getNetworkInsurancePoliciesByPurpose(purpose: string): Promise<schema.NetworkInsurancePolicy[]>;
  createNetworkInsurancePolicy(policy: schema.InsertNetworkInsurancePolicy): Promise<schema.NetworkInsurancePolicy>;
  updateNetworkInsurancePolicyStatus(id: number, status: schema.InsurancePolicyStatus): Promise<schema.NetworkInsurancePolicy | undefined>;
  
  // Mandelbrot Recursion Events methods
  getMandelbrotRecursionEvent(id: number): Promise<schema.MandelbrotRecursionEvent | undefined>;
  getMandelbrotRecursionEventsByType(type: string): Promise<schema.MandelbrotRecursionEvent[]>;
  createMandelbrotRecursionEvent(event: schema.InsertMandelbrotRecursionEvent): Promise<schema.MandelbrotRecursionEvent>;
  
  // AI Assistant Training Data methods
  getAiTrainingData(id: number): Promise<schema.AiTrainingData | undefined>;
  getAiTrainingDataByUserId(userId: number): Promise<schema.AiTrainingData[]>;
  getAiTrainingDataByStatus(status: schema.TrainingProcessingStatus): Promise<schema.AiTrainingData[]>;
  getAiTrainingDataByFeedbackType(feedbackType: schema.TrainingFeedbackType): Promise<schema.AiTrainingData[]>;
  createAiTrainingData(data: schema.InsertAiTrainingData): Promise<schema.AiTrainingData>;
  updateAiTrainingDataStatus(id: number, status: schema.TrainingProcessingStatus, notes?: string): Promise<schema.AiTrainingData | undefined>;
  updateAiTrainingDataRewards(id: number, points: number, singTokens?: number): Promise<schema.AiTrainingData | undefined>;
  
  // AI Training Jobs methods
  getAiTrainingJob(id: number): Promise<schema.AiTrainingJob | undefined>;
  getAiTrainingJobsByStatus(status: string): Promise<schema.AiTrainingJob[]>;
  createAiTrainingJob(job: schema.InsertAiTrainingJob): Promise<schema.AiTrainingJob>;
  updateAiTrainingJobStatus(id: number, status: string): Promise<schema.AiTrainingJob | undefined>;
  completeAiTrainingJob(id: number, metrics: Record<string, any>): Promise<schema.AiTrainingJob | undefined>;
  
  // AI Training Contributors methods
  getAiTrainingContributor(id: number): Promise<schema.AiTrainingContributor | undefined>;
  getAiTrainingContributorByUserId(userId: number): Promise<schema.AiTrainingContributor | undefined>;
  getTopAiTrainingContributors(limit: number): Promise<schema.AiTrainingContributor[]>;
  createAiTrainingContributor(contributor: schema.InsertAiTrainingContributor): Promise<schema.AiTrainingContributor>;
  updateAiTrainingContributor(
    id: number,
    contributions: number,
    points: number,
    singTokens: number
  ): Promise<schema.AiTrainingContributor | undefined>;
  updateAiTrainingContributorTier(id: number, tier: string): Promise<schema.AiTrainingContributor | undefined>;
  updateAiTrainingContributorRank(id: number, rank: number): Promise<schema.AiTrainingContributor | undefined>;
}