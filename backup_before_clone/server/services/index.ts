/**
 * Services Index
 * 
 * This file provides a centralized export for all services, making them easily
 * accessible throughout the application.
 */

// Core Services
export { matrixCommunication } from './matrix-integration';
export { matrixDappIntegration } from './matrix-dapp-integration';

// DApp Builder Services
export { versionService } from './version-control/version-service';
export { sandboxService } from './sandbox/sandbox-service';
export { collaborationService } from './collaboration/collaboration-service';
export { deploymentService } from './deployment/deployment-service';
export { securityAnalysisService } from './security/security-analysis-service';
export { completionService } from './ai-completion/completion-service';

// Import and re-export types from services
export type { 
  UserPresence 
} from './collaboration/collaboration-service';

export type {
  DeploymentNetwork,
} from './deployment/deployment-service';

export type {
  SecurityCheckResult,
  SecurityVulnerability,
  GasAnalysis
} from './security/security-analysis-service';

export type {
  CompletionSuggestion
} from './ai-completion/completion-service';