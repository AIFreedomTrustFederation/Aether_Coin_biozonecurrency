/**
 * Identity Service Interface
 * Defines the interface for quantum-resistant cross-chain identity
 */

import { 
  BlockchainNetworkType, 
  CrossChainIdentity, 
  RecoveryMechanism 
} from '@shared/aethercore/types';
import { 
  CrossChainIdentity as DbCrossChainIdentity,
  IdentityRecoveryGuardian 
} from '@shared/aethercore/schema';

export interface IGuardianConfig {
  threshold: number;
  guardianDelayHours: number;
  maxGuardians: number;
}

export interface INetworkIdentityRegistration {
  network: BlockchainNetworkType;
  address: string;
  registrationTransaction?: string;
  status: 'pending' | 'complete' | 'failed';
}

export interface IIdentityService {
  /**
   * Create a unified quantum-resistant identity that works across
   * AetherCoin, FractalCoin and Filecoin networks
   * @param userId User ID
   * @param options Identity options
   */
  createCrossChainIdentity(
    userId: number,
    options: {
      recoveryMechanism: RecoveryMechanism;
      temporalConsistency: boolean;
    }
  ): Promise<CrossChainIdentity>;
  
  /**
   * Get a user's cross-chain identity
   * @param userId User ID
   */
  getUserIdentity(userId: number): Promise<DbCrossChainIdentity | null>;
  
  /**
   * Get identity by blockchain address
   * @param network Blockchain network
   * @param address Address on that network
   */
  getIdentityByAddress(
    network: BlockchainNetworkType,
    address: string
  ): Promise<DbCrossChainIdentity | null>;
  
  /**
   * Update a user's cross-chain identity
   * @param userId User ID
   * @param updates Updates to apply
   */
  updateUserIdentity(
    userId: number,
    updates: Partial<CrossChainIdentity>
  ): Promise<DbCrossChainIdentity>;
  
  /**
   * Add a recovery guardian
   * @param userId User ID
   * @param guardianData Guardian data
   */
  addRecoveryGuardian(
    userId: number,
    guardianData: {
      guardianType: string;
      guardianAddress: string;
      guardianName?: string;
      weight?: number;
    }
  ): Promise<IdentityRecoveryGuardian>;
  
  /**
   * Get a user's recovery guardians
   * @param userId User ID
   */
  getUserGuardians(userId: number): Promise<IdentityRecoveryGuardian[]>;
  
  /**
   * Remove a recovery guardian
   * @param guardianId Guardian ID
   * @param userId User ID making the request
   */
  removeGuardian(
    guardianId: number,
    userId: number
  ): Promise<boolean>;
  
  /**
   * Initiate social recovery
   * @param userId User ID
   */
  initiateSocialRecovery(userId: number): Promise<{
    recoveryId: string;
    expiresAt: number;
  }>;
  
  /**
   * Approve recovery as a guardian
   * @param recoveryId Recovery ID
   * @param guardianAddress Guardian address
   * @param signature Guardian signature
   */
  approveRecovery(
    recoveryId: string,
    guardianAddress: string,
    signature: string
  ): Promise<{
    approvalCount: number;
    threshold: number;
    isComplete: boolean;
  }>;
  
  /**
   * Complete recovery and restore access
   * @param recoveryId Recovery ID
   * @param newPublicKey New public key
   */
  completeRecovery(
    recoveryId: string,
    newPublicKey: string
  ): Promise<{
    userId: number;
    newIdentity: CrossChainIdentity;
  }>;
  
  /**
   * Setup hardware-based recovery
   * @param userId User ID
   * @param deviceInfo Hardware device info
   */
  setupHardwareRecovery(
    userId: number,
    deviceInfo: any
  ): Promise<boolean>;
  
  /**
   * Setup hybrid recovery (social + hardware)
   * @param userId User ID
   * @param privateKey Private key (securely handled)
   */
  setupHybridRecovery(
    userId: number,
    privateKey: string
  ): Promise<boolean>;
}