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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const fixed_storage_1 = require("./fixed-storage");
const schema_1 = require("@shared/schema");
const stripe_1 = require("./services/stripe");
const twilioService = __importStar(require("./services/twilio"));
const matrix_integration_1 = require("./services/matrix-integration");
const zod_1 = require("zod");
const stripe_2 = __importDefault(require("stripe"));
const api_gateway_1 = __importDefault(require("../api-gateway"));
const api_services_1 = __importDefault(require("./routes/api-services"));
const escrow_routes_1 = __importDefault(require("./routes/escrow-routes"));
const dapp_builder_enhancements_1 = __importDefault(require("./routes/dapp-builder-enhancements"));
const mysterion_1 = __importDefault(require("./routes/mysterion"));
const ai_guidance_1 = __importDefault(require("./routes/ai-guidance"));
const ai_training_routes_1 = __importDefault(require("./routes/ai-training-routes"));
const auth_routes_1 = __importDefault(require("./routes/auth-routes"));
const quantum_secure_payment_1 = require("./routes/quantum-secure-payment");
const web3_storage_routes_1 = __importDefault(require("./routes/web3-storage-routes"));
const domain_hosting_routes_1 = __importDefault(require("./routes/domain-hosting-routes"));
const recurve_routes_1 = __importDefault(require("./routes/recurve-routes"));
const aethercore_routes_1 = __importDefault(require("./routes/aethercore-routes"));
const fractalcoin_api_routes_1 = __importDefault(require("./routes/fractalcoin-api-routes"));
const fractalcoin_key_routes_1 = __importDefault(require("./routes/fractalcoin-key-routes"));
const api_key_routes_1 = __importDefault(require("./routes/api-key-routes"));
const fractal_network_routes_1 = __importDefault(require("./routes/fractal-network-routes"));
const openSourcePayment_1 = require("./services/openSourcePayment");
/**
 * Utility function to send notifications through available channels
 * This function will send notifications to a user through all enabled channels
 * (SMS via Twilio and/or Matrix) based on their preferences
 *
 * @param userId User ID to send notification to
 * @param message Plain text message (required for both channels)
 * @param htmlMessage HTML formatted message (optional, for Matrix only)
 * @returns Object with status of each notification channel
 */
async function sendUserNotifications(userId, message, htmlMessage) {
    const results = {
        sms: false,
        matrix: false
    };
    try {
        // Try SMS notification
        const smsSid = await twilioService.sendSmsNotification(userId, message);
        results.sms = !!smsSid;
    }
    catch (error) {
        console.error('Error sending SMS notification:', error);
    }
    try {
        // Try Matrix notification
        const eventId = await matrix_integration_1.matrixCommunication.sendUserNotification(userId, message, htmlMessage);
        results.matrix = !!eventId;
    }
    catch (error) {
        console.error('Error sending Matrix notification:', error);
    }
    return results;
}
/**
 * Utility for transaction notifications
 * Sends to both channels if available
 */
