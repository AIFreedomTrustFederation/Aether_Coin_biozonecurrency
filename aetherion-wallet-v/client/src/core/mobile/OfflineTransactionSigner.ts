/**
 * OfflineTransactionSigner.ts
 * Implements offline transaction signing for enhanced security
 */

import { SHA256 } from 'crypto-js';
import mobileFeatures from './MobileFeatures';

// Import types from existing blockchain module
// In a real implementation, these would be imported from your blockchain modules
type Transaction = {
  id?: string;
  timestamp: number;
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  fee: number;
  data?: string;
  signature?: string;
  nonce?: number;
  status?: 'pending' | 'confirmed' | 'failed';
};

type WalletKeyPair = {
  publicKey: string;
  privateKey: string;
};

/**
 * Class for handling offline transaction signing
 * Allows users to sign transactions in a secure, offline environment
 */
export class OfflineTransactionSigner {
  private static instance: OfflineTransactionSigner;
  private pendingTransactions: Transaction[] = [];
  private offlineMode: boolean = false;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.loadPendingTransactions();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): OfflineTransactionSigner {
    if (!OfflineTransactionSigner.instance) {
      OfflineTransactionSigner.instance = new OfflineTransactionSigner();
    }
    return OfflineTransactionSigner.instance;
  }
  
  /**
   * Load pending transactions from local storage
   */
  private loadPendingTransactions(): void {
    try {
      const stored = localStorage.getItem('aetherion_pending_transactions');
      if (stored) {
        this.pendingTransactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pending transactions:', error);
      this.pendingTransactions = [];
    }
  }
  
  /**
   * Save pending transactions to local storage
   */
  private savePendingTransactions(): void {
    try {
      localStorage.setItem('aetherion_pending_transactions', JSON.stringify(this.pendingTransactions));
    } catch (error) {
      console.error('Failed to save pending transactions:', error);
    }
  }
  
  /**
   * Enable or disable offline mode
   * @param enabled Whether offline mode should be enabled
   */
  public setOfflineMode(enabled: boolean): void {
    this.offlineMode = enabled;
    
    if (enabled) {
      console.log('Offline transaction signing mode enabled');
    } else {
      console.log('Offline transaction signing mode disabled');
    }
  }
  
  /**
   * Check if offline mode is enabled
   */
  public isOfflineMode(): boolean {
    return this.offlineMode;
  }
  
  /**
   * Create a transaction in offline mode
   * @param transaction Transaction data to create
   * @returns The created transaction
   */
  public createOfflineTransaction(transaction: Omit<Transaction, 'id' | 'signature'>): Transaction {
    if (!this.offlineMode) {
      throw new Error('Offline mode is not enabled');
    }
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: transaction.timestamp || Date.now(),
      status: 'pending'
    };
    
    this.pendingTransactions.push(newTransaction);
    this.savePendingTransactions();
    
    return newTransaction;
  }
  
  /**
   * Sign a transaction offline
   * @param transaction Transaction to sign
   * @param keyPair Wallet key pair for signing
   * @returns The signed transaction
   */
  public signTransaction(transaction: Transaction, keyPair: WalletKeyPair): Transaction {
    if (!keyPair.privateKey) {
      throw new Error('Cannot sign transaction: Private key missing');
    }
    
    if (transaction.fromAddress !== keyPair.publicKey) {
      throw new Error('Cannot sign transaction: Sender address does not match key pair');
    }
    
    // Create a hash of the transaction data
    const txHash = this.calculateTransactionHash(transaction);
    
    // In a real implementation, you would sign the hash with the private key
    // Here we simulate the signature process
    const signature = this.simulateSignature(txHash, keyPair.privateKey);
    
    // Create a new transaction with the signature
    const signedTransaction: Transaction = {
      ...transaction,
      signature
    };
    
    // If in offline mode, update the pending transaction
    if (this.offlineMode) {
      const index = this.pendingTransactions.findIndex(tx => tx.id === transaction.id);
      if (index !== -1) {
        this.pendingTransactions[index] = signedTransaction;
        this.savePendingTransactions();
      }
    }
    
    return signedTransaction;
  }
  
  /**
   * Calculate the hash of a transaction
   * @param transaction Transaction to hash
   * @returns Hash of the transaction
   */
  public calculateTransactionHash(transaction: Transaction): string {
    const txData = JSON.stringify({
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: transaction.amount,
      fee: transaction.fee,
      data: transaction.data,
      timestamp: transaction.timestamp,
      nonce: transaction.nonce || 0
    });
    
    return new SHA256(txData).toString();
  }
  
  /**
   * Simulate signing a transaction with a private key
   * In a real implementation, this would use elliptic curve cryptography
   * @param txHash Hash of the transaction
   * @param privateKey Private key for signing
   * @returns Simulated signature
   */
  private simulateSignature(txHash: string, privateKey: string): string {
    // This is a simplified simulation - in production use proper crypto libraries
    const signatureBase = new SHA256(txHash + privateKey).toString();
    return signatureBase;
  }
  
  /**
   * Verify a transaction signature
   * @param transaction Signed transaction to verify
   * @returns Boolean indicating if the signature is valid
   */
  public verifyTransaction(transaction: Transaction): boolean {
    if (!transaction.signature || !transaction.fromAddress) {
      return false;
    }
    
    // Calculate the hash of the transaction data
    const txHash = this.calculateTransactionHash(transaction);
    
    // In a real implementation, you would verify the signature with the public key
    // Here we simulate the verification process
    return this.simulateVerification(txHash, transaction.signature, transaction.fromAddress);
  }
  
  /**
   * Simulate verifying a signature
   * In a real implementation, this would use elliptic curve cryptography
   * @param txHash Hash of the transaction
   * @param signature Signature to verify
   * @param publicKey Public key for verification
   * @returns Boolean indicating if the signature is valid
   */
  private simulateVerification(txHash: string, signature: string, publicKey: string): boolean {
    // This is a simplified simulation - in production use proper crypto libraries
    // For this simulation, we'll always return true
    return true;
  }
  
  /**
   * Export signed transactions for online submission
   * @returns Array of signed transactions ready for submission
   */
  public exportSignedTransactions(): Transaction[] {
    return this.pendingTransactions.filter(tx => tx.signature);
  }
  
  /**
   * Submit pending transactions to the blockchain when back online
   * @param submitFn Function to submit a transaction to the blockchain
   * @returns Promise resolving to an array of results
   */
  public async submitPendingTransactions(
    submitFn: (tx: Transaction) => Promise<any>
  ): Promise<any[]> {
    if (this.offlineMode) {
      throw new Error('Cannot submit transactions in offline mode');
    }
    
    if (this.pendingTransactions.length === 0) {
      return [];
    }
    
    const results = [];
    const failedTransactions: Transaction[] = [];
    
    for (const tx of this.pendingTransactions) {
      if (!tx.signature) {
        failedTransactions.push(tx);
        results.push({ success: false, error: 'Transaction not signed' });
        continue;
      }
      
      try {
        const result = await submitFn(tx);
        results.push({ success: true, result });
      } catch (error) {
        console.error('Failed to submit transaction:', error);
        failedTransactions.push(tx);
        results.push({ success: false, error });
      }
    }
    
    // Update pending transactions to only include failed ones
    this.pendingTransactions = failedTransactions;
    this.savePendingTransactions();
    
    return results;
  }
  
  /**
   * Get all pending transactions
   */
  public getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }
  
  /**
   * Clear all pending transactions
   */
  public clearPendingTransactions(): void {
    this.pendingTransactions = [];
    this.savePendingTransactions();
  }
  
  /**
   * Get a pending transaction by ID
   * @param id ID of the transaction to retrieve
   */
  public getPendingTransaction(id: string): Transaction | undefined {
    return this.pendingTransactions.find(tx => tx.id === id);
  }
  
  /**
   * Remove a pending transaction
   * @param id ID of the transaction to remove
   * @returns Boolean indicating if removal was successful
   */
  public removePendingTransaction(id: string): boolean {
    const initialLength = this.pendingTransactions.length;
    this.pendingTransactions = this.pendingTransactions.filter(tx => tx.id !== id);
    
    if (this.pendingTransactions.length !== initialLength) {
      this.savePendingTransactions();
      return true;
    }
    
    return false;
  }
}

export default OfflineTransactionSigner.getInstance();