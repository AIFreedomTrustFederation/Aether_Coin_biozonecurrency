/**
 * Temporal Entanglement
 * 
 * Provides time-based security mechanisms for blockchain interactions.
 * The temporal entanglement concept binds actions to specific time windows,
 * adding an additional layer of security beyond spatial signatures.
 */

import { createTemporalEntanglement, verifyTemporalEntanglement, TemporalEntanglementRecord } from './quantumBridge';

// Export the TemporalEntanglementRecord type for reuse
export { TemporalEntanglementRecord } from './quantumBridge';

/**
 * Types of temporal entanglement
 */
export enum EntanglementType {
  NETWORK_CONNECTION = 'network-connection',
  PAYMENT_APPROVAL = 'payment-approval',
  REWARD_CLAIM = 'reward-claim',
  WALLET_AUTH = 'wallet-auth',
  CONTRACT_EXECUTION = 'contract-execution'
}

/**
 * Temporal window durations in milliseconds
 */
export const ENTANGLEMENT_DURATIONS = {
  SHORT: 5 * 60 * 1000,        // 5 minutes
  MEDIUM: 30 * 60 * 1000,      // 30 minutes
  LONG: 4 * 60 * 60 * 1000,    // 4 hours
  DAY: 24 * 60 * 60 * 1000,    // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000 // 1 week
};

/**
 * Create a temporal entanglement for network connection
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
export async function createNetworkConnectionEntanglement(
  address: string
): Promise<TemporalEntanglementRecord> {
  return await createTemporalEntanglement(
    address,
    EntanglementType.NETWORK_CONNECTION,
    ENTANGLEMENT_DURATIONS.DAY
  );
}

/**
 * Create a temporal entanglement for payment approval
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
export async function createPaymentApprovalEntanglement(
  address: string
): Promise<TemporalEntanglementRecord> {
  return await createTemporalEntanglement(
    address,
    EntanglementType.PAYMENT_APPROVAL,
    ENTANGLEMENT_DURATIONS.MEDIUM
  );
}

/**
 * Create a temporal entanglement for reward claim
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
export async function createRewardClaimEntanglement(
  address: string
): Promise<TemporalEntanglementRecord> {
  return await createTemporalEntanglement(
    address,
    EntanglementType.REWARD_CLAIM,
    ENTANGLEMENT_DURATIONS.SHORT
  );
}

/**
 * Create a temporal entanglement for wallet authentication
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
export async function createWalletAuthEntanglement(
  address: string
): Promise<TemporalEntanglementRecord> {
  return await createTemporalEntanglement(
    address,
    EntanglementType.WALLET_AUTH,
    ENTANGLEMENT_DURATIONS.MEDIUM
  );
}

/**
 * Create a temporal entanglement for contract execution
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
export async function createContractExecutionEntanglement(
  address: string
): Promise<TemporalEntanglementRecord> {
  return await createTemporalEntanglement(
    address,
    EntanglementType.CONTRACT_EXECUTION,
    ENTANGLEMENT_DURATIONS.SHORT
  );
}

/**
 * Gets the remaining valid time for an entanglement record
 * @param record The entanglement record
 * @returns Time remaining in milliseconds, or 0 if expired
 */
export function getEntanglementTimeRemaining(
  record: TemporalEntanglementRecord
): number {
  const now = Date.now();
  return Math.max(0, record.expiresAt - now);
}

/**
 * Format remaining time as a human-readable string
 * @param milliseconds Time in milliseconds
 * @returns Formatted time string
 */
export function formatRemainingTime(milliseconds: number): string {
  if (milliseconds <= 0) {
    return 'Expired';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Store an entanglement record locally
 * @param record Entanglement record to store
 * @param key Optional storage key
 */
export function storeEntanglement(
  record: TemporalEntanglementRecord,
  key?: string
): void {
  const storageKey = key || `entanglement-${record.purpose}-${record.address}`;
  localStorage.setItem(storageKey, JSON.stringify(record));
}

/**
 * Retrieve an entanglement record from local storage
 * @param purpose Entanglement purpose
 * @param address User address
 * @param key Optional storage key
 * @returns Entanglement record or null if not found
 */
export function retrieveEntanglement(
  purpose: string,
  address: string,
  key?: string
): TemporalEntanglementRecord | null {
  const storageKey = key || `entanglement-${purpose}-${address}`;
  const storedRecord = localStorage.getItem(storageKey);
  
  if (!storedRecord) {
    return null;
  }
  
  try {
    const record = JSON.parse(storedRecord) as TemporalEntanglementRecord;
    return record;
  } catch (error) {
    console.error('Error parsing stored entanglement record:', error);
    return null;
  }
}

/**
 * Verify and get an entanglement record, either from storage or creating a new one
 * @param purpose Entanglement purpose
 * @param address User address
 * @param duration Validity duration
 * @returns Promise resolving to valid entanglement record
 */
export async function ensureValidEntanglement(
  purpose: string,
  address: string,
  duration: number
): Promise<TemporalEntanglementRecord> {
  // Try to get from storage
  const storedRecord = retrieveEntanglement(purpose, address);
  
  // Check if valid and not expired
  if (storedRecord && await verifyTemporalEntanglement(storedRecord)) {
    return storedRecord;
  }
  
  // Create new entanglement
  const newRecord = await createTemporalEntanglement(address, purpose, duration);
  
  // Store for future use
  storeEntanglement(newRecord);
  
  return newRecord;
}