async function sendTransactionNotification(userId, transactionType, amount, tokenSymbol) {
    const results = {
        sms: false,
        matrix: false
    };
    try {
        // Try SMS notification
        const smsSid = await twilioService.sendTransactionNotification(userId, transactionType, amount, tokenSymbol);
        results.sms = !!smsSid;
    }
    catch (error) {
        console.error('Error sending SMS transaction notification:', error);
    }
    try {
        // Try Matrix notification
        const eventId = await matrix_integration_1.matrixCommunication.sendTransactionNotification(userId, transactionType, amount, tokenSymbol);
        results.matrix = !!eventId;
    }
    catch (error) {
        console.error('Error sending Matrix transaction notification:', error);
    }
    return results;
}
// Initialize Stripe with the secret key from environment variables
let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = new stripe_2.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16', // Use the latest stable version
        });
        console.log('Stripe initialized successfully');
    }
    else {
        console.log('Stripe secret key not provided. Payment functionality will be disabled.');
    }
}
catch (error) {
    console.error('Failed to initialize Stripe:', error);
}
async function registerRoutes(app) {
    // Register the API gateway for modular widget system and other modular services
    app.use('/api/gateway', api_gateway_1.default);
    // Mount external API services router (CoinGecko, Blockstream, Etherscan, CryptoCompare, Matrix)
    app.use('/api/services', api_services_1.default);
    // Mount escrow transaction routes
    app.use('/api/escrow', escrow_routes_1.default);
    // Mount DApp Builder enhancement routes
    app.use('/api/dapp-builder', dapp_builder_enhancements_1.default);
    // Mount Mysterion AI system routes
    app.use('/api/mysterion', mysterion_1.default);
    // Mount AI guidance routes for wallet assistance
    app.use('/api/ai', ai_guidance_1.default);
    // Mount authentication routes
    app.use('/api/auth', (0, auth_routes_1.default)());
    // Mount domain hosting routes
    app.use('/api/domain-hosting', domain_hosting_routes_1.default);
    // Mount Web3 storage routes
    app.use('/api/web3-storage', web3_storage_routes_1.default);
    // Mount Recurve Fractal Reserve routes
    app.use('/api/recurve', recurve_routes_1.default);
    // Mount AI Training Feedback routes
    app.use('/api/ai-training', ai_training_routes_1.default);
    // Mount AetherCore routes
    app.use('/api/aethercore', aethercore_routes_1.default);
    // Mount FractalCoin API routes
    app.use('/api/fractalcoin', fractalcoin_api_routes_1.default);
    // Mount FractalCoin API Key management routes
    app.use('/api/fractalcoin', fractalcoin_key_routes_1.default);
    // Mount API Key management routes
    app.use('/api/keys', api_key_routes_1.default);
    // Mount Fractal Network routes for node management
    app.use('/api/fractal-network', fractal_network_routes_1.default);
    // Register quantum secure payment routes
    (0, quantum_secure_payment_1.registerQuantumSecurePaymentRoutes)(app);
    // Whitepaper endpoint
    app.get("/api/whitepaper", (req, res) => {
        res.send(`# FractalCoin Whitepaper

## Pioneering Quantum-Resistant Blockchain Technology

### Abstract

FractalCoin represents a paradigm shift in blockchain technology, founded on the revolutionary principles of toroidal economics and fractal mathematics. Our mission is to create a truly equitable and sustainable blockchain ecosystem that eliminates the inherent advantage of early adopters and ensures fair value distribution across all participants, regardless of when they join.

The FractalCoin blockchain implements several groundbreaking concepts:

1. **Fractal Recursive Tokenomics**: Token distribution and fee structures based on Fibonacci sequences and Mandelbrot set mathematics, creating natural balance throughout the ecosystem.

2. **Toroidal Economics Model**: A circular value flow mechanism that ensures equitable returns for all participants regardless of entry timing.

3. **Death & Resurrection Mining Protocol**: A collaborative mining approach that redistributes computational resources through participant lifecycles, preventing mining power concentration.

4. **Quantum Succession Planning**: Advanced cryptographic mechanisms ensuring digital asset continuity beyond a participant's lifetime.

5. **AI Freedom Trust Federation**: Decentralized governance maintaining mathematical harmony and fair resource distribution in perpetuity.

### Section 1: Core Economic Principles

The fractal nature of our tokenomics ensures that growth patterns, fee structures, and reward mechanisms follow natural mathematical sequences that create balance within the system. By implementing a toroidal flow model, value continuously circulates in a way that prevents concentration at any single point.

New participants joining at any stage experience equivalent growth opportunities through mathematically balanced entry points. This contrasts with traditional exponential models where early adopters gain disproportionate advantages.

### Section 2: Mining & Node Distribution

Our "Death & Resurrection" mining model ensures computational resources are redistributed when nodes go offline, preventing monopolization. Mining rewards follow Fibonacci distribution patterns, with the network maintaining the same ratio of rewards regardless of total computational power.

Quantum-resistant security protocols ensure network integrity against both classical and quantum attacks, future-proofing the system for decades to come.

### Section 3: Implementation Roadmap

The FractalCoin implementation follows a staged approach:

1. **Genesis Layer**: Core protocol establishment with base quantum resistance (2025 Q1-Q2)
2. **Fractal Expansion**: Layer 2 solutions implementing the toroidal economic model (2025 Q3-Q4)
3. **AI Trust Integration**: Decentralized governance systems with mathematical balancing (2026 Q1-Q2)
4. **Full Quantum Shield**: Complete post-quantum cryptographic implementation (2026 Q3-Q4)

### Conclusion

FractalCoin represents not just a technological innovation but a fundamental reimagining of how value can be created and distributed in a digital economy. By aligning blockchain incentives with natural mathematical patterns, we create a system that is inherently fair, sustainable, and resistant to the centralization pressures that have affected previous cryptocurrency implementations.`);
    });
    // API routes
    // Get user wallets
    app.get("/api/wallets", async (req, res) => {
        try {
            // For demo purposes, use userId 1
            const userId = 1;
            const wallets = await fixed_storage_1.storage.getWalletsByUserId(userId);
            res.json(wallets);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch wallets" });
        }
    });
    // Get recent transactions
    app.get("/api/transactions/recent", async (req, res) => {
        try {
            const userId = 1;
            const limit = parseInt(req.query.limit) || 5;
            const transactions = await fixed_storage_1.storage.getRecentTransactions(userId, limit);
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch transactions" });
        }
    });
    // Get transactions by wallet ID
    app.get("/api/wallets/:walletId/transactions", async (req, res) => {
        try {
            const walletId = parseInt(req.params.walletId);
            if (isNaN(walletId)) {
                return res.status(400).json({ message: "Invalid wallet ID" });
            }
            const transactions = await fixed_storage_1.storage.getTransactionsByWalletId(walletId);
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch wallet transactions" });
        }
    });
    // Create a new transaction
    app.post("/api/transactions", async (req, res) => {
        try {
            const transactionData = schema_1.insertTransactionSchema.parse(req.body);
            const transaction = await fixed_storage_1.storage.createTransaction(transactionData);
            // Get wallet to determine user
            const wallet = await fixed_storage_1.storage.getWallet(transaction.walletId);
            if (wallet) {
                // Determine transaction type based on positive or negative amount
                const transactionType = parseFloat(transaction.amount) >= 0 ? 'receive' : 'send';
                const amount = Math.abs(parseFloat(transaction.amount)).toString();
                // Send transaction notification through both Matrix and SMS if enabled
                try {
                    const notificationResults = await sendTransactionNotification(wallet.userId, transactionType, amount, transaction.tokenSymbol || 'SING' // Default to SING if no symbol provided
                    );
                    console.log(`Transaction notification results:`, notificationResults);
                }
                catch (notificationError) {
                    console.error('Failed to send transaction notification:', notificationError);
                    // Non-blocking: we don't fail the transaction if notification fails
                }
            }
            res.status(201).json(transaction);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create transaction" });
        }
    });
    // Get Layer 2 transactions
    app.get("/api/transactions/layer2", async (req, res) => {
        try {
            const userId = 1;
            const layer2Type = req.query.type;
            const transactions = await fixed_storage_1.storage.getLayer2Transactions(userId, layer2Type);
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch Layer 2 transactions" });
        }
    });
    // Update transaction description (plain language explanation)
    app.patch("/api/transactions/:id/description", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { description } = req.body;
            if (!description || typeof description !== 'string') {
                return res.status(400).json({ message: "Description is required and must be a string" });
            }
            const transaction = await fixed_storage_1.storage.updateTransactionDescription(id, description);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            res.json(transaction);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update transaction description" });
        }
    });
    // Update transaction Layer 2 information
    app.patch("/api/transactions/:id/layer2", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { isLayer2, layer2Type, layer2Data } = req.body;
            if (typeof isLayer2 !== 'boolean') {
                return res.status(400).json({ message: "isLayer2 is required and must be a boolean" });
            }
            const transaction = await fixed_storage_1.storage.updateTransactionLayer2Info(id, isLayer2, layer2Type, layer2Data);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            res.json(transaction);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update transaction Layer 2 information" });
        }
    });
    // Get smart contracts
    app.get("/api/contracts", async (req, res) => {
        try {
            const userId = 1;
            const contracts = await fixed_storage_1.storage.getSmartContractsByUserId(userId);
            res.json(contracts);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch smart contracts" });
        }
    });
    // Create a new smart contract
    app.post("/api/contracts", async (req, res) => {
        try {
            const contractData = schema_1.insertSmartContractSchema.parse(req.body);
            const contract = await fixed_storage_1.storage.createSmartContract(contractData);
            res.status(201).json(contract);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create smart contract" });
        }
    });
    // Update smart contract status
    app.patch("/api/contracts/:id/status", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid contract ID" });
            }
            if (!status || typeof status !== 'string') {
                return res.status(400).json({ message: "Invalid status" });
            }
            const updatedContract = await fixed_storage_1.storage.updateSmartContractStatus(id, status);
            if (!updatedContract) {
                return res.status(404).json({ message: "Contract not found" });
            }
            res.json(updatedContract);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update contract status" });
        }
    });
    // Get AI monitoring logs
    app.get("/api/ai/logs", async (req, res) => {
        try {
            const userId = 1;
            const limit = parseInt(req.query.limit) || 10;
            const logs = await fixed_storage_1.storage.getAiMonitoringLogs(userId, limit);
            res.json(logs);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch AI monitoring logs" });
        }
    });
    // Create a new AI monitoring log
    app.post("/api/ai/logs", async (req, res) => {
        try {
            const logData = schema_1.insertAiMonitoringLogSchema.parse(req.body);
            const log = await fixed_storage_1.storage.createAiMonitoringLog(logData);
            res.status(201).json(log);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid log data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create AI monitoring log" });
        }
    });
    // Get CID entries
    app.get("/api/cids", async (req, res) => {
        try {
            const userId = 1;
            const entries = await fixed_storage_1.storage.getCidEntriesByUserId(userId);
            res.json(entries);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch CID entries" });
        }
    });
    // Create a new CID entry
    app.post("/api/cids", async (req, res) => {
        try {
            const entryData = schema_1.insertCidEntrySchema.parse(req.body);
            const entry = await fixed_storage_1.storage.createCidEntry(entryData);
            res.status(201).json(entry);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid CID entry data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create CID entry" });
        }
    });
    // Update CID entry status
    app.patch("/api/cids/:id/status", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid CID entry ID" });
            }
            if (!status || typeof status !== 'string') {
                return res.status(400).json({ message: "Invalid status" });
            }
            const updatedEntry = await fixed_storage_1.storage.updateCidEntryStatus(id, status);
            if (!updatedEntry) {
                return res.status(404).json({ message: "CID entry not found" });
            }
            res.json(updatedEntry);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update CID entry status" });
        }
    });
    // Payment routes
    // Get payment methods for a user
    app.get("/api/payment-methods", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const paymentMethods = await fixed_storage_1.storage.getPaymentMethodsByUserId(userId);
            res.json(paymentMethods);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch payment methods" });
        }
    });
    // Create a new payment method
    app.post("/api/payment-methods", async (req, res) => {
        try {
            const { stripePaymentMethodId, isDefault } = req.body;
            if (!stripePaymentMethodId || typeof stripePaymentMethodId !== 'string') {
                return res.status(400).json({ message: "Invalid payment method ID" });
            }
            const userId = 1; // For demo purposes
            const paymentMethod = await stripe_1.stripeService.savePaymentMethod(userId, stripePaymentMethodId, isDefault === true);
            res.status(201).json(paymentMethod);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to create payment method",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Update a payment method (set as default)
    app.patch("/api/payment-methods/:id/default", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { isDefault } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid payment method ID" });
            }
            if (typeof isDefault !== 'boolean') {
                return res.status(400).json({ message: "isDefault must be a boolean" });
            }
            const updatedMethod = await fixed_storage_1.storage.updatePaymentMethodDefault(id, isDefault);
            if (!updatedMethod) {
                return res.status(404).json({ message: "Payment method not found" });
            }
            res.json(updatedMethod);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update payment method" });
        }
    });
    // Delete a payment method
    app.delete("/api/payment-methods/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid payment method ID" });
            }
            const success = await fixed_storage_1.storage.deletePaymentMethod(id);
            if (!success) {
                return res.status(404).json({ message: "Payment method not found" });
            }
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ message: "Failed to delete payment method" });
        }
    });
    // Get payments for a user
    app.get("/api/payments", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const payments = await fixed_storage_1.storage.getPaymentsByUserId(userId);
            res.json(payments);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch payments" });
        }
    });
    // Create a payment intent
    // Create a Stripe payment intent
    app.post("/api/payments/stripe/create-intent", async (req, res) => {
        try {
            const { amount, currency, description, walletId, metadata } = req.body;
            const userId = 1; // For demo purposes, ideally this would come from auth
            if (!amount || isNaN(parseInt(amount))) {
                return res.status(400).json({ message: "Invalid amount" });
            }
            if (!currency || typeof currency !== 'string') {
                return res.status(400).json({ message: "Invalid currency" });
            }
            const paymentIntent = await stripe_1.stripeService.createPaymentIntent(userId, parseInt(amount), currency, description || "Wallet funding", metadata || {}, walletId ? parseInt(walletId) : undefined);
            res.json({
                clientSecret: paymentIntent.clientSecret,
                paymentIntentId: paymentIntent.paymentIntentId
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to create Stripe payment intent",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Process an OpenCollective/open-source payment
    app.post("/api/payments/open-source", async (req, res) => {
        try {
            const { amount, currency, description, paymentMethod, walletId, metadata } = req.body;
            const userId = 1; // For demo purposes, ideally this would come from auth
            if (!amount || isNaN(parseInt(amount))) {
                return res.status(400).json({ message: "Invalid amount" });
            }
            if (!currency || typeof currency !== 'string') {
                return res.status(400).json({ message: "Invalid currency" });
            }
            if (!paymentMethod || typeof paymentMethod !== 'string') {
                return res.status(400).json({ message: "Invalid payment method" });
            }
            const paymentResponse = await openSourcePayment_1.openSourcePaymentService.processPayment({
                userId,
                amount: parseInt(amount),
                currency,
                description: description || "Wallet funding",
                paymentMethod,
                walletId,
                metadata
            });
            res.json(paymentResponse);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to process open-source payment",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Legacy payment processing endpoint (kept for backwards compatibility)
    app.post("/api/payments/process", async (req, res) => {
        try {
            const { paymentMethodId, amount, currency, description, walletId } = req.body;
            const userId = 1; // For demo purposes
            if (!paymentMethodId || isNaN(parseInt(paymentMethodId))) {
                return res.status(400).json({ message: "Invalid payment method ID" });
            }
            if (!amount || isNaN(parseInt(amount))) {
                return res.status(400).json({ message: "Invalid amount" });
            }
            if (!currency || typeof currency !== 'string') {
                return res.status(400).json({ message: "Invalid currency" });
            }
            if (!description || typeof description !== 'string') {
                return res.status(400).json({ message: "Invalid description" });
            }
            // Create payment intent with Stripe as the default
            const paymentIntent = await stripe_1.stripeService.createPaymentIntent(userId, parseInt(amount), currency, description, { paymentMethodId }, walletId ? parseInt(walletId) : undefined);
            res.status(201).json({
                clientSecret: paymentIntent.clientSecret,
                paymentIntentId: paymentIntent.paymentIntentId
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to process payment",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Process open-source payment
    app.post("/api/payments/open-source/process", async (req, res) => {
        try {
            const { amount, currency, description, paymentMethod, walletId, metadata } = req.body;
            if (!amount || isNaN(parseFloat(amount))) {
                return res.status(400).json({ message: "Invalid amount" });
            }
            if (!currency || typeof currency !== 'string') {
                return res.status(400).json({ message: "Invalid currency" });
            }
            if (!paymentMethod || typeof paymentMethod !== 'string') {
                return res.status(400).json({ message: "Invalid payment method" });
            }
            const userId = 1; // For demo purposes
            const paymentResult = await openSourcePayment_1.openSourcePaymentService.processPayment({
                userId,
                amount: parseFloat(amount),
                currency,
                description: description || 'Open-source payment',
                paymentMethod,
                walletId: walletId ? parseInt(walletId) : undefined,
                metadata
            });
            res.status(201).json(paymentResult);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to process open-source payment",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Check status of an open-source payment
    app.get("/api/payments/open-source/:paymentId/status", async (req, res) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                return res.status(400).json({ message: "Missing payment ID" });
            }
            const paymentStatus = await openSourcePayment_1.openSourcePaymentService.checkPaymentStatus(paymentId);
            res.json(paymentStatus);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to check payment status",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Handle open-source payment webhooks
    app.post("/api/webhooks/open-source", async (req, res) => {
        const signature = req.headers['x-webhook-signature'];
        if (!signature) {
            return res.status(400).json({ message: "Missing webhook signature" });
        }
        try {
            // Raw body needed for webhook signature verification
            const rawBody = req.rawBody || JSON.stringify(req.body);
            const result = await openSourcePayment_1.openSourcePaymentService.handleWebhookEvent(rawBody, signature);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to process webhook",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Handle Stripe webhook events
    app.post("/api/webhooks/stripe", async (req, res) => {
        if (!stripe) {
            return res.status(503).json({ message: "Stripe service is not available" });
        }
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            return res.status(400).json({ message: "Missing Stripe signature" });
        }
        try {
            // Raw body needed for webhook signature verification
            const rawBody = req.rawBody;
            if (!rawBody) {
                return res.status(400).json({ message: "Missing request body" });
            }
            const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
            await stripe_1.stripeService.handleWebhookEvent(event);
            res.json({ received: true });
        }
        catch (error) {
            res.status(400).json({
                message: "Webhook error",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Wallet Health Score routes
    // Get wallet health scores for a user
    app.get("/api/wallet-health/scores", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const scores = await fixed_storage_1.storage.getWalletHealthScoresByUserId(userId);
            res.json(scores);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch wallet health scores" });
        }
    });
    // Get wallet health score by wallet ID
    app.get("/api/wallet-health/scores/wallet/:walletId", async (req, res) => {
        try {
            const walletId = parseInt(req.params.walletId);
            if (isNaN(walletId)) {
                return res.status(400).json({ message: "Invalid wallet ID" });
            }
            const score = await fixed_storage_1.storage.getWalletHealthScoreByWalletId(walletId);
            if (!score) {
                return res.status(404).json({ message: "Wallet health score not found" });
            }
            res.json(score);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch wallet health score" });
        }
    });
    // Get wallet health issues by score ID
    app.get("/api/wallet-health/issues/:scoreId", async (req, res) => {
        try {
            const scoreId = parseInt(req.params.scoreId);
            if (isNaN(scoreId)) {
                return res.status(400).json({ message: "Invalid score ID" });
            }
            const issues = await fixed_storage_1.storage.getWalletHealthIssuesByScoreId(scoreId);
            res.json(issues);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch wallet health issues" });
        }
    });
    // Create a wallet health score
    app.post("/api/wallet-health/scores", async (req, res) => {
        try {
            const scoreData = schema_1.insertWalletHealthScoreSchema.parse(req.body);
            const score = await fixed_storage_1.storage.createWalletHealthScore(scoreData);
            res.status(201).json(score);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid score data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create wallet health score" });
        }
    });
    // Create a wallet health issue
    app.post("/api/wallet-health/issues", async (req, res) => {
        try {
            const issueData = schema_1.insertWalletHealthIssueSchema.parse(req.body);
            const issue = await fixed_storage_1.storage.createWalletHealthIssue(issueData);
            res.status(201).json(issue);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid issue data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create wallet health issue" });
        }
    });
    // Update a wallet health issue (mark as resolved/unresolved)
    app.patch("/api/wallet-health/issues/:id/resolved", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { resolved } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid issue ID" });
            }
            if (typeof resolved !== 'boolean') {
                return res.status(400).json({ message: "resolved must be a boolean" });
            }
            const updatedIssue = await fixed_storage_1.storage.updateWalletHealthIssueResolved(id, resolved);
            if (!updatedIssue) {
                return res.status(404).json({ message: "Wallet health issue not found" });
            }
            res.json(updatedIssue);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update wallet health issue" });
        }
    });
    // Notification routes
    // Get notification preferences for a user
    app.get("/api/notification-preferences", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const preferences = await fixed_storage_1.storage.getNotificationPreferenceByUserId(userId);
            if (!preferences) {
                return res.status(404).json({ message: "Notification preferences not found" });
            }
            // Add status of notification services
            const notificationServices = {
                smsAvailable: twilioService.isTwilioConfigured(),
                matrixAvailable: matrix_integration_1.matrixCommunication.isMatrixConfigured()
            };
            res.json({
                ...preferences,
                notificationServices
            });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch notification preferences" });
        }
    });
    // Update notification preferences
    app.patch("/api/notification-preferences", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { smsEnabled, transactionAlerts, securityAlerts, priceAlerts, marketingUpdates } = req.body;
            // Get current preferences
            const preferences = await fixed_storage_1.storage.getNotificationPreferenceByUserId(userId);
            if (!preferences) {
                return res.status(404).json({ message: "Notification preferences not found" });
            }
            // Update preferences
            const updatedData = {};
            if (typeof smsEnabled === 'boolean')
                updatedData.smsEnabled = smsEnabled;
            if (typeof transactionAlerts === 'boolean')
                updatedData.transactionAlerts = transactionAlerts;
            if (typeof securityAlerts === 'boolean')
                updatedData.securityAlerts = securityAlerts;
            if (typeof priceAlerts === 'boolean')
                updatedData.priceAlerts = priceAlerts;
            if (typeof marketingUpdates === 'boolean')
                updatedData.marketingUpdates = marketingUpdates;
            const updatedPreferences = await fixed_storage_1.storage.updateNotificationPreferences(userId, updatedData);
            if (!updatedPreferences) {
                return res.status(404).json({ message: "Failed to update notification preferences" });
            }
            res.json(updatedPreferences);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update notification preferences" });
        }
    });
    // Add or update phone number and send verification code
    app.post("/api/notification-preferences/phone", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { phoneNumber } = req.body;
            if (!phoneNumber || typeof phoneNumber !== 'string') {
                return res.status(400).json({ message: "Invalid phone number" });
            }
            // Check if Twilio is configured
            if (!twilioService.isTwilioConfigured()) {
                // If testing without Twilio, we just update the phone number without verification
                await fixed_storage_1.storage.updatePhoneNumber(userId, phoneNumber, true);
                return res.json({
                    success: true,
                    message: "Phone number updated (no verification in testing mode)"
                });
            }
            // Send verification code
            const verificationCode = await twilioService.sendVerificationCode(userId, phoneNumber);
            if (!verificationCode) {
                return res.status(500).json({ message: "Failed to send verification code" });
            }
            // In a real app, we would store the verification code securely or use a service like Twilio Verify
            // For demo purposes, we'll return the code in the response (this would never be done in production)
            // In a real app, we'd store this in a short-lived cache or session
            res.json({
                success: true,
                message: "Verification code sent",
                verificationCode // In a real app, this would NEVER be returned to the client
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to send verification code",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Verify phone number with code
    app.post("/api/notification-preferences/verify", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { verificationCode, expectedCode } = req.body;
            if (!verificationCode || typeof verificationCode !== 'string') {
                return res.status(400).json({ message: "Invalid verification code" });
            }
            if (!expectedCode || typeof expectedCode !== 'string') {
                return res.status(400).json({ message: "Invalid expected code" });
            }
            // Check if Twilio is configured
            if (!twilioService.isTwilioConfigured()) {
                // If testing without Twilio, we just verify without sending codes
                await fixed_storage_1.storage.verifyPhoneNumber(userId, true);
                return res.json({
                    success: true,
                    message: "Phone number verified (testing mode)"
                });
            }
            // Verify code
            const success = await twilioService.verifyPhoneNumber(userId, verificationCode, expectedCode);
            if (!success) {
                return res.status(400).json({ message: "Invalid verification code" });
            }
            res.json({
                success: true,
                message: "Phone number verified successfully"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to verify phone number",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Send a test SMS message
    app.post("/api/notification-preferences/test-sms", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            // Check if Twilio is configured
            if (!twilioService.isTwilioConfigured()) {
                return res.status(503).json({
                    message: "SMS service not configured",
                    needsConfiguration: true
                });
            }
            // Get user's notification preferences
            const preferences = await fixed_storage_1.storage.getNotificationPreferenceByUserId(userId);
            if (!preferences) {
                return res.status(404).json({ message: "Notification preferences not found" });
            }
            if (!preferences.phoneNumber || !preferences.isPhoneVerified) {
                return res.status(400).json({
                    message: "Phone number not verified",
                    needsVerification: true
                });
            }
            if (!preferences.smsEnabled) {
                return res.status(400).json({
                    message: "SMS notifications are disabled",
                    smsDisabled: true
                });
            }
            // Send a test message
            const message = "This is a test message from Aetherion Wallet. Your SMS notifications are working correctly!";
            const messageSid = await twilioService.sendSmsNotification(userId, message);
            if (!messageSid) {
                return res.status(500).json({ message: "Failed to send test message" });
            }
            res.json({
                success: true,
                message: "Test message sent successfully",
                messageSid
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to send test message",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Update Matrix ID for notification preferences
    app.post("/api/notification-preferences/matrix", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { matrixId } = req.body;
            if (!matrixId || typeof matrixId !== 'string') {
                return res.status(400).json({ message: "Invalid Matrix ID" });
            }
            // Basic format validation for Matrix ID (@username:homeserver.org)
            if (!matrixId.startsWith('@') || !matrixId.includes(':')) {
                return res.status(400).json({
                    message: "Invalid Matrix ID format. Must be in the format @username:homeserver.org"
                });
            }
            // Check if Matrix service is properly configured
            const isMatrixConfigured = matrix_integration_1.matrixCommunication.isMatrixConfigured();
            // If Matrix service is not configured, we'll update without verification
            if (!isMatrixConfigured) {
                await fixed_storage_1.storage.updateMatrixId(userId, matrixId, true);
                return res.json({
                    success: true,
                    message: "Matrix ID updated (no verification in testing mode)",
                    verificationNeeded: false
                });
            }
            try {
                // Initialize Matrix client if not already done
                await matrix_integration_1.matrixCommunication.initialize();
                // Check if the Matrix ID exists
                const isValid = await matrix_integration_1.matrixCommunication.verifyMatrixId(matrixId);
                if (!isValid) {
                    return res.status(400).json({
                        message: "Could not verify Matrix ID. Please check the ID and try again."
                    });
                }
                // Save Matrix ID (unverified - will be verified after first message)
                await fixed_storage_1.storage.updateMatrixId(userId, matrixId, false);
                // For the demo, we'll mark as verified immediately
                // In a real app, we'd have a verification flow similar to SMS
                await fixed_storage_1.storage.verifyMatrixId(userId, true);
                res.json({
                    success: true,
                    message: "Matrix ID verified successfully",
                    verificationNeeded: false
                });
            }
            catch (matrixError) {
                console.error('Matrix verification error:', matrixError);
                // If Matrix verification fails, we still update but mark as unverified
                await fixed_storage_1.storage.updateMatrixId(userId, matrixId, false);
                res.json({
                    success: true,
                    message: "Matrix ID saved but verification service unavailable",
                    verificationNeeded: true
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to update Matrix ID",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Test Matrix notification
    app.post("/api/notification-preferences/test-matrix", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            // Get user's notification preferences
            const preferences = await fixed_storage_1.storage.getNotificationPreferenceByUserId(userId);
            if (!preferences) {
                return res.status(404).json({ message: "Notification preferences not found" });
            }
            if (!preferences.matrixId || !preferences.isMatrixVerified) {
                return res.status(400).json({
                    message: "Matrix ID not verified",
                    needsVerification: true
                });
            }
            if (!preferences.matrixEnabled) {
                return res.status(400).json({
                    message: "Matrix notifications are disabled",
                    matrixDisabled: true
                });
            }
            // Check if Matrix service is properly configured
            if (!matrix_integration_1.matrixCommunication.isMatrixConfigured()) {
                return res.status(503).json({
                    message: "Matrix service not configured",
                    needsConfiguration: true
                });
            }
            try {
                // Initialize Matrix client if needed
                await matrix_integration_1.matrixCommunication.initialize();
                // Send a test message using the user notification method
                const message = "This is a test message from Aetherion Wallet. Your Matrix notifications are working correctly!";
                const htmlMessage = "<b>This is a test message from Aetherion Wallet.</b> Your Matrix notifications are working correctly!";
                const eventId = await matrix_integration_1.matrixCommunication.sendUserNotification(userId, message, htmlMessage);
                if (!eventId) {
                    return res.status(500).json({ message: "Failed to send Matrix notification" });
                }
                res.json({
                    success: true,
                    message: "Test message sent successfully",
                    eventId
                });
            }
            catch (matrixError) {
                console.error('Matrix send error:', matrixError);
                return res.status(503).json({
                    message: "Failed to send Matrix notification",
                    error: matrixError instanceof Error ? matrixError.message : String(matrixError)
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to send test message",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Unified test notification endpoint (tests both SMS and Matrix or specified channel)
    app.post("/api/notification-preferences/test", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { channel } = req.body; // 'sms', 'matrix', or undefined (both)
            // Get user's notification preferences
            const preferences = await fixed_storage_1.storage.getNotificationPreferenceByUserId(userId);
            if (!preferences) {
                return res.status(404).json({ message: "Notification preferences not found" });
            }
            const results = {
                sms: false,
                matrix: false,
                errors: []
            };
            // Test SMS if requested or if no specific channel requested
            if (!channel || channel === 'sms') {
                if (twilioService.isTwilioConfigured()) {
                    if (preferences.phoneNumber && preferences.isPhoneVerified && preferences.smsEnabled) {
                        try {
                            const message = "This is a unified test message from Aetherion Wallet. Your SMS notifications are working correctly!";
                            const smsSid = await twilioService.sendSmsNotification(userId, message);
                            results.sms = !!smsSid;
                        }
                        catch (error) {
                            console.error('SMS test error:', error);
                            results.errors.push(`SMS error: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                    else {
                        results.errors.push('SMS notifications are disabled or phone number is not verified');
                    }
                }
                else {
                    results.errors.push('SMS service not configured');
                }
            }
            // Test Matrix if requested or if no specific channel requested
            if (!channel || channel === 'matrix') {
                if (matrix_integration_1.matrixCommunication.isMatrixConfigured()) {
                    if (preferences.matrixId && preferences.isMatrixVerified && preferences.matrixEnabled) {
                        try {
                            await matrix_integration_1.matrixCommunication.initialize();
                            const message = "This is a unified test message from Aetherion Wallet. Your Matrix notifications are working correctly!";
                            const htmlMessage = "<b>This is a unified test message from Aetherion Wallet.</b> Your Matrix notifications are working correctly!";
                            const eventId = await matrix_integration_1.matrixCommunication.sendUserNotification(userId, message, htmlMessage);
                            results.matrix = !!eventId;
                        }
                        catch (error) {
                            console.error('Matrix test error:', error);
                            results.errors.push(`Matrix error: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                    else {
                        results.errors.push('Matrix notifications are disabled or Matrix ID is not verified');
                    }
                }
                else {
                    results.errors.push('Matrix service not configured');
                }
            }
            const success = results.sms || results.matrix;
            res.json({
                success,
                results,
                message: success ? "Test notification(s) sent successfully" : "Failed to send test notification(s)"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to send test notification",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // PAYMENT RELATED ROUTES
    // Create a Stripe payment intent
    app.post("/api/payments/stripe/create-intent", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { amount, currency, description, metadata, walletId } = req.body;
            if (!amount || !currency) {
                return res.status(400).json({ message: "Amount and currency are required" });
            }
            // Convert amount to cents (Stripe uses cents for all currencies)
            const amountInCents = Math.round(parseFloat(amount) * 100);
            const result = await stripe_1.stripeService.createPaymentIntent(userId, amountInCents, currency, description || "Payment to Aetherion Wallet", metadata || {}, walletId);
            res.json({
                success: true,
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId
            });
        }
        catch (error) {
            console.error('Stripe payment intent error:', error);
            res.status(500).json({
                message: "Failed to create payment intent",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Check status of a Stripe payment
    app.get("/api/payments/stripe/status/:paymentIntentId", async (req, res) => {
        try {
            const { paymentIntentId } = req.params;
            if (!paymentIntentId) {
                return res.status(400).json({ message: "Payment intent ID is required" });
            }
            const status = await stripe_1.stripeService.checkPaymentStatus(paymentIntentId);
            res.json({
                success: true,
                status
            });
        }
        catch (error) {
            console.error('Stripe payment status check error:', error);
            res.status(500).json({
                message: "Failed to check payment status",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Process a Stripe webhook
    app.post("/api/payments/stripe/webhook", async (req, res) => {
        try {
            const signature = req.headers['stripe-signature'];
            if (!signature) {
                return res.status(400).json({ message: "Stripe signature is required" });
            }
            const payload = req.body;
            const event = await stripe_1.stripeService.handleWebhookEvent(payload, signature);
            res.json({ received: true, event });
        }
        catch (error) {
            console.error('Stripe webhook error:', error);
            res.status(400).json({
                message: "Webhook error",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Process an open-source payment
    app.post("/api/payments/open-source/process", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const { amount, currency, description, metadata, walletId, paymentMethod } = req.body;
            if (!amount || !currency) {
                return res.status(400).json({ message: "Amount and currency are required" });
            }
            // Make sure payment method is valid
            if (paymentMethod && !['credit_card', 'bank_transfer', 'crypto'].includes(paymentMethod)) {
                return res.status(400).json({ message: "Invalid payment method" });
            }
            const amountValue = parseFloat(amount);
            const payment = await openSourcePayment_1.openSourcePaymentService.processPayment(userId, amountValue, currency, description || "Open Source Payment to Aetherion Wallet", metadata || {}, walletId, paymentMethod);
            res.json({
                success: true,
                payment,
                message: "Payment processed successfully"
            });
        }
        catch (error) {
            console.error('Open source payment error:', error);
            res.status(500).json({
                message: "Failed to process payment",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Verify an open-source payment
    app.get("/api/payments/open-source/verify/:paymentId", async (req, res) => {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                return res.status(400).json({ message: "Payment ID is required" });
            }
            const isValid = await openSourcePayment_1.openSourcePaymentService.verifyPayment(paymentId);
            res.json({
                success: true,
                valid: isValid
            });
        }
        catch (error) {
            console.error('Open source payment verification error:', error);
            res.status(500).json({
                message: "Failed to verify payment",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Get all payments for a user
    app.get("/api/payments", async (req, res) => {
        try {
            const userId = 1; // For demo purposes
            const payments = await fixed_storage_1.storage.getPaymentsByUserId(userId);
            res.json({
                success: true,
                payments
            });
        }
        catch (error) {
            console.error('Get payments error:', error);
            res.status(500).json({
                message: "Failed to get payments",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    // Process open-source payments
    app.post("/api/payments/open-source", async (req, res) => {
        try {
            const { amount, currency, description, paymentMethod, walletId } = req.body;
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({ message: "Invalid payment amount" });
            }
            if (!currency || typeof currency !== 'string') {
                return res.status(400).json({ message: "Invalid currency" });
            }
            if (!paymentMethod || typeof paymentMethod !== 'string') {
                return res.status(400).json({ message: "Invalid payment method" });
            }
            const userId = 1; // For demo purposes
            const result = await openSourcePayment_1.openSourcePaymentService.processPayment({
                userId,
                amount,
                currency,
                description: description || 'Open Source Payment',
                paymentMethod,
                walletId: walletId || undefined
            });
            // Normally we would do more verification here before automating this
            // but for demo purposes, we'll auto-verify the payment
            await openSourcePayment_1.openSourcePaymentService.verifyPayment(result.id);
            res.json({
                success: true,
                payment: result
            });
        }
        catch (error) {
            console.error('Open source payment error:', error);
            res.status(500).json({
                message: "Failed to process payment",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
