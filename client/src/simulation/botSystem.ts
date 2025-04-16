/**
 * Aetherion Autonomous Bot System
 * 
 * This module provides a framework for creating autonomous bots that can interact
 * with the Aetherion ecosystem just like real users. These bots are designed to:
 * 
 * 1. Simulate real user behavior
 * 2. Test system integrity and performance
 * 3. Provide engagement metrics
 * 4. Stress test the infrastructure
 * 5. Identify potential security vulnerabilities
 */

import { v4 as uuidv4 } from 'uuid';
import { getRandomInt, getRandomElement, sleep } from './utils';

// Bot Profiles
export interface BotProfile {
  id: string;
  name: string;
  walletAddress: string;
  balance: number;
  behavior: BotBehaviorType;
  personality: BotPersonality;
  activityLevel: 'low' | 'medium' | 'high';
  specialization: BotSpecialization;
  createdAt: Date;
}

// Bot Behavior Types
export type BotBehaviorType = 
  | 'trader' 
  | 'hodler' 
  | 'node-operator'
  | 'developer'
  | 'explorer'
  | 'validator';

// Bot Personality Traits
export interface BotPersonality {
  risk: number; // 0-100 (conservative to aggressive)
  patience: number; // 0-100 (impulsive to patient)
  curiosity: number; // 0-100 (focused to exploratory)
  sociability: number; // 0-100 (solitary to social)
}

// Bot Specialization
export type BotSpecialization = 
  | 'defi' 
  | 'nft' 
  | 'gaming' 
  | 'infrastructure'
  | 'ai-integration'
  | 'quantum-security';

// Bot Factory - Creates different types of bots
export class BotFactory {
  static createTrader(name?: string): BotProfile {
    return {
      id: uuidv4(),
      name: name || `Trader-${getRandomInt(1000, 9999)}`,
      walletAddress: `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`,
      balance: getRandomInt(100, 10000),
      behavior: 'trader',
      personality: {
        risk: getRandomInt(50, 90),
        patience: getRandomInt(20, 60),
        curiosity: getRandomInt(40, 70),
        sociability: getRandomInt(50, 80)
      },
      activityLevel: getRandomElement(['medium', 'high']),
      specialization: getRandomElement(['defi', 'nft']),
      createdAt: new Date()
    };
  }

  static createHodler(name?: string): BotProfile {
    return {
      id: uuidv4(),
      name: name || `Hodler-${getRandomInt(1000, 9999)}`,
      walletAddress: `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`,
      balance: getRandomInt(5000, 50000),
      behavior: 'hodler',
      personality: {
        risk: getRandomInt(10, 40),
        patience: getRandomInt(70, 100),
        curiosity: getRandomInt(20, 60),
        sociability: getRandomInt(30, 70)
      },
      activityLevel: getRandomElement(['low', 'medium']),
      specialization: getRandomElement(['defi', 'infrastructure']),
      createdAt: new Date()
    };
  }

  static createNodeOperator(name?: string): BotProfile {
    return {
      id: uuidv4(),
      name: name || `NodeOp-${getRandomInt(1000, 9999)}`,
      walletAddress: `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`,
      balance: getRandomInt(20000, 100000),
      behavior: 'node-operator',
      personality: {
        risk: getRandomInt(30, 60),
        patience: getRandomInt(60, 90),
        curiosity: getRandomInt(50, 80),
        sociability: getRandomInt(40, 70)
      },
      activityLevel: getRandomElement(['medium', 'high']),
      specialization: getRandomElement(['infrastructure', 'quantum-security']),
      createdAt: new Date()
    };
  }

  static createDeveloper(name?: string): BotProfile {
    return {
      id: uuidv4(),
      name: name || `Dev-${getRandomInt(1000, 9999)}`,
      walletAddress: `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`,
      balance: getRandomInt(5000, 30000),
      behavior: 'developer',
      personality: {
        risk: getRandomInt(40, 70),
        patience: getRandomInt(50, 90),
        curiosity: getRandomInt(70, 100),
        sociability: getRandomInt(30, 70)
      },
      activityLevel: getRandomElement(['medium', 'high']),
      specialization: getRandomElement(['ai-integration', 'quantum-security', 'infrastructure']),
      createdAt: new Date()
    };
  }

  static createRandomBot(): BotProfile {
    const behaviors: BotBehaviorType[] = ['trader', 'hodler', 'node-operator', 'developer', 'explorer', 'validator'];
    const behavior = getRandomElement(behaviors);
    
    switch (behavior) {
      case 'trader': return this.createTrader();
      case 'hodler': return this.createHodler();
      case 'node-operator': return this.createNodeOperator();
      case 'developer': return this.createDeveloper();
      case 'explorer': return this.createExplorer();
      case 'validator': return this.createValidator();
      default: return this.createTrader();
    }
  }

