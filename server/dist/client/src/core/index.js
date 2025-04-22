"use strict";
/**
 * AI Freedom Trust Framework Core
 * Exports all core components of the framework for easy access
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFramework = exports.trainingDataService = exports.rewardService = exports.economicAgent = exports.agentSystem = exports.mysterionClient = exports.knowledgeSystem = void 0;
// Mysterion Intelligence System
var knowledge_system_1 = require("./mysterion/knowledge-system");
Object.defineProperty(exports, "knowledgeSystem", { enumerable: true, get: function () { return __importDefault(knowledge_system_1).default; } });
var mysterion_client_1 = require("./mysterion/mysterion-client");
Object.defineProperty(exports, "mysterionClient", { enumerable: true, get: function () { return __importDefault(mysterion_client_1).default; } });
__exportStar(require("./mysterion/knowledge-system"), exports);
__exportStar(require("./mysterion/mysterion-client"), exports);
// Autonomous Agent System
var agent_system_1 = require("./autonomous-agents/agent-system");
Object.defineProperty(exports, "agentSystem", { enumerable: true, get: function () { return __importDefault(agent_system_1).default; } });
var economic_agent_1 = require("./autonomous-agents/economic-agent");
Object.defineProperty(exports, "economicAgent", { enumerable: true, get: function () { return __importDefault(economic_agent_1).default; } });
__exportStar(require("./autonomous-agents/agent-system"), exports);
__exportStar(require("./autonomous-agents/economic-agent"), exports);
// Computational Rewards System
var reward_service_1 = require("./computational-rewards/reward-service");
Object.defineProperty(exports, "rewardService", { enumerable: true, get: function () { return __importDefault(reward_service_1).default; } });
__exportStar(require("./computational-rewards/reward-service"), exports);
// Training Data Bridge System
var training_data_service_1 = require("./training-data-bridge/training-data-service");
Object.defineProperty(exports, "trainingDataService", { enumerable: true, get: function () { return __importDefault(training_data_service_1).default; } });
__exportStar(require("./training-data-bridge/training-data-service"), exports);
/**
 * Initialize all core framework components
 * @returns Promise that resolves when all components are initialized
 */
const initializeFramework = async () => {
    console.log('Initializing AI Freedom Trust Framework core components...');
    try {
        // Initialize economic agent (this will bootstrap the autonomous economy)
        await economicAgent.initialize({
            riskTolerance: 0.6,
            growthTarget: 0.1,
            decisionThreshold: 0.7,
            operationalBudget: 1000,
            autoExecuteThreshold: 10,
            notificationSettings: {
                thresholds: {
                    'opportunity': 0.8,
                    'risk': 0.7,
                    'transaction': 100
                },
                channels: ['system', 'email']
            },
            restrictedActions: ['high-risk-investment']
        });
        console.log('AI Freedom Trust Framework core components initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize AI Freedom Trust Framework:', error);
        throw error;
    }
};
exports.initializeFramework = initializeFramework;
