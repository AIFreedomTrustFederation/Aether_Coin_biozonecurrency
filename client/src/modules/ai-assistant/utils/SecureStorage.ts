import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { CredentialType, SecureCredential } from "../types";

/**
 * Secure storage utility for sensitive credentials
 * Uses AES encryption with a master key derived from the user's session
 */
class SecureStorage {
  private readonly STORAGE_KEY = "ai_secure_credentials";
  private readonly TEST_KEY = "ai_secure_storage_test";
  private masterKey: string | null = null;
  private credentials: SecureCredential[] = [];
  private initialized = false;
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Initialize secure storage with a master key
   */
  initialize(userKey: string): boolean {
    if (!userKey) return false;
    
    try {
      // Derive master key from user key (in a real app, use proper key derivation)
      this.masterKey = CryptoJS.SHA256(userKey).toString();
      
      // Test if we can encrypt/decrypt with this key
      const testData = `test-${Date.now()}`;
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      
      if (decrypted !== testData) {
        this.masterKey = null;
        return false;
      }
      
      // Save test key to verify later
      localStorage.setItem(this.TEST_KEY, encrypted);
      
      // Re-encrypt any stored credentials with the new key
      this.reEncryptAll();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize secure storage:", error);
      this.masterKey = null;
      return false;
    }
  }
  
  /**
   * Check if secure storage is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Store a credential securely
   */
  saveCredential(type: CredentialType, name: string, data: string, label?: string): SecureCredential | null {
    if (!this.masterKey) return null;
    
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const credential: SecureCredential = {
        id,
        type,
        name,
        createdAt: now,
        lastUsed: null,
        label: label || null,
        isEncrypted: true,
        data: this.encrypt(data)
      };
      
      this.credentials.push(credential);
      this.saveToStorage();
      
      // Return a copy without sensitive data
      return this.sanitizeCredential(credential);
    } catch (error) {
      console.error("Failed to save credential:", error);
      return null;
    }
  }
  
  /**
   * Get a credential by ID
   */
  getCredential(id: string): SecureCredential | null {
    if (!this.masterKey) return null;
    
    const credential = this.credentials.find(c => c.id === id);
    if (!credential) return null;
    
    try {
      // Update last used timestamp
      credential.lastUsed = new Date().toISOString();
      this.saveToStorage();
      
      // Return a copy with decrypted data
      return {
        ...credential,
        data: credential.isEncrypted ? this.decrypt(credential.data!) : credential.data
      };
    } catch (error) {
      console.error("Failed to get credential:", error);
      return null;
    }
  }
  
  /**
   * Get all credentials (without sensitive data)
   */
  getAllCredentials(): SecureCredential[] {
    return this.credentials.map(this.sanitizeCredential);
  }
  
  /**
   * Delete a credential by ID
   */
  deleteCredential(id: string): boolean {
    const initialLength = this.credentials.length;
    this.credentials = this.credentials.filter(c => c.id !== id);
    
    if (this.credentials.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }
  
  /**
   * Reset all storage (for logout/session end)
   */
  reset(): void {
    this.masterKey = null;
    this.credentials = [];
    this.initialized = false;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TEST_KEY);
  }
  
  /**
   * Verify if the current key can decrypt the test data
   */
  verifyMasterKey(): boolean {
    if (!this.masterKey) return false;
    
    try {
      const testEncrypted = localStorage.getItem(this.TEST_KEY);
      if (!testEncrypted) return false;
      
      // Try to decrypt
      const decrypted = this.decrypt(testEncrypted);
      
      // If we can decrypt and it starts with "test-", key is valid
      return decrypted.startsWith("test-");
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Load credentials from storage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.credentials = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load from storage:", error);
      this.credentials = [];
    }
  }
  
  /**
   * Save credentials to storage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.credentials));
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  }
  
  /**
   * Encrypt data with the master key
   */
  private encrypt(data: string): string {
    if (!this.masterKey) throw new Error("Master key not initialized");
    
    try {
      return CryptoJS.AES.encrypt(data, this.masterKey).toString();
    } catch (error) {
      console.error("Encryption failed:", error);
      throw error;
    }
  }
  
  /**
   * Decrypt data with the master key
   */
  private decrypt(encryptedData: string): string {
    if (!this.masterKey) throw new Error("Master key not initialized");
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw error;
    }
  }
  
  /**
   * Re-encrypt all credentials with the current master key
   */
  private reEncryptAll(): void {
    if (!this.masterKey) return;
    
    // Skip if no credentials
    if (this.credentials.length === 0) return;
    
    try {
      this.credentials = this.credentials.map(credential => {
        // Skip if already properly encrypted or has no data
        if (!credential.data) return credential;
        
        // Try to decrypt and re-encrypt if needed
        if (credential.isEncrypted) {
          try {
            const decrypted = this.decrypt(credential.data);
            return {
              ...credential,
              data: this.encrypt(decrypted)
            };
          } catch (e) {
            // If we can't decrypt, the credential may be encrypted with a different key
            // We can't recover this data, so we'll mark it as corrupted
            return {
              ...credential,
              isEncrypted: false,
              data: "[Encryption key changed - data inaccessible]"
            };
          }
        } else {
          // Not encrypted, encrypt it now
          return {
            ...credential,
            isEncrypted: true,
            data: this.encrypt(credential.data)
          };
        }
      });
      
      this.saveToStorage();
    } catch (error) {
      console.error("Failed to re-encrypt credentials:", error);
    }
  }
  
  /**
   * Create a copy of the credential without sensitive data
   */
  private sanitizeCredential(credential: SecureCredential): SecureCredential {
    const { data, ...safeCredential } = credential;
    return safeCredential as SecureCredential;
  }
}

// Export a singleton instance
const secureStorage = new SecureStorage();
export { secureStorage };
export default secureStorage;