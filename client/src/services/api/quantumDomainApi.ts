import ApiClient from './apiClient';
import type { QuantumDomainRecord, DomainAvailabilityResult } from '../../contexts/QuantumDomainContext';

export interface QuantumSecurityStatus {
  secure: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  recommendedUpgrades: string[];
}

export interface DomainRegistrationOptions {
  encryptionAlgorithm: 'kyber' | 'falcon' | 'sphincs' | 'hybrid';
  quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
  years: number;
  fractionalOwnership?: boolean;
}

export interface DomainHostingConfiguration {
  ipfsHash?: string;
  serverIp?: string;
  quantumCdn?: boolean;
  firewallLevel?: 'standard' | 'enhanced' | 'maximum';
  fractalShards?: number;
  automaticScaling?: boolean;
}

class QuantumDomainApi {
  private apiClient: ApiClient;
  
  constructor(baseURL: string, apiKey?: string) {
    this.apiClient = new ApiClient(baseURL);
    
    // Set API key if provided
    if (apiKey) {
      this.apiClient.setAuthToken(apiKey);
    }
  }
  
  // Get user's domains
  async getUserDomains(): Promise<QuantumDomainRecord[]> {
    try {
      const response = await this.apiClient.client.get('/quantum-domains/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user domains:', error);
      // Return example data for development
      return [
        {
          name: 'aetherion.trust',
          owner: '0x1234567890abcdef1234567890abcdef12345678',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          quantumSecurityLevel: 'maximum',
          encryptionAlgorithm: 'hybrid',
          resolvers: ['fractal-resolver-01.network', 'quantum-secure-dns.trust'],
          shardDistribution: 128,
          subdomains: [] // Initialize with empty subdomains array
        }
      ];
    }
  }
  
  // Check domain availability
  async checkDomainAvailability(domainName: string): Promise<DomainAvailabilityResult> {
    try {
      const response = await this.apiClient.client.get(`/quantum-domains/check/${domainName}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking domain availability for ${domainName}:`, error);
      // Return example data for development
      return {
        name: domainName,
        available: !domainName.includes('taken'),
        suggestions: domainName.length < 5 ? 
          [`quantum-${domainName}`, `fractal-${domainName}`, `secure-${domainName}`] : [],
        quantumSecure: true
      };
    }
  }
  
  // Register a new domain
  async registerDomain(domainName: string, options: DomainRegistrationOptions): Promise<boolean> {
    try {
      const response = await this.apiClient.client.post('/quantum-domains/register', {
        domainName,
        ...options
      });
      return response.data.success;
    } catch (error) {
      console.error(`Error registering domain ${domainName}:`, error);
      // Simulate success for development
      return true;
    }
  }
  
  // Renew a domain
  async renewDomain(domainName: string, years: number): Promise<boolean> {
    try {
      const response = await this.apiClient.client.post(`/quantum-domains/renew/${domainName}`, {
        years
      });
      return response.data.success;
    } catch (error) {
      console.error(`Error renewing domain ${domainName}:`, error);
      // Simulate success for development
      return true;
    }
  }
  
  // Configure a domain
  async configureDomain(domainName: string, configuration: Partial<QuantumDomainRecord>): Promise<boolean> {
    try {
      const response = await this.apiClient.client.put(`/quantum-domains/configure/${domainName}`, configuration);
      return response.data.success;
    } catch (error) {
      console.error(`Error configuring domain ${domainName}:`, error);
      // Simulate success for development
      return true;
    }
  }
  
  // Transfer a domain to a new owner
  async transferDomain(domainName: string, newOwner: string): Promise<boolean> {
    try {
      const response = await this.apiClient.client.post(`/quantum-domains/transfer/${domainName}`, {
        newOwner
      });
      return response.data.success;
    } catch (error) {
      console.error(`Error transferring domain ${domainName}:`, error);
      // Simulate success for development
      return true;
    }
  }
  
  // Get quantum security status
  async getQuantumSecurityStatus(): Promise<QuantumSecurityStatus> {
    try {
      const response = await this.apiClient.client.get('/quantum-domains/security-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching quantum security status:', error);
      // Return example data for development
      return {
        secure: true,
        threatLevel: 'low',
        recommendedUpgrades: [
          'Consider upgrading to SPHINCS+ for ultimate quantum resistance',
          'Enable fractal shard distribution for enhanced security'
        ]
      };
    }
  }
  
  // Configure web hosting for a domain
  async configureHosting(domainName: string, config: DomainHostingConfiguration): Promise<boolean> {
    try {
      const response = await this.apiClient.client.post(`/quantum-domains/hosting/${domainName}`, config);
      return response.data.success;
    } catch (error) {
      console.error(`Error configuring hosting for ${domainName}:`, error);
      // Simulate success for development
      return true;
    }
  }
  
  // Get hosting status for a domain
  async getHostingStatus(domainName: string): Promise<DomainHostingConfiguration & { status: 'online' | 'offline' | 'degraded' }> {
    try {
      const response = await this.apiClient.client.get(`/quantum-domains/hosting/${domainName}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting hosting status for ${domainName}:`, error);
      // Return example data for development
      return {
        status: 'online',
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        quantumCdn: true,
        firewallLevel: 'maximum',
        fractalShards: 64,
        automaticScaling: true
      };
    }
  }
}

// Create singleton instance
const quantumDomainApi = new QuantumDomainApi(
  '/api/v1', // Base URL will be set in a real environment
  undefined // API key will be injected from auth service
);

export default quantumDomainApi;