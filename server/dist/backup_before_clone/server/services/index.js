"use strict";
/**
 * Services Index
 *
 * This file provides a centralized export for all services, making them easily
 * accessible throughout the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.completionService = exports.securityAnalysisService = exports.deploymentService = exports.collaborationService = exports.sandboxService = exports.versionService = exports.matrixDappIntegration = exports.matrixCommunication = void 0;
// Core Services
var matrix_integration_1 = require("./matrix-integration");
Object.defineProperty(exports, "matrixCommunication", { enumerable: true, get: function () { return matrix_integration_1.matrixCommunication; } });
var matrix_dapp_integration_1 = require("./matrix-dapp-integration");
Object.defineProperty(exports, "matrixDappIntegration", { enumerable: true, get: function () { return matrix_dapp_integration_1.matrixDappIntegration; } });
// DApp Builder Services
var version_service_1 = require("./version-control/version-service");
Object.defineProperty(exports, "versionService", { enumerable: true, get: function () { return version_service_1.versionService; } });
var sandbox_service_1 = require("./sandbox/sandbox-service");
Object.defineProperty(exports, "sandboxService", { enumerable: true, get: function () { return sandbox_service_1.sandboxService; } });
var collaboration_service_1 = require("./collaboration/collaboration-service");
Object.defineProperty(exports, "collaborationService", { enumerable: true, get: function () { return collaboration_service_1.collaborationService; } });
var deployment_service_1 = require("./deployment/deployment-service");
Object.defineProperty(exports, "deploymentService", { enumerable: true, get: function () { return deployment_service_1.deploymentService; } });
var security_analysis_service_1 = require("./security/security-analysis-service");
Object.defineProperty(exports, "securityAnalysisService", { enumerable: true, get: function () { return security_analysis_service_1.securityAnalysisService; } });
var completion_service_1 = require("./ai-completion/completion-service");
Object.defineProperty(exports, "completionService", { enumerable: true, get: function () { return completion_service_1.completionService; } });
