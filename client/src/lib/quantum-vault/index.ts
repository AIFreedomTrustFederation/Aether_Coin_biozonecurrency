import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Types for the quantum vault
 */
export enum VaultItemType {
  PHONE_NUMBER = 'phone_number',
  MATRIX_ID = 'matrix_id',
  RECOVERY_CODE = 'recovery_code',
  API_KEY = 'api_key',
  WALLET_BACKUP = 'wallet_backup',
}

export interface VaultItem {
  id: string;
  type: VaultItemType;
  label: string;
  value: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

interface VaultState {
  initialized: boolean;
  items: Record<string, VaultItem>;
  lastSyncedAt?: number;
}

/**
 * QuantumVault - Secure storage system for sensitive user data
 *
 * Uses a hybrid encryption approach:
 * 1. AES-256 for symmetric encryption (NIST-approved, quantum-resistant when used with sufficient key size)
 * 2. PBKDF2 for key derivation with high iteration count
 * 3. Structured to be compatible with future quantum-resistant algorithms
 */
export class QuantumVault {
  private static instance: QuantumVault;
  private readonly VAULT_KEY = 'quantum_vault_state';
  private readonly TEST_KEY = 'quantum_vault_test';
  private masterKey: string | null = null;
  private state: VaultState = {
    initialized: false,
    items: {},
  };

  /**
   * Get the singleton instance of QuantumVault
   */
  public static getInstance(): QuantumVault {
    if (!QuantumVault.instance) {
      QuantumVault.instance = new QuantumVault();
    }
    return QuantumVault.instance;
  }

  private constructor() {
    // Load the state from localStorage
    this.loadState();
  }

  /**
   * Initialize the vault with a master password
   * @param password The user's master password
   * @param iterations Number of PBKDF2 iterations (higher is more secure)
   * @returns True if successfully initialized, false otherwise
   */
  public initialize(password: string, iterations: number = 10000): boolean {
    if (!password) return false;

    try {
      // Derive a secure key using PBKDF2 (resistant to brute-force attacks)
      // We use a fixed salt here, but in a production system you'd want to use a per-user salt
      // stored securely on the server
      const salt = 'aetherion_quantum_vault'; // In production, this should be user-specific and stored securely
      this.masterKey = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 256-bit key
        iterations, // Higher is more secure but slower
      }).toString();

      // Test encryption/decryption
      const testValue = `quantum-test-${Date.now()}`;
      const encrypted = this.encrypt(testValue);
      const decrypted = this.decrypt(encrypted);

      if (decrypted !== testValue) {
        this.masterKey = null;
        return false;
      }

      // Store test value
      localStorage.setItem(this.TEST_KEY, encrypted);

      // Re-encrypt any existing items with the new key
      this.reEncryptAll();

