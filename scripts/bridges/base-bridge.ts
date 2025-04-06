/**
 * Base Bridge Interface
 * 
 * This file defines the base interface for all bridges between Aetherion and other blockchain networks.
 * Each specific blockchain bridge will extend this interface.
 */

import { EventEmitter } from 'events';
import { BridgeNetwork, BridgeStatus, BridgeTransactionStatus } from '../../shared/bridge-schema';

export interface BridgeConfig {
  name: string;
  sourceNetwork: BridgeNetwork;
  targetNetwork: BridgeNetwork;
  contractAddressSource?: string;
  contractAddressTarget?: string;
  feePercentage: string;
  minTransferAmount?: string;
  maxTransferAmount?: string;
  requiredConfirmations: number;
  validatorThreshold: number;
  securityLevel: 'low' | 'standard' | 'high';
  config: Record<string, any>;
}

export interface TransferOptions {
  slippageTolerance?: number; // in percentage
  deadline?: number; // in seconds
  gasLimit?: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionDetails {
  amount: string;
  tokenSymbol: string;
  sourceAddress: string;
  targetAddress: string;
  sourceChain: BridgeNetwork;
  targetChain: BridgeNetwork;
  options?: TransferOptions;
}

export interface TransactionResponse {
  transactionId: number;
  sourceTransactionHash?: string;
  targetTransactionHash?: string;
  status: BridgeTransactionStatus;
  amount: string;
  tokenSymbol: string;
  fee?: string;
  sourceAddress: string;
  targetAddress: string;
  initiatedAt: Date;
  completedAt?: Date;
}

export interface ValidatorInfo {
  id: number;
  name: string;
  address: string;
  publicKey: string;
  network: string;
  isActive: boolean;
  reputation: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  sourceAddress?: string;
  targetAddress?: string;
  decimals: number;
  isEnabled: boolean;
}

export interface BridgeHealth {
  status: BridgeStatus;
  activeValidators: number;
  totalValidators: number;
  lastSyncTimestamp: Date;
  pendingTransactions: number;
  averageCompletionTimeSeconds: number;
  feesCollectedLast24h: string;
  volumeLast24h: string;
}

export interface FeeEstimate {
  amount: string;
  token: string;
  feeAmount: string;
  feeToken: string;
  gasPrice?: string;
  gasLimit?: number;
  sourceNetworkFee?: string;
  targetNetworkFee?: string;
  bridgeFee?: string;
  estimatedTimeToCompleteSeconds?: number;
}

export abstract class BaseBridge extends EventEmitter {
  protected config: BridgeConfig;
  protected bridgeId: number;

  constructor(bridgeId: number, config: BridgeConfig) {
    super();
    this.bridgeId = bridgeId;
    this.config = config;
  }

  // Core bridge methods
  abstract initialize(): Promise<boolean>;
  abstract shutdown(): Promise<void>;
  abstract getHealth(): Promise<BridgeHealth>;
  abstract getSupportedTokens(): Promise<TokenInfo[]>;
  abstract getValidators(): Promise<ValidatorInfo[]>;
  abstract estimateFee(details: TransactionDetails): Promise<FeeEstimate>;
  abstract initiateTransfer(details: TransactionDetails): Promise<TransactionResponse>;
  abstract getTransactionStatus(transactionId: number): Promise<TransactionResponse>;
  abstract validateTransaction(transactionId: number, validatorId: number, signature: string): Promise<boolean>;
  abstract completeTransfer(transactionId: number, targetTransactionHash: string): Promise<TransactionResponse>;

  // Monitoring methods
  abstract monitorSourceChain(): Promise<void>;
  abstract monitorTargetChain(): Promise<void>;
  abstract syncPendingTransactions(): Promise<void>;

  // Validator-specific methods
  abstract registerValidator(validatorInfo: Omit<ValidatorInfo, 'id'>): Promise<ValidatorInfo>;
  abstract removeValidator(validatorId: number): Promise<boolean>;
  
  // Helper methods
  public getConfig(): BridgeConfig {
    return this.config;
  }

  public getBridgeId(): number {
    return this.bridgeId;
  }

  public setConfig(updatedConfig: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...updatedConfig };
  }
}