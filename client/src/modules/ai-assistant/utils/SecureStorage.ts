import SecureWebStorage from 'secure-web-storage';
import CryptoJS from 'crypto-js';
import { SecureCredential } from '../types';

/**
 * SecureStorage utility for encrypted storage of sensitive credentials
 * Uses AES encryption with user-provided secret key
 */
class SecureStorage {
  private storage: SecureWebStorage | null = null;
  private secretKey: string = '';
  private initialized: boolean = false;

  /**
   * Initialize secure storage with a secret key
   * @param secretKey - User's secret key for encryption/decryption
   * @returns boolean indicating success
   */
  initialize(secretKey: string): boolean {
    try {
      this.secretKey = secretKey;
      
      this.storage = new SecureWebStorage(localStorage, {
        hash: (key: string) => {
          // Create a hash of the key for storage
          return CryptoJS.SHA256(key).toString();
        },
        encrypt: (data: string) => {
          // Encrypt the data with AES
          return CryptoJS.AES.encrypt(data, this.secretKey).toString();
        },
        decrypt: (data: string) => {
          // Decrypt the data
          return CryptoJS.AES.decrypt(data, this.secretKey).toString(CryptoJS.enc.Utf8);
        }
      });
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Store a credential securely
   * @param credential - The credential to store
   * @returns boolean indicating success
   */
  storeCredential(credential: SecureCredential): boolean {
    if (!this.initialized || !this.storage) {
      console.error('Secure storage not initialized');
      return false;
    }

    try {
      // Store credential in secure storage
      const credentialsKey = `credentials_${credential.type}`;
      
      // Get existing credentials of this type
      const existingCredentialsStr = this.storage.getItem(credentialsKey) || '[]';
      const existingCredentials: SecureCredential[] = JSON.parse(existingCredentialsStr);
      
      // Add new credential
      existingCredentials.push({
        ...credential,
        createdAt: new Date()
      });
      
      // Store updated list
      this.storage.setItem(credentialsKey, JSON.stringify(existingCredentials));
      
      return true;
    } catch (error) {
      console.error('Failed to store credential:', error);
      return false;
    }
  }

  /**
   * Retrieve a credential by ID
   * @param id - The ID of the credential to retrieve
   * @param type - The type of credential
   * @returns The credential if found, undefined otherwise
   */
  getCredential(id: string, type: SecureCredential['type']): SecureCredential | undefined {
    if (!this.initialized || !this.storage) {
      console.error('Secure storage not initialized');
      return undefined;
    }

    try {
      const credentialsKey = `credentials_${type}`;
      
      // Get credentials of this type
      const credentialsStr = this.storage.getItem(credentialsKey) || '[]';
      const credentials: SecureCredential[] = JSON.parse(credentialsStr);
      
      // Find credential by ID
      const credential = credentials.find(cred => cred.id === id);
      
      if (credential) {
        // Update last accessed timestamp
        this.updateLastAccessed(id, type);
        return credential;
      }
      
      return undefined;
    } catch (error) {
      console.error('Failed to retrieve credential:', error);
      return undefined;
    }
  }

  /**
   * List all stored credentials of a specific type
   * @param type - The type of credentials to list
   * @returns Array of credentials of the specified type
   */
  listCredentials(type: SecureCredential['type']): SecureCredential[] {
    if (!this.initialized || !this.storage) {
      console.error('Secure storage not initialized');
      return [];
    }

    try {
      const credentialsKey = `credentials_${type}`;
      
      // Get credentials of this type
      const credentialsStr = this.storage.getItem(credentialsKey) || '[]';
      return JSON.parse(credentialsStr);
    } catch (error) {
      console.error('Failed to list credentials:', error);
      return [];
    }
  }

  /**
   * Delete a credential by ID
   * @param id - The ID of the credential to delete
   * @param type - The type of credential
   * @returns boolean indicating success
   */
  deleteCredential(id: string, type: SecureCredential['type']): boolean {
    if (!this.initialized || !this.storage) {
      console.error('Secure storage not initialized');
      return false;
    }

    try {
      const credentialsKey = `credentials_${type}`;
      
      // Get credentials of this type
      const credentialsStr = this.storage.getItem(credentialsKey) || '[]';
      const credentials: SecureCredential[] = JSON.parse(credentialsStr);
      
      // Filter out the credential to delete
      const updatedCredentials = credentials.filter(cred => cred.id !== id);
      
      // Store updated list
      this.storage.setItem(credentialsKey, JSON.stringify(updatedCredentials));
      
      return true;
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return false;
    }
  }

  /**
   * Update the last accessed timestamp for a credential
   * @param id - The ID of the credential to update
   * @param type - The type of credential
   * @returns boolean indicating success
   */
  private updateLastAccessed(id: string, type: SecureCredential['type']): boolean {
    try {
      const credentialsKey = `credentials_${type}`;
      
      // Get credentials of this type
      const credentialsStr = this.storage?.getItem(credentialsKey) || '[]';
      const credentials: SecureCredential[] = JSON.parse(credentialsStr);
      
      // Update the credential
      const updatedCredentials = credentials.map(cred => {
        if (cred.id === id) {
          return {
            ...cred,
            lastAccessed: new Date()
          };
        }
        return cred;
      });
      
      // Store updated list
      this.storage?.setItem(credentialsKey, JSON.stringify(updatedCredentials));
      
      return true;
    } catch (error) {
      console.error('Failed to update last accessed timestamp:', error);
      return false;
    }
  }

  /**
   * Clear all credentials
   * @returns boolean indicating success
   */
  clearAll(): boolean {
    if (!this.initialized || !this.storage) {
      console.error('Secure storage not initialized');
      return false;
    }

    try {
      // Clear credentials of all types
      const credentialTypes: SecureCredential['type'][] = [
        'password',
        'seed',
        'private_key',
        'api_key',
        'other'
      ];
      
      for (const type of credentialTypes) {
        this.storage.removeItem(`credentials_${type}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      return false;
    }
  }

  /**
   * Check if secure storage is initialized
   * @returns boolean indicating if storage is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Change the secret key and re-encrypt all stored credentials
   * @param newSecretKey - The new secret key
   * @returns boolean indicating success
   */
  changeSecretKey(newSecretKey: string): boolean {
    if (!this.initialized || !this.storage) {
      console.error('Secure storage not initialized');
      return false;
    }

    try {
      const credentialTypes: SecureCredential['type'][] = [
        'password',
        'seed',
        'private_key',
        'api_key',
        'other'
      ];
      
      // Temporarily store all credentials
      const allCredentials: Record<string, SecureCredential[]> = {};
      
      // Get all credentials
      for (const type of credentialTypes) {
        const credentialsKey = `credentials_${type}`;
        const credentialsStr = this.storage.getItem(credentialsKey) || '[]';
        allCredentials[type] = JSON.parse(credentialsStr);
      }
      
      // Re-initialize with new secret key
      this.initialize(newSecretKey);
      
      // Re-store all credentials with new encryption
      for (const type of credentialTypes) {
        const credentialsKey = `credentials_${type}`;
        this.storage?.setItem(credentialsKey, JSON.stringify(allCredentials[type] || []));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to change secret key:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new SecureStorage();