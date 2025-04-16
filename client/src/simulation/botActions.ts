/**
 * Bot Action Service
 * 
 * This service provides implementations of bot actions that integrate with the actual API
 * endpoints of the Aetherion ecosystem. It allows bots to perform realistic actions
 * like trading, managing nodes, and interacting with the platform.
 */

import { simulationApiFactory } from './apiClient';
import { BotAction, BotProfile } from './botSystem';
import { getRandomInt, getRandomElement, sleep, generateTransactionHash } from './utils';

// Enhanced Bot Actions that interact with the actual API

// Wallet Actions

export class CheckBalanceActionWithApi implements BotAction {
  type = 'check_balance';
  
  async execute(bot: BotProfile): Promise<void> {
    const walletClient = simulationApiFactory.createWalletApiClient(bot);
    
    try {
      // Call the actual API
      const response = await walletClient.getBalance(bot.walletAddress);
      
      // Simulate some processing time
      await sleep(getRandomInt(300, 1000));
      
      // If successful, could update the bot's local balance
      if (response.success && response.data) {
        // Update bot balance (in a real implementation, this would actually update it)
        console.log(`Bot ${bot.name} checked balance: ${response.data.balance} ATC`);
      }
    } catch (error) {
      console.error(`Bot ${bot.name} failed to check balance:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is checking their wallet balance`;
  }
}

export class TransferFundsActionWithApi implements BotAction {
  type = 'transfer_funds';
  
  async execute(bot: BotProfile): Promise<void> {
    const walletClient = simulationApiFactory.createWalletApiClient(bot);
    
    try {
      // Generate a random recipient address and amount
      const toAddress = `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`;
      const amount = getRandomInt(1, Math.min(100, bot.balance / 2));
      
      // Skip if amount is too small
      if (amount <= 0) return;
      
      // Call the actual API
      const response = await walletClient.transfer(bot.walletAddress, toAddress, amount);
      
      // Simulate some processing time
      await sleep(getRandomInt(1000, 3000));
      
      // Handle response
      if (response.success) {
        // Update bot balance (in a real implementation, this would actually update it)
        console.log(`Bot ${bot.name} transferred ${amount} ATC to ${toAddress}`);
      }
    } catch (error) {
      console.error(`Bot ${bot.name} failed to transfer funds:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    const amount = getRandomInt(1, Math.min(100, bot.balance / 2));
    return `${bot.name} is transferring ${amount} ATC tokens`;
  }
}

// Node Marketplace Actions

export class ListNodesActionWithApi implements BotAction {
  type = 'list_nodes';
  
  async execute(bot: BotProfile): Promise<void> {
    const marketplaceClient = simulationApiFactory.createNodeMarketplaceApiClient(bot);
    
    try {
      // Call the actual API
      const response = await marketplaceClient.listNodes(1, 10);
      
      // Simulate some processing time
      await sleep(getRandomInt(500, 2000));
      
      // Process response
      if (response.success && response.data) {
        console.log(`Bot ${bot.name} retrieved ${response.data.nodes?.length || 0} nodes from marketplace`);
      }
    } catch (error) {
      console.error(`Bot ${bot.name} failed to list nodes:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is browsing available nodes in the marketplace`;
  }
}

export class PurchaseNodeActionWithApi implements BotAction {
  type = 'purchase_node';
  
  async execute(bot: BotProfile): Promise<void> {
    const marketplaceClient = simulationApiFactory.createNodeMarketplaceApiClient(bot);
    
    try {
      // First, get a list of available nodes
      const listResponse = await marketplaceClient.listNodes(1, 10);
      
      // Simulate some processing time
      await sleep(getRandomInt(500, 1500));
      
      if (listResponse.success && listResponse.data?.nodes && listResponse.data.nodes.length > 0) {
        // Choose a random node to purchase
        const node = getRandomElement(listResponse.data.nodes);
        
        // Check if the bot has enough balance
        if (bot.balance >= node.price) {
          // Purchase the node
          const purchaseResponse = await marketplaceClient.purchaseNode(node.nodeId, bot.walletAddress);
          
          // Simulate some processing time
          await sleep(getRandomInt(1000, 3000));
          
          // Process response
          if (purchaseResponse.success) {
            // Update bot balance (in a real implementation, this would actually update it)
            console.log(`Bot ${bot.name} purchased node ${node.nodeId} for ${node.price} ATC`);
          }
        } else {
          console.log(`Bot ${bot.name} couldn't afford node ${node.nodeId} (price: ${node.price} ATC, balance: ${bot.balance} ATC)`);
        }
      }
    } catch (error) {
      console.error(`Bot ${bot.name} failed to purchase node:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is attempting to purchase a node`;
  }
}

export class SellNodeActionWithApi implements BotAction {
  type = 'sell_node';
  
  async execute(bot: BotProfile): Promise<void> {
    const marketplaceClient = simulationApiFactory.createNodeMarketplaceApiClient(bot);
    
    try {
      // Generate node details
      const nodeTypes = ['compute', 'storage', 'validator', 'relay', 'gateway'];
      const nodeType = getRandomElement(nodeTypes);
      const price = getRandomInt(1000, 10000);
      const description = `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} node operated by ${bot.name}`;
      
      // Call the actual API
      const response = await marketplaceClient.sellNode(bot.walletAddress, nodeType, price, description);
      
      // Simulate some processing time
      await sleep(getRandomInt(1000, 3000));
      
      // Process response
      if (response.success) {
        console.log(`Bot ${bot.name} listed a ${nodeType} node for ${price} ATC`);
      }
    } catch (error) {
      console.error(`Bot ${bot.name} failed to sell node:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    const nodeTypes = ['compute', 'storage', 'validator', 'relay', 'gateway'];
    const nodeType = getRandomElement(nodeTypes);
    return `${bot.name} is listing a ${nodeType} node for sale`;
  }
}

// More complex, composite actions

export class TradingCycleAction implements BotAction {
  type = 'trading_cycle';
  
  async execute(bot: BotProfile): Promise<void> {
    // This action simulates a full trading cycle:
    // 1. Check balance
    // 2. Browse available offers
    // 3. Make a purchase decision
    // 4. Execute trade
    // 5. Verify transaction
    
    console.log(`Bot ${bot.name} starting a trading cycle`);
    
    const walletClient = simulationApiFactory.createWalletApiClient(bot);
    const marketplaceClient = simulationApiFactory.createNodeMarketplaceApiClient(bot);
    
    try {
      // Step 1: Check balance
      console.log(`${bot.name} checking balance before trading...`);
      const balanceResponse = await walletClient.getBalance(bot.walletAddress);
      await sleep(getRandomInt(300, 800));
      
      if (!balanceResponse.success) {
        console.log(`${bot.name} couldn't check balance, aborting trading cycle`);
        return;
      }
      
      const balance = balanceResponse.data?.balance || bot.balance;
      console.log(`${bot.name} has ${balance} ATC available for trading`);
      
      // Step 2: Browse marketplace
      console.log(`${bot.name} browsing marketplace...`);
      const listResponse = await marketplaceClient.listNodes(1, 10);
      await sleep(getRandomInt(500, 1500));
      
      if (!listResponse.success || !listResponse.data?.nodes || listResponse.data.nodes.length === 0) {
        console.log(`${bot.name} found no trading opportunities, considering selling instead`);
        
        // Decide whether to list a node for sale
        if (Math.random() > 0.7) {
          const sellAction = new SellNodeActionWithApi();
          await sellAction.execute(bot);
        } else {
          console.log(`${bot.name} decided not to sell at this time`);
        }
        
        return;
      }
      
      // Step 3: Make trading decision
      console.log(`${bot.name} evaluating ${listResponse.data.nodes.length} trading opportunities...`);
      await sleep(getRandomInt(1000, 2000));
      
      // Filter nodes within budget
      const affordableNodes = listResponse.data.nodes.filter(node => node.price <= balance);
      
      if (affordableNodes.length === 0) {
        console.log(`${bot.name} found no affordable nodes, continuing to monitor the market`);
        return;
      }
      
      // Decide whether to buy based on personality traits
      const shouldBuy = Math.random() * 100 < bot.personality.risk;
      
      if (!shouldBuy) {
        console.log(`${bot.name} decided not to trade at current market conditions`);
        return;
      }
      
      // Step 4: Execute trade
      const targetNode = getRandomElement(affordableNodes);
      console.log(`${bot.name} decided to purchase node ${targetNode.nodeId} for ${targetNode.price} ATC`);
      
      const purchaseResponse = await marketplaceClient.purchaseNode(targetNode.nodeId, bot.walletAddress);
      await sleep(getRandomInt(1000, 3000));
      
      // Step 5: Verify transaction
      if (purchaseResponse.success) {
        console.log(`${bot.name} successfully purchased node ${targetNode.nodeId}`);
        
        // Update bot's balance (in a real implementation, this would actually update it)
      } else {
        console.log(`${bot.name} failed to complete the purchase: ${purchaseResponse.error}`);
      }
      
    } catch (error) {
      console.error(`Bot ${bot.name} trading cycle failed:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is executing a complete trading cycle`;
  }
}

export class NodeOperationCycleAction implements BotAction {
  type = 'node_operation_cycle';
  
  async execute(bot: BotProfile): Promise<void> {
    // This action simulates a full node operation cycle:
    // 1. Check node status
    // 2. Perform maintenance
    // 3. Claim rewards
    // 4. Reinvest or withdraw
    
    console.log(`Bot ${bot.name} performing node operation cycle`);
    
    try {
      // Step 1: Check node status
      console.log(`${bot.name} checking node status...`);
      await sleep(getRandomInt(1000, 2000));
      
      // Step 2: Perform maintenance (simulated)
      const maintenanceNeeded = Math.random() > 0.7;
      if (maintenanceNeeded) {
        console.log(`${bot.name} performing node maintenance...`);
        await sleep(getRandomInt(2000, 5000));
      } else {
        console.log(`${bot.name} nodes operating normally, no maintenance needed`);
      }
      
      // Step 3: Claim rewards
      console.log(`${bot.name} claiming node operation rewards...`);
      const rewardAmount = getRandomInt(50, 500);
      await sleep(getRandomInt(1000, 2000));
      
      console.log(`${bot.name} claimed ${rewardAmount} ATC in node operation rewards`);
      
      // Step 4: Reinvest or withdraw
      const shouldReinvest = Math.random() > 0.3;
      if (shouldReinvest) {
        console.log(`${bot.name} reinvesting rewards into node infrastructure`);
        await sleep(getRandomInt(1000, 3000));
      } else {
        console.log(`${bot.name} withdrawing rewards to main wallet`);
        await sleep(getRandomInt(1000, 2000));
      }
      
    } catch (error) {
      console.error(`Bot ${bot.name} node operation cycle failed:`, error);
    }
  }
  
  getDescription(bot: BotProfile): string {
    return `${bot.name} is managing their node infrastructure`;
  }
}

// Factory for creating enhanced bot actions
export class EnhancedBotActionFactory {
  static createWalletActions(): BotAction[] {
    return [
      new CheckBalanceActionWithApi(),
      new TransferFundsActionWithApi()
    ];
  }
  
  static createMarketplaceActions(): BotAction[] {
    return [
      new ListNodesActionWithApi(),
      new PurchaseNodeActionWithApi(),
      new SellNodeActionWithApi()
    ];
  }
  
  static createComplexActions(): BotAction[] {
    return [
      new TradingCycleAction(),
      new NodeOperationCycleAction()
    ];
  }
  
  static createAllActions(): BotAction[] {
    return [
      ...this.createWalletActions(),
      ...this.createMarketplaceActions(),
      ...this.createComplexActions()
    ];
  }
}