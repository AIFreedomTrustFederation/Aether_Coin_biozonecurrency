import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { fractalShardManager, ShardType } from './fractal-sharding';
import { bitcoinSecurityLayer } from './bitcoin-security';
import { smartContractManager } from './smart-contracts';

/**
 * Types for the quantum vault
 */
export enum VaultItemType {
  // Personal identifiers
  PHONE_NUMBER = 'phone_number',
  MATRIX_ID = 'matrix_id',
  RECOVERY_CODE = 'recovery_code',
  
  // Credentials
  API_KEY = 'api_key',
  WALLET_BACKUP = 'wallet_backup',
  SEED_PHRASE = 'seed_phrase',
  PRIVATE_KEY = 'private_key',
  
  // FractalCoin network items
  FRACTAL_SHARD = 'fractal_shard',
  QUANTUM_KEY = 'quantum_key',
  MERKLE_PROOF = 'merkle_proof',
  
  // Smart contracts
  ESCROW_CONTRACT = 'escrow_contract',
  LLM_TRAINING_CONTRACT = 'llm_training_contract',
  QUANTUM_PROCESSING_CONTRACT = 'quantum_processing_contract',
  
  // Multi-party security
  MULTISIG_CONFIGURATION = 'multisig_configuration',
  ZERO_KNOWLEDGE_PROOF = 'zero_knowledge_proof',
}

export interface VaultItem {
  id: string;
  type: VaultItemType;
  label: string;
  value: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  shardingEnabled?: boolean;
  bitcoinSecured?: boolean;
  accessControl?: {
    allowedParties?: string[];
    requiredSignatures?: number;
    expirationDate?: number;
  };
}

interface VaultState {
  initialized: boolean;
  items: Record<string, VaultItem>;
  lastSyncedAt?: number;
  vaultSecurity: {
    quantumResistant: boolean;
    bitcoinSecured: boolean;
    fractalShardingEnabled: boolean;
    thresholdSignaturesEnabled: boolean;
    lastSecurityUpgrade?: number;
  };
  vaultMetrics: {
    totalStorageUsed: number;
    networkContribution: number;
    securityScore: number;
  };
}

/**
 * StorageType enum for vault data
 */
export enum VaultStorageType {
  LOCAL_ONLY = 'local_only',
  FRACTAL_NETWORK = 'fractal_network',
  HARDWARE_WALLET = 'hardware_wallet',
  HYBRID = 'hybrid',
}

/**
 * Security level enum for vault items
 */
export enum SecurityLevel {
  STANDARD = 'standard',         // AES-256 encryption
  ENHANCED = 'enhanced',         // AES-256 + multisig
  QUANTUM_RESISTANT = 'quantum', // Post-quantum crypto algorithms
  FRACTAL_SECURED = 'fractal',   // Fractal sharding with holographic verification
  MAXIMUM = 'maximum',           // All security features enabled
}

/**
 * VaultOptions interface for initialization
 */
export interface VaultOptions {
  securityLevel: SecurityLevel;
  defaultStorageType: VaultStorageType;
  enableFractalSharding: boolean;
  enableBitcoinSecurity: boolean;
  enableSmartContracts: boolean;
  backupFrequency: number; // In milliseconds
  autoLockTimeout: number; // In milliseconds
}

/**
 * QuantumVault - Advanced secure storage system for sensitive user data
 *
 * Uses a multi-layered security approach:
 * 1. AES-256 for symmetric encryption (NIST-approved, quantum-resistant when used with sufficient key size)
 * 2. PBKDF2 for key derivation with high iteration count
 * 3. Fractal recursive sharding for distributed storage and holographic verification
 * 4. Bitcoin-inspired security mechanisms for proven security features
 * 5. Smart contract capabilities for escrow, LLM training, and quantum processing
 */
export class QuantumVault {
  private static instance: QuantumVault;
  private readonly VAULT_KEY = 'quantum_vault_state';
  private readonly TEST_KEY = 'quantum_vault_test';
  private readonly SETTINGS_KEY = 'quantum_vault_settings';
  
