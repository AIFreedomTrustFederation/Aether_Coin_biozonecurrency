"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertWalletSchema = exports.walletsRelations = exports.wallets = exports.insertUserSchema = exports.usersRelations = exports.users = exports.DisputeStatus = exports.EvidenceType = exports.EscrowStatus = exports.passphraseWalletsRelations = exports.templeNodeWallets = exports.torusWallets = exports.passphraseWallets = exports.apiKeyConnections = exports.apiKeyUsage = exports.apiKeys = exports.mandelbrotRecursionEvents = exports.networkInsurancePolicies = exports.torusSecurityNodes = exports.fractalLoans = exports.recurveTokens = exports.insurancePolicies = exports.BridgeTransactionType = exports.BridgeSupportedTokenType = exports.BridgeValidatorType = exports.BridgeConfigurationType = exports.bridgeTransactions = exports.bridgeSupportedTokens = exports.bridgeValidators = exports.bridgeConfigurations = exports.BridgeNetworkEnum = exports.BridgeNetwork = exports.BridgeTransactionStatusEnum = exports.BridgeTransactionStatus = exports.BridgeStatusEnum = exports.BridgeStatus = exports.TrainingProcessingStatus = exports.TrainingFeedbackType = exports.aiTrainingContributors = exports.aiTrainingJobs = exports.aiTrainingData = exports.graftingProtocols = exports.harvestAllocators = exports.liturgicalExchanges = exports.vaultBuilders = exports.covenantRegistrations = exports.synapticCoCreations = exports.octavalFeedbacks = exports.fractalAuthenticationRibbons = exports.sacredUtilityModules = void 0;
exports.insertFundSchema = exports.fundsRelations = exports.funds = exports.insertAdminPermissionSchema = exports.adminPermissionsRelations = exports.adminPermissions = exports.insertAdminActionSchema = exports.adminActionsRelations = exports.adminActions = exports.insertNotificationPreferenceSchema = exports.notificationPreferencesRelations = exports.notificationPreferences = exports.insertWalletHealthIssueSchema = exports.walletHealthIssuesRelations = exports.walletHealthIssues = exports.insertWalletHealthScoreSchema = exports.walletHealthScoresRelations = exports.walletHealthScores = exports.insertGovernanceRewardSchema = exports.governanceRewardsRelations = exports.governanceRewards = exports.insertVoteSchema = exports.votesRelations = exports.votes = exports.insertProposalOptionSchema = exports.proposalOptionsRelations = exports.proposalOptions = exports.insertProposalSchema = exports.proposalsRelations = exports.proposals = exports.insertStakingPositionSchema = exports.stakingPositionsRelations = exports.stakingPositions = exports.insertPaymentSchema = exports.paymentsRelations = exports.payments = exports.insertPaymentMethodSchema = exports.paymentMethodsRelations = exports.paymentMethods = exports.insertCidEntrySchema = exports.cidEntries = exports.insertAiMonitoringLogSchema = exports.aiMonitoringLogsRelations = exports.aiMonitoringLogs = exports.insertSmartContractSchema = exports.smartContractsRelations = exports.smartContracts = exports.insertTransactionSchema = exports.transactionsRelations = exports.transactions = void 0;
exports.insertEscrowTransactionSchema = exports.aiCoinCompensationRelations = exports.recursionLogsRelations = exports.transactionRatingsRelations = exports.userReputationRelations = exports.mysterionAssessmentsRelations = exports.escrowDisputesRelations = exports.matrixMessagesRelations = exports.matrixRoomsRelations = exports.escrowProofsRelations = exports.escrowTransactionsRelations = exports.aiCoinCompensation = exports.recursionLogs = exports.transactionRatings = exports.userReputation = exports.escrowDisputes = exports.mysterionAssessments = exports.matrixMessages = exports.matrixRooms = exports.escrowProofs = exports.escrowTransactions = exports.insertStakingRecordSchema = exports.stakingRecordsRelations = exports.stakingRecords = exports.insertIcoPhaseSchema = exports.icoPhases = exports.insertIcoParticipationSchema = exports.icoParticipationsRelations = exports.icoParticipations = exports.usersWidgetRelations = exports.dashboardsRelations = exports.widgetTemplatesRelations = exports.widgetsRelations = exports.insertTokenDistributionSchema = exports.tokenDistributionsRelations = exports.tokenomicsConfigRelations = exports.fractalGovernanceVotes = exports.quantumIdentities = exports.brainNetworkShards = exports.llmBrainRecords = exports.aetherBridgeTransactions = exports.tokenDistributions = exports.insertTokenomicsConfigSchema = exports.tokenomicsConfig = exports.insertFundTransactionSchema = exports.fundTransactionsRelations = exports.fundTransactions = exports.insertFundAllocationSchema = exports.fundAllocationsRelations = exports.fundAllocations = void 0;
exports.schema = exports.insertNodeAllocationMappingSchema = exports.nodeAllocationMappingRelations = exports.nodeAllocationMapping = exports.insertStorageProviderNodeSchema = exports.storageProviderNodes = exports.insertDomainActivityLogSchema = exports.domainActivityLogsRelations = exports.domainActivityLogs = exports.insertDomainTrustWalletConnectionSchema = exports.domainTrustWalletConnectionsRelations = exports.domainTrustWalletConnections = exports.insertDnsRecordSchema = exports.dnsRecordsRelations = exports.dnsRecords = exports.insertDomainDeploymentSchema = exports.domainDeploymentsRelations = exports.domainDeployments = exports.insertFilecoinStorageAllocationSchema = exports.filecoinStorageAllocationsRelations = exports.filecoinStorageAllocations = exports.insertDomainConfigurationSchema = exports.domainConfigurationsRelations = exports.domainConfigurations = exports.insertMysterionTrainingDataSchema = exports.mysterionTrainingDataRelations = exports.mysterionTrainingData = exports.insertUserApiKeySchema = exports.userApiKeysRelations = exports.userApiKeys = exports.usersExtendedRelations = exports.insertAiCoinCompensationSchema = exports.insertRecursionLogSchema = exports.insertTransactionRatingSchema = exports.insertUserReputationSchema = exports.insertMysterionAssessmentSchema = exports.insertEscrowDisputeSchema = exports.insertMatrixMessageSchema = exports.insertMatrixRoomSchema = exports.insertEscrowProofSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
// Import API key management schema
const api_key_schema_1 = require("./api-key-schema");
Object.defineProperty(exports, "apiKeys", { enumerable: true, get: function () { return api_key_schema_1.apiKeys; } });
Object.defineProperty(exports, "apiKeyUsage", { enumerable: true, get: function () { return api_key_schema_1.apiKeyUsage; } });
Object.defineProperty(exports, "apiKeyConnections", { enumerable: true, get: function () { return api_key_schema_1.apiKeyConnections; } });
// Import wallet schemas
const wallet_schema_1 = require("./wallet-schema");
Object.defineProperty(exports, "passphraseWallets", { enumerable: true, get: function () { return wallet_schema_1.passphraseWallets; } });
Object.defineProperty(exports, "passphraseWalletsRelations", { enumerable: true, get: function () { return wallet_schema_1.passphraseWalletsRelations; } });
Object.defineProperty(exports, "torusWallets", { enumerable: true, get: function () { return wallet_schema_1.torusWallets; } });
Object.defineProperty(exports, "templeNodeWallets", { enumerable: true, get: function () { return wallet_schema_1.templeNodeWallets; } });
// Using existing pgTable imports from the top of the file for schema definitions
// Temporary definition for Sacred Utility schema
// These are placeholders until we properly implement them
const sacredUtilityModules = (0, pg_core_1.pgTable)('sacred_utility_modules', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.sacredUtilityModules = sacredUtilityModules;
const fractalAuthenticationRibbons = (0, pg_core_1.pgTable)('fractal_authentication_ribbons', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.fractalAuthenticationRibbons = fractalAuthenticationRibbons;
const octavalFeedbacks = (0, pg_core_1.pgTable)('octaval_feedbacks', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.octavalFeedbacks = octavalFeedbacks;
const synapticCoCreations = (0, pg_core_1.pgTable)('synaptic_co_creations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.synapticCoCreations = synapticCoCreations;
const covenantRegistrations = (0, pg_core_1.pgTable)('covenant_registrations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    covenantName: (0, pg_core_1.text)('covenant_name').notNull(),
    covenantType: (0, pg_core_1.text)('covenant_type').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.covenantRegistrations = covenantRegistrations;
const vaultBuilders = (0, pg_core_1.pgTable)('vault_builders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.vaultBuilders = vaultBuilders;
const liturgicalExchanges = (0, pg_core_1.pgTable)('liturgical_exchanges', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.liturgicalExchanges = liturgicalExchanges;
const harvestAllocators = (0, pg_core_1.pgTable)('harvest_allocators', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.harvestAllocators = harvestAllocators;
const graftingProtocols = (0, pg_core_1.pgTable)('grafting_protocols', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
exports.graftingProtocols = graftingProtocols;
// Import AI Assistant Schema 
const ai_assistant_schema_1 = require("./ai-assistant-schema");
Object.defineProperty(exports, "TrainingFeedbackType", { enumerable: true, get: function () { return ai_assistant_schema_1.TrainingFeedbackType; } });
Object.defineProperty(exports, "TrainingProcessingStatus", { enumerable: true, get: function () { return ai_assistant_schema_1.TrainingProcessingStatus; } });
Object.defineProperty(exports, "aiTrainingData", { enumerable: true, get: function () { return ai_assistant_schema_1.aiTrainingData; } });
Object.defineProperty(exports, "aiTrainingJobs", { enumerable: true, get: function () { return ai_assistant_schema_1.aiTrainingJobs; } });
Object.defineProperty(exports, "aiTrainingContributors", { enumerable: true, get: function () { return ai_assistant_schema_1.aiTrainingContributors; } });
// Import and re-export bridge schemas
const bridge_schema_1 = require("./bridge-schema");
Object.defineProperty(exports, "BridgeStatus", { enumerable: true, get: function () { return bridge_schema_1.BridgeStatus; } });
Object.defineProperty(exports, "BridgeStatusEnum", { enumerable: true, get: function () { return bridge_schema_1.BridgeStatusEnum; } });
Object.defineProperty(exports, "BridgeTransactionStatus", { enumerable: true, get: function () { return bridge_schema_1.BridgeTransactionStatus; } });
Object.defineProperty(exports, "BridgeTransactionStatusEnum", { enumerable: true, get: function () { return bridge_schema_1.BridgeTransactionStatusEnum; } });
Object.defineProperty(exports, "BridgeNetwork", { enumerable: true, get: function () { return bridge_schema_1.BridgeNetwork; } });
Object.defineProperty(exports, "BridgeNetworkEnum", { enumerable: true, get: function () { return bridge_schema_1.BridgeNetworkEnum; } });
Object.defineProperty(exports, "bridgeConfigurations", { enumerable: true, get: function () { return bridge_schema_1.bridgeConfigurations; } });
Object.defineProperty(exports, "bridgeValidators", { enumerable: true, get: function () { return bridge_schema_1.bridgeValidators; } });
Object.defineProperty(exports, "bridgeSupportedTokens", { enumerable: true, get: function () { return bridge_schema_1.bridgeSupportedTokens; } });
Object.defineProperty(exports, "bridgeTransactions", { enumerable: true, get: function () { return bridge_schema_1.bridgeTransactions; } });
Object.defineProperty(exports, "BridgeConfigurationType", { enumerable: true, get: function () { return bridge_schema_1.BridgeConfigurationType; } });
Object.defineProperty(exports, "BridgeValidatorType", { enumerable: true, get: function () { return bridge_schema_1.BridgeValidatorType; } });
Object.defineProperty(exports, "BridgeSupportedTokenType", { enumerable: true, get: function () { return bridge_schema_1.BridgeSupportedTokenType; } });
Object.defineProperty(exports, "BridgeTransactionType", { enumerable: true, get: function () { return bridge_schema_1.BridgeTransactionType; } });
const recurve_schema_1 = require("./recurve-schema");
Object.defineProperty(exports, "insurancePolicies", { enumerable: true, get: function () { return recurve_schema_1.insurancePolicies; } });
Object.defineProperty(exports, "recurveTokens", { enumerable: true, get: function () { return recurve_schema_1.recurveTokens; } });
Object.defineProperty(exports, "fractalLoans", { enumerable: true, get: function () { return recurve_schema_1.fractalLoans; } });
Object.defineProperty(exports, "torusSecurityNodes", { enumerable: true, get: function () { return recurve_schema_1.torusSecurityNodes; } });
Object.defineProperty(exports, "networkInsurancePolicies", { enumerable: true, get: function () { return recurve_schema_1.networkInsurancePolicies; } });
Object.defineProperty(exports, "mandelbrotRecursionEvents", { enumerable: true, get: function () { return recurve_schema_1.mandelbrotRecursionEvents; } });
// Import all DApp Builder and Marketplace schema elements
const dapp_schema_1 = require("./dapp-schema");
// Escrow system types
var EscrowStatus;
(function (EscrowStatus) {
    EscrowStatus["INITIATED"] = "initiated";
    EscrowStatus["FUNDED"] = "funded";
    EscrowStatus["EVIDENCE_SUBMITTED"] = "evidence_submitted";
    EscrowStatus["VERIFIED"] = "verified";
    EscrowStatus["COMPLETED"] = "completed";
    EscrowStatus["DISPUTED"] = "disputed";
    EscrowStatus["REFUNDED"] = "refunded";
    EscrowStatus["CANCELLED"] = "cancelled";
})(EscrowStatus || (exports.EscrowStatus = EscrowStatus = {}));
var EvidenceType;
(function (EvidenceType) {
    EvidenceType["IMAGE"] = "image";
    EvidenceType["VIDEO"] = "video";
    EvidenceType["DOCUMENT"] = "document";
    EvidenceType["AUDIO"] = "audio";
    EvidenceType["CHAT_LOG"] = "chat_log";
    EvidenceType["OTHER"] = "other";
})(EvidenceType || (exports.EvidenceType = EvidenceType = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["OPENED"] = "opened";
    DisputeStatus["REVIEWING"] = "reviewing";
    DisputeStatus["EVIDENCE_REQUESTED"] = "evidence_requested";
    DisputeStatus["RESOLVED_BUYER"] = "resolved_buyer";
    DisputeStatus["RESOLVED_SELLER"] = "resolved_seller";
    DisputeStatus["RESOLVED_SPLIT"] = "resolved_split";
    DisputeStatus["CLOSED"] = "closed";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
// User schema
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default("user"), // 'user', 'admin', 'super_admin'
    isTrustMember: (0, pg_core_1.boolean)("is_trust_member").default(false), // Whether this user is an AI Freedom Trust member
    trustMemberSince: (0, pg_core_1.timestamp)("trust_member_since"), // When the user became a trust member
    trustMemberLevel: (0, pg_core_1.text)("trust_member_level"), // Level of trust membership: 'associate', 'full', 'governing'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    lastLogin: (0, pg_core_1.timestamp)("last_login"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    wallets: many(exports.wallets),
    smartContracts: many(exports.smartContracts),
    aiMonitoringLogs: many(exports.aiMonitoringLogs),
    cidEntries: many(exports.cidEntries),
    paymentMethods: many(exports.paymentMethods),
    payments: many(exports.payments),
    stakingPositions: many(exports.stakingPositions),
    stakingRecords: many(exports.stakingRecords),
    icoParticipations: many(exports.icoParticipations),
    createdProposals: many(exports.proposals, { relationName: "createdProposals" }),
    votes: many(exports.votes),
    governanceRewards: many(exports.governanceRewards),
    notificationPreference: one(exports.notificationPreferences),
    apiKeys: many(exports.userApiKeys),
    bridgeTransactions: many(bridge_schema_1.bridgeTransactions),
    // New relations will be added in usersExtendedRelations after schema initialization
}));
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
    isActive: true,
    trustMemberSince: true,
});
// Wallets schema
exports.wallets = (0, pg_core_1.pgTable)("wallets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    chain: (0, pg_core_1.text)("chain").notNull(), // e.g., 'ethereum', 'bitcoin', 'solana'
    name: (0, pg_core_1.text)("name").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    balance: (0, pg_core_1.text)("balance").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // e.g., 'native', 'token', 'nft'
    symbol: (0, pg_core_1.text)("symbol").notNull(),
    dollarValue: (0, pg_core_1.decimal)("dollar_value").notNull(),
    percentChange: (0, pg_core_1.decimal)("percent_change").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.walletsRelations = (0, drizzle_orm_1.relations)(exports.wallets, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.wallets.userId],
        references: [exports.users.id],
    }),
    transactions: many(exports.transactions),
    stakingPositions: many(exports.stakingPositions),
    stakingRecords: many(exports.stakingRecords),
    votes: many(exports.votes),
    bridgeTransactions: many(bridge_schema_1.bridgeTransactions),
    fractalLoans: many(recurve_schema_1.fractalLoans),
    domainTrustWalletConnections: many(exports.domainTrustWalletConnections),
}));
exports.insertWalletSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wallets).omit({
    id: true,
    createdAt: true,
});
// Transactions schema
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    walletId: (0, pg_core_1.integer)("wallet_id").notNull().references(() => exports.wallets.id),
    txHash: (0, pg_core_1.text)("tx_hash").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'send', 'receive', 'contract_interaction'
    amount: (0, pg_core_1.text)("amount").notNull(),
    tokenSymbol: (0, pg_core_1.text)("token_symbol").notNull(),
    fromAddress: (0, pg_core_1.text)("from_address"),
    toAddress: (0, pg_core_1.text)("to_address"),
    status: (0, pg_core_1.text)("status").notNull(), // 'pending', 'confirmed', 'failed'
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    fee: (0, pg_core_1.text)("fee"),
    blockNumber: (0, pg_core_1.integer)("block_number"),
    aiVerified: (0, pg_core_1.boolean)("ai_verified").default(false),
    plainDescription: (0, pg_core_1.text)("plain_description"), // Human-readable description
    isLayer2: (0, pg_core_1.boolean)("is_layer2").default(false), // Whether this is a Layer 2 transaction
    layer2Type: (0, pg_core_1.text)("layer2_type"), // e.g., 'optimism', 'arbitrum', 'polygon', 'zksync'
    layer2Data: (0, pg_core_1.jsonb)("layer2_data"), // Additional Layer 2 specific information
});
exports.transactionsRelations = (0, drizzle_orm_1.relations)(exports.transactions, ({ one }) => ({
    wallet: one(exports.wallets, {
        fields: [exports.transactions.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions).omit({
    id: true,
    timestamp: true,
});
// Smart Contracts schema
exports.smartContracts = (0, pg_core_1.pgTable)("smart_contracts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    name: (0, pg_core_1.text)("name").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    chain: (0, pg_core_1.text)("chain").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'active', 'pending', 'inactive'
    lastInteraction: (0, pg_core_1.timestamp)("last_interaction"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.smartContractsRelations = (0, drizzle_orm_1.relations)(exports.smartContracts, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.smartContracts.userId],
        references: [exports.users.id],
    }),
}));
exports.insertSmartContractSchema = (0, drizzle_zod_1.createInsertSchema)(exports.smartContracts).omit({
    id: true,
    lastInteraction: true,
    createdAt: true,
});
// AI Monitoring Logs schema
exports.aiMonitoringLogs = (0, pg_core_1.pgTable)("ai_monitoring_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    action: (0, pg_core_1.text)("action").notNull(), // 'threat_detected', 'transaction_verified', 'gas_optimization'
    description: (0, pg_core_1.text)("description").notNull(),
    severity: (0, pg_core_1.text)("severity").notNull(), // 'info', 'warning', 'critical'
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    relatedEntityId: (0, pg_core_1.integer)("related_entity_id"), // Can link to tx, contract, etc.
    relatedEntityType: (0, pg_core_1.text)("related_entity_type"), // 'transaction', 'contract', etc.
});
exports.aiMonitoringLogsRelations = (0, drizzle_orm_1.relations)(exports.aiMonitoringLogs, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.aiMonitoringLogs.userId],
        references: [exports.users.id],
    }),
}));
exports.insertAiMonitoringLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiMonitoringLogs).omit({
    id: true,
    timestamp: true,
});
// CID Management schema
exports.cidEntries = (0, pg_core_1.pgTable)("cid_entries", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    cid: (0, pg_core_1.text)("cid").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'wallet_backup', 'smart_contract', 'transaction_log'
    status: (0, pg_core_1.text)("status").notNull(), // 'active', 'syncing', 'inactive'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertCidEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.cidEntries).omit({
    id: true,
    createdAt: true,
});
// Payment Methods schema
exports.paymentMethods = (0, pg_core_1.pgTable)("payment_methods", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    type: (0, pg_core_1.text)("type").notNull(), // 'card', 'bank_account', etc.
    provider: (0, pg_core_1.text)("provider").notNull(), // 'stripe', 'paypal', etc.
    providerPaymentId: (0, pg_core_1.text)("provider_payment_id").notNull(), // Stripe payment method ID, etc.
    last4: (0, pg_core_1.text)("last4"), // Last 4 digits of the card or account
    expiryMonth: (0, pg_core_1.integer)("expiry_month"), // Card expiry month
    expiryYear: (0, pg_core_1.integer)("expiry_year"), // Card expiry year
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    status: (0, pg_core_1.text)("status").notNull(), // 'active', 'expired', 'invalid'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.paymentMethodsRelations = (0, drizzle_orm_1.relations)(exports.paymentMethods, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.paymentMethods.userId],
        references: [exports.users.id],
    }),
}));
exports.insertPaymentMethodSchema = (0, drizzle_zod_1.createInsertSchema)(exports.paymentMethods).omit({
    id: true,
    createdAt: true,
});
// Payments schema
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    paymentMethodId: (0, pg_core_1.integer)("payment_method_id").references(() => exports.paymentMethods.id),
    walletId: (0, pg_core_1.integer)("wallet_id").references(() => exports.wallets.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    currency: (0, pg_core_1.text)("currency").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'pending', 'completed', 'failed', 'refunded'
    provider: (0, pg_core_1.text)("provider").notNull().default('stripe'), // 'stripe', 'open_collective', etc.
    providerPaymentId: (0, pg_core_1.text)("provider_payment_id"), // Stripe payment intent ID or other provider's ID
    externalId: (0, pg_core_1.text)("external_id"), // ID from external payment system
    description: (0, pg_core_1.text)("description"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    // Quantum security fields
    quantumSecured: (0, pg_core_1.boolean)("quantum_secured").default(false), // Whether the payment has quantum security
    quantumSignature: (0, pg_core_1.text)("quantum_signature"), // Quantum-resistant signature
    temporalEntanglementId: (0, pg_core_1.text)("temporal_entanglement_id"), // ID for temporal entanglement
    securityLevel: (0, pg_core_1.text)("security_level").default('standard'), // 'standard', 'enhanced', 'quantum'
    // Standard fields
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
});
exports.paymentsRelations = (0, drizzle_orm_1.relations)(exports.payments, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.payments.userId],
        references: [exports.users.id],
    }),
    paymentMethod: one(exports.paymentMethods, {
        fields: [exports.payments.paymentMethodId],
        references: [exports.paymentMethods.id],
    }),
    wallet: one(exports.wallets, {
        fields: [exports.payments.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payments).omit({
    id: true,
    createdAt: true,
    processedAt: true,
}).extend({
    // We need to extend this because the provider field is added to the schema
    provider: zod_1.z.string().default('stripe'),
    // Allow amount to be either a string or a number
    amount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    // Extend with quantum security fields (optional)
    quantumSecured: zod_1.z.boolean().default(false).optional(),
    quantumSignature: zod_1.z.string().optional(),
    temporalEntanglementId: zod_1.z.string().optional(),
    securityLevel: zod_1.z.enum(['standard', 'enhanced', 'quantum']).default('standard').optional(),
    // Allow metadata to be a record with any values
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Governance Schemas
// Staking schema
exports.stakingPositions = (0, pg_core_1.pgTable)("staking_positions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    walletId: (0, pg_core_1.integer)("wallet_id").notNull().references(() => exports.wallets.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    tokenSymbol: (0, pg_core_1.text)("token_symbol").notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull().defaultNow(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    status: (0, pg_core_1.text)("status").notNull(), // 'active', 'ended', 'canceled'
    rewardsEarned: (0, pg_core_1.decimal)("rewards_earned").default("0"),
    lockPeriodDays: (0, pg_core_1.integer)("lock_period_days"),
    stakingPoolId: (0, pg_core_1.text)("staking_pool_id").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.stakingPositionsRelations = (0, drizzle_orm_1.relations)(exports.stakingPositions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.stakingPositions.userId],
        references: [exports.users.id],
    }),
    wallet: one(exports.wallets, {
        fields: [exports.stakingPositions.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertStakingPositionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.stakingPositions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    rewardsEarned: true,
});
// Proposals schema
exports.proposals = (0, pg_core_1.pgTable)("proposals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    creatorId: (0, pg_core_1.integer)("creator_id").notNull().references(() => exports.users.id),
    status: (0, pg_core_1.text)("status").notNull(), // 'draft', 'active', 'passed', 'rejected', 'expired'
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    contractAddress: (0, pg_core_1.text)("contract_address"),
    chain: (0, pg_core_1.text)("chain").notNull(),
    proposalType: (0, pg_core_1.text)("proposal_type").notNull(), // 'parameter_change', 'treasury', 'upgrade', 'text'
    requiredQuorum: (0, pg_core_1.decimal)("required_quorum").notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.proposalsRelations = (0, drizzle_orm_1.relations)(exports.proposals, ({ one, many }) => ({
    creator: one(exports.users, {
        fields: [exports.proposals.creatorId],
        references: [exports.users.id],
    }),
    votes: many(exports.votes),
    options: many(exports.proposalOptions),
}));
exports.insertProposalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.proposals).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Proposal Options schema
exports.proposalOptions = (0, pg_core_1.pgTable)("proposal_options", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    proposalId: (0, pg_core_1.integer)("proposal_id").notNull().references(() => exports.proposals.id),
    optionText: (0, pg_core_1.text)("option_text").notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.proposalOptionsRelations = (0, drizzle_orm_1.relations)(exports.proposalOptions, ({ one, many }) => ({
    proposal: one(exports.proposals, {
        fields: [exports.proposalOptions.proposalId],
        references: [exports.proposals.id],
    }),
    votes: many(exports.votes),
}));
exports.insertProposalOptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.proposalOptions).omit({
    id: true,
    createdAt: true,
});
// Votes schema
exports.votes = (0, pg_core_1.pgTable)("votes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    proposalId: (0, pg_core_1.integer)("proposal_id").notNull().references(() => exports.proposals.id),
    optionId: (0, pg_core_1.integer)("option_id").notNull().references(() => exports.proposalOptions.id),
    walletId: (0, pg_core_1.integer)("wallet_id").notNull().references(() => exports.wallets.id),
    votePower: (0, pg_core_1.decimal)("vote_power").notNull(),
    transactionHash: (0, pg_core_1.text)("transaction_hash"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.votesRelations = (0, drizzle_orm_1.relations)(exports.votes, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.votes.userId],
        references: [exports.users.id],
    }),
    proposal: one(exports.proposals, {
        fields: [exports.votes.proposalId],
        references: [exports.proposals.id],
    }),
    option: one(exports.proposalOptions, {
        fields: [exports.votes.optionId],
        references: [exports.proposalOptions.id],
    }),
    wallet: one(exports.wallets, {
        fields: [exports.votes.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertVoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.votes).omit({
    id: true,
    createdAt: true,
});
// Governance Rewards schema
exports.governanceRewards = (0, pg_core_1.pgTable)("governance_rewards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    tokenSymbol: (0, pg_core_1.text)("token_symbol").notNull(),
    rewardType: (0, pg_core_1.text)("reward_type").notNull(), // 'voting', 'staking', 'proposal_creation'
    status: (0, pg_core_1.text)("status").notNull(), // 'pending', 'claimed', 'expired'
    relatedEntityId: (0, pg_core_1.integer)("related_entity_id"), // ID of proposal, vote, or staking position
    relatedEntityType: (0, pg_core_1.text)("related_entity_type"), // 'proposal', 'vote', 'staking'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    claimedAt: (0, pg_core_1.timestamp)("claimed_at"),
});
exports.governanceRewardsRelations = (0, drizzle_orm_1.relations)(exports.governanceRewards, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.governanceRewards.userId],
        references: [exports.users.id],
    }),
}));
exports.insertGovernanceRewardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.governanceRewards).omit({
    id: true,
    createdAt: true,
    claimedAt: true,
});
// Wallet Health Score Tables
exports.walletHealthScores = (0, pg_core_1.pgTable)("wallet_health_scores", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    walletId: (0, pg_core_1.integer)("wallet_id").notNull().references(() => exports.wallets.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).defaultNow(),
    overallScore: (0, pg_core_1.integer)("overall_score").notNull(), // 0-100
    securityScore: (0, pg_core_1.integer)("security_score").notNull(), // 0-100
    diversificationScore: (0, pg_core_1.integer)("diversification_score").notNull(), // 0-100
    activityScore: (0, pg_core_1.integer)("activity_score").notNull(), // 0-100
    gasOptimizationScore: (0, pg_core_1.integer)("gas_optimization_score").notNull(), // 0-100
    backgroundScanTimestamp: (0, pg_core_1.timestamp)("background_scan_timestamp", { mode: "date" }),
});
exports.walletHealthScoresRelations = (0, drizzle_orm_1.relations)(exports.walletHealthScores, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.walletHealthScores.userId],
        references: [exports.users.id],
    }),
    wallet: one(exports.wallets, {
        fields: [exports.walletHealthScores.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertWalletHealthScoreSchema = (0, drizzle_zod_1.createInsertSchema)(exports.walletHealthScores).omit({
    id: true,
    createdAt: true,
});
exports.walletHealthIssues = (0, pg_core_1.pgTable)("wallet_health_issues", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    healthScoreId: (0, pg_core_1.integer)("health_score_id").notNull().references(() => exports.walletHealthScores.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "date" }).defaultNow(),
    category: (0, pg_core_1.text)("category").notNull(), // security, diversification, activity, gasOptimization
    severity: (0, pg_core_1.text)("severity").notNull(), // low, medium, high, critical
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    recommendation: (0, pg_core_1.text)("recommendation").notNull(),
    resolved: (0, pg_core_1.boolean)("resolved").default(false),
    resolvedAt: (0, pg_core_1.timestamp)("resolved_at", { mode: "date" }),
});
exports.walletHealthIssuesRelations = (0, drizzle_orm_1.relations)(exports.walletHealthIssues, ({ one }) => ({
    healthScore: one(exports.walletHealthScores, {
        fields: [exports.walletHealthIssues.healthScoreId],
        references: [exports.walletHealthScores.id],
    }),
}));
exports.insertWalletHealthIssueSchema = (0, drizzle_zod_1.createInsertSchema)(exports.walletHealthIssues).omit({
    id: true,
    createdAt: true,
    resolvedAt: true,
});
// Notification preferences schema
exports.notificationPreferences = (0, pg_core_1.pgTable)("notification_preferences", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    // Phone notification fields
    phoneNumber: (0, pg_core_1.text)("phone_number"),
    isPhoneVerified: (0, pg_core_1.boolean)("is_phone_verified").default(false),
    smsEnabled: (0, pg_core_1.boolean)("sms_enabled").default(false),
    // Matrix notification fields (open-source alternative to Twilio)
    matrixId: (0, pg_core_1.text)("matrix_id"), // Format: @username:homeserver.org
    isMatrixVerified: (0, pg_core_1.boolean)("is_matrix_verified").default(false),
    matrixEnabled: (0, pg_core_1.boolean)("matrix_enabled").default(false),
    // Alert types
    transactionAlerts: (0, pg_core_1.boolean)("transaction_alerts").default(true),
    securityAlerts: (0, pg_core_1.boolean)("security_alerts").default(true),
    priceAlerts: (0, pg_core_1.boolean)("price_alerts").default(false),
    marketingUpdates: (0, pg_core_1.boolean)("marketing_updates").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.notificationPreferencesRelations = (0, drizzle_orm_1.relations)(exports.notificationPreferences, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.notificationPreferences.userId],
        references: [exports.users.id],
    }),
}));
exports.insertNotificationPreferenceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notificationPreferences).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Admin Action Logs
exports.adminActions = (0, pg_core_1.pgTable)("admin_actions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id), // Admin who performed the action
    actionType: (0, pg_core_1.text)("action_type").notNull(), // 'user_management', 'fund_allocation', 'tokenomics_update', 'system_config'
    action: (0, pg_core_1.text)("action").notNull(), // Detailed action e.g. 'update_user_role', 'allocate_funds'
    targetId: (0, pg_core_1.integer)("target_id"), // ID of the entity being acted upon (if applicable)
    targetType: (0, pg_core_1.text)("target_type"), // Type of entity e.g. 'user', 'wallet', 'fund'
    details: (0, pg_core_1.jsonb)("details"), // Additional details about the action
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
exports.adminActionsRelations = (0, drizzle_orm_1.relations)(exports.adminActions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.adminActions.userId],
        references: [exports.users.id],
    }),
}));
exports.insertAdminActionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.adminActions).omit({
    id: true,
    timestamp: true,
});
// Admin Permissions
exports.adminPermissions = (0, pg_core_1.pgTable)("admin_permissions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    permissionName: (0, pg_core_1.text)("permission_name").notNull(), // 'manage_users', 'manage_funds', 'view_reports', etc.
    permissionLevel: (0, pg_core_1.text)("permission_level").notNull(), // 'read', 'write', 'admin'
    grantedBy: (0, pg_core_1.integer)("granted_by").references(() => exports.users.id), // Admin who granted this permission
    grantedAt: (0, pg_core_1.timestamp)("granted_at").defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
});
exports.adminPermissionsRelations = (0, drizzle_orm_1.relations)(exports.adminPermissions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.adminPermissions.userId],
        references: [exports.users.id],
    }),
    grantor: one(exports.users, {
        fields: [exports.adminPermissions.grantedBy],
        references: [exports.users.id],
        relationName: "permission_grantor",
    }),
}));
exports.insertAdminPermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.adminPermissions).omit({
    id: true,
    grantedAt: true,
});
// Fund Management
exports.funds = (0, pg_core_1.pgTable)("funds", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    currency: (0, pg_core_1.text)("currency").notNull().default("USD"),
    fundType: (0, pg_core_1.text)("fund_type").notNull(), // 'operational', 'development', 'marketing', 'reserve'
    status: (0, pg_core_1.text)("status").notNull().default("active"), // 'active', 'depleted', 'locked'
    createdBy: (0, pg_core_1.integer)("created_by").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.fundsRelations = (0, drizzle_orm_1.relations)(exports.funds, ({ one, many }) => ({
    creator: one(exports.users, {
        fields: [exports.funds.createdBy],
        references: [exports.users.id],
    }),
    allocations: many(exports.fundAllocations),
    transactions: many(exports.fundTransactions),
}));
exports.insertFundSchema = (0, drizzle_zod_1.createInsertSchema)(exports.funds).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Fund Allocations
exports.fundAllocations = (0, pg_core_1.pgTable)("fund_allocations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    fundId: (0, pg_core_1.integer)("fund_id").notNull().references(() => exports.funds.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    purpose: (0, pg_core_1.text)("purpose").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'completed'
    approvedBy: (0, pg_core_1.integer)("approved_by").references(() => exports.users.id),
    requestedBy: (0, pg_core_1.integer)("requested_by").notNull().references(() => exports.users.id),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
exports.fundAllocationsRelations = (0, drizzle_orm_1.relations)(exports.fundAllocations, ({ one, many }) => ({
    fund: one(exports.funds, {
        fields: [exports.fundAllocations.fundId],
        references: [exports.funds.id],
    }),
    approver: one(exports.users, {
        fields: [exports.fundAllocations.approvedBy],
        references: [exports.users.id],
        relationName: "allocation_approver",
    }),
    requester: one(exports.users, {
        fields: [exports.fundAllocations.requestedBy],
        references: [exports.users.id],
        relationName: "allocation_requester",
    }),
    transactions: many(exports.fundTransactions),
}));
exports.insertFundAllocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fundAllocations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    completedAt: true,
});
// Fund Transactions
exports.fundTransactions = (0, pg_core_1.pgTable)("fund_transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    fundId: (0, pg_core_1.integer)("fund_id").notNull().references(() => exports.funds.id),
    allocationId: (0, pg_core_1.integer)("allocation_id").references(() => exports.fundAllocations.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    transactionType: (0, pg_core_1.text)("transaction_type").notNull(), // 'deposit', 'withdrawal', 'transfer'
    description: (0, pg_core_1.text)("description").notNull(),
    executedBy: (0, pg_core_1.integer)("executed_by").notNull().references(() => exports.users.id),
    recipientType: (0, pg_core_1.text)("recipient_type"), // 'vendor', 'employee', 'partner', 'project'
    recipientId: (0, pg_core_1.text)("recipient_id"), // External ID or identifier
    recipientDetails: (0, pg_core_1.jsonb)("recipient_details"), // Additional details about the recipient
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    reference: (0, pg_core_1.text)("reference"), // Invoice number, PO number, etc.
    status: (0, pg_core_1.text)("status").notNull().default("completed"), // 'pending', 'completed', 'failed', 'reversed'
    metadata: (0, pg_core_1.jsonb)("metadata"),
});
exports.fundTransactionsRelations = (0, drizzle_orm_1.relations)(exports.fundTransactions, ({ one }) => ({
    fund: one(exports.funds, {
        fields: [exports.fundTransactions.fundId],
        references: [exports.funds.id],
    }),
    allocation: one(exports.fundAllocations, {
        fields: [exports.fundTransactions.allocationId],
        references: [exports.fundAllocations.id],
    }),
    executor: one(exports.users, {
        fields: [exports.fundTransactions.executedBy],
        references: [exports.users.id],
    }),
}));
exports.insertFundTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fundTransactions).omit({
    id: true,
    timestamp: true,
});
// Tokenomics Management - moving declaration up before references
// Token Distribution forward declaration
let tokenDistributions;
// Tokenomics Management
exports.tokenomicsConfig = (0, pg_core_1.pgTable)("tokenomics_config", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    totalSupply: (0, pg_core_1.decimal)("total_supply").notNull(),
    circulatingSupply: (0, pg_core_1.decimal)("circulating_supply").notNull(),
    symbol: (0, pg_core_1.text)("symbol").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    decimals: (0, pg_core_1.integer)("decimals").notNull(),
    initialPrice: (0, pg_core_1.decimal)("initial_price").notNull(),
    currentPrice: (0, pg_core_1.decimal)("current_price").notNull(),
    marketCap: (0, pg_core_1.decimal)("market_cap").notNull(),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
    updatedBy: (0, pg_core_1.integer)("updated_by").notNull().references(() => exports.users.id),
    status: (0, pg_core_1.text)("status").notNull().default("active"), // 'planned', 'active', 'deprecated'
    version: (0, pg_core_1.integer)("version").notNull().default(1),
    metadata: (0, pg_core_1.jsonb)("metadata"),
});
exports.insertTokenomicsConfigSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tokenomicsConfig).omit({
    id: true,
    lastUpdated: true,
});
// Token Distribution
exports.tokenDistributions = tokenDistributions = (0, pg_core_1.pgTable)("token_distributions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    configId: (0, pg_core_1.integer)("config_id").notNull().references(() => exports.tokenomicsConfig.id),
    name: (0, pg_core_1.text)("name").notNull(), // 'ICO', 'Team', 'Foundation', 'Ecosystem', 'Development'
    percentage: (0, pg_core_1.decimal)("percentage").notNull(),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    lockupPeriodDays: (0, pg_core_1.integer)("lockup_period_days"),
    vestingPeriodDays: (0, pg_core_1.integer)("vesting_period_days"),
    vestingSchedule: (0, pg_core_1.jsonb)("vesting_schedule"), // Detailed vesting schedule
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    createdBy: (0, pg_core_1.integer)("created_by").notNull().references(() => exports.users.id),
});
// Import AetherCore tables
const schema_1 = require("./aethercore/schema");
Object.defineProperty(exports, "aetherBridgeTransactions", { enumerable: true, get: function () { return schema_1.aetherBridgeTransactions; } });
Object.defineProperty(exports, "llmBrainRecords", { enumerable: true, get: function () { return schema_1.llmBrainRecords; } });
Object.defineProperty(exports, "brainNetworkShards", { enumerable: true, get: function () { return schema_1.brainNetworkShards; } });
Object.defineProperty(exports, "quantumIdentities", { enumerable: true, get: function () { return schema_1.quantumIdentities; } });
Object.defineProperty(exports, "fractalGovernanceVotes", { enumerable: true, get: function () { return schema_1.fractalGovernanceVotes; } });
exports.tokenomicsConfigRelations = (0, drizzle_orm_1.relations)(exports.tokenomicsConfig, ({ one, many }) => ({
    updater: one(exports.users, {
        fields: [exports.tokenomicsConfig.updatedBy],
        references: [exports.users.id],
    }),
    distributions: many(tokenDistributions),
}));
exports.tokenDistributionsRelations = (0, drizzle_orm_1.relations)(tokenDistributions, ({ one }) => ({
    config: one(exports.tokenomicsConfig, {
        fields: [tokenDistributions.configId],
        references: [exports.tokenomicsConfig.id],
    }),
    creator: one(exports.users, {
        fields: [tokenDistributions.createdBy],
        references: [exports.users.id],
    }),
}));
exports.insertTokenDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(tokenDistributions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Widget schema imports
const widget_schema_1 = require("./widget-schema");
// Widget relations
exports.widgetsRelations = (0, drizzle_orm_1.relations)(widget_schema_1.widgets, ({ one }) => ({
    user: one(exports.users, {
        fields: [widget_schema_1.widgets.userId],
        references: [exports.users.id],
    }),
}));
exports.widgetTemplatesRelations = (0, drizzle_orm_1.relations)(widget_schema_1.widgetTemplates, ({ many }) => ({
    widgets: many(widget_schema_1.widgets),
}));
exports.dashboardsRelations = (0, drizzle_orm_1.relations)(widget_schema_1.dashboards, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [widget_schema_1.dashboards.userId],
        references: [exports.users.id],
    }),
    widgets: many(widget_schema_1.widgets),
}));
// Extend user relations with widgets
exports.usersWidgetRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    widgets: many(widget_schema_1.widgets),
    dashboards: many(widget_schema_1.dashboards),
}));
// ICO Participation schema
exports.icoParticipations = (0, pg_core_1.pgTable)('ico_participations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    transactionHash: (0, pg_core_1.text)('transaction_hash').notNull(),
    amountContributed: (0, pg_core_1.text)('amount_contributed').notNull(), // In source currency
    tokensAllocated: (0, pg_core_1.text)('tokens_allocated').notNull(),
    purchaseTimestamp: (0, pg_core_1.timestamp)('purchase_timestamp').defaultNow(),
    phase: (0, pg_core_1.text)('phase').notNull(), // 'seed', 'private', 'public'
    status: (0, pg_core_1.text)('status').notNull().default('pending'), // 'pending', 'confirmed', 'distributed'
    sourceWalletAddress: (0, pg_core_1.text)('source_wallet_address').notNull(),
    destinationWalletAddress: (0, pg_core_1.text)('destination_wallet_address').notNull(),
    networkFee: (0, pg_core_1.text)('network_fee'),
    conversionRate: (0, pg_core_1.text)('conversion_rate'),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    referralCode: (0, pg_core_1.text)('referral_code'),
});
exports.icoParticipationsRelations = (0, drizzle_orm_1.relations)(exports.icoParticipations, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.icoParticipations.userId],
        references: [exports.users.id],
    }),
}));
exports.insertIcoParticipationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.icoParticipations).omit({
    id: true,
    purchaseTimestamp: true,
});
// ICO Phases schema
exports.icoPhases = (0, pg_core_1.pgTable)('ico_phases', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    startDate: (0, pg_core_1.timestamp)('start_date').notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date').notNull(),
    hardCap: (0, pg_core_1.text)('hard_cap').notNull(),
    softCap: (0, pg_core_1.text)('soft_cap').notNull(),
    tokenPrice: (0, pg_core_1.text)('token_price').notNull(),
    minContribution: (0, pg_core_1.text)('min_contribution'),
    maxContribution: (0, pg_core_1.text)('max_contribution'),
    totalRaised: (0, pg_core_1.text)('total_raised').default('0'),
    totalParticipants: (0, pg_core_1.integer)('total_participants').default(0),
    status: (0, pg_core_1.text)('status').notNull().default('upcoming'), // 'upcoming', 'active', 'completed', 'cancelled'
    bonusPercentage: (0, pg_core_1.integer)('bonus_percentage').default(0),
});
exports.insertIcoPhaseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.icoPhases).omit({
    id: true,
});
// Enhanced Staking Records schema
exports.stakingRecords = (0, pg_core_1.pgTable)('staking_records', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    walletId: (0, pg_core_1.integer)('wallet_id').references(() => exports.wallets.id),
    amount: (0, pg_core_1.text)('amount').notNull(),
    startTime: (0, pg_core_1.timestamp)('start_time').defaultNow(),
    endTime: (0, pg_core_1.timestamp)('end_time'),
    rewardRate: (0, pg_core_1.decimal)('reward_rate').notNull(),
    totalReward: (0, pg_core_1.text)('total_reward').default('0'),
    status: (0, pg_core_1.text)('status').notNull().default('active'), // 'active', 'completed', 'cancelled'
    lastRewardCalculation: (0, pg_core_1.timestamp)('last_reward_calculation').defaultNow(),
    nodeContribution: (0, pg_core_1.text)('node_contribution').default('0'),
    validatorStatus: (0, pg_core_1.boolean)('validator_status').default(false),
    fractalShardingParticipation: (0, pg_core_1.boolean)('fractal_sharding_participation').default(false),
});
exports.stakingRecordsRelations = (0, drizzle_orm_1.relations)(exports.stakingRecords, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.stakingRecords.userId],
        references: [exports.users.id],
    }),
    wallet: one(exports.wallets, {
        fields: [exports.stakingRecords.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertStakingRecordSchema = (0, drizzle_zod_1.createInsertSchema)(exports.stakingRecords).omit({
    id: true,
    startTime: true,
    lastRewardCalculation: true,
});
// Combine all schemas for export
// Escrow Transactions schema
exports.escrowTransactions = (0, pg_core_1.pgTable)("escrow_transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sellerId: (0, pg_core_1.integer)("seller_id").notNull().references(() => exports.users.id),
    buyerId: (0, pg_core_1.integer)("buyer_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    tokenSymbol: (0, pg_core_1.text)("token_symbol").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'created', 'funded', 'in_progress', 'completed', 'disputed', 'refunded', 'canceled'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    disputedAt: (0, pg_core_1.timestamp)("disputed_at"),
    transactionHash: (0, pg_core_1.text)("transaction_hash"),
    contractAddress: (0, pg_core_1.text)("contract_address"),
    chain: (0, pg_core_1.text)("chain").notNull(),
    escrowFee: (0, pg_core_1.decimal)("escrow_fee"),
    releasedAt: (0, pg_core_1.timestamp)("released_at"),
    metadata: (0, pg_core_1.jsonb)("metadata"), // For storing additional escrow specific data
});
// Escrow Proofs schema (for pictures, delivery confirmation, etc.)
exports.escrowProofs = (0, pg_core_1.pgTable)("escrow_proofs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    escrowTransactionId: (0, pg_core_1.integer)("escrow_transaction_id").notNull().references(() => exports.escrowTransactions.id),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id), // Who uploaded the proof
    proofType: (0, pg_core_1.text)("proof_type").notNull(), // 'delivery_confirmation', 'condition_picture', 'tracking_info', etc.
    description: (0, pg_core_1.text)("description"),
    fileUrl: (0, pg_core_1.text)("file_url"), // IPFS/Web3.Storage URL to the proof file
    fileCid: (0, pg_core_1.text)("file_cid"), // IPFS CID of the proof file
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    verified: (0, pg_core_1.boolean)("verified").default(false),
    verificationNotes: (0, pg_core_1.text)("verification_notes"),
});
// Matrix Chat Rooms for Escrow Transactions
exports.matrixRooms = (0, pg_core_1.pgTable)("matrix_rooms", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.text)("room_id").notNull().unique(), // Matrix room ID
    escrowTransactionId: (0, pg_core_1.integer)("escrow_transaction_id").notNull().references(() => exports.escrowTransactions.id).unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    status: (0, pg_core_1.text)("status").notNull(), // 'active', 'archived', 'deleted'
    lastActivity: (0, pg_core_1.timestamp)("last_activity").defaultNow(),
    encryptionEnabled: (0, pg_core_1.boolean)("encryption_enabled").default(true),
});
// Matrix Messages for Audit Trail
exports.matrixMessages = (0, pg_core_1.pgTable)("matrix_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.integer)("room_id").notNull().references(() => exports.matrixRooms.id),
    senderId: (0, pg_core_1.integer)("sender_id").notNull().references(() => exports.users.id),
    content: (0, pg_core_1.text)("content").notNull(),
    sentAt: (0, pg_core_1.timestamp)("sent_at").defaultNow(),
    eventId: (0, pg_core_1.text)("event_id").notNull(), // Matrix event ID
    messageType: (0, pg_core_1.text)("message_type").notNull(), // 'text', 'image', 'file', 'system'
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional message metadata
});
// Mysterion AI Ethics Assessment
exports.mysterionAssessments = (0, pg_core_1.pgTable)("mysterion_assessments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    relatedEntityId: (0, pg_core_1.integer)("related_entity_id").notNull(), // ID of escrow transaction, dispute, etc.
    relatedEntityType: (0, pg_core_1.text)("related_entity_type").notNull(), // 'escrow_transaction', 'dispute', etc.
    assessmentType: (0, pg_core_1.text)("assessment_type").notNull(), // 'ethics', 'fraud_detection', 'dispute_resolution', etc.
    assessmentDate: (0, pg_core_1.timestamp)("assessment_date").defaultNow(),
    confidence: (0, pg_core_1.decimal)("confidence").notNull(), // 0-1 confidence score
    decision: (0, pg_core_1.text)("decision").notNull(), // 'buyer_favor', 'seller_favor', 'split', 'inconclusive', etc.
    rationale: (0, pg_core_1.text)("rationale").notNull(),
    ethicalPrinciples: (0, pg_core_1.text)("ethical_principles").array(), // Array of ethical principles applied
    precedents: (0, pg_core_1.jsonb)("precedents"), // JSON of similar cases used as precedent
    compensationAmount: (0, pg_core_1.decimal)("compensation_amount"), // Optional AiCoin compensation
    compensationReason: (0, pg_core_1.text)("compensation_reason"),
});
// Escrow Disputes
exports.escrowDisputes = (0, pg_core_1.pgTable)("escrow_disputes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    escrowTransactionId: (0, pg_core_1.integer)("escrow_transaction_id").notNull().references(() => exports.escrowTransactions.id),
    initiatorId: (0, pg_core_1.integer)("initiator_id").notNull().references(() => exports.users.id),
    reason: (0, pg_core_1.text)("reason").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'opened', 'investigating', 'resolved_buyer', 'resolved_seller', 'split', 'escalated'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    resolvedAt: (0, pg_core_1.timestamp)("resolved_at"),
    resolution: (0, pg_core_1.text)("resolution"),
    resolutionDetail: (0, pg_core_1.text)("resolution_detail"),
    mysterionAssessmentId: (0, pg_core_1.integer)("mysterion_assessment_id").references(() => exports.mysterionAssessments.id),
});
// User Reputation System
exports.userReputation = (0, pg_core_1.pgTable)("user_reputation", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id).unique(),
    overallScore: (0, pg_core_1.decimal)("overall_score").notNull().default("0.5"), // 0-1 scale
    transactionCount: (0, pg_core_1.integer)("transaction_count").notNull().default(0),
    positiveRatings: (0, pg_core_1.integer)("positive_ratings").notNull().default(0),
    negativeRatings: (0, pg_core_1.integer)("negative_ratings").notNull().default(0),
    disputesInitiated: (0, pg_core_1.integer)("disputes_initiated").notNull().default(0),
    disputesLost: (0, pg_core_1.integer)("disputes_lost").notNull().default(0),
    cooldownUntil: (0, pg_core_1.timestamp)("cooldown_until"), // If user is in cooldown period
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
    trustLevel: (0, pg_core_1.text)("trust_level").notNull().default("new"), // 'new', 'trusted', 'verified', 'elite', 'flagged'
    verificationStatus: (0, pg_core_1.text)("verification_status").notNull().default("none"), // 'none', 'basic', 'advanced', 'premium'
    strikeCounts: (0, pg_core_1.integer)("strike_counts").notNull().default(0), // Number of policy violations
});
// Transaction Ratings
exports.transactionRatings = (0, pg_core_1.pgTable)("transaction_ratings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    escrowTransactionId: (0, pg_core_1.integer)("escrow_transaction_id").notNull().references(() => exports.escrowTransactions.id),
    raterId: (0, pg_core_1.integer)("rater_id").notNull().references(() => exports.users.id),
    ratedUserId: (0, pg_core_1.integer)("rated_user_id").notNull().references(() => exports.users.id),
    rating: (0, pg_core_1.integer)("rating").notNull(), // 1-5 scale
    comment: (0, pg_core_1.text)("comment"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    flagged: (0, pg_core_1.boolean)("flagged").default(false),
    flagReason: (0, pg_core_1.text)("flag_reason"),
});
// Recursion Logs for Transaction Reversals
exports.recursionLogs = (0, pg_core_1.pgTable)("recursion_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    transactionId: (0, pg_core_1.integer)("transaction_id").notNull().references(() => exports.transactions.id),
    requesterId: (0, pg_core_1.integer)("requester_id").notNull().references(() => exports.users.id),
    reason: (0, pg_core_1.text)("reason").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'requested', 'processing', 'approved', 'denied', 'completed'
    requestedAt: (0, pg_core_1.timestamp)("requested_at").defaultNow(),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    networkFee: (0, pg_core_1.decimal)("network_fee"),
    recursionDepth: (0, pg_core_1.integer)("recursion_depth").notNull().default(1), // Mandelbrot recursion depth applied
    originalHash: (0, pg_core_1.text)("original_hash").notNull(), // Original transaction hash
    reversalHash: (0, pg_core_1.text)("reversal_hash"), // Reversal transaction hash if processed
    mysterionNotes: (0, pg_core_1.text)("mysterion_notes"), // Notes from Mysterion AI about the reversal
    approved: (0, pg_core_1.boolean)("approved"),
    approvalReason: (0, pg_core_1.text)("approval_reason"),
});
// AiCoin Compensation Records
exports.aiCoinCompensation = (0, pg_core_1.pgTable)("ai_coin_compensation", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    reason: (0, pg_core_1.text)("reason").notNull(),
    relatedEntityId: (0, pg_core_1.integer)("related_entity_id"), // ID of escrow transaction, dispute, etc.
    relatedEntityType: (0, pg_core_1.text)("related_entity_type"), // 'escrow_transaction', 'dispute', etc.
    status: (0, pg_core_1.text)("status").notNull(), // 'pending', 'processed', 'failed'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    transactionHash: (0, pg_core_1.text)("transaction_hash"),
    mysterionAssessmentId: (0, pg_core_1.integer)("mysterion_assessment_id").references(() => exports.mysterionAssessments.id),
});
// Relations for new tables
exports.escrowTransactionsRelations = (0, drizzle_orm_1.relations)(exports.escrowTransactions, ({ one, many }) => ({
    seller: one(exports.users, {
        fields: [exports.escrowTransactions.sellerId],
        references: [exports.users.id],
        relationName: "seller_escrows"
    }),
    buyer: one(exports.users, {
        fields: [exports.escrowTransactions.buyerId],
        references: [exports.users.id],
        relationName: "buyer_escrows"
    }),
    proofs: many(exports.escrowProofs),
    matrixRoom: one(exports.matrixRooms, {
        fields: [exports.escrowTransactions.id],
        references: [exports.matrixRooms.escrowTransactionId]
    }),
    disputes: many(exports.escrowDisputes)
}));
exports.escrowProofsRelations = (0, drizzle_orm_1.relations)(exports.escrowProofs, ({ one }) => ({
    escrowTransaction: one(exports.escrowTransactions, {
        fields: [exports.escrowProofs.escrowTransactionId],
        references: [exports.escrowTransactions.id]
    }),
    user: one(exports.users, {
        fields: [exports.escrowProofs.userId],
        references: [exports.users.id]
    })
}));
exports.matrixRoomsRelations = (0, drizzle_orm_1.relations)(exports.matrixRooms, ({ one }) => ({
    escrowTransaction: one(exports.escrowTransactions, {
        fields: [exports.matrixRooms.escrowTransactionId],
        references: [exports.escrowTransactions.id]
    })
}));
exports.matrixMessagesRelations = (0, drizzle_orm_1.relations)(exports.matrixMessages, ({ one }) => ({
    room: one(exports.matrixRooms, {
        fields: [exports.matrixMessages.roomId],
        references: [exports.matrixRooms.id]
    }),
    sender: one(exports.users, {
        fields: [exports.matrixMessages.senderId],
        references: [exports.users.id]
    })
}));
exports.escrowDisputesRelations = (0, drizzle_orm_1.relations)(exports.escrowDisputes, ({ one }) => ({
    escrowTransaction: one(exports.escrowTransactions, {
        fields: [exports.escrowDisputes.escrowTransactionId],
        references: [exports.escrowTransactions.id]
    }),
    initiator: one(exports.users, {
        fields: [exports.escrowDisputes.initiatorId],
        references: [exports.users.id]
    }),
    mysterionAssessment: one(exports.mysterionAssessments, {
        fields: [exports.escrowDisputes.mysterionAssessmentId],
        references: [exports.mysterionAssessments.id]
    })
}));
exports.mysterionAssessmentsRelations = (0, drizzle_orm_1.relations)(exports.mysterionAssessments, ({ many }) => ({
    disputes: many(exports.escrowDisputes)
}));
exports.userReputationRelations = (0, drizzle_orm_1.relations)(exports.userReputation, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userReputation.userId],
        references: [exports.users.id]
    })
}));
exports.transactionRatingsRelations = (0, drizzle_orm_1.relations)(exports.transactionRatings, ({ one }) => ({
    escrowTransaction: one(exports.escrowTransactions, {
        fields: [exports.transactionRatings.escrowTransactionId],
        references: [exports.escrowTransactions.id]
    }),
    rater: one(exports.users, {
        fields: [exports.transactionRatings.raterId],
        references: [exports.users.id],
        relationName: "given_ratings"
    }),
    ratedUser: one(exports.users, {
        fields: [exports.transactionRatings.ratedUserId],
        references: [exports.users.id],
        relationName: "received_ratings"
    })
}));
exports.recursionLogsRelations = (0, drizzle_orm_1.relations)(exports.recursionLogs, ({ one }) => ({
    transaction: one(exports.transactions, {
        fields: [exports.recursionLogs.transactionId],
        references: [exports.transactions.id]
    }),
    requester: one(exports.users, {
        fields: [exports.recursionLogs.requesterId],
        references: [exports.users.id]
    })
}));
exports.aiCoinCompensationRelations = (0, drizzle_orm_1.relations)(exports.aiCoinCompensation, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.aiCoinCompensation.userId],
        references: [exports.users.id]
    }),
    mysterionAssessment: one(exports.mysterionAssessments, {
        fields: [exports.aiCoinCompensation.mysterionAssessmentId],
        references: [exports.mysterionAssessments.id]
    })
}));
// Insert schemas for new tables
exports.insertEscrowTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.escrowTransactions).omit({
    id: true,
    createdAt: true,
    completedAt: true,
    disputedAt: true,
    releasedAt: true,
});
exports.insertEscrowProofSchema = (0, drizzle_zod_1.createInsertSchema)(exports.escrowProofs).omit({
    id: true,
    timestamp: true,
    verified: true,
    verificationNotes: true,
});
exports.insertMatrixRoomSchema = (0, drizzle_zod_1.createInsertSchema)(exports.matrixRooms).omit({
    id: true,
    createdAt: true,
    lastActivity: true,
});
exports.insertMatrixMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.matrixMessages).omit({
    id: true,
    sentAt: true,
});
exports.insertEscrowDisputeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.escrowDisputes).omit({
    id: true,
    createdAt: true,
    resolvedAt: true,
    mysterionAssessmentId: true,
});
exports.insertMysterionAssessmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mysterionAssessments).omit({
    id: true,
    assessmentDate: true,
});
exports.insertUserReputationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userReputation).omit({
    id: true,
    lastUpdated: true,
    overallScore: true,
    transactionCount: true,
    positiveRatings: true,
    negativeRatings: true,
    disputesInitiated: true,
    disputesLost: true,
    trustLevel: true,
    verificationStatus: true,
    strikeCounts: true,
});
exports.insertTransactionRatingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactionRatings).omit({
    id: true,
    createdAt: true,
    flagged: true,
    flagReason: true,
});
exports.insertRecursionLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.recursionLogs).omit({
    id: true,
    requestedAt: true,
    processedAt: true,
    reversalHash: true,
    mysterionNotes: true,
    approved: true,
    approvalReason: true,
});
exports.insertAiCoinCompensationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiCoinCompensation).omit({
    id: true,
    createdAt: true,
    processedAt: true,
    transactionHash: true,
});
// Extended user relations to include the new tables
exports.usersExtendedRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    sellerEscrows: many(exports.escrowTransactions, { relationName: "seller_escrows" }),
    buyerEscrows: many(exports.escrowTransactions, { relationName: "buyer_escrows" }),
    escrowProofs: many(exports.escrowProofs),
    matrixMessages: many(exports.matrixMessages),
    initiatedDisputes: many(exports.escrowDisputes),
    reputation: one(exports.userReputation),
    givenRatings: many(exports.transactionRatings, { relationName: "given_ratings" }),
    receivedRatings: many(exports.transactionRatings, { relationName: "received_ratings" }),
    recursionRequests: many(exports.recursionLogs),
    aiCoinCompensations: many(exports.aiCoinCompensation),
    // Recurve Fractal Reserve relations
    insurancePolicies: many(recurve_schema_1.insurancePolicies),
    recurveTokens: many(recurve_schema_1.recurveTokens),
    fractalLoans: many(recurve_schema_1.fractalLoans),
    torusSecurityNodes: many(recurve_schema_1.torusSecurityNodes),
    mandelbrotRecursionEvents: many(recurve_schema_1.mandelbrotRecursionEvents),
    // DApp Builder and Marketplace relations
    userDapps: many(dapp_schema_1.userDapps),
    dappListings: many(dapp_schema_1.marketplaceListings),
    dappPurchases: many(dapp_schema_1.dappPurchases),
    dappReviews: many(dapp_schema_1.dappReviews),
    dappCreationChats: many(dapp_schema_1.dappCreationChats),
    browserSettings: one(dapp_schema_1.browserUsers),
    sandboxEnvironments: many(dapp_schema_1.sandboxEnvironments),
}));
// User API Keys for Mysterion distributed LLM training
exports.userApiKeys = (0, pg_core_1.pgTable)("user_api_keys", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    service: (0, pg_core_1.text)("service").notNull(), // 'openai', 'anthropic', etc.
    keyName: (0, pg_core_1.text)("key_name").notNull(), // User-defined name for the key
    keyIdentifier: (0, pg_core_1.text)("key_identifier"), // First few chars of the key for identification
    encryptedKey: (0, pg_core_1.text)("encrypted_key").notNull(), // Encrypted API key
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    isTrainingEnabled: (0, pg_core_1.boolean)("is_training_enabled").notNull().default(true), // Whether to use for training
    usageCount: (0, pg_core_1.integer)("usage_count").notNull().default(0),
    lastUsed: (0, pg_core_1.timestamp)("last_used"),
    lastContribution: (0, pg_core_1.timestamp)("last_contribution"), // Last time contributed to training
    contributionPoints: (0, pg_core_1.integer)("contribution_points").notNull().default(0), // Points earned by contributing
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.userApiKeysRelations = (0, drizzle_orm_1.relations)(exports.userApiKeys, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userApiKeys.userId],
        references: [exports.users.id],
    }),
}));
exports.insertUserApiKeySchema = (0, drizzle_zod_1.createInsertSchema)(exports.userApiKeys).omit({
    id: true,
    usageCount: true,
    lastUsed: true,
    lastContribution: true,
    contributionPoints: true,
    createdAt: true,
    updatedAt: true,
});
// Mysterion LLM Training Contributions
exports.mysterionTrainingData = (0, pg_core_1.pgTable)("mysterion_training_data", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userApiKeyId: (0, pg_core_1.integer)("user_api_key_id").notNull().references(() => exports.userApiKeys.id),
    dataSizeBytes: (0, pg_core_1.integer)("data_size_bytes").notNull(),
    dataHash: (0, pg_core_1.text)("data_hash").notNull(), // Hash of the training data for deduplication
    dataType: (0, pg_core_1.text)("data_type").notNull(), // 'conversation', 'transaction', 'code', etc.
    contributionDate: (0, pg_core_1.timestamp)("contribution_date").defaultNow(),
    processingStatus: (0, pg_core_1.text)("processing_status").notNull().default("queued"), // 'queued', 'processing', 'completed', 'failed'
    processingNotes: (0, pg_core_1.text)("processing_notes"),
    pointsAwarded: (0, pg_core_1.integer)("points_awarded").notNull().default(0),
});
exports.mysterionTrainingDataRelations = (0, drizzle_orm_1.relations)(exports.mysterionTrainingData, ({ one }) => ({
    userApiKey: one(exports.userApiKeys, {
        fields: [exports.mysterionTrainingData.userApiKeyId],
        references: [exports.userApiKeys.id],
    }),
}));
exports.insertMysterionTrainingDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mysterionTrainingData).omit({
    id: true,
    contributionDate: true,
    processingStatus: true,
    pointsAwarded: true,
});
// Types are now imported at the top of the file
// FractalCoin Domain Hosting Schemas
exports.domainConfigurations = (0, pg_core_1.pgTable)("domain_configurations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    domainName: (0, pg_core_1.text)("domain_name").notNull().unique(),
    active: (0, pg_core_1.boolean)("active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    nameservers: (0, pg_core_1.text)("nameservers").array(),
    contentCid: (0, pg_core_1.text)("content_cid"), // IPFS CID for website content
    ensRegistered: (0, pg_core_1.boolean)("ens_registered").default(false),
    domainType: (0, pg_core_1.text)("domain_type").default("standard").notNull(), // standard, premium, enterprise
    paymentStatus: (0, pg_core_1.text)("payment_status").default("pending").notNull(), // pending, paid, failed, refunded
    autoRenew: (0, pg_core_1.boolean)("auto_renew").default(true),
    domainRegistrationType: (0, pg_core_1.text)("domain_registration_type").default("fractalcoin").notNull(), // fractalcoin, trust, traditional
    registrarInfo: (0, pg_core_1.jsonb)("registrar_info"), // Information about the registrar service
    dnsConfiguration: (0, pg_core_1.jsonb)("dns_configuration"), // DNS record configurations
    trustCredentials: (0, pg_core_1.jsonb)("trust_credentials"), // For .trust domain integration
    sslCertificate: (0, pg_core_1.jsonb)("ssl_certificate"), // SSL certificate information
    customDomainSettings: (0, pg_core_1.jsonb)("custom_domain_settings"), // Settings for traditional domains
});
exports.domainConfigurationsRelations = (0, drizzle_orm_1.relations)(exports.domainConfigurations, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.domainConfigurations.userId],
        references: [exports.users.id],
    }),
    filecoinStorageAllocations: many(exports.filecoinStorageAllocations),
    domainDeployments: many(exports.domainDeployments),
}));
exports.insertDomainConfigurationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.domainConfigurations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.filecoinStorageAllocations = (0, pg_core_1.pgTable)("filecoin_storage_allocations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    domainId: (0, pg_core_1.integer)("domain_id").notNull().references(() => exports.domainConfigurations.id),
    storageBytes: (0, pg_core_1.integer)("storage_bytes").notNull(),
    allocationDate: (0, pg_core_1.timestamp)("allocation_date").defaultNow().notNull(),
    expirationDate: (0, pg_core_1.timestamp)("expiration_date"),
    bridgeCid: (0, pg_core_1.text)("bridge_cid").notNull(), // Reference to the Filecoin-FractalCoin bridge
    nodeCount: (0, pg_core_1.integer)("node_count").default(3).notNull(), // Number of storage nodes
    status: (0, pg_core_1.text)("status").default("active").notNull(), // active, expired, pending, failed
    bridgeConfig: (0, pg_core_1.jsonb)("bridge_config").notNull(), // Configuration settings for the bridge
    cost: (0, pg_core_1.decimal)("cost", { precision: 18, scale: 6 }).notNull(), // Cost in FractalCoin
});
exports.filecoinStorageAllocationsRelations = (0, drizzle_orm_1.relations)(exports.filecoinStorageAllocations, ({ one }) => ({
    domain: one(exports.domainConfigurations, {
        fields: [exports.filecoinStorageAllocations.domainId],
        references: [exports.domainConfigurations.id],
    }),
}));
exports.insertFilecoinStorageAllocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.filecoinStorageAllocations).omit({
    id: true,
    allocationDate: true,
});
exports.domainDeployments = (0, pg_core_1.pgTable)("domain_deployments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    domainId: (0, pg_core_1.integer)("domain_id").notNull().references(() => exports.domainConfigurations.id),
    deploymentCid: (0, pg_core_1.text)("deployment_cid").notNull(), // IPFS CID of the deployed website
    deploymentDate: (0, pg_core_1.timestamp)("deployment_date").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("processing").notNull(), // processing, success, failed
    ipfsGatewayUrl: (0, pg_core_1.text)("ipfs_gateway_url"), // Gateway URL for accessing the content
    fileCounts: (0, pg_core_1.jsonb)("file_counts"), // JSON object with file type counts
    totalSizeBytes: (0, pg_core_1.integer)("total_size_bytes"),
    deploymentConfig: (0, pg_core_1.jsonb)("deployment_config"), // Custom configuration for this deployment
});
exports.domainDeploymentsRelations = (0, drizzle_orm_1.relations)(exports.domainDeployments, ({ one }) => ({
    domain: one(exports.domainConfigurations, {
        fields: [exports.domainDeployments.domainId],
        references: [exports.domainConfigurations.id],
    }),
}));
exports.insertDomainDeploymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.domainDeployments).omit({
    id: true,
    deploymentDate: true,
});
exports.dnsRecords = (0, pg_core_1.pgTable)("dns_records", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    domainId: (0, pg_core_1.integer)("domain_id").notNull().references(() => exports.domainConfigurations.id),
    recordType: (0, pg_core_1.text)("record_type").notNull(), // A, AAAA, CNAME, MX, TXT, etc.
    name: (0, pg_core_1.text)("name").notNull(), // subdomain or @ for root
    value: (0, pg_core_1.text)("value").notNull(), // IP, hostname, text value, etc.
    ttl: (0, pg_core_1.integer)("ttl").default(3600), // Time to live in seconds
    priority: (0, pg_core_1.integer)("priority"), // For MX and SRV records
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
});
exports.dnsRecordsRelations = (0, drizzle_orm_1.relations)(exports.dnsRecords, ({ one }) => ({
    domain: one(exports.domainConfigurations, {
        fields: [exports.dnsRecords.domainId],
        references: [exports.domainConfigurations.id],
    }),
}));
exports.insertDnsRecordSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dnsRecords).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.domainTrustWalletConnections = (0, pg_core_1.pgTable)("domain_trust_wallet_connections", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    domainId: (0, pg_core_1.integer)("domain_id").notNull().references(() => exports.domainConfigurations.id),
    walletId: (0, pg_core_1.integer)("wallet_id").notNull().references(() => exports.wallets.id),
    walletAddress: (0, pg_core_1.text)("wallet_address").notNull(),
    connectionType: (0, pg_core_1.text)("connection_type").notNull(), // owner, manager, delegate
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    verificationProof: (0, pg_core_1.text)("verification_proof"), // Proof of ownership
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
});
exports.domainTrustWalletConnectionsRelations = (0, drizzle_orm_1.relations)(exports.domainTrustWalletConnections, ({ one }) => ({
    domain: one(exports.domainConfigurations, {
        fields: [exports.domainTrustWalletConnections.domainId],
        references: [exports.domainConfigurations.id],
    }),
    wallet: one(exports.wallets, {
        fields: [exports.domainTrustWalletConnections.walletId],
        references: [exports.wallets.id],
    }),
}));
exports.insertDomainTrustWalletConnectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.domainTrustWalletConnections).omit({
    id: true,
    createdAt: true,
});
exports.domainActivityLogs = (0, pg_core_1.pgTable)("domain_activity_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    domainId: (0, pg_core_1.integer)("domain_id").notNull().references(() => exports.domainConfigurations.id),
    action: (0, pg_core_1.text)("action").notNull(), // deploy, renew, update, delete, etc.
    performedBy: (0, pg_core_1.integer)("performed_by").notNull().references(() => exports.users.id),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
    details: (0, pg_core_1.jsonb)("details"), // Additional details about the action
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
});
exports.domainActivityLogsRelations = (0, drizzle_orm_1.relations)(exports.domainActivityLogs, ({ one }) => ({
    domain: one(exports.domainConfigurations, {
        fields: [exports.domainActivityLogs.domainId],
        references: [exports.domainConfigurations.id],
    }),
    user: one(exports.users, {
        fields: [exports.domainActivityLogs.performedBy],
        references: [exports.users.id],
    }),
}));
exports.insertDomainActivityLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.domainActivityLogs).omit({
    id: true,
    timestamp: true,
});
exports.storageProviderNodes = (0, pg_core_1.pgTable)("storage_provider_nodes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    providerId: (0, pg_core_1.text)("provider_id").notNull().unique(), // Unique ID of the storage provider
    nodeType: (0, pg_core_1.text)("node_type").notNull(), // fractalcoin, filecoin, hybrid
    availableBytes: (0, pg_core_1.integer)("available_bytes").notNull(),
    totalBytes: (0, pg_core_1.integer)("total_bytes").notNull(),
    location: (0, pg_core_1.text)("location"), // Geographic location
    reliability: (0, pg_core_1.decimal)("reliability", { precision: 5, scale: 2 }).default("99.9"),
    activeDate: (0, pg_core_1.timestamp)("active_date").defaultNow().notNull(),
    lastHeartbeat: (0, pg_core_1.timestamp)("last_heartbeat").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("active").notNull(), // active, offline, maintenance
    endpoints: (0, pg_core_1.jsonb)("endpoints").notNull(), // JSON array of endpoints
    ownerAddress: (0, pg_core_1.text)("owner_address"), // Wallet address of the node owner
    rewards: (0, pg_core_1.decimal)("rewards", { precision: 18, scale: 6 }).default("0"), // Earned rewards in FractalCoin
});
exports.insertStorageProviderNodeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.storageProviderNodes).omit({
    id: true,
    activeDate: true,
    lastHeartbeat: true,
});
exports.nodeAllocationMapping = (0, pg_core_1.pgTable)("node_allocation_mapping", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    nodeId: (0, pg_core_1.integer)("node_id").notNull().references(() => exports.storageProviderNodes.id),
    allocationId: (0, pg_core_1.integer)("allocation_id").notNull().references(() => exports.filecoinStorageAllocations.id),
    allocationDate: (0, pg_core_1.timestamp)("allocation_date").defaultNow().notNull(),
    bytesAllocated: (0, pg_core_1.integer)("bytes_allocated").notNull(),
    status: (0, pg_core_1.text)("status").default("active").notNull(), // active, terminated, error
    shardInfo: (0, pg_core_1.jsonb)("shard_info"), // Information about the data shards
});
exports.nodeAllocationMappingRelations = (0, drizzle_orm_1.relations)(exports.nodeAllocationMapping, ({ one }) => ({
    node: one(exports.storageProviderNodes, {
        fields: [exports.nodeAllocationMapping.nodeId],
        references: [exports.storageProviderNodes.id],
    }),
    allocation: one(exports.filecoinStorageAllocations, {
        fields: [exports.nodeAllocationMapping.allocationId],
        references: [exports.filecoinStorageAllocations.id],
    }),
}));
exports.insertNodeAllocationMappingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.nodeAllocationMapping).omit({
    id: true,
    allocationDate: true,
});
exports.schema = {
    users: exports.users,
    wallets: exports.wallets,
    transactions: exports.transactions,
    smartContracts: exports.smartContracts,
    aiMonitoringLogs: exports.aiMonitoringLogs,
    cidEntries: exports.cidEntries,
    paymentMethods: exports.paymentMethods,
    payments: exports.payments,
    stakingPositions: exports.stakingPositions,
    proposals: exports.proposals,
    proposalOptions: exports.proposalOptions,
    votes: exports.votes,
    governanceRewards: exports.governanceRewards,
    walletHealthScores: exports.walletHealthScores,
    walletHealthIssues: exports.walletHealthIssues,
    notificationPreferences: exports.notificationPreferences,
    widgets: widget_schema_1.widgets,
    widgetTemplates: widget_schema_1.widgetTemplates,
    dashboards: widget_schema_1.dashboards,
    adminActions: exports.adminActions,
    adminPermissions: exports.adminPermissions,
    funds: exports.funds,
    fundAllocations: exports.fundAllocations,
    fundTransactions: exports.fundTransactions,
    tokenomicsConfig: exports.tokenomicsConfig,
    tokenDistributions,
    icoParticipations: exports.icoParticipations,
    icoPhases: exports.icoPhases,
    stakingRecords: exports.stakingRecords,
    // New schema tables
    escrowTransactions: exports.escrowTransactions,
    escrowProofs: exports.escrowProofs,
    matrixRooms: exports.matrixRooms,
    matrixMessages: exports.matrixMessages,
    escrowDisputes: exports.escrowDisputes,
    mysterionAssessments: exports.mysterionAssessments,
    userReputation: exports.userReputation,
    transactionRatings: exports.transactionRatings,
    recursionLogs: exports.recursionLogs,
    aiCoinCompensation: exports.aiCoinCompensation,
    userApiKeys: exports.userApiKeys,
    mysterionTrainingData: exports.mysterionTrainingData,
    // Bridge infrastructure schemas
    bridgeConfigurations: bridge_schema_1.bridgeConfigurations,
    bridgeValidators: bridge_schema_1.bridgeValidators,
    bridgeSupportedTokens: bridge_schema_1.bridgeSupportedTokens,
    bridgeTransactions: bridge_schema_1.bridgeTransactions,
    // Domain hosting schemas
    domainConfigurations: exports.domainConfigurations,
    filecoinStorageAllocations: exports.filecoinStorageAllocations,
    domainDeployments: exports.domainDeployments,
    domainActivityLogs: exports.domainActivityLogs,
    storageProviderNodes: exports.storageProviderNodes,
    nodeAllocationMapping: exports.nodeAllocationMapping,
    dnsRecords: exports.dnsRecords,
    domainTrustWalletConnections: exports.domainTrustWalletConnections,
    // DApp Builder and Marketplace schemas (imported from dapp-schema.ts)
    dappTemplates: dapp_schema_1.dappTemplates,
    userDapps: dapp_schema_1.userDapps,
    marketplaceListings: dapp_schema_1.marketplaceListings,
    dappPurchases: dapp_schema_1.dappPurchases,
    dappReviews: dapp_schema_1.dappReviews,
    dappCreationChats: dapp_schema_1.dappCreationChats,
    contractSchemas: dapp_schema_1.contractSchemas,
    conversationMessages: dapp_schema_1.conversationMessages,
    dappVersions: dapp_schema_1.dappVersions,
    dappFiles: dapp_schema_1.dappFiles,
    securityAuditTemplates: dapp_schema_1.securityAuditTemplates,
    browserUsers: dapp_schema_1.browserUsers,
    sandboxEnvironments: dapp_schema_1.sandboxEnvironments,
    // Recurve Fractal Reserve schemas (imported from recurve-schema.ts)
    insurancePolicies: recurve_schema_1.insurancePolicies,
    recurveTokens: recurve_schema_1.recurveTokens,
    fractalLoans: recurve_schema_1.fractalLoans,
    torusSecurityNodes: recurve_schema_1.torusSecurityNodes,
    networkInsurancePolicies: recurve_schema_1.networkInsurancePolicies,
    mandelbrotRecursionEvents: recurve_schema_1.mandelbrotRecursionEvents,
    // API Key Management schemas (imported from api-key-schema.ts)
    apiKeys: api_key_schema_1.apiKeys,
    apiKeyUsage: api_key_schema_1.apiKeyUsage,
    apiKeyConnections: api_key_schema_1.apiKeyConnections,
};