  static createExplorer(name?: string): BotProfile {
    return {
      id: uuidv4(),
      name: name || `Explorer-${getRandomInt(1000, 9999)}`,
      walletAddress: `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`,
      balance: getRandomInt(1000, 15000),
      behavior: 'explorer',
      personality: {
        risk: getRandomInt(60, 90),
        patience: getRandomInt(30, 70),
        curiosity: getRandomInt(80, 100),
        sociability: getRandomInt(50, 90)
      },
      activityLevel: getRandomElement(['medium', 'high']),
      specialization: getRandomElement(['nft', 'gaming', 'ai-integration']),
      createdAt: new Date()
    };
  }

  static createValidator(name?: string): BotProfile {
    return {
      id: uuidv4(),
      name: name || `Validator-${getRandomInt(1000, 9999)}`,
      walletAddress: `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`,
      balance: getRandomInt(50000, 500000),
      behavior: 'validator',
      personality: {
        risk: getRandomInt(20, 50),
        patience: getRandomInt(70, 100),
        curiosity: getRandomInt(40, 70),
        sociability: getRandomInt(50, 80)
      },
      activityLevel: getRandomElement(['medium', 'high']),
      specialization: getRandomElement(['infrastructure', 'quantum-security']),
      createdAt: new Date()
    };
  }

  static createBotSwarm(count: number): BotProfile[] {
    const bots: BotProfile[] = [];
    for (let i = 0; i < count; i++) {
      bots.push(this.createRandomBot());
    }
    return bots;
  }
}

// Bot Actions
export interface BotAction {
  type: string;
  execute(bot: BotProfile): Promise<void>;
  getDescription(bot: BotProfile): string;
}

// Base Bot Class
export abstract class Bot {
  profile: BotProfile;
  actions: BotAction[];
  isActive: boolean = false;
  activityInterval: number;
  activityLog: { timestamp: Date; action: string; success: boolean; details?: any }[] = [];

  constructor(profile: BotProfile) {
    this.profile = profile;
    this.actions = [];
    
    // Set activity interval based on activity level
    switch (profile.activityLevel) {
      case 'low': this.activityInterval = getRandomInt(5 * 60 * 1000, 15 * 60 * 1000); break; // 5-15 minutes
      case 'medium': this.activityInterval = getRandomInt(1 * 60 * 1000, 5 * 60 * 1000); break; // 1-5 minutes
      case 'high': this.activityInterval = getRandomInt(10 * 1000, 60 * 1000); break; // 10-60 seconds
      default: this.activityInterval = 60 * 1000; // Default 1 minute
    }
  }

  async start(): Promise<void> {
    this.isActive = true;
    this.logActivity('Bot started', true);
    this.runActivityLoop();
  }

  async stop(): Promise<void> {
    this.isActive = false;
    this.logActivity('Bot stopped', true);
  }

  private async runActivityLoop(): Promise<void> {
    while (this.isActive) {
      await this.performRandomAction();
      await sleep(this.activityInterval);
    }
  }

  protected async performRandomAction(): Promise<void> {
    if (this.actions.length === 0) {
      console.warn(`Bot ${this.profile.name} has no actions to perform`);
      return;
    }

    const action = getRandomElement(this.actions);
    try {
      this.logActivity(`Performing action: ${action.getDescription(this.profile)}`, true);
      await action.execute(this.profile);
    } catch (error) {
      console.error(`Bot ${this.profile.name} failed to perform action:`, error);
      this.logActivity(`Failed action: ${action.getDescription(this.profile)}`, false, { error });
    }
  }

  protected logActivity(action: string, success: boolean, details?: any): void {
    this.activityLog.push({
      timestamp: new Date(),
      action,
      success,
      details
    });
    
    // Keep log size manageable - only keep the last 1000 activities
    if (this.activityLog.length > 1000) {
      this.activityLog.shift();
    }
  }

  public getActivityLog() {
    return this.activityLog;
  }
}

// Bot Network - Manages communication between bots
export class BotNetwork {
  private bots: Map<string, Bot> = new Map();
  private messageQueue: {from: string; to: string; message: any; timestamp: Date}[] = [];
  private isProcessing: boolean = false;

  addBot(bot: Bot): void {
    this.bots.set(bot.profile.id, bot);
  }

  removeBot(botId: string): void {
    this.bots.delete(botId);
  }