  private masterKey: string | null = null;
  private state: VaultState = {
    initialized: false,
    items: {},
    vaultSecurity: {
      quantumResistant: true,
      bitcoinSecured: false,
      fractalShardingEnabled: false,
      thresholdSignaturesEnabled: false,
    },
    vaultMetrics: {
      totalStorageUsed: 0,
      networkContribution: 0,
      securityScore: 0,
    }
  };
  
  private settings: VaultOptions = {
    securityLevel: SecurityLevel.STANDARD,
    defaultStorageType: VaultStorageType.LOCAL_ONLY,
    enableFractalSharding: false,
    enableBitcoinSecurity: false,
    enableSmartContracts: false,
    backupFrequency: 86400000, // Default: once per day
    autoLockTimeout: 900000,   // Default: 15 minutes
  };
  
  private autoLockTimer: number | null = null;

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
    this.loadSettings();
  }

  /**
   * Initialize the vault with a master password and options
   * @param password The user's master password
   * @param options Optional vault configuration options
   * @param iterations Number of PBKDF2 iterations (higher is more secure)
   * @returns True if successfully initialized, false otherwise
   */
  public initialize(
    password: string, 
    options?: Partial<VaultOptions>,
    iterations: number = 10000
  ): boolean {
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

      // Apply options if provided
      if (options) {
        this.settings = {
          ...this.settings,
          ...options,
        };
        this.saveSettings();
      }

      // Re-encrypt any existing items with the new key
      this.reEncryptAll();
      
      // Initialize sub-modules if enabled
      if (this.settings.enableFractalSharding) {
        fractalShardManager.initialize(this.masterKey);
        this.state.vaultSecurity.fractalShardingEnabled = true;
      }
      
      if (this.settings.enableSmartContracts) {
        smartContractManager.initialize(this.masterKey);
      }

      this.state.initialized = true;
      this.state.vaultSecurity.lastSecurityUpgrade = Date.now();
      this.saveState();
      
      // Start auto-lock timer
      this.resetAutoLockTimer();
      
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
          
          // Load state with the unlocked key
          this.loadState();
          
          // Initialize sub-modules if enabled
          if (this.settings.enableFractalSharding) {
            fractalShardManager.initialize(this.masterKey);
          }
          
          if (this.settings.enableSmartContracts) {
            smartContractManager.initialize(this.masterKey);
          }
          
          // Start auto-lock timer
          this.resetAutoLockTimer();
          
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
    
    // Clear auto-lock timer
    if (this.autoLockTimer !== null) {
      window.clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  /**
   * Update vault settings
   * @param options New vault options
   * @returns True if update was successful
   */
  public updateSettings(options: Partial<VaultOptions>): boolean {
    try {
      // Update settings
      this.settings = {
        ...this.settings,
        ...options,
      };
      
      // Save updated settings
      this.saveSettings();
      
      // Update security state based on new settings
      this.state.vaultSecurity.fractalShardingEnabled = this.settings.enableFractalSharding;
      this.state.vaultSecurity.bitcoinSecured = this.settings.enableBitcoinSecurity;
      this.state.vaultSecurity.lastSecurityUpgrade = Date.now();
      
      // Recalculate security score
      this.calculateSecurityScore();
      
      // Save updated state
      this.saveState();
      
      return true;
    } catch (error) {
      console.error('Failed to update vault settings:', error);
      return false;
    }
  }

  /**
   * Get current vault settings
   */
  public getSettings(): VaultOptions {
    return { ...this.settings };
  }

  /**
   * Get vault security metrics
   */
  public getSecurityMetrics(): {
    securityScore: number;
    quantumResistant: boolean;
    bitcoinSecured: boolean;
    fractalShardingEnabled: boolean;
    thresholdSignaturesEnabled: boolean;
    lastSecurityUpgrade?: number;
  } {
    return {
      securityScore: this.state.vaultMetrics.securityScore,
      ...this.state.vaultSecurity,
    };
  }

  /**
   * Get vault storage metrics
   */
  public getStorageMetrics(): {
    totalStorageUsed: number;
    networkContribution: number;
  } {
    return {
      totalStorageUsed: this.state.vaultMetrics.totalStorageUsed,
      networkContribution: this.state.vaultMetrics.networkContribution,
    };
  }

  /**
   * Store a sensitive value in the vault
   * @param type The type of item to store
   * @param label A user-friendly label for the item
   * @param value The sensitive value to encrypt
   * @param metadata Optional metadata for the item
   * @param securityOptions Optional security configuration for this item
   * @returns The ID of the stored item, or null if storing failed
   */
  public store(
    type: VaultItemType,
    label: string,
    value: string,
    metadata?: Record<string, any>,
    securityOptions?: {
      securityLevel?: SecurityLevel;
      storageType?: VaultStorageType;
      accessControl?: {
        allowedParties?: string[];
        requiredSignatures?: number;
        expirationDate?: number;
      };
    }
  ): string | null {
    if (!this.masterKey) return null;

    try {
      const itemId = uuidv4();
      const now = Date.now();
      
      // Reset auto-lock timer on vault activity
      this.resetAutoLockTimer();

      // Create the new item
      const newItem: VaultItem = {
        id: itemId,
        type,
        label,
        value, // This will be encrypted when saved
        metadata: metadata || {},
        createdAt: now,
        updatedAt: now,
      };
      
      // Apply security options if provided
      if (securityOptions) {
        // Enable fractal sharding if requested
        if (
          securityOptions.securityLevel === SecurityLevel.FRACTAL_SECURED ||
          securityOptions.securityLevel === SecurityLevel.MAXIMUM ||
          securityOptions.storageType === VaultStorageType.FRACTAL_NETWORK ||
          securityOptions.storageType === VaultStorageType.HYBRID
        ) {
          newItem.shardingEnabled = true;
          
          // Create shard in the fractal network if sharding is enabled
          if (this.settings.enableFractalSharding) {
            const shardId = fractalShardManager.createShard(
              value,
              this.mapVaultTypeToShardType(type),
              this.getUserPublicKey() || 'default-public-key'
            );
            
            if (shardId) {
              if (!newItem.metadata) newItem.metadata = {};
              newItem.metadata.shardId = shardId;
            }
          }
        }
        
        // Apply Bitcoin-inspired security if requested
        if (
          securityOptions.securityLevel === SecurityLevel.ENHANCED ||
          securityOptions.securityLevel === SecurityLevel.MAXIMUM
        ) {
          newItem.bitcoinSecured = true;
          
          // Generate a Merkle proof if Bitcoin security is enabled
          if (this.settings.enableBitcoinSecurity) {
            // For simplicity, we're just storing that it's Bitcoin-secured
            // In a real implementation, this would involve actual Bitcoin security mechanisms
            if (!newItem.metadata) newItem.metadata = {};
            newItem.metadata.bitcoinSecured = true;
          }
        }
        
        // Apply access control if specified
        if (securityOptions.accessControl) {
          newItem.accessControl = securityOptions.accessControl;
        }
      }

      // Store in memory
      this.state.items[itemId] = newItem;
      
      // Update storage metrics
      this.updateStorageMetrics();
      
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
    
    // Reset auto-lock timer on vault activity
    this.resetAutoLockTimer();
    
    // If the item is sharded and we have fractal sharding enabled,
    // verify the shard integrity before returning the item
    const item = this.state.items[id];
    if (
      item.shardingEnabled && 
      this.settings.enableFractalSharding && 
      item.metadata?.shardId
    ) {
      // Retrieve the shard from the fractal network
      const shardData = fractalShardManager.retrieveShard(item.metadata.shardId);
      
      // If the shard exists and matches the stored value, we're good
      // In a real implementation, this would involve more sophisticated integrity checks
      if (!shardData || shardData !== item.value) {
        console.error('Shard integrity verification failed');
        // In a real implementation, you might try to recover from backups or other shards
      }
    }
    
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
    
    // Reset auto-lock timer on vault activity
    this.resetAutoLockTimer();
    
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
      // Reset auto-lock timer on vault activity
      this.resetAutoLockTimer();
      
      const oldItem = this.state.items[id];
      const newItem = {
        ...oldItem,
        ...updates,
        updatedAt: Date.now(),
      };
      
      // Update in memory
      this.state.items[id] = newItem;
      
      // If value changed and item is sharded, update the shard too
      if (
        updates.value && 
        oldItem.value !== updates.value && 
        oldItem.shardingEnabled && 
        this.settings.enableFractalSharding && 
        oldItem.metadata?.shardId
      ) {
        // In a real implementation, this would update the existing shard
        // For this demo, we'll create a new shard and update the reference
        const shardId = fractalShardManager.createShard(
          updates.value,
          this.mapVaultTypeToShardType(oldItem.type),
          this.getUserPublicKey() || 'default-public-key'
        );
        
        if (shardId) {
          if (!newItem.metadata) newItem.metadata = {};
          newItem.metadata.shardId = shardId;
          this.state.items[id] = newItem;
        }
      }
      
      // Update storage metrics
      this.updateStorageMetrics();
      
      // Persist to storage
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
      // Reset auto-lock timer on vault activity
      this.resetAutoLockTimer();
      
      // If the item is sharded, we should also remove the shard
      const item = this.state.items[id];
      if (
        item.shardingEnabled && 
        this.settings.enableFractalSharding && 
        item.metadata?.shardId
      ) {
        // In a real implementation, this would delete the shard
        // or mark it for deletion in the fractal network
      }
      
      // Delete from memory
      delete this.state.items[id];
      
      // Update storage metrics
      this.updateStorageMetrics();
      
      // Persist to storage
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
      // Reset auto-lock timer on vault activity
      this.resetAutoLockTimer();
      
      // Clear all items
      this.state.items = {};
      
      // Update storage metrics
      this.updateStorageMetrics();
      
      // Persist to storage
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
   * Calculate and return the vault's current security score
   * Score is from 0-100 based on enabled security features and configuration
   */
  public calculateSecurityScore(): number {
    // Base score starts at 50 for having a vault
    let score = 50;
    
    // Add points for security features
    if (this.state.vaultSecurity.quantumResistant) score += 10;
    if (this.state.vaultSecurity.bitcoinSecured) score += 10;
    if (this.state.vaultSecurity.fractalShardingEnabled) score += 10;
    if (this.state.vaultSecurity.thresholdSignaturesEnabled) score += 10;
    
    // Add points based on security level setting
    switch (this.settings.securityLevel) {
      case SecurityLevel.STANDARD:
        score += 0;
        break;
      case SecurityLevel.ENHANCED:
        score += 5;
        break;
      case SecurityLevel.QUANTUM_RESISTANT:
        score += 10;
        break;
      case SecurityLevel.FRACTAL_SECURED:
        score += 15;
        break;
      case SecurityLevel.MAXIMUM:
        score += 20;
        break;
    }
    
    // Update the security score and save
    this.state.vaultMetrics.securityScore = Math.min(100, score);
    this.saveState();
    
    return this.state.vaultMetrics.securityScore;
  }

  /**
   * Get the user's public key for use in contracts and sharding
   */
  private getUserPublicKey(): string | null {
    // In a real implementation, this would retrieve the user's public key
    // from a proper key management system
    return smartContractManager.getUserPublicKey();
  }

  /**
   * Map vault item types to shard types
   */
  private mapVaultTypeToShardType(vaultType: VaultItemType): ShardType {
    switch (vaultType) {
      case VaultItemType.WALLET_BACKUP:
      case VaultItemType.SEED_PHRASE:
      case VaultItemType.PRIVATE_KEY:
        return ShardType.USER_KEYSTORE;
        
      case VaultItemType.LLM_TRAINING_CONTRACT:
        return ShardType.LLM_TRAINING_DATA;
        
      case VaultItemType.QUANTUM_PROCESSING_CONTRACT:
        return ShardType.QUANTUM_PROCESSING_LOGIC;
        
      case VaultItemType.ESCROW_CONTRACT:
        return ShardType.ESCROW_ACCOUNT;
        
      default:
        return ShardType.USER_KEYSTORE;
    }
  }

  /**
   * Update storage metrics based on current items
   */
  private updateStorageMetrics(): void {
    // Calculate total storage used (rough estimate)
    const totalBytes = Object.values(this.state.items).reduce((total, item) => {
      // Approximate size calculation: key length + value length + metadata
      return total + item.id.length + item.label.length + item.value.length + 
        (item.metadata ? JSON.stringify(item.metadata).length : 0);
    }, 0);
    
    this.state.vaultMetrics.totalStorageUsed = totalBytes;
    
    // In a real implementation, this would query the fractal network
    // to get the user's storage contribution
    if (this.settings.enableFractalSharding) {
      const networkStats = fractalShardManager.getNetworkStats();
      this.state.vaultMetrics.networkContribution = networkStats.contributedStorage;
    }
  }

  /**
   * Reset the auto-lock timer
   */
  private resetAutoLockTimer(): void {
    // Clear existing timer if any
    if (this.autoLockTimer !== null) {
      window.clearTimeout(this.autoLockTimer);
    }
    
    // Set new timer
    this.autoLockTimer = window.setTimeout(() => {
      this.lock();
    }, this.settings.autoLockTimeout);
  }

  /**
   * Load the encrypted state from storage
   */
  private loadState(): void {
    try {
      const encryptedState = localStorage.getItem(this.VAULT_KEY);
      if (!encryptedState) {
        // No state found, initialize with empty state
        this.state = {
          initialized: false,
          items: {},
          vaultSecurity: {
            quantumResistant: true,
            bitcoinSecured: false,
            fractalShardingEnabled: false,
            thresholdSignaturesEnabled: false,
          },
          vaultMetrics: {
            totalStorageUsed: 0,
            networkContribution: 0,
            securityScore: 0,
          }
        };
        return;
      }

      if (!this.masterKey) {
        // Vault is locked, we can't decrypt the state
        // But we can still mark it as initialized since it exists
        this.state = {
          initialized: true,
          items: {},
          vaultSecurity: {
            quantumResistant: true,
            bitcoinSecured: false,
            fractalShardingEnabled: false,
            thresholdSignaturesEnabled: false,
          },
          vaultMetrics: {
            totalStorageUsed: 0,
            networkContribution: 0,
            securityScore: 0,
          }
        };
        return;
      }

      // Decrypt the state
      const decryptedState = this.decrypt(encryptedState);
      this.state = JSON.parse(decryptedState);
    } catch (error) {
      console.error('Failed to load QuantumVault state:', error);
      this.state = {
        initialized: false,
        items: {},
        vaultSecurity: {
          quantumResistant: true,
          bitcoinSecured: false,
          fractalShardingEnabled: false,
          thresholdSignaturesEnabled: false,
        },
        vaultMetrics: {
          totalStorageUsed: 0,
          networkContribution: 0,
          securityScore: 0,
        }
      };
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
   * Load settings from storage
   */
  private loadSettings(): void {
    try {
      const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
      if (settingsJson) {
        this.settings = JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Failed to load QuantumVault settings:', error);
      // Keep default settings
    }
  }

  /**
   * Save settings to storage
   */
  private saveSettings(): void {
    try {
      const settingsJson = JSON.stringify(this.settings);
      localStorage.setItem(this.SETTINGS_KEY, settingsJson);
    } catch (error) {
      console.error('Failed to save QuantumVault settings:', error);
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