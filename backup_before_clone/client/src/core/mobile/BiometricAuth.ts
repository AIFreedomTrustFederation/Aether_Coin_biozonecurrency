/**
 * BiometricAuth.ts
 * Implements biometric authentication for mobile devices
 */

import mobileFeatures from './MobileFeatures';

export type BiometricType = 'fingerprint' | 'face' | 'other';
export type BiometricCredential = { id: string; type: BiometricType; createdAt: Date };

interface BiometricAuthOptions {
  timeout?: number; // Timeout in milliseconds
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

/**
 * Class for handling biometric authentication on mobile devices
 * Uses Web Authentication API (WebAuthn) for modern browsers
 */
export class BiometricAuth {
  private static instance: BiometricAuth;
  private isAvailable: boolean = false;
  private credentials: BiometricCredential[] = [];
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.isAvailable = mobileFeatures.isBiometricsAvailable;
    this.loadStoredCredentials();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): BiometricAuth {
    if (!BiometricAuth.instance) {
      BiometricAuth.instance = new BiometricAuth();
    }
    return BiometricAuth.instance;
  }
  
  /**
   * Load stored biometric credentials from local storage
   */
  private loadStoredCredentials(): void {
    try {
      const stored = localStorage.getItem('aetherion_biometric_credentials');
      if (stored) {
        this.credentials = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load biometric credentials:', error);
      this.credentials = [];
    }
  }
  
  /**
   * Save credentials to local storage
   */
  private saveCredentials(): void {
    try {
      localStorage.setItem('aetherion_biometric_credentials', JSON.stringify(this.credentials));
    } catch (error) {
      console.error('Failed to save biometric credentials:', error);
    }
  }
  
  /**
   * Register a new biometric credential for the user
   * @param userId Unique identifier for the user
   * @param options Configuration options for registration
   * @returns Promise resolving to the created credential or null if registration failed
   */
  public async register(
    userId: string, 
    options: BiometricAuthOptions = {}
  ): Promise<BiometricCredential | null> {
    if (!this.isAvailable) {
      throw new Error('Biometric authentication is not available on this device');
    }
    
    try {
      if (!navigator.credentials) {
        throw new Error('Web Authentication API is not supported');
      }
      
      // In a real implementation, this would use the WebAuthn API
      // Here we're simulating the credential creation
      
      // This is where the actual WebAuthn call would happen:
      // const credential = await navigator.credentials.create({
      //   publicKey: { ... }
      // });
      
      // For our simulation, we'll create a mock credential
      const newCredential: BiometricCredential = {
        id: `bio_${userId}_${Date.now()}`,
        type: 'fingerprint', // This would be determined by the actual biometric used
        createdAt: new Date()
      };
      
      this.credentials.push(newCredential);
      this.saveCredentials();
      
      return newCredential;
    } catch (error) {
      console.error('Failed to register biometric credential:', error);
      return null;
    }
  }
  
  /**
   * Authenticate using a previously registered biometric credential
   * @param options Authentication options
   * @returns Promise resolving to a boolean indicating authentication success
   */
  public async authenticate(options: BiometricAuthOptions = {}): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Biometric authentication is not available on this device');
    }
    
    if (this.credentials.length === 0) {
      throw new Error('No biometric credentials registered');
    }
    
    try {
      // In a real implementation, this would use the WebAuthn API
      // Here we're simulating the authentication process
      
      // This is where the actual WebAuthn call would happen:
      // const assertion = await navigator.credentials.get({
      //   publicKey: { ... }
      // });
      
      // For our simulation, we'll simply return a successful authentication
      // In production, this would validate the credential against the server
      
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
  
  /**
   * Remove a registered biometric credential
   * @param credentialId ID of the credential to remove
   * @returns Boolean indicating if removal was successful
   */
  public removeCredential(credentialId: string): boolean {
    const initialLength = this.credentials.length;
    this.credentials = this.credentials.filter(cred => cred.id !== credentialId);
    
    if (this.credentials.length !== initialLength) {
      this.saveCredentials();
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all registered biometric credentials
   */
  public getCredentials(): BiometricCredential[] {
    return [...this.credentials];
  }
  
  /**
   * Check if the user has any registered biometric credentials
   */
  public hasRegisteredCredentials(): boolean {
    return this.credentials.length > 0;
  }
  
  /**
   * Clear all registered biometric credentials
   */
  public clearAllCredentials(): void {
    this.credentials = [];
    this.saveCredentials();
  }
  
  /**
   * Verify if biometric authentication is available
   */
  public isBiometricAuthAvailable(): boolean {
    return this.isAvailable;
  }
}

export default BiometricAuth.getInstance();