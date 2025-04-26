/**
 * FractalDNS Client Service
 * Provides client-side interface to the FractalDNS system
 */

import { apiRequest } from '../api/apiClient';

// DNS record types
export enum RecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  MX = 'MX',
  TXT = 'TXT',
  NS = 'NS'
}

// DNS zone interface
export interface DnsZone {
  name: string;
  recordCount: number;
  updated: string;
}

// DNS record interface
export interface DnsRecord {
  domain: string;
  type: RecordType;
  value: string;
  ttl?: number;
  priority?: number;
  created?: string;
  updated?: string;
}

// DNS status interface
export interface DnsStatus {
  running: boolean;
  uptime: number;
  zones: number;
  records: number;
  peers: number;
}

/**
 * FractalDNS client service class
 */
export class FractalDnsService {
  private readonly baseUrl: string;

  /**
   * Create a new FractalDNS client
   * @param baseUrl Base URL of the FractalDNS API (default: /api/dns)
   */
  constructor(baseUrl: string = '/api/dns') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get server status
   * @returns Promise with server status
   */
  async getStatus(): Promise<DnsStatus> {
    try {
      const response = await apiRequest<DnsStatus>({
        url: `${this.baseUrl}/status`,
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Failed to get DNS server status:', error);
      throw error;
    }
  }

  /**
   * Get all TLD zones
   * @returns Promise with array of zones
   */
  async getZones(): Promise<DnsZone[]> {
    try {
      const response = await apiRequest<{ zones: DnsZone[] }>({
        url: `${this.baseUrl}/zones`,
        method: 'GET'
      });
      
      return response.zones;
    } catch (error) {
      console.error('Failed to get DNS zones:', error);
      throw error;
    }
  }

  /**
   * Get a specific zone
   * @param tld TLD name
   * @returns Promise with zone data
   */
  async getZone(tld: string): Promise<{ zone: any, records: DnsRecord[] }> {
    try {
      const response = await apiRequest<{ zone: any, records: DnsRecord[] }>({
        url: `${this.baseUrl}/zones/${tld}`,
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to get DNS zone: ${tld}`, error);
      throw error;
    }
  }

  /**
   * Create a new zone
   * @param tld TLD name
   * @returns Promise with created zone
   */
  async createZone(tld: string): Promise<{ zone: any }> {
    try {
      const response = await apiRequest<{ zone: any }>({
        url: `${this.baseUrl}/zones`,
        method: 'POST',
        data: { tld }
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to create DNS zone: ${tld}`, error);
      throw error;
    }
  }

  /**
   * Delete a zone
   * @param tld TLD name
   * @returns Promise with success message
   */
  async deleteZone(tld: string): Promise<{ message: string }> {
    try {
      const response = await apiRequest<{ message: string }>({
        url: `${this.baseUrl}/zones/${tld}`,
        method: 'DELETE'
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to delete DNS zone: ${tld}`, error);
      throw error;
    }
  }

  /**
   * Add/update a record in a zone
   * @param tld TLD name
   * @param record Record to add
   * @returns Promise with created/updated record
   */
  async addRecord(tld: string, record: DnsRecord): Promise<{ record: DnsRecord }> {
    try {
      const response = await apiRequest<{ record: DnsRecord }>({
        url: `${this.baseUrl}/zones/${tld}/records`,
        method: 'POST',
        data: record
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to add DNS record to zone: ${tld}`, error);
      throw error;
    }
  }

  /**
   * Delete a record from a zone
   * @param tld TLD name
   * @param domain Record domain
   * @param type Record type
   * @returns Promise with success message
   */
  async deleteRecord(tld: string, domain: string, type: RecordType): Promise<{ message: string }> {
    try {
      const response = await apiRequest<{ message: string }>({
        url: `${this.baseUrl}/zones/${tld}/records`,
        method: 'DELETE',
        data: { domain, type }
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to delete DNS record from zone: ${tld}`, error);
      throw error;
    }
  }

  /**
   * Lookup a DNS record
   * @param domain Domain name
   * @param type Record type
   * @returns Promise with lookup results
   */
  async lookupRecord(domain: string, type: RecordType): Promise<{ results: any[] }> {
    try {
      const response = await apiRequest<{ results: any[] }>({
        url: `${this.baseUrl}/lookup`,
        method: 'GET',
        params: { domain, type }
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to lookup DNS record: ${domain} (${type})`, error);
      throw error;
    }
  }

  /**
   * Test if a domain resolves through FractalDNS
   * @param domain Domain to test
   * @returns Promise with test results
   */
  async testDomainResolution(domain: string): Promise<{ 
    success: boolean;
    resolvedAddress?: string;
    error?: string;
    latency?: number;
  }> {
    try {
      const response = await apiRequest<{
        success: boolean;
        resolvedAddress?: string;
        error?: string;
        latency?: number;
      }>({
        url: `${this.baseUrl}/test`,
        method: 'GET',
        params: { domain }
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to test domain resolution: ${domain}`, error);
      throw error;
    }
  }

  /**
   * Export a zone to BIND format
   * @param tld TLD name
   * @returns Promise with zone file content
   */
  async exportZone(tld: string): Promise<{ content: string }> {
    try {
      const response = await apiRequest<{ content: string }>({
        url: `${this.baseUrl}/zones/${tld}/export`,
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to export DNS zone: ${tld}`, error);
      throw error;
    }
  }

  /**
   * Check if a domain is registered in FractalDNS
   * @param domain Domain to check
   * @returns Boolean indicating if domain is registered
   */
  isDomainRegistered(domain: string): boolean {
    // Simulate domain checking - in a real implementation, this would use the FractalDNS API
    const registeredDomains = [
      'aethercore.trust',
      'www.aethercore.trust',
      'fractalcoin.network',
      'www.fractalcoin.network',
      'aifreedomtrust.com',
      'www.aifreedomtrust.com',
      'atc.aifreedomtrust.com'
    ];
    
    // Normalize the domain by removing protocol
    const normalizedDomain = domain.replace(/^(https?|httqs):\/\//, '');
    
    // Check if the domain is in our list
    return registeredDomains.some(d => 
      normalizedDomain === d || 
      normalizedDomain.endsWith('.' + d)
    );
  }
  
  /**
   * Resolve a domain using FractalDNS
   * @param domain Domain to resolve
   * @returns Promise with resolution results
   */
  async resolveDomain(domain: string): Promise<DNSResolutionResult> {
    try {
      // Simulate DNS resolution - in a real implementation, this would use the FractalDNS API
      if (this.isDomainRegistered(domain)) {
        return {
          success: true,
          domain: domain,
          resolvedAddress: '198.51.100.' + Math.floor(Math.random() * 255),
          quantumSecure: domain.includes('aethercore') || domain.includes('fractalcoin') || domain.includes('aifreedomtrust'),
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          domain: domain,
          errors: ['Domain not found in FractalDNS'],
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error(`Failed to resolve domain: ${domain}`, error);
      return {
        success: false,
        domain: domain,
        errors: ['DNS resolution failed'],
        timestamp: new Date().toISOString()
      };
    }
  }
}

// DNS Resolution result interface
export interface DNSResolutionResult {
  success: boolean;
  domain?: string;
  resolvedAddress?: string;
  quantumSecure?: boolean;
  errors?: string[];
  timestamp?: string;
};

// Create singleton instance
export const fractalDnsService = new FractalDnsService();