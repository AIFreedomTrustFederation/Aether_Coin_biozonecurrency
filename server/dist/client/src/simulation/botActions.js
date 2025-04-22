"use strict";
/**
 * Bot Action Service
 *
 * This service provides implementations of bot actions that integrate with the actual API
 * endpoints of the Aetherion ecosystem. It allows bots to perform realistic actions
 * like trading, managing nodes, and interacting with the platform.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedBotActionFactory = exports.NodeOperationCycleAction = exports.TradingCycleAction = exports.SellNodeActionWithApi = exports.PurchaseNodeActionWithApi = exports.ListNodesActionWithApi = exports.TransferFundsActionWithApi = exports.CheckBalanceActionWithApi = void 0;
const apiClient_1 = require("./apiClient");
const utils_1 = require("./utils");
// Type guard to check if an object is a NodeItem
function isNodeItem(obj) {
    return obj &&
        typeof obj.nodeId === 'string' &&
        typeof obj.price === 'number';
}
// Enhanced Bot Actions that interact with the actual API
// Wallet Actions
class CheckBalanceActionWithApi {
    constructor() {
        this.type = 'check_balance';
    }
    async execute(bot) {
        const walletClient = apiClient_1.simulationApiFactory.createWalletApiClient(bot);
        try {
            // Call the actual API
            const response = await walletClient.getBalance(bot.walletAddress);
            // Simulate some processing time
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(300, 1000));
            // If successful, could update the bot's local balance
            if (response.success && response.data) {
                // Update bot balance (in a real implementation, this would actually update it)
                console.log(`Bot ${bot.name} checked balance: ${response.data.balance} ATC`);
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} failed to check balance:`, error);
        }
    }
    getDescription(bot) {
        return `${bot.name} is checking their wallet balance`;
    }
}
exports.CheckBalanceActionWithApi = CheckBalanceActionWithApi;
class TransferFundsActionWithApi {
    constructor() {
        this.type = 'transfer_funds';
    }
    async execute(bot) {
        const walletClient = apiClient_1.simulationApiFactory.createWalletApiClient(bot);
        try {
            // Generate a random recipient address and amount
            const toAddress = `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`;
            const amount = (0, utils_1.getRandomInt)(1, Math.min(100, bot.balance / 2));
            // Skip if amount is too small
            if (amount <= 0)
                return;
            // Call the actual API
            const response = await walletClient.transfer(bot.walletAddress, toAddress, amount);
            // Simulate some processing time
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 3000));
            // Handle response
            if (response.success) {
                // Update bot balance (in a real implementation, this would actually update it)
                console.log(`Bot ${bot.name} transferred ${amount} ATC to ${toAddress}`);
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} failed to transfer funds:`, error);
        }
    }
    getDescription(bot) {
        const amount = (0, utils_1.getRandomInt)(1, Math.min(100, bot.balance / 2));
        return `${bot.name} is transferring ${amount} ATC tokens`;
    }
}
exports.TransferFundsActionWithApi = TransferFundsActionWithApi;
// Node Marketplace Actions
class ListNodesActionWithApi {
    constructor() {
        this.type = 'list_nodes';
    }
    async execute(bot) {
        const marketplaceClient = apiClient_1.simulationApiFactory.createNodeMarketplaceApiClient(bot);
        try {
            // Call the actual API
            const response = await marketplaceClient.listNodes(1, 10);
            // Simulate some processing time
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(500, 2000));
            // Process response
            if (response.success && response.data) {
                console.log(`Bot ${bot.name} retrieved ${response.data.nodes?.length || 0} nodes from marketplace`);
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} failed to list nodes:`, error);
        }
    }
    getDescription(bot) {
        return `${bot.name} is browsing available nodes in the marketplace`;
    }
}
exports.ListNodesActionWithApi = ListNodesActionWithApi;
class PurchaseNodeActionWithApi {
    constructor() {
        this.type = 'purchase_node';
    }
    async execute(bot) {
        const marketplaceClient = apiClient_1.simulationApiFactory.createNodeMarketplaceApiClient(bot);
        try {
            // First, get a list of available nodes
            const listResponse = await marketplaceClient.listNodes(1, 10);
            // Simulate some processing time
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(500, 1500));
            if (listResponse.success && listResponse.data?.nodes && listResponse.data.nodes.length > 0) {
                // Choose a random node to purchase
                const node = (0, utils_1.getRandomElement)(listResponse.data.nodes);
                // Check if the bot has enough balance
                if (bot.balance >= node.price) {
                    // Purchase the node
                    const purchaseResponse = await marketplaceClient.purchaseNode(node.nodeId, bot.walletAddress);
                    // Simulate some processing time
                    await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 3000));
                    // Process response
                    if (purchaseResponse.success) {
                        // Update bot balance (in a real implementation, this would actually update it)
                        console.log(`Bot ${bot.name} purchased node ${node.nodeId} for ${node.price} ATC`);
                    }
                }
                else {
                    console.log(`Bot ${bot.name} couldn't afford node ${node.nodeId} (price: ${node.price} ATC, balance: ${bot.balance} ATC)`);
                }
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} failed to purchase node:`, error);
        }
    }
    getDescription(bot) {
        return `${bot.name} is attempting to purchase a node`;
    }
}
exports.PurchaseNodeActionWithApi = PurchaseNodeActionWithApi;
class SellNodeActionWithApi {
    constructor() {
        this.type = 'sell_node';
    }
    async execute(bot) {
        const marketplaceClient = apiClient_1.simulationApiFactory.createNodeMarketplaceApiClient(bot);
        try {
            // Generate node details
            const nodeTypes = ['compute', 'storage', 'validator', 'relay', 'gateway'];
            const nodeType = (0, utils_1.getRandomElement)(nodeTypes);
            const price = (0, utils_1.getRandomInt)(1000, 10000);
            const description = `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} node operated by ${bot.name}`;
            // Call the actual API
            const response = await marketplaceClient.sellNode(bot.walletAddress, nodeType, price, description);
            // Simulate some processing time
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 3000));
            // Process response
            if (response.success) {
                console.log(`Bot ${bot.name} listed a ${nodeType} node for ${price} ATC`);
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} failed to sell node:`, error);
        }
    }
    getDescription(bot) {
        const nodeTypes = ['compute', 'storage', 'validator', 'relay', 'gateway'];
        const nodeType = (0, utils_1.getRandomElement)(nodeTypes);
        return `${bot.name} is listing a ${nodeType} node for sale`;
    }
}
exports.SellNodeActionWithApi = SellNodeActionWithApi;
// More complex, composite actions
class TradingCycleAction {
    constructor() {
        this.type = 'trading_cycle';
    }
    async execute(bot) {
        // This action simulates a full trading cycle:
        // 1. Check balance
        // 2. Browse available offers
        // 3. Make a purchase decision
        // 4. Execute trade
        // 5. Verify transaction
        console.log(`Bot ${bot.name} starting a trading cycle`);
        const walletClient = apiClient_1.simulationApiFactory.createWalletApiClient(bot);
        const marketplaceClient = apiClient_1.simulationApiFactory.createNodeMarketplaceApiClient(bot);
        try {
            // Step 1: Check balance
            console.log(`${bot.name} checking balance before trading...`);
            const balanceResponse = await walletClient.getBalance(bot.walletAddress);
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(300, 800));
            if (!balanceResponse.success) {
                console.log(`${bot.name} couldn't check balance, aborting trading cycle`);
                return;
            }
            const balance = balanceResponse.data?.balance || bot.balance;
            console.log(`${bot.name} has ${balance} ATC available for trading`);
            // Step 2: Browse marketplace
            console.log(`${bot.name} browsing marketplace...`);
            const listResponse = await marketplaceClient.listNodes(1, 10);
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(500, 1500));
            if (!listResponse.success || !listResponse.data?.nodes || listResponse.data.nodes.length === 0) {
                console.log(`${bot.name} found no trading opportunities, considering selling instead`);
                // Decide whether to list a node for sale
                if (Math.random() > 0.7) {
                    const sellAction = new SellNodeActionWithApi();
                    await sellAction.execute(bot);
                }
                else {
                    console.log(`${bot.name} decided not to sell at this time`);
                }
                return;
            }
            // Step 3: Make trading decision
            console.log(`${bot.name} evaluating ${listResponse.data.nodes.length} trading opportunities...`);
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 2000));
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
            const targetNode = (0, utils_1.getRandomElement)(affordableNodes);
            console.log(`${bot.name} decided to purchase node ${targetNode.nodeId} for ${targetNode.price} ATC`);
            const purchaseResponse = await marketplaceClient.purchaseNode(targetNode.nodeId, bot.walletAddress);
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 3000));
            // Step 5: Verify transaction
            if (purchaseResponse.success) {
                console.log(`${bot.name} successfully purchased node ${targetNode.nodeId}`);
                // Update bot's balance (in a real implementation, this would actually update it)
            }
            else {
                console.log(`${bot.name} failed to complete the purchase: ${purchaseResponse.error}`);
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} trading cycle failed:`, error);
        }
    }
    getDescription(bot) {
        return `${bot.name} is executing a complete trading cycle`;
    }
}
exports.TradingCycleAction = TradingCycleAction;
class NodeOperationCycleAction {
    constructor() {
        this.type = 'node_operation_cycle';
    }
    async execute(bot) {
        // This action simulates a full node operation cycle:
        // 1. Check node status
        // 2. Perform maintenance
        // 3. Claim rewards
        // 4. Reinvest or withdraw
        console.log(`Bot ${bot.name} performing node operation cycle`);
        try {
            // Step 1: Check node status
            console.log(`${bot.name} checking node status...`);
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 2000));
            // Step 2: Perform maintenance (simulated)
            const maintenanceNeeded = Math.random() > 0.7;
            if (maintenanceNeeded) {
                console.log(`${bot.name} performing node maintenance...`);
                await (0, utils_1.sleep)((0, utils_1.getRandomInt)(2000, 5000));
            }
            else {
                console.log(`${bot.name} nodes operating normally, no maintenance needed`);
            }
            // Step 3: Claim rewards
            console.log(`${bot.name} claiming node operation rewards...`);
            const rewardAmount = (0, utils_1.getRandomInt)(50, 500);
            await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 2000));
            console.log(`${bot.name} claimed ${rewardAmount} ATC in node operation rewards`);
            // Step 4: Reinvest or withdraw
            const shouldReinvest = Math.random() > 0.3;
            if (shouldReinvest) {
                console.log(`${bot.name} reinvesting rewards into node infrastructure`);
                await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 3000));
            }
            else {
                console.log(`${bot.name} withdrawing rewards to main wallet`);
                await (0, utils_1.sleep)((0, utils_1.getRandomInt)(1000, 2000));
            }
        }
        catch (error) {
            console.error(`Bot ${bot.name} node operation cycle failed:`, error);
        }
    }
    getDescription(bot) {
        return `${bot.name} is managing their node infrastructure`;
    }
}
exports.NodeOperationCycleAction = NodeOperationCycleAction;
// Factory for creating enhanced bot actions
class EnhancedBotActionFactory {
    static createWalletActions() {
        return [
            new CheckBalanceActionWithApi(),
            new TransferFundsActionWithApi()
        ];
    }
    static createMarketplaceActions() {
        return [
            new ListNodesActionWithApi(),
            new PurchaseNodeActionWithApi(),
            new SellNodeActionWithApi()
        ];
    }
    static createComplexActions() {
        return [
            new TradingCycleAction(),
            new NodeOperationCycleAction()
        ];
    }
    static createAllActions() {
        return [
            ...this.createWalletActions(),
            ...this.createMarketplaceActions(),
            ...this.createComplexActions()
        ];
    }
}
exports.EnhancedBotActionFactory = EnhancedBotActionFactory;
