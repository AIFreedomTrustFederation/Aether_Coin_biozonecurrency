"use strict";
/**
 * Quantum Security Module
 *
 * This module implements advanced quantum-resistant security features for
 * the FractalCoin blockchain, including:
 *
 * 1. Quantum Bridge - Connection to post-quantum cryptography
 * 2. Fractal Consensus - Mathematical pattern-based consensus algorithm
 * 3. Temporal Entanglement - Non-linear time-based security
 * 4. Eternal Now Engine - Time convergence system
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuantumState = exports.QuantumSecurityDashboard = exports.useEternalNow = exports.getEternalNowEngine = exports.TemporalEntanglement = exports.FractalConsensus = exports.QuantumBridge = void 0;
// Export all components
var quantumBridge_1 = require("./lib/quantumBridge");
Object.defineProperty(exports, "QuantumBridge", { enumerable: true, get: function () { return quantumBridge_1.QuantumBridge; } });
var fractalConsensus_1 = require("./lib/fractalConsensus");
Object.defineProperty(exports, "FractalConsensus", { enumerable: true, get: function () { return fractalConsensus_1.FractalConsensus; } });
var temporalEntanglement_1 = require("./lib/temporalEntanglement");
Object.defineProperty(exports, "TemporalEntanglement", { enumerable: true, get: function () { return temporalEntanglement_1.TemporalEntanglement; } });
var eternalNowEngine_1 = require("./lib/eternalNowEngine");
Object.defineProperty(exports, "getEternalNowEngine", { enumerable: true, get: function () { return eternalNowEngine_1.getEternalNowEngine; } });
Object.defineProperty(exports, "useEternalNow", { enumerable: true, get: function () { return eternalNowEngine_1.useEternalNow; } });
var QuantumSecurityDashboard_1 = require("./components/QuantumSecurityDashboard");
Object.defineProperty(exports, "QuantumSecurityDashboard", { enumerable: true, get: function () { return __importDefault(QuantumSecurityDashboard_1).default; } });
var useQuantumState_1 = require("./hooks/useQuantumState");
Object.defineProperty(exports, "useQuantumState", { enumerable: true, get: function () { return useQuantumState_1.useQuantumState; } });
