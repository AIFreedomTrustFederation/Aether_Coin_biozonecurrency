"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockBridgeTestResult = exports.getMockTransactions = exports.getMockBridges = exports.runBridgeTest = exports.getSupportedTokens = exports.getBridgeHealth = exports.createBridgeTransaction = exports.getBridgeTransactions = exports.getBridgeById = exports.getBridgeConfigurations = void 0;
const queryClient_1 = require("@/lib/queryClient");
const schema_1 = require("@shared/schema");
// Get all bridge configurations
const getBridgeConfigurations = async (status) => {
    try {
        const url = status
            ? `/api/bridges?status=${status}`
            : '/api/bridges';
        return await (0, queryClient_1.apiRequest)(url);
    }
    catch (error) {
        console.error('Error fetching bridge configurations:', error);
        return [];
    }
};
exports.getBridgeConfigurations = getBridgeConfigurations;
// Get bridge by ID
const getBridgeById = async (id) => {
    try {
        return await (0, queryClient_1.apiRequest)(`/api/bridges/${id}`);
    }
    catch (error) {
        console.error(`Error fetching bridge with ID ${id}:`, error);
        return null;
    }
};
exports.getBridgeById = getBridgeById;
// Get transactions by bridge ID or user ID
const getBridgeTransactions = async (bridgeId, userId, limit) => {
    try {
        let url = '/api/bridge-transactions';
        const params = new URLSearchParams();
        if (bridgeId)
            params.append('bridgeId', bridgeId.toString());
        if (userId)
            params.append('userId', userId.toString());
        if (limit)
            params.append('limit', limit.toString());
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        return await (0, queryClient_1.apiRequest)(url);
    }
    catch (error) {
        console.error('Error fetching bridge transactions:', error);
        return [];
    }
};
exports.getBridgeTransactions = getBridgeTransactions;
// Create a new bridge transaction
const createBridgeTransaction = async (transaction) => {
    try {
        return await (0, queryClient_1.apiRequest)('/api/bridge-transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
    }
    catch (error) {
        console.error('Error creating bridge transaction:', error);
        throw error;
    }
};
exports.createBridgeTransaction = createBridgeTransaction;
// Get bridge health status
const getBridgeHealth = async (bridgeId) => {
    try {
        return await (0, queryClient_1.apiRequest)(`/api/bridges/${bridgeId}/health`);
    }
    catch (error) {
        console.error(`Error fetching health for bridge ID ${bridgeId}:`, error);
        return {
            isOnline: false,
            sourceNetworkStatus: 'offline',
            targetNetworkStatus: 'offline',
            averageTransactionTime: null,
            successRate: 0,
            validatorCount: 0,
            activeValidators: 0,
        };
    }
};
exports.getBridgeHealth = getBridgeHealth;
// Get supported tokens for a bridge
const getSupportedTokens = async (bridgeId) => {
    try {
        return await (0, queryClient_1.apiRequest)(`/api/bridges/${bridgeId}/tokens`);
    }
    catch (error) {
        console.error(`Error fetching tokens for bridge ID ${bridgeId}:`, error);
        return [];
    }
};
exports.getSupportedTokens = getSupportedTokens;
// Run a bridge test
const runBridgeTest = async (bridgeId, qubits, iterations) => {
    try {
        return await (0, queryClient_1.apiRequest)('/api/bridge-tests', {
            method: 'POST',
            body: JSON.stringify({ bridgeId, qubits, iterations }),
        });
    }
    catch (error) {
        console.error('Error running bridge test:', error);
        throw error;
    }
};
exports.runBridgeTest = runBridgeTest;
// Mock data for development purposes
// These should be replaced with actual API calls in production
const getMockBridges = () => [
    {
        id: 1,
        name: 'Aetherion-Ethereum Bridge',
        sourceNetwork: 'aetherion',
        targetNetwork: 'ethereum',
        status: schema_1.BridgeStatus.ACTIVE,
        validatorThreshold: 3,
        processingTime: 45,
        securityLevel: 9
    },
    {
        id: 2,
        name: 'Aetherion-Solana Bridge',
        sourceNetwork: 'aetherion',
        targetNetwork: 'solana',
        status: schema_1.BridgeStatus.ACTIVE,
        validatorThreshold: 5,
        processingTime: 30,
        securityLevel: 8
    },
    {
        id: 3,
        name: 'Aetherion-Filecoin Bridge',
        sourceNetwork: 'aetherion',
        targetNetwork: 'filecoin',
        status: schema_1.BridgeStatus.ACTIVE,
        validatorThreshold: 2,
        processingTime: 60,
        securityLevel: 7
    }
];
exports.getMockBridges = getMockBridges;
const getMockTransactions = () => [
    {
        id: 1,
        bridgeId: 1,
        sourceNetwork: 'aetherion',
        targetNetwork: 'ethereum',
        sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        amount: '1.5',
        tokenSymbol: 'AET',
        status: schema_1.BridgeTransactionStatus.COMPLETED,
        sourceTransactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        targetTransactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        fee: '0.001',
        initiatedAt: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: new Date(Date.now() - 3300000), // 55 minutes ago
    },
    {
        id: 2,
        bridgeId: 2,
        sourceNetwork: 'aetherion',
        targetNetwork: 'solana',
        sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetAddress: 'SoLABCDEFGHIJKLmNOpqRsTuVwXyZ1234567890AbCdEf',
        amount: '5.0',
        tokenSymbol: 'AET',
        status: schema_1.BridgeTransactionStatus.PENDING_TARGET_EXECUTION,
        sourceTransactionHash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
        targetTransactionHash: null,
        fee: '0.002',
        initiatedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        completedAt: null,
    },
    {
        id: 3,
        bridgeId: 3,
        sourceNetwork: 'aetherion',
        targetNetwork: 'filecoin',
        sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetAddress: 'f1abcdefghijklmnopqrstuvwxyz1234567890abc',
        amount: '10.0',
        tokenSymbol: 'AET',
        status: schema_1.BridgeTransactionStatus.FAILED,
        sourceTransactionHash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
        targetTransactionHash: null,
        fee: '0.005',
        initiatedAt: new Date(Date.now() - 86400000), // 1 day ago
        completedAt: null,
        errorMessage: 'Insufficient validators available.'
    }
];
exports.getMockTransactions = getMockTransactions;
const getMockBridgeTestResult = () => ({
    testId: 'qbt-1234-5678',
    timeElapsed: 12.5,
    bridgeId: 1,
    qubits: 6,
    iterations: 10,
    summary: {
        totalTestsRun: 320,
        successRate: 0.96,
        averageTransactionTime: 2.3,
        vulnerabilitiesDetected: 2,
        mostSecureBridge: 'Aetherion-Ethereum',
        vulnerableBridges: [],
        bridgeResults: [
            {
                bridgeName: 'Aetherion-Ethereum',
                quantumResistanceScore: 0.95,
                successRate: 0.98,
                avgConfirmationTime: 2.1,
                vulnerabilitiesCount: 0,
                highSeverityCount: 0
            },
            {
                bridgeName: 'Aetherion-Solana',
                quantumResistanceScore: 0.88,
                successRate: 0.94,
                avgConfirmationTime: 1.8,
                vulnerabilitiesCount: 1,
                highSeverityCount: 0
            },
            {
                bridgeName: 'Aetherion-Filecoin',
                quantumResistanceScore: 0.72,
                successRate: 0.85,
                avgConfirmationTime: 3.2,
                vulnerabilitiesCount: 3,
                highSeverityCount: 1
            }
        ]
    }
});
exports.getMockBridgeTestResult = getMockBridgeTestResult;
