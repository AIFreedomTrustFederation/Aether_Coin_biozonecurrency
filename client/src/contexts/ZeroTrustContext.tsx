/**
 * ZeroTrustContext
 * 
 * A React context that provides access to the zero-trust security framework
 * throughout the application. This context integrates all the security components
 * (FractalVault, AetherMesh, QuantumGuard, BioZoeSecrets) and provides a unified
 * interface for secure operations.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import FractalVault from "@/services/security/fractal-vault";
import AetherMesh, { ZeroTrustCredentials } from "@/services/security/aether-mesh";
import QuantumGuard, { AuthToken, AuthFactor } from "@/services/security/quantum-guard";
import BioZoeSecrets, { RecoveryInfo } from "@/services/security/biozoe-secrets";
import { toast } from "sonner";

// Interface for the zero-trust context
interface ZeroTrustContextType {
  // Status
  isInitialized: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  securityLevel: 'high' | 'medium' | 'low';
  authToken: AuthToken | null;
  userVerificationStatus: 'active' | 'pending' | 'failed';
  
  // Authentication
  authenticateUser: (credentials: {
    userId: string;
    password: string;
    secondaryFactors?: AuthFactor[];
  }) => Promise<boolean>;
  logout: () => void;
  verifyIdentity: () => Promise<boolean>;
  
  // Secure operations
  signTransaction: (transaction: any) => Promise<any>;
  
  // Secure storage
  secureStorage: {
    storeSecret: (key: string, value: any) => Promise<RecoveryInfo | null>;
    getSecret: (key: string, recoveryInfo: RecoveryInfo) => Promise<any>;
  };
  
  // Network
  secureNetwork: {
    connectToPeer: (peerId: string, credentials: ZeroTrustCredentials) => Promise<boolean>;
    sendToPeer: (peerId: string, message: any) => Promise<boolean>;
    getActivePeers: () => string[];
  };
}

// Create the context
const ZeroTrustContext = createContext<ZeroTrustContextType | null>(null);

// Provider component
export const ZeroTrustProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [authToken, setAuthToken] = useState<AuthToken | null>(null);
  const [userVerificationStatus, setUserVerificationStatus] = useState<'active' | 'pending' | 'failed'>('pending');
  
  // Security service instances
  const [vault, setVault] = useState<FractalVault | null>(null);
  const [mesh, setMesh] = useState<AetherMesh | null>(null);
  const [guard, setGuard] = useState<QuantumGuard | null>(null);
  const [secrets, setSecrets] = useState<BioZoeSecrets | null>(null);
  
  // Initialize all security services
  useEffect(() => {
    const initSecurity = async () => {
      if (isInitializing || isInitialized) return;
      
      setIsInitializing(true);
      
      try {
        console.log("Initializing AetherCore zero-trust security framework...");
        
        // Initialize FractalVault
        const vaultInstance = FractalVault.getInstance();
        const vaultInitialized = await vaultInstance.initialize();
        if (!vaultInitialized) {
          throw new Error("Failed to initialize FractalVault");
        }
        setVault(vaultInstance);
        
        // Initialize AetherMesh
        const meshInstance = new AetherMesh();
        const meshInitialized = await meshInstance.initialize();
        if (!meshInitialized) {
          throw new Error("Failed to initialize AetherMesh");
        }
        setMesh(meshInstance);
        
        // Initialize QuantumGuard
        const guardInstance = new QuantumGuard();
        const guardInitialized = await guardInstance.initialize();
        if (!guardInitialized) {
          throw new Error("Failed to initialize QuantumGuard");
        }
        setGuard(guardInstance);
        
        // Initialize BioZoeSecrets
        const secretsInstance = new BioZoeSecrets();
        const secretsInitialized = await secretsInstance.initialize();
        if (!secretsInitialized) {
          throw new Error("Failed to initialize BioZoeSecrets");
        }
        setSecrets(secretsInstance);
        
        setIsInitialized(true);
        console.log("AetherCore zero-trust security framework initialized successfully");
        toast.success("Zero-trust security framework initialized");
      } catch (error) {
        console.error("Failed to initialize security services:", error);
        toast.error("Failed to initialize security framework");
      } finally {
        setIsInitializing(false);
      }
    };
    
    initSecurity();
  }, [isInitializing, isInitialized]);
  
  /**
   * Authenticate a user
   */
  const authenticateUser = async (credentials: {
    userId: string;
    password: string;
    secondaryFactors?: AuthFactor[];
  }): Promise<boolean> => {
    if (!guard) {
      toast.error("Security framework not initialized");
      return false;
    }
    
    try {
      const token = await guard.authenticateUser(
        credentials.userId,
        credentials.password,
        credentials.secondaryFactors
      );
      
      setAuthToken(token);
      setIsAuthenticated(true);
      setUserVerificationStatus('active');
      
      // Set security level based on token metadata
      const riskLevel = token.metadata?.riskLevel || 'medium';
      setSecurityLevel(riskLevel === 'critical' || riskLevel === 'high' ? 'low' : 
                      riskLevel === 'medium' ? 'medium' : 'high');
      
      toast.success("Authentication successful");
      return true;
    } catch (error) {
      console.error("Authentication failed:", error);
      toast.error("Authentication failed");
      return false;
    }
  };
  
  /**
   * Log out the current user
   */
  const logout = (): void => {
    if (!guard || !authToken) return;
    
    try {
      guard.logout(authToken.userId);
      setAuthToken(null);
      setIsAuthenticated(false);
      setUserVerificationStatus('pending');
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  /**
   * Verify the current user's identity
   */
  const verifyIdentity = async (): Promise<boolean> => {
    if (!guard || !authToken) return false;
    
    try {
      const verificationResult = await guard.verifyIdentity(authToken);
      setUserVerificationStatus(verificationResult.valid ? 'active' : 'failed');
      
      if (!verificationResult.valid) {
        toast.warning("Identity verification failed. Please re-authenticate.");
        // Optionally log the user out here
        // logout();
      }
      
      return verificationResult.valid;
    } catch (error) {
      console.error("Identity verification error:", error);
      setUserVerificationStatus('failed');
      return false;
    }
  };
  
  /**
   * Sign a transaction securely
   */
  const signTransaction = async (transaction: any): Promise<any> => {
    if (!vault || !authToken) {
      throw new Error("Secure environment not initialized or user not authenticated");
    }
    
    try {
      // Verify identity before signing
      if (!await verifyIdentity()) {
        throw new Error("Identity verification failed");
      }
      
      return await vault.signTransaction(transaction, authToken.token);
    } catch (error) {
      console.error("Secure transaction signing failed:", error);
      toast.error("Transaction signing failed");
      throw error;
    }
  };
  
  /**
   * Store a secret securely
   */
  const storeSecret = async (key: string, value: any): Promise<RecoveryInfo | null> => {
    if (!secrets) {
      toast.error("Secret management not initialized");
      return null;
    }
    
    try {
      // Convert to string if needed
      const secretString = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Store the secret
      const result = await secrets.storeStringSecret(secretString);
      
      return result.recoveryInfo;
    } catch (error) {
      console.error("Failed to store secret:", error);
      toast.error("Failed to store secret");
      return null;
    }
  };
  
  /**
   * Retrieve a secret
   */
  const getSecret = async (key: string, recoveryInfo: RecoveryInfo): Promise<any> => {
    if (!secrets) {
      toast.error("Secret management not initialized");
      return null;
    }
    
    try {
      // Retrieve the secret
      const secretString = await secrets.retrieveStringSecret(recoveryInfo);
      
      if (!secretString) {
        throw new Error("Failed to reconstruct secret");
      }
      
      // Try to parse as JSON if applicable
      try {
        return JSON.parse(secretString);
      } catch {
        // If not valid JSON, return as string
        return secretString;
      }
    } catch (error) {
      console.error("Failed to retrieve secret:", error);
      toast.error("Failed to retrieve secret");
      return null;
    }
  };
  
  /**
   * Connect to a peer securely
   */
  const connectToPeer = async (peerId: string, credentials: ZeroTrustCredentials): Promise<boolean> => {
    if (!mesh) {
      toast.error("Secure network not initialized");
      return false;
    }
    
    try {
      await mesh.connectToPeer(peerId, credentials);
      return true;
    } catch (error) {
      console.error("Failed to connect to peer:", error);
      toast.error(`Failed to establish secure connection to ${peerId}`);
      return false;
    }
  };
  
  /**
   * Send a message to a peer securely
   */
  const sendToPeer = async (peerId: string, message: any): Promise<boolean> => {
    if (!mesh) {
      toast.error("Secure network not initialized");
      return false;
    }
    
    try {
      return await mesh.sendToPeer(peerId, message);
    } catch (error) {
      console.error("Failed to send to peer:", error);
      toast.error(`Failed to send message to ${peerId}`);
      return false;
    }
  };
  
  /**
   * Get a list of active peer connections
   */
  const getActivePeers = (): string[] => {
    if (!mesh) return [];
    return mesh.getActivePeers();
  };
  
  // Create the context value
  const contextValue: ZeroTrustContextType = {
    // Status
    isInitialized,
    isInitializing,
    isAuthenticated,
    securityLevel,
    authToken,
    userVerificationStatus,
    
    // Authentication
    authenticateUser,
    logout,
    verifyIdentity,
    
    // Secure operations
    signTransaction,
    
    // Secure storage
    secureStorage: {
      storeSecret,
      getSecret
    },
    
    // Network
    secureNetwork: {
      connectToPeer,
      sendToPeer,
      getActivePeers
    }
  };
  
  return (
    <ZeroTrustContext.Provider value={contextValue}>
      {children}
    </ZeroTrustContext.Provider>
  );
};

/**
 * Hook for using the Zero Trust context
 */
export const useZeroTrust = (): ZeroTrustContextType => {
  const context = useContext(ZeroTrustContext);
  if (!context) {
    throw new Error("useZeroTrust must be used within a ZeroTrustProvider");
  }
  return context;
};

export default ZeroTrustContext;