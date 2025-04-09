/**
 * Schema Proxy
 * 
 * This file helps resolve circular dependencies between schema files
 * by re-exporting and proxying their types and tables.
 * 
 * When importing from schema files, use this proxy instead of direct imports
 * to avoid circular dependency issues.
 */

// Re-export everything from the main schema file
export * from './schema';

// Re-export from LLM schema
export * from './llm-schema';

// Re-export from API Key schema
export * from './api-key-schema';

// Define proxy references to schema tables with forward declarations for other schemas
// that may have circular dependencies

// Wallet schema proxies
export const wallets = { userId: null, id: null } as any;
export const transactions = { walletId: null, id: null, timestamp: null } as any;

// AI Monitoring logs proxy
export const aiMonitoringLogs = { 
  id: null, 
  userId: null, 
  timestamp: null,
  action: null,
  details: null
} as any;

// Smart Contract schema proxies
export const smartContracts = { 
  id: null, 
  userId: null, 
  name: null,
  code: null,
  status: null
} as any;

// CID/IPFS storage schema proxies
export const cidEntries = {
  id: null,
  userId: null,
  cid: null,
  name: null,
  metadata: null,
  timestamp: null
} as any;

// Payment schema proxies
export const paymentMethods = {
  id: null,
  userId: null,
  type: null,
  details: null
} as any;

export const payments = {
  id: null,
  userId: null,
  amount: null,
  currency: null,
  status: null,
  timestamp: null
} as any;

// Temple Node schema proxies
export const templeNodes = {
  id: null,
  userId: null,
  nodeType: null, // 'levite', 'aaronic', 'zadokite'
  status: null,
  configuration: null
} as any;

// API Key schema proxies
export const apiKeys = {
  id: null,
  userId: null,
  key: null,
  email: null,
  name: null,
  createdAt: null,
  expiresAt: null,
  revokedAt: null,
  isActive: null,
  lastUsedAt: null,
  scopes: null
} as any;

export const apiKeyUsage = {
  id: null,
  keyId: null,
  timestamp: null,
  endpoint: null,
  ipAddress: null,
  responseCode: null,
  responseTime: null
} as any;

export const apiKeyConnections = {
  id: null,
  keyId: null,
  serviceType: null,
  connectionId: null,
  connectedAt: null,
  disconnectedAt: null,
  isActive: null,
  lastPingAt: null,
  metadata: null
} as any;

// Make sure any new schemas are also re-exported and proxied here
// to maintain a single source of truth for imports