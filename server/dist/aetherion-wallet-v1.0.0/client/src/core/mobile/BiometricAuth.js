"use strict";
/**
 * BiometricAuth.ts
 * Implements biometric authentication for mobile devices
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometricAuth = void 0;
const MobileFeatures_1 = __importDefault(require("./MobileFeatures"));
/**
 * Class for handling biometric authentication on mobile devices
 * Uses Web Authentication API (WebAuthn) for modern browsers
 */
class BiometricAuth {
    /**
     * Private constructor for singleton pattern
     */
    constructor() {
        this.isAvailable = false;
        this.credentials = [];
        this.isAvailable = MobileFeatures_1.default.isBiometricsAvailable;
        this.loadStoredCredentials();
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!BiometricAuth.instance) {
            BiometricAuth.instance = new BiometricAuth();
        }
        return BiometricAuth.instance;
    }
    /**
     * Load stored biometric credentials from local storage
     */
    loadStoredCredentials() {
        try {
            const stored = localStorage.getItem('aetherion_biometric_credentials');
            if (stored) {
                this.credentials = JSON.parse(stored);
            }
        }
        catch (error) {
            console.error('Failed to load biometric credentials:', error);
            this.credentials = [];
        }
    }
    /**
     * Save credentials to local storage
     */
    saveCredentials() {
        try {
            localStorage.setItem('aetherion_biometric_credentials', JSON.stringify(this.credentials));
        }
        catch (error) {
            console.error('Failed to save biometric credentials:', error);
        }
    }
    /**
     * Register a new biometric credential for the user
     * @param userId Unique identifier for the user
     * @param options Configuration options for registration
     * @returns Promise resolving to the created credential or null if registration failed
     */
    async register(userId, options = {}) {
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
            const newCredential = {
                id: `bio_${userId}_${Date.now()}`,
                type: 'fingerprint', // This would be determined by the actual biometric used
                createdAt: new Date()
            };
            this.credentials.push(newCredential);
            this.saveCredentials();
            return newCredential;
        }
        catch (error) {
            console.error('Failed to register biometric credential:', error);
            return null;
        }
    }
    /**
     * Authenticate using a previously registered biometric credential
     * @param options Authentication options
     * @returns Promise resolving to a boolean indicating authentication success
     */
    async authenticate(options = {}) {
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
        }
        catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    }
    /**
     * Remove a registered biometric credential
     * @param credentialId ID of the credential to remove
     * @returns Boolean indicating if removal was successful
     */
    removeCredential(credentialId) {
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
    getCredentials() {
        return [...this.credentials];
    }
    /**
     * Check if the user has any registered biometric credentials
     */
    hasRegisteredCredentials() {
        return this.credentials.length > 0;
    }
    /**
     * Clear all registered biometric credentials
     */
    clearAllCredentials() {
        this.credentials = [];
        this.saveCredentials();
    }
    /**
     * Verify if biometric authentication is available
     */
    isBiometricAuthAvailable() {
        return this.isAvailable;
    }
}
exports.BiometricAuth = BiometricAuth;
exports.default = BiometricAuth.getInstance();
