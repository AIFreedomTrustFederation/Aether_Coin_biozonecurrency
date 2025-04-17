/**
 * AI Freedom Trust Framework Core
 * Exports all core components of the framework for easy access
 */

// Mysterion Intelligence System
export { default as knowledgeSystem } from './mysterion/knowledge-system';
export { default as mysterionClient } from './mysterion/mysterion-client';
export * from './mysterion/knowledge-system';
export * from './mysterion/mysterion-client';

// Autonomous Agent System
export { default as agentSystem } from './autonomous-agents/agent-system';
export { default as economicAgent } from './autonomous-agents/economic-agent';
export * from './autonomous-agents/agent-system';
export * from './autonomous-agents/economic-agent';

// Computational Rewards System
export { default as rewardService } from './computational-rewards/reward-service';
export * from './computational-rewards/reward-service';

// Training Data Bridge System
export { default as trainingDataService } from './training-data-bridge/training-data-service';
export * from './training-data-bridge/training-data-service';

/**
 * Initialize all core framework components
 * @returns Promise that resolves when all components are initialized
 */
export const initializeFramework = async (): Promise<void> => {
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
  } catch (error) {
    console.error('Failed to initialize AI Freedom Trust Framework:', error);
    throw error;
  }
};