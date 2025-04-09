/**
 * Token Bridge Service Interface
 * Defines the interface for the AetherCore Token Bridge
 */

import { 
  BlockchainNetworkType, 
  BridgeDirection, 
  TokenBridgeStatus, 
  TokenBridgeTransaction, 
  TokenBridgeConfig 
} from '@shared/aethercore/types';

/**
 * Interface for Token Bridge Configuration
 */
export interface ITokenBridgeConfig {
  sourceNetwork: BlockchainNetworkType;
  destinationNetwork: BlockchainNetworkType;
  conversionRate: number;
  bridgeFeePercent: number;
  requiredConfirmations: number;
  maxTransactionAmount: string;
  minTransactionAmount: string;
}

/**
 * Token Bridge Service Interface
 * Defines methods for bridging tokens across different blockchain networks
 */
export interface ITokenBridgeService {
  /**
   * Initialize the bridge service
   */
  initialize(): Promise<boolean>;

  /**
   * Create a new token bridge transaction
   */
  createBridgeTransaction(
    userId: number,
    sourceAddress: string,
    destinationAddress: string,
    amount: string,
    direction: BridgeDirection
  ): Promise<TokenBridgeTransaction>;

  /**
   * Get a bridge transaction by ID
   */
  getBridgeTransaction(txId: string): Promise<TokenBridgeTransaction | null>;

  /**
   * Get all bridge transactions for a user
   */
  getUserBridgeTransactions(userId: number): Promise<TokenBridgeTransaction[]>;

  /**
   * Update a bridge transaction status
   */
  updateBridgeTransactionStatus(
    txId: string,
    status: TokenBridgeStatus,
    metadata?: any
  ): Promise<TokenBridgeTransaction>;

  /**
   * Get the bridge configuration for a pair of networks
   */
  getBridgeConfig(
    sourceNetwork: BlockchainNetworkType,
    destinationNetwork: BlockchainNetworkType
  ): Promise<ITokenBridgeConfig>;

  /**
   * Calculate the bridge fee for a transaction
   */
  calculateBridgeFee(
    amount: string,
    direction: BridgeDirection
  ): Promise<string>;

  /**
   * Verify a transaction on the source blockchain
   */
  verifySourceTransaction(txId: string): Promise<boolean>;

  /**
   * Complete a bridge transaction by minting or releasing tokens
   */
  completeBridgeTransaction(txId: string): Promise<TokenBridgeTransaction>;

  /**
   * Revert a failed bridge transaction
   */
  revertBridgeTransaction(
    txId: string,
    reason: string
  ): Promise<TokenBridgeTransaction>;
}