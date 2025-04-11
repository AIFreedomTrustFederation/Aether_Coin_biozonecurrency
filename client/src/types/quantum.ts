/**
 * Quantum-related type definitions for the Aetherion ecosystem
 */

/**
 * Available quantum encryption algorithms
 */
export type QuantumEncryptionAlgorithm = 'kyber' | 'falcon' | 'sphincs' | 'hybrid';

/**
 * Quantum security level configuration
 */
export type QuantumSecurityLevel = 'standard' | 'enhanced' | 'maximum';

/**
 * Subdomain record type for DNS-like entries
 */
export type SubdomainType = 'a' | 'cname' | 'ipfs' | 'fractalNode' | 'quantumSecure';

/**
 * Threat level assessment for quantum security
 */
export type ThreatLevel = 'low' | 'medium' | 'high';

/**
 * Fractal node configuration
 */
export interface FractalNodeConfig {
  shards: number;
  replicationFactor: number;
  autoScaling: boolean;
  resourceAllocation: {
    storage: number;  // GB
    compute: number;  // vCPUs
    memory: number;   // GB
  };
  securityLevel: QuantumSecurityLevel;
}

/**
 * Mining configuration for FractalCoin and AICoin
 */
export interface MiningConfig {
  enabled: boolean;
  targetCoins: ('fractalcoin' | 'aicoin')[];
  computeAllocation: number;  // Percentage of available compute power
  storageAllocation: number;  // Percentage of available storage
  autoOptimize: boolean;
  poolMining: boolean;
  poolUrl?: string;
}

/**
 * AICoin compute power configuration
 */
export interface AIComputeConfig {
  enabled: boolean;
  modelSupport: ('llm' | 'vision' | 'audio' | 'multimodal')[];
  dedicatedGPUs: number;
  quantumSimulation: boolean;
  rewardsAddress: string;
  privacySettings: {
    anonymizeUsage: boolean;
    encryptWorkloads: boolean;
    fractalDistribution: boolean;
  };
}

/**
 * Quantum secure web hosting configuration
 */
export interface QuantumSecureHostingConfig {
  domain: string;
  protocol: 'httqs' | 'https';
  encryptionAlgorithm: QuantumEncryptionAlgorithm;
  securityLevel: QuantumSecurityLevel;
  fractalSharding: {
    enabled: boolean;
    shards: number;
    globalDistribution: boolean;
  };
  backups: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    retentionDays: number;
  };
  ddosProtection: boolean;
  quantumFirewall: boolean;
}