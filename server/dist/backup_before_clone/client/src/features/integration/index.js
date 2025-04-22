"use strict";
/**
 * Aetherion Integration Module
 *
 * This module serves as the central hub for connecting all Aetherion components:
 * - Quantum Security
 * - VS Code Editor
 * - AI Assistant
 * - Token Management
 * - Smart Contract Deployment
 *
 * It provides a unified API for accessing the integrated features.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAetherionIntegration = exports.useTokenManagement = exports.useQuantumDeployment = exports.useQuantumAIBridge = exports.useQuantumEditorBridge = void 0;
const useQuantumState_1 = require("../quantum-security/hooks/useQuantumState");
const eternalNowEngine_1 = require("../quantum-security/lib/eternalNowEngine");
// Import integration services
const QuantumEditorBridge_1 = require("./services/QuantumEditorBridge");
const QuantumAIBridge_1 = require("./services/QuantumAIBridge");
const QuantumDeploymentService_1 = require("./services/QuantumDeploymentService");
const TokenManagementService_1 = require("./services/TokenManagementService");
// Export services for direct access
var QuantumEditorBridge_2 = require("./services/QuantumEditorBridge");
Object.defineProperty(exports, "useQuantumEditorBridge", { enumerable: true, get: function () { return QuantumEditorBridge_2.useQuantumEditorBridge; } });
var QuantumAIBridge_2 = require("./services/QuantumAIBridge");
Object.defineProperty(exports, "useQuantumAIBridge", { enumerable: true, get: function () { return QuantumAIBridge_2.useQuantumAIBridge; } });
var QuantumDeploymentService_2 = require("./services/QuantumDeploymentService");
Object.defineProperty(exports, "useQuantumDeployment", { enumerable: true, get: function () { return QuantumDeploymentService_2.useQuantumDeployment; } });
var TokenManagementService_2 = require("./services/TokenManagementService");
Object.defineProperty(exports, "useTokenManagement", { enumerable: true, get: function () { return TokenManagementService_2.useTokenManagement; } });
/**
 * Unified hook for accessing all integrated Aetherion services
 *
 * This hook combines all the individual service hooks into a single API,
 * making it easier to access the integrated functionality.
 */
const useAetherionIntegration = () => {
    // Access all services
    const quantumState = (0, useQuantumState_1.useQuantumState)();
    const editorBridge = (0, QuantumEditorBridge_1.useQuantumEditorBridge)();
    const aiBridge = (0, QuantumAIBridge_1.useQuantumAIBridge)();
    const deployment = (0, QuantumDeploymentService_1.useQuantumDeployment)();
    const tokenManagement = (0, TokenManagementService_1.useTokenManagement)();
    return {
        // Quantum security state and methods
        quantum: {
            ...quantumState,
            getEternalNowEngine: eternalNowEngine_1.getEternalNowEngine
        },
        // VS Code integration
        editor: {
            ...editorBridge,
            validateContract: editorBridge.validateSmartContract,
            secureContract: editorBridge.injectQuantumResistance
        },
        // AI assistant integration
        ai: {
            ...aiBridge,
            getInsights: aiBridge.getSecurityInsights,
            askAI: aiBridge.generateResponse,
            generateContract: aiBridge.generateSmartContract
        },
        // Smart contract deployment
        deployment: {
            ...deployment,
            deployContract: deployment.deploySmartContract,
            deployPresale: deployment.deployTokenPresale,
            verifyContractSecurity: deployment.verifyContractSecurity
        },
        // Token management
        tokens: {
            ...tokenManagement,
            getInfo: tokenManagement.getTokenInfo,
            getBalances: tokenManagement.getTokenBalances,
            send: tokenManagement.sendTokens,
            joinPresale: tokenManagement.participateInPresale,
            getStats: tokenManagement.getTokenStatistics,
            getHistory: tokenManagement.getTransactionHistory,
            checkPresaleEligibility: tokenManagement.checkPresaleEligibility
        },
        // Combined workflows
        workflows: {
            /**
             * Complete workflow for creating, validating, and deploying a smart contract
             */
            async createAndDeployContract(contractCode, contractLanguage = 'solidity', options = { secureWithQuantum: true }) {
                // Step 1: Validate the contract for security issues
                const validationResult = await editorBridge.validateSmartContract(contractCode, contractLanguage);
                // If there are critical vulnerabilities, return the validation result
                if (!validationResult.valid) {
                    return {
                        stage: 'validation',
                        success: false,
                        result: validationResult
                    };
                }
                // Step 2: Make the contract quantum-resistant if requested
                let securedCode = contractCode;
                if (options.secureWithQuantum) {
                    securedCode = editorBridge.injectQuantumResistance(contractCode, contractLanguage);
                }
                // Step 3: Compile the contract (simulated)
                const compilationResult = {
                    success: true,
                    bytecode: '0x' + Array.from({ length: 1000 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                    abi: [ /* simulated ABI */]
                };
                // Step 4: Deploy the contract
                const deploymentResult = await deployment.deploySmartContract(compilationResult, {
                    network: options.network || 'aetherion-testnet',
                    account: options.account || '0x0000000000000000000000000000000000000000',
                    quantumSecured: options.secureWithQuantum || false,
                    temporalProtection: options.secureWithQuantum || false,
                    fractalValidation: options.secureWithQuantum || false
                });
                return {
                    stage: 'deployment',
                    success: deploymentResult.success,
                    validationResult,
                    deploymentResult,
                    securedCode
                };
            },
            /**
             * Complete workflow for setting up and deploying a token presale
             */
            async setupTokenPresale(config, options = {}) {
                // Deploy the presale contract
                const deploymentResult = await deployment.deployTokenPresale(config, {
                    network: options.network || 'aetherion-testnet',
                    account: options.account || '0x0000000000000000000000000000000000000000',
                    quantumSecured: true, // Always use quantum security for presales
                    temporalProtection: true, // Protect against frontrunning
                    fractalValidation: true // Ensure high security validation
                });
                return {
                    success: deploymentResult.success,
                    deploymentResult,
                    presaleConfig: config,
                    contractAddress: deploymentResult.contractAddress
                };
            },
            /**
             * Get AI-powered analysis of a smart contract's security
             */
            async analyzeContractSecurity(contractCode, contractLanguage = 'solidity') {
                // Step 1: Validate the contract using the editor bridge
                const validationResult = await editorBridge.validateSmartContract(contractCode, contractLanguage);
                // Step 2: Get the current quantum security state
                const securityState = quantumState;
                // Step 3: Get AI-powered insights
                const aiInsights = await aiBridge.getSecurityInsights(securityState);
                // Step 4: Generate AI recommendations specific to this contract
                const aiRecommendations = await aiBridge.generateResponse('Analyze this smart contract for security vulnerabilities and suggest improvements', {
                    currentCode: contractCode,
                    currentLanguage: contractLanguage,
                    securityState,
                    appContext: 'editor'
                });
                return {
                    validationResult,
                    securityState,
                    aiInsights,
                    aiRecommendations
                };
            }
        }
    };
};
exports.useAetherionIntegration = useAetherionIntegration;
