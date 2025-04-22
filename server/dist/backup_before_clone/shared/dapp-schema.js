"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertChainDeploymentSchema = exports.insertSandboxTransactionSchema = exports.insertSandboxDeploymentSchema = exports.insertSandboxEnvironmentSchema = exports.insertBrowserUserSchema = exports.insertSecurityAuditTemplateSchema = exports.insertDappReviewSchema = exports.insertDappPurchaseSchema = exports.insertMarketplaceListingSchema = exports.chainDeployments = exports.sandboxTransactions = exports.sandboxDeployments = exports.sandboxEnvironments = exports.browserUsers = exports.securityAuditTemplates = exports.dappReviews = exports.dappPurchases = exports.marketplaceListings = exports.insertCodeCommentSchema = exports.insertCodeCommentThreadSchema = exports.insertCollaborativeParticipantSchema = exports.insertCollaborativeSessionSchema = exports.insertFileChangeHistorySchema = exports.insertConversationMessageSchema = exports.insertDappCreationChatSchema = exports.insertContractSchemaSchema = exports.insertDappTemplateFileSchema = exports.insertDappTemplateSchema = exports.insertDappFileSchema = exports.insertDappVersionSchema = exports.insertUserDappSchema = exports.codeComments = exports.codeCommentThreads = exports.collaborativeParticipants = exports.collaborativeSessions = exports.conversationMessages = exports.dappCreationChats = exports.contractSchemas = exports.dappTemplateFiles = exports.dappTemplates = exports.fileChangeHistory = exports.dappFiles = exports.dappVersions = exports.userDapps = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Define the table for user DApps
exports.userDapps = (0, pg_core_1.pgTable)('user_dapps', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').notNull().default('draft'), // draft, published, archived
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    chain: (0, pg_core_1.text)('chain').default('ethereum'), // ethereum, polygon, etc.
    additionalDetails: (0, pg_core_1.jsonb)('additional_details'), // Can contain securityScore, generatedAt, etc.
    isPublic: (0, pg_core_1.boolean)('is_public').default(false), // For template marketplace
    isTemplate: (0, pg_core_1.boolean)('is_template').default(false), // If it can be used as a template
    forkedFrom: (0, pg_core_1.integer)('forked_from'), // ID of parent template if this was forked
    lastDeployment: (0, pg_core_1.jsonb)('last_deployment') // Info about the last deployment
});
// Define the table for DApp versions
exports.dappVersions = (0, pg_core_1.pgTable)('dapp_versions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(),
    version: (0, pg_core_1.text)('version').notNull(),
    changes: (0, pg_core_1.text)('changes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by').notNull(), // User ID for collaborative editing
    branch: (0, pg_core_1.text)('branch').default('main'), // For version control (main, feature/x, etc.)
    parentVersionId: (0, pg_core_1.integer)('parent_version_id'), // For version history tracking
    commitMessage: (0, pg_core_1.text)('commit_message'),
    metadata: (0, pg_core_1.jsonb)('metadata') // Additional version metadata
});
// Define the table for DApp files
exports.dappFiles = (0, pg_core_1.pgTable)('dapp_files', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(), // Direct reference to dapp for easier queries
    dappVersionId: (0, pg_core_1.integer)('dapp_version_id').notNull(),
    fileType: (0, pg_core_1.text)('file_type').notNull(), // contract, test, ui, docs, etc.
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    path: (0, pg_core_1.text)('path'), // Optional path information
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    lastModifiedBy: (0, pg_core_1.integer)('last_modified_by'),
    lastModifiedAt: (0, pg_core_1.timestamp)('last_modified_at'),
    metadata: (0, pg_core_1.jsonb)('metadata') // File metadata like IPFS hash, line counts, etc.
});
// Define the table for file change history
exports.fileChangeHistory = (0, pg_core_1.pgTable)('file_change_history', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    fileId: (0, pg_core_1.integer)('file_id').notNull(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    changeType: (0, pg_core_1.text)('change_type').notNull(), // create, modify, delete
    previousContent: (0, pg_core_1.text)('previous_content'),
    newContent: (0, pg_core_1.text)('new_content'),
    changedAt: (0, pg_core_1.timestamp)('changed_at').defaultNow(),
    metadata: (0, pg_core_1.jsonb)('metadata') // Additional change metadata
});
// Define the table for DApp templates
exports.dappTemplates = (0, pg_core_1.pgTable)('dapp_templates', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    category: (0, pg_core_1.text)('category').notNull(), // token, nft, marketplace, etc.
    popularity: (0, pg_core_1.integer)('popularity').default(0),
    complexity: (0, pg_core_1.text)('complexity').notNull(), // simple, moderate, complex
    securityScore: (0, pg_core_1.integer)('security_score').default(0),
    compatibility: (0, pg_core_1.jsonb)('compatibility'), // Array of compatible chains
    tags: (0, pg_core_1.jsonb)('tags'), // Array of tags
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    createdBy: (0, pg_core_1.integer)('created_by'), // Optional creator ID (admin or community member)
    isPublic: (0, pg_core_1.boolean)('is_public').default(true),
    featuredOrder: (0, pg_core_1.integer)('featured_order'), // For showcasing certain templates
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    isVerified: (0, pg_core_1.boolean)('is_verified').default(false) // If template is verified by admins
});
// Define the table for DApp template files
exports.dappTemplateFiles = (0, pg_core_1.pgTable)('dapp_template_files', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    templateId: (0, pg_core_1.integer)('template_id').notNull(),
    fileType: (0, pg_core_1.text)('file_type').notNull(), // contract, test, ui, docs, etc.
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    path: (0, pg_core_1.text)('path'), // Optional path information
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
// Define the table for contract schemas
exports.contractSchemas = (0, pg_core_1.pgTable)('contract_schemas', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    category: (0, pg_core_1.text)('category').notNull(), // token, nft, marketplace, etc.
    schemaDefinition: (0, pg_core_1.jsonb)('schema_definition').notNull(), // JSON schema definition
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Define the table for DApp creation conversations
exports.dappCreationChats = (0, pg_core_1.pgTable)('dapp_creation_chats', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id'), // Nullable until a DApp is generated
    name: (0, pg_core_1.text)('name'),
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    status: (0, pg_core_1.text)('status').notNull().default('active'), // active, completed, abandoned
    additionalInfo: (0, pg_core_1.jsonb)('additional_info'), // Additional metadata
    settings: (0, pg_core_1.jsonb)('settings') // Generation settings, AI preferences, etc.
});
// Define the table for conversation messages
exports.conversationMessages = (0, pg_core_1.pgTable)('conversation_messages', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    chatId: (0, pg_core_1.integer)('chat_id').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    sender: (0, pg_core_1.text)('sender').notNull(), // user, mysterion
    timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow(),
    metadata: (0, pg_core_1.jsonb)('metadata'), // Additional message metadata
    codeSnippets: (0, pg_core_1.jsonb)('code_snippets'), // Extracted code snippets from message
    relatedFiles: (0, pg_core_1.jsonb)('related_files') // References to files related to this message
});
// Define collaborative editing sessions
exports.collaborativeSessions = (0, pg_core_1.pgTable)('collaborative_sessions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(),
    createdBy: (0, pg_core_1.integer)('created_by').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('active'), // active, ended
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    endedAt: (0, pg_core_1.timestamp)('ended_at'),
    sessionToken: (0, pg_core_1.text)('session_token').notNull(),
    settings: (0, pg_core_1.jsonb)('settings') // Session settings
});
// Define collaborative participants
exports.collaborativeParticipants = (0, pg_core_1.pgTable)('collaborative_participants', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    sessionId: (0, pg_core_1.integer)('session_id').notNull(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    joinedAt: (0, pg_core_1.timestamp)('joined_at').defaultNow(),
    lastActiveAt: (0, pg_core_1.timestamp)('last_active_at'),
    role: (0, pg_core_1.text)('role').notNull().default('viewer'), // owner, editor, viewer
    color: (0, pg_core_1.text)('color'), // User highlight color
    cursor: (0, pg_core_1.jsonb)('cursor'), // Current cursor position
    metadata: (0, pg_core_1.jsonb)('metadata') // Additional participant metadata
});
// Define the table for comment threads on code
exports.codeCommentThreads = (0, pg_core_1.pgTable)('code_comment_threads', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    fileId: (0, pg_core_1.integer)('file_id').notNull(),
    createdBy: (0, pg_core_1.integer)('created_by').notNull(),
    startLine: (0, pg_core_1.integer)('start_line').notNull(),
    endLine: (0, pg_core_1.integer)('end_line').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('open'), // open, resolved
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
    resolvedBy: (0, pg_core_1.integer)('resolved_by')
});
// Define the table for comments in threads
exports.codeComments = (0, pg_core_1.pgTable)('code_comments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    threadId: (0, pg_core_1.integer)('thread_id').notNull(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    editedAt: (0, pg_core_1.timestamp)('edited_at'),
    metadata: (0, pg_core_1.jsonb)('metadata') // Additional comment metadata
});
// Define Zod schemas for insertion
exports.insertUserDappSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userDapps).omit({ id: true });
exports.insertDappVersionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappVersions).omit({ id: true });
exports.insertDappFileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappFiles).omit({ id: true });
exports.insertDappTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappTemplates).omit({ id: true });
exports.insertDappTemplateFileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappTemplateFiles).omit({ id: true });
exports.insertContractSchemaSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contractSchemas).omit({ id: true });
exports.insertDappCreationChatSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappCreationChats).omit({ id: true });
exports.insertConversationMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.conversationMessages).omit({ id: true });
exports.insertFileChangeHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.fileChangeHistory).omit({ id: true });
exports.insertCollaborativeSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.collaborativeSessions).omit({ id: true });
exports.insertCollaborativeParticipantSchema = (0, drizzle_zod_1.createInsertSchema)(exports.collaborativeParticipants);
exports.insertCodeCommentThreadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.codeCommentThreads).omit({ id: true });
exports.insertCodeCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.codeComments).omit({ id: true });
// Define the table for marketplace listings
exports.marketplaceListings = (0, pg_core_1.pgTable)('marketplace_listings', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(),
    sellerId: (0, pg_core_1.integer)('seller_id').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.decimal)('price').notNull(),
    currency: (0, pg_core_1.text)('currency').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('active'), // active, sold, suspended, archived
    category: (0, pg_core_1.text)('category').notNull(),
    tags: (0, pg_core_1.jsonb)('tags'),
    previewUrl: (0, pg_core_1.text)('preview_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    featured: (0, pg_core_1.boolean)('featured').default(false),
    metadata: (0, pg_core_1.jsonb)('metadata')
});
// Define the table for DApp purchases
exports.dappPurchases = (0, pg_core_1.pgTable)('dapp_purchases', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    listingId: (0, pg_core_1.integer)('listing_id').notNull(),
    buyerId: (0, pg_core_1.integer)('buyer_id').notNull(),
    transactionHash: (0, pg_core_1.text)('transaction_hash'),
    amount: (0, pg_core_1.decimal)('amount').notNull(),
    currency: (0, pg_core_1.text)('currency').notNull(),
    status: (0, pg_core_1.text)('status').notNull(), // pending, completed, refunded, disputed
    purchasedAt: (0, pg_core_1.timestamp)('purchased_at').defaultNow(),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    metadata: (0, pg_core_1.jsonb)('metadata')
});
// Define the table for DApp reviews
exports.dappReviews = (0, pg_core_1.pgTable)('dapp_reviews', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(),
    reviewerId: (0, pg_core_1.integer)('reviewer_id').notNull(),
    rating: (0, pg_core_1.integer)('rating').notNull(),
    title: (0, pg_core_1.text)('title'),
    content: (0, pg_core_1.text)('content'),
    verified: (0, pg_core_1.boolean)('verified').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Define the table for security audit templates
exports.securityAuditTemplates = (0, pg_core_1.pgTable)('security_audit_templates', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    category: (0, pg_core_1.text)('category').notNull(),
    checks: (0, pg_core_1.jsonb)('checks').notNull(), // Array of security checks to perform
    severity: (0, pg_core_1.text)('severity').notNull(), // critical, high, medium, low
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true)
});
// Define the table for browser users
exports.browserUsers = (0, pg_core_1.pgTable)('browser_users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    browserVersion: (0, pg_core_1.text)('browser_version'),
    preferences: (0, pg_core_1.jsonb)('preferences'),
    extensions: (0, pg_core_1.jsonb)('extensions'),
    walletAddresses: (0, pg_core_1.jsonb)('wallet_addresses'),
    lastSynced: (0, pg_core_1.timestamp)('last_synced'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Define the table for sandbox environments
exports.sandboxEnvironments = (0, pg_core_1.pgTable)('sandbox_environments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    environmentType: (0, pg_core_1.text)('environment_type').notNull(), // ethereum, polygon, local, etc.
    status: (0, pg_core_1.text)('status').notNull().default('active'),
    config: (0, pg_core_1.jsonb)('config'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    isTemplate: (0, pg_core_1.boolean)('is_template').default(false),
    providerId: (0, pg_core_1.text)('provider_id'), // ID from cloud provider
    ipAddress: (0, pg_core_1.text)('ip_address'), // IP address of sandbox
    port: (0, pg_core_1.integer)('port'), // Port for API access
    resourceUsage: (0, pg_core_1.jsonb)('resource_usage'), // CPU, memory, storage usage
    lastActivity: (0, pg_core_1.timestamp)('last_activity')
});
// Define the table for sandbox deployments
exports.sandboxDeployments = (0, pg_core_1.pgTable)('sandbox_deployments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    sandboxId: (0, pg_core_1.integer)('sandbox_id').notNull(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(),
    dappVersionId: (0, pg_core_1.integer)('dapp_version_id').notNull(),
    deploymentAddress: (0, pg_core_1.text)('deployment_address'), // Contract address
    deploymentHash: (0, pg_core_1.text)('deployment_hash'), // Transaction hash
    deployedAt: (0, pg_core_1.timestamp)('deployed_at').defaultNow(),
    status: (0, pg_core_1.text)('status').notNull().default('pending'), // pending, deployed, failed
    logs: (0, pg_core_1.text)('logs'), // Deployment logs
    config: (0, pg_core_1.jsonb)('config'), // Deployment configuration
    metadata: (0, pg_core_1.jsonb)('metadata') // Additional metadata
});
// Define the table for sandbox test transactions
exports.sandboxTransactions = (0, pg_core_1.pgTable)('sandbox_transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    deploymentId: (0, pg_core_1.integer)('deployment_id').notNull(),
    transactionHash: (0, pg_core_1.text)('transaction_hash'),
    functionName: (0, pg_core_1.text)('function_name'), // Called function
    parameters: (0, pg_core_1.jsonb)('parameters'), // Function parameters
    sender: (0, pg_core_1.text)('sender'), // Transaction sender
    result: (0, pg_core_1.jsonb)('result'), // Transaction result
    gasUsed: (0, pg_core_1.integer)('gas_used'),
    status: (0, pg_core_1.text)('status').notNull(), // success, failed
    executedAt: (0, pg_core_1.timestamp)('executed_at').defaultNow(),
    errorMessage: (0, pg_core_1.text)('error_message')
});
// Define the table for multi-chain deployments
exports.chainDeployments = (0, pg_core_1.pgTable)('chain_deployments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userDappId: (0, pg_core_1.integer)('user_dapp_id').notNull(),
    dappVersionId: (0, pg_core_1.integer)('dapp_version_id').notNull(),
    chain: (0, pg_core_1.text)('chain').notNull(), // ethereum, polygon, etc.
    networkType: (0, pg_core_1.text)('network_type').notNull(), // mainnet, testnet
    deploymentAddress: (0, pg_core_1.text)('deployment_address'), // Contract address
    deploymentHash: (0, pg_core_1.text)('deployment_hash'), // Transaction hash
    abi: (0, pg_core_1.jsonb)('abi'), // Contract ABI
    verified: (0, pg_core_1.boolean)('verified').default(false), // If verified on explorer
    deployedAt: (0, pg_core_1.timestamp)('deployed_at').defaultNow(),
    deployedBy: (0, pg_core_1.integer)('deployed_by').notNull(), // User ID
    status: (0, pg_core_1.text)('status').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata') // Additional metadata
});
// Define Zod schemas for insertion - marketplace, sandbox, and browser
exports.insertMarketplaceListingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceListings).omit({ id: true });
exports.insertDappPurchaseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappPurchases).omit({ id: true });
exports.insertDappReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dappReviews).omit({ id: true });
exports.insertSecurityAuditTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.securityAuditTemplates).omit({ id: true });
exports.insertBrowserUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.browserUsers).omit({ id: true });
exports.insertSandboxEnvironmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sandboxEnvironments).omit({ id: true });
exports.insertSandboxDeploymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sandboxDeployments).omit({ id: true });
exports.insertSandboxTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sandboxTransactions).omit({ id: true });
exports.insertChainDeploymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chainDeployments).omit({ id: true });
