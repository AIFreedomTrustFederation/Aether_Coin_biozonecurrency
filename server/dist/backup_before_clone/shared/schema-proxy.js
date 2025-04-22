"use strict";
/**
 * Schema Proxy
 *
 * This file helps resolve circular dependencies between schema files
 * by re-exporting and proxying their types and tables.
 *
 * When importing from schema files, use this proxy instead of direct imports
 * to avoid circular dependency issues.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyConnections = exports.apiKeyUsage = exports.apiKeys = exports.templeNodes = exports.payments = exports.paymentMethods = exports.cidEntries = exports.smartContracts = exports.aiMonitoringLogs = exports.transactions = exports.wallets = void 0;
// Re-export everything from the main schema file
__exportStar(require("./schema"), exports);
// Re-export from LLM schema
__exportStar(require("./llm-schema"), exports);
// Re-export from API Key schema
__exportStar(require("./api-key-schema"), exports);
// Define proxy references to schema tables with forward declarations for other schemas
// that may have circular dependencies
// Wallet schema proxies
exports.wallets = { userId: null, id: null };
exports.transactions = { walletId: null, id: null, timestamp: null };
// AI Monitoring logs proxy
exports.aiMonitoringLogs = {
    id: null,
    userId: null,
    timestamp: null,
    action: null,
    details: null
};
// Smart Contract schema proxies
exports.smartContracts = {
    id: null,
    userId: null,
    name: null,
    code: null,
    status: null
};
// CID/IPFS storage schema proxies
exports.cidEntries = {
    id: null,
    userId: null,
    cid: null,
    name: null,
    metadata: null,
    timestamp: null
};
// Payment schema proxies
exports.paymentMethods = {
    id: null,
    userId: null,
    type: null,
    details: null
};
exports.payments = {
    id: null,
    userId: null,
    amount: null,
    currency: null,
    status: null,
    timestamp: null
};
// Temple Node schema proxies
exports.templeNodes = {
    id: null,
    userId: null,
    nodeType: null, // 'levite', 'aaronic', 'zadokite'
    status: null,
    configuration: null
};
// API Key schema proxies
exports.apiKeys = {
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
};
exports.apiKeyUsage = {
    id: null,
    keyId: null,
    timestamp: null,
    endpoint: null,
    ipAddress: null,
    responseCode: null,
    responseTime: null
};
exports.apiKeyConnections = {
    id: null,
    keyId: null,
    serviceType: null,
    connectionId: null,
    connectedAt: null,
    disconnectedAt: null,
    isActive: null,
    lastPingAt: null,
    metadata: null
};
// Make sure any new schemas are also re-exported and proxied here
// to maintain a single source of truth for imports