  sendMessage(fromBotId: string, toBotId: string, message: any): void {
    this.messageQueue.push({
      from: fromBotId,
      to: toBotId,
      message,
      timestamp: new Date()
    });
    
    if (!this.isProcessing) {
      this.processMessageQueue();
    }
  }

  broadcastMessage(fromBotId: string, message: any): void {
    for (const [botId, _] of this.bots) {
      if (botId !== fromBotId) {
        this.sendMessage(fromBotId, botId, message);
      }
    }
  }
  
  private async processMessageQueue(): Promise<void> {
    this.isProcessing = true;
    
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (!msg) continue;
      
      const targetBot = this.bots.get(msg.to);
      if (targetBot) {
        // Handle message delivery to bot - in a real implementation, this would
        // call a method on the bot to process incoming messages
      }
      
      // Simulate network delay
      await sleep(100);
    }
    
    this.isProcessing = false;
  }
  
  getStats(): { botCount: number; messageCount: number } {
    return {
      botCount: this.bots.size,
      messageCount: this.messageQueue.length
    };
  }
}

// Bot Orchestrator - Manages the bot swarm
export class BotOrchestrator {
  private bots: Bot[] = [];
  private network: BotNetwork;
  private isRunning: boolean = false;

  constructor() {
    this.network = new BotNetwork();
  }

  createBotSwarm(count: number): void {
    const profiles = BotFactory.createBotSwarm(count);
    for (const profile of profiles) {
      const bot = this.createBotFromProfile(profile);
      this.bots.push(bot);
      this.network.addBot(bot);
    }
  }
  
  private createBotFromProfile(profile: BotProfile): Bot {
    switch (profile.behavior) {
      case 'trader': return new TraderBot(profile);
      case 'hodler': return new HodlerBot(profile);
      case 'node-operator': return new NodeOperatorBot(profile);
      case 'developer': return new DeveloperBot(profile);
      case 'explorer': return new ExplorerBot(profile);
      case 'validator': return new ValidatorBot(profile);
      default: 
        console.warn(`Unknown bot behavior: ${profile.behavior}, creating a fallback bot`);
        return new TraderBot(profile);
    }
  }

  startAll(): void {
    if (this.isRunning) {
      console.warn('Bot swarm is already running');
      return;
    }
    
    this.isRunning = true;
    for (const bot of this.bots) {
      bot.start();
    }
    
    console.log(`Started ${this.bots.length} bots`);
  }

  stopAll(): void {
    if (!this.isRunning) {
      console.warn('Bot swarm is not running');
      return;
    }
    
    this.isRunning = false;
    for (const bot of this.bots) {
      bot.stop();
    }
    
    console.log(`Stopped ${this.bots.length} bots`);
  }

  getActivityReports(): { botId: string; botName: string; activityCount: number; lastActivity: Date | null }[] {
    return this.bots.map(bot => {
      const log = bot.getActivityLog();
      const lastActivity = log.length > 0 ? log[log.length - 1].timestamp : null;
      
      return {
        botId: bot.profile.id,
        botName: bot.profile.name,
        activityCount: log.length,
        lastActivity
      };
    });
  }
  
  getNetworkStats() {
    return this.network.getStats();
  }
}

// Abstract classes for each bot type

// Trader Bot - Focuses on trading activities
export class TraderBot extends Bot {
  constructor(profile: BotProfile) {
    super(profile);
    this.actions = [
      new CheckMarketAction(),
      new PlaceTradeAction(),
      new CancelTradeAction(),
      new CheckBalanceAction(),
      new TransferFundsAction()
    ];
  }
}

// Hodler Bot - Focuses on long-term holding
export class HodlerBot extends Bot {
  constructor(profile: BotProfile) {
    super(profile);
    this.actions = [
      new CheckBalanceAction(),
      new CheckMarketAction(),
      new TransferFundsAction(),
      new StakeTokensAction()
    ];
  }
}

// Node Operator Bot - Focuses on running nodes
export class NodeOperatorBot extends Bot {
  constructor(profile: BotProfile) {
    super(profile);
    this.actions = [
      new CheckNodeStatusAction(),
      new ManageNodeAction(),
      new CheckBalanceAction(),
      new ClaimRewardsAction()
    ];
  }
}

// Developer Bot - Focuses on development activities
export class DeveloperBot extends Bot {
  constructor(profile: BotProfile) {
    super(profile);
    this.actions = [
      new ExploreDocsAction(),
      new DeployContractAction(),
      new TestApiAction(),
      new CheckBalanceAction()
    ];
  }
}

