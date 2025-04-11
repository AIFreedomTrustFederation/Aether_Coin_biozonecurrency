import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Subdomain record interface
export interface SubdomainRecord {
  name: string; // Full subdomain name (e.g., blog.example.trust)
  createdAt: string;
  pointsTo: string; // IP, IPFS hash, or other destination
  type: 'a' | 'cname' | 'ipfs' | 'fractalNode' | 'quantumSecure';
  quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
  shardDistribution: number;
  enabled: boolean;
  customSSL?: boolean;
}

// Domain record interface with quantum security information
export interface QuantumDomainRecord {
  name: string;
  owner: string;
  expiresAt: string;
  registeredAt: string;
  quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
  encryptionAlgorithm: 'kyber' | 'falcon' | 'sphincs' | 'hybrid';
  resolvers: string[];
  shardDistribution: number; // Number of shards this domain is distributed across
  subdomains: SubdomainRecord[];
  fractionalOwnership?: {
    address: string;
    percentage: number;
  }[];
}

// Domain availability check result
export interface DomainAvailabilityResult {
  name: string;
  available: boolean;
  suggestions?: string[];
  quantumSecure: boolean;
}

// Context state interface
interface QuantumDomainContextState {
  userDomains: QuantumDomainRecord[];
  isLoading: boolean;
  error: string | null;
  currentDomain: QuantumDomainRecord | null;
  quantumSecurityStatus: {
    secure: boolean;
    threatLevel: 'low' | 'medium' | 'high';
    recommendedUpgrades: string[];
  };
  // Actions
  registerDomain: (domainName: string, options: {
    encryptionAlgorithm: 'kyber' | 'falcon' | 'sphincs' | 'hybrid';
    quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
    years: number;
    fractionalOwnership?: boolean;
  }) => Promise<boolean>;
  checkDomainAvailability: (domainName: string) => Promise<DomainAvailabilityResult>;
  renewDomain: (domainName: string, years: number) => Promise<boolean>;
  configureDomain: (domainName: string, configuration: Partial<QuantumDomainRecord>) => Promise<boolean>;
  transferDomain: (domainName: string, newOwner: string) => Promise<boolean>;
  selectDomain: (domainName: string) => void;
}

// Create the context with a default undefined value
const QuantumDomainContext = createContext<QuantumDomainContextState | undefined>(undefined);