      this.state.initialized = true;
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to initialize QuantumVault:', error);
      this.masterKey = null;
      return false;
    }
  }

  /**
   * Check if the vault is unlocked (master key is available)
   */
  public isUnlocked(): boolean {
    return !!this.masterKey;
  }

  /**
   * Check if the vault has been initialized
   */
  public isInitialized(): boolean {
    return this.state.initialized;
  }

  /**
   * Unlock the vault with a master password
   * @param password The user's master password
   * @param iterations Number of PBKDF2 iterations
   * @returns True if successfully unlocked, false otherwise
   */
  public unlock(password: string, iterations: number = 10000): boolean {
    if (!password) return false;

    try {
      // Derive the key
      const salt = 'aetherion_quantum_vault';
      const derivedKey = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations,
      }).toString();

      // Test decryption
      const testEncrypted = localStorage.getItem(this.TEST_KEY);
      if (!testEncrypted) return false;

      // Try to decrypt the test value
      const tempMasterKey = this.masterKey;
      this.masterKey = derivedKey;
      
      try {
        const testDecrypted = this.decrypt(testEncrypted);
        if (testDecrypted.startsWith('quantum-test-')) {
          // Success - keep the derived key
          return true;
        }
      } catch (e) {
        // If decryption fails, restore the previous master key (if any)
        this.masterKey = tempMasterKey;
        return false;
      }

      return false;
    } catch (error) {
      console.error('Failed to unlock QuantumVault:', error);
      return false;
    }
  }

  /**
   * Lock the vault (clear the master key from memory)
   */
  public lock(): void {
    this.masterKey = null;
  }

  /**
   * Store a sensitive value in the vault
   * @param type The type of item to store
   * @param label A user-friendly label for the item
   * @param value The sensitive value to encrypt
   * @param metadata Optional metadata for the item
   * @returns The ID of the stored item, or null if storing failed
   */
  public store(type: VaultItemType, label: string, value: string, metadata?: Record<string, any>): string | null {
    if (!this.masterKey) return null;

    try {
      const itemId = uuidv4();
      const now = Date.now();

      const newItem: VaultItem = {
        id: itemId,
        type,
        label,
        value, // This will be encrypted when saved
        metadata,
        createdAt: now,
        updatedAt: now,
      };

      // Store in memory
      this.state.items[itemId] = newItem;
      
      // Persist to storage
      this.saveState();
      
      return itemId;
    } catch (error) {
      console.error('Failed to store item in QuantumVault:', error);
      return null;
    }
  }

  /**
   * Retrieve a sensitive value from the vault
   * @param id The ID of the item to retrieve
   * @returns The decrypted item, or null if not found or vault is locked
   */
  public retrieve(id: string): VaultItem | null {
    if (!this.masterKey || !this.state.items[id]) return null;
    
    // Return a copy of the item to prevent accidental modifications
    return { ...this.state.items[id] };
  }

  /**
   * Retrieve all items of a specific type
   * @param type The type of items to retrieve
   * @returns Array of items of the specified type
   */
  public retrieveByType(type: VaultItemType): VaultItem[] {
    if (!this.masterKey) return [];
    
    return Object.values(this.state.items)
      .filter(item => item.type === type)
      .map(item => ({ ...item })); // Return copies
  }

  /**
   * Update an existing item in the vault
   * @param id The ID of the item to update
   * @param updates Partial item data to update
   * @returns True if update was successful, false otherwise
   */
  public update(id: string, updates: Partial<Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
    if (!this.masterKey || !this.state.items[id]) return false;

    try {
      this.state.items[id] = {
        ...this.state.items[id],
        ...updates,
        updatedAt: Date.now(),
      };
      
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to update item in QuantumVault:', error);
      return false;
    }
  }

  /**
   * Delete an item from the vault
   * @param id The ID of the item to delete
   * @returns True if deletion was successful, false otherwise
   */
  public delete(id: string): boolean {
    if (!this.masterKey || !this.state.items[id]) return false;

    try {
      delete this.state.items[id];
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to delete item from QuantumVault:', error);
      return false;
    }
  }

  /**
   * Clear all items from the vault
   * @returns True if clearing was successful, false otherwise
   */
  public clear(): boolean {
    if (!this.masterKey) return false;

    try {
      this.state.items = {};
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to clear QuantumVault:', error);
      return false;
    }
  }

  /**
   * Get the count of items in the vault
   */
  public itemCount(): number {
    return Object.keys(this.state.items).length;
  }

  /**
   * Load the encrypted state from storage
   */
  private loadState(): void {
    try {
      const encryptedState = localStorage.getItem(this.VAULT_KEY);
      if (!encryptedState) {
        // No state found, initialize with empty state
        this.state = { initialized: false, items: {} };
        return;
      }

      if (!this.masterKey) {
        // Vault is locked, we can't decrypt the state
        // But we can still mark it as initialized since it exists
        this.state = { initialized: true, items: {} };
        return;
      }

      // Decrypt the state
      const decryptedState = this.decrypt(encryptedState);
      this.state = JSON.parse(decryptedState);
    } catch (error) {
      console.error('Failed to load QuantumVault state:', error);
      this.state = { initialized: false, items: {} };
    }
  }

  /**
   * Save the encrypted state to storage
   */
  private saveState(): void {
    if (!this.masterKey) return;

    try {
      // Encrypt the state before saving
      const stateJson = JSON.stringify(this.state);
      const encryptedState = this.encrypt(stateJson);
      localStorage.setItem(this.VAULT_KEY, encryptedState);
    } catch (error) {
      console.error('Failed to save QuantumVault state:', error);
    }
  }

  /**
   * Encrypt a value using the master key
   */
  private encrypt(value: string): string {
    if (!this.masterKey) throw new Error('Vault is locked');
    
    // Encrypt with AES
    return CryptoJS.AES.encrypt(value, this.masterKey).toString();
  }

  /**
   * Decrypt a value using the master key
   */
  private decrypt(encryptedValue: string): string {
    if (!this.masterKey) throw new Error('Vault is locked');
    
    // Decrypt with AES
    const bytes = CryptoJS.AES.decrypt(encryptedValue, this.masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Re-encrypt all items with the current master key
   * Used when the master key changes
   */
  private reEncryptAll(): void {
    // Since we're storing the unencrypted values in memory and only 
    // encrypting when saving to storage, we just need to re-save the state
    this.saveState();
  }
}

// Export the singleton instance
export const quantumVault = QuantumVault.getInstance();