// Explorer Bot - Focuses on exploring the ecosystem
export class ExplorerBot extends Bot {
  constructor(profile: BotProfile) {
    super(profile);
    this.actions = [
      new ExploreDocsAction(),
      new CheckMarketAction(),
      new CheckNodeStatusAction(),
      new TestApiAction(),
      new CheckBalanceAction()
    ];
  }
}

// Validator Bot - Focuses on validation activities
export class ValidatorBot extends Bot {
  constructor(profile: BotProfile) {
    super(profile);
    this.actions = [
      new ValidateTransactionAction(),
      new CheckNodeStatusAction(),
      new ClaimRewardsAction(),
      new StakeTokensAction(),
      new CheckBalanceAction()
    ];
  }
}

// Bot Actions
class CheckMarketAction implements BotAction {
  type = 'check_market';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate market check
    await sleep(getRandomInt(500, 2000));
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is checking market conditions`;
  }
}

class PlaceTradeAction implements BotAction {
  type = 'place_trade';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate placing a trade
    await sleep(getRandomInt(1000, 3000));
  }
  
  getDescription(bot: BotProfile): string {
    const action = Math.random() > 0.5 ? 'buying' : 'selling';
    const amount = getRandomInt(10, 1000);
    return `${bot.name} is ${action} ${amount} ATC tokens`;
  }
}

class CancelTradeAction implements BotAction {
  type = 'cancel_trade';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate cancelling a trade
    await sleep(getRandomInt(500, 1500));
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is cancelling a pending trade`;
  }
}

class CheckBalanceAction implements BotAction {
  type = 'check_balance';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate checking balance
    await sleep(getRandomInt(300, 1000));
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is checking their wallet balance`;
  }
}

class TransferFundsAction implements BotAction {
  type = 'transfer_funds';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate transferring funds
    await sleep(getRandomInt(1000, 3000));
  }
  
  getDescription(bot: BotProfile): string {
    const amount = getRandomInt(10, 500);
    return `${bot.name} is transferring ${amount} ATC tokens`;
  }
}

class CheckNodeStatusAction implements BotAction {
  type = 'check_node_status';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate checking node status
    await sleep(getRandomInt(500, 2000));
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is checking node status`;
  }
}

class ManageNodeAction implements BotAction {
  type = 'manage_node';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate node management
    await sleep(getRandomInt(2000, 5000));
  }
  
  getDescription(bot: BotProfile): string {
    const actions = ['upgrading', 'configuring', 'restarting', 'optimizing'];
    const action = getRandomElement(actions);
    return `${bot.name} is ${action} their node`;
  }
}

class ClaimRewardsAction implements BotAction {
  type = 'claim_rewards';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate claiming rewards
    await sleep(getRandomInt(1000, 3000));
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is claiming node operation rewards`;
  }
}

class ExploreDocsAction implements BotAction {
  type = 'explore_docs';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate exploring documentation
    await sleep(getRandomInt(2000, 8000));
  }
  
  getDescription(bot: BotProfile): string {
    const topics = ['API', 'wallet integration', 'node operation', 'smart contracts', 'security features'];
    const topic = getRandomElement(topics);
    return `${bot.name} is studying ${topic} documentation`;
  }
}

class DeployContractAction implements BotAction {
  type = 'deploy_contract';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate deploying a contract
    await sleep(getRandomInt(3000, 10000));
  }
  
  getDescription(bot: BotProfile): string {
    const contractTypes = ['DeFi', 'NFT', 'DAO', 'token bridge', 'oracle'];
    const contractType = getRandomElement(contractTypes);
    return `${bot.name} is deploying a ${contractType} contract`;
  }
}

class TestApiAction implements BotAction {
  type = 'test_api';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate testing API endpoints
    await sleep(getRandomInt(1000, 4000));
  }
  
  getDescription(bot: BotProfile): string {
    const apis = ['market data', 'node status', 'user profiles', 'transaction history', 'wallet'];
    const api = getRandomElement(apis);
    return `${bot.name} is testing the ${api} API`;
  }
}

class StakeTokensAction implements BotAction {
  type = 'stake_tokens';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate staking tokens
    await sleep(getRandomInt(1000, 3000));
  }
  
  getDescription(bot: BotProfile): string {
    const amount = getRandomInt(1000, 10000);
    return `${bot.name} is staking ${amount} ATC tokens`;
  }
}

class ValidateTransactionAction implements BotAction {
  type = 'validate_transaction';
  
  async execute(bot: BotProfile): Promise<void> {
    // Simulate validating transactions
    await sleep(getRandomInt(500, 2000));
  }
  
  getDescription(bot: BotProfile): string {
    const count = getRandomInt(5, 50);
    return `${bot.name} is validating ${count} transactions`;
  }
}