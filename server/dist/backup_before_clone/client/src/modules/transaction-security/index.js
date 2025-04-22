"use strict";
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
exports.useSecurity = exports.SecurityProvider = exports.TransactionAnalyzer = exports.PhishingDetector = exports.SecurityDashboard = exports.TransactionMonitor = void 0;
// Export all components from the Transaction Security module
var TransactionMonitor_1 = require("./components/TransactionMonitor");
Object.defineProperty(exports, "TransactionMonitor", { enumerable: true, get: function () { return __importDefault(TransactionMonitor_1).default; } });
var SecurityDashboard_1 = require("./components/SecurityDashboard");
Object.defineProperty(exports, "SecurityDashboard", { enumerable: true, get: function () { return __importDefault(SecurityDashboard_1).default; } });
var PhishingDetector_1 = require("./utils/PhishingDetector");
Object.defineProperty(exports, "PhishingDetector", { enumerable: true, get: function () { return __importDefault(PhishingDetector_1).default; } });
var TransactionAnalyzer_1 = require("./utils/TransactionAnalyzer");
Object.defineProperty(exports, "TransactionAnalyzer", { enumerable: true, get: function () { return __importDefault(TransactionAnalyzer_1).default; } });
var SecurityContext_1 = require("./contexts/SecurityContext");
Object.defineProperty(exports, "SecurityProvider", { enumerable: true, get: function () { return SecurityContext_1.SecurityProvider; } });
Object.defineProperty(exports, "useSecurity", { enumerable: true, get: function () { return SecurityContext_1.useSecurity; } });
__exportStar(require("./types"), exports);