// Provider component
export const QuantumDomainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userDomains, setUserDomains] = useState<QuantumDomainRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<QuantumDomainRecord | null>(null);
  const [quantumSecurityStatus, setQuantumSecurityStatus] = useState({
    secure: true,
    threatLevel: 'low' as const,
    recommendedUpgrades: []
  });

  // Load user domains on mount
  useEffect(() => {
    const loadUserDomains = async () => {
      setIsLoading(true);
      try {
        // This will be replaced with actual API calls
        // For now we're simulating the response
        const domains = [
          {
            name: 'aetherion.trust',
            owner: '0x1234567890abcdef1234567890abcdef12345678',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            quantumSecurityLevel: 'maximum' as const,
            encryptionAlgorithm: 'hybrid' as const,
            resolvers: ['fractal-resolver-01.network', 'quantum-secure-dns.trust'],
            shardDistribution: 128,
            subdomains: [
              {
                name: 'blog.aetherion.trust',
                createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
                type: 'ipfs' as const,
                quantumSecurityLevel: 'maximum' as const,
                shardDistribution: 64,
                enabled: true,
                customSSL: true
              },
              {
                name: 'app.aetherion.trust',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: '203.0.113.15',
                type: 'a' as const,
                quantumSecurityLevel: 'enhanced' as const,
                shardDistribution: 32,
                enabled: true,
                customSSL: true
              },
              {
                name: 'wallet.aetherion.trust',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: 'fractal://node-cluster/aetherion-wallet',
                type: 'fractalNode' as const,
                quantumSecurityLevel: 'maximum' as const,
                shardDistribution: 128,
                enabled: true,
                customSSL: true
              },
              {
                name: 'docs.aetherion.trust',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: 'aetherion-docs.github.io',
                type: 'cname' as const,
                quantumSecurityLevel: 'standard' as const,
                shardDistribution: 32,
                enabled: true
              }
            ]
          },
          {
            name: 'fractalcoin.trust',
            owner: '0x1234567890abcdef1234567890abcdef12345678',
            expiresAt: new Date(Date.now() + 545 * 24 * 60 * 60 * 1000).toISOString(),
            registeredAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            quantumSecurityLevel: 'enhanced' as const,
            encryptionAlgorithm: 'kyber' as const,
            resolvers: ['fractal-resolver-01.network', 'quantum-secure-dns.trust'],
            shardDistribution: 64,
            subdomains: [
              {
                name: 'exchange.fractalcoin.trust',
                createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: '203.0.113.25',
                type: 'a' as const,
                quantumSecurityLevel: 'maximum' as const,
                shardDistribution: 128,
                enabled: true,
                customSSL: true
              },
              {
                name: 'staking.fractalcoin.trust',
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
                type: 'ipfs' as const,
                quantumSecurityLevel: 'enhanced' as const,
                shardDistribution: 64,
                enabled: true,
                customSSL: true
              },
              {
                name: 'explorer.fractalcoin.trust',
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                pointsTo: 'fractal://explorer-main/fractalcoin',
                type: 'fractalNode' as const,
                quantumSecurityLevel: 'enhanced' as const,
                shardDistribution: 64,
                enabled: true
              }
            ]
          }
        ];
        
        setUserDomains(domains);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load domains');
        console.error('Error loading user domains:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserDomains();
  }, []);

  // Register a new domain
  const registerDomain = async (domainName: string, options: {
    encryptionAlgorithm: 'kyber' | 'falcon' | 'sphincs' | 'hybrid';
    quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
    years: number;
    fractionalOwnership?: boolean;
  }) => {
    setIsLoading(true);
    try {
      // Simulated API call
      console.log(`Registering ${domainName} with options:`, options);
      
      // Add the new domain to the list
      const newDomain: QuantumDomainRecord = {
        name: domainName,
        owner: '0x1234567890abcdef1234567890abcdef12345678', // Would come from wallet connection
        expiresAt: new Date(Date.now() + options.years * 365 * 24 * 60 * 60 * 1000).toISOString(),
        registeredAt: new Date().toISOString(),
        quantumSecurityLevel: options.quantumSecurityLevel,
        encryptionAlgorithm: options.encryptionAlgorithm,
        resolvers: ['fractal-resolver-01.network', 'quantum-secure-dns.trust'],
        shardDistribution: options.quantumSecurityLevel === 'maximum' ? 128 : 
                          options.quantumSecurityLevel === 'enhanced' ? 64 : 32,
        subdomains: [] // Initialize with empty subdomains array
      };
      
      setUserDomains(prev => [...prev, newDomain]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register domain');
      console.error('Error registering domain:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a domain is available
  const checkDomainAvailability = async (domainName: string): Promise<DomainAvailabilityResult> => {
    setIsLoading(true);
    try {
      // Simulated API call
      console.log(`Checking availability for ${domainName}`);
      
      // Simulate a response - in production this would call the blockchain
      const result: DomainAvailabilityResult = {
        name: domainName,
        available: !domainName.includes('taken'),
        suggestions: domainName.includes('suggest') ? 
          [`ai-${domainName}`, `crypto-${domainName}`, `quantum-${domainName}`] : [],
        quantumSecure: true
      };
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check domain availability');
      console.error('Error checking domain availability:', err);
      return {
        name: domainName,
        available: false,
        quantumSecure: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Renew a domain
  const renewDomain = async (domainName: string, years: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulated API call
      console.log(`Renewing ${domainName} for ${years} years`);
      
      // Update the expiration date of the domain
      setUserDomains(prev => prev.map(domain => {
        if (domain.name === domainName) {
          const expiryDate = new Date(domain.expiresAt);
          expiryDate.setFullYear(expiryDate.getFullYear() + years);
          return {
            ...domain,
            expiresAt: expiryDate.toISOString()
          };
        }
        return domain;
      }));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew domain');
      console.error('Error renewing domain:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Configure a domain
  const configureDomain = async (domainName: string, configuration: Partial<QuantumDomainRecord>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulated API call
      console.log(`Configuring ${domainName} with:`, configuration);
      
      // Update the domain configuration
      setUserDomains(prev => prev.map(domain => {
        if (domain.name === domainName) {
          return {
            ...domain,
            ...configuration
          };
        }
        return domain;
      }));
      
      // Update the current domain if it's the one being configured
      if (currentDomain && currentDomain.name === domainName) {
        setCurrentDomain(prev => prev ? {...prev, ...configuration} : null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to configure domain');
      console.error('Error configuring domain:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer a domain to a new owner
  const transferDomain = async (domainName: string, newOwner: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulated API call
      console.log(`Transferring ${domainName} to ${newOwner}`);
      
      // Update the owner of the domain
      setUserDomains(prev => prev.map(domain => {
        if (domain.name === domainName) {
          return {
            ...domain,
            owner: newOwner
          };
        }
        return domain;
      }));
      
      // Clear the current domain if it's the one being transferred
      if (currentDomain && currentDomain.name === domainName) {
        setCurrentDomain(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer domain');
      console.error('Error transferring domain:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Select a domain to view/edit
  const selectDomain = (domainName: string) => {
    const domain = userDomains.find(d => d.name === domainName) || null;
    setCurrentDomain(domain);
  };

  // Context value
  const value = {
    userDomains,
    isLoading,
    error,
    currentDomain,
    quantumSecurityStatus,
    registerDomain,
    checkDomainAvailability,
    renewDomain,
    configureDomain,
    transferDomain,
    selectDomain
  };

  return (
    <QuantumDomainContext.Provider value={value}>
      {children}
    </QuantumDomainContext.Provider>
  );
};

// Custom hook to use the context
export const useQuantumDomain = (): QuantumDomainContextState => {
  const context = useContext(QuantumDomainContext);
  if (context === undefined) {
    throw new Error('useQuantumDomain must be used within a QuantumDomainProvider');
  }
  return context;
};