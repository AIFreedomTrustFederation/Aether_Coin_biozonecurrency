import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal, primaryKey } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

// Define the table for user DApps
export const userDapps = pgTable('user_dapps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'), // draft, published, archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  chain: text('chain').default('ethereum'), // ethereum, polygon, etc.
  additionalDetails: jsonb('additional_details'), // Can contain securityScore, generatedAt, etc.
  isPublic: boolean('is_public').default(false), // For template marketplace
  isTemplate: boolean('is_template').default(false), // If it can be used as a template
  forkedFrom: integer('forked_from'), // ID of parent template if this was forked
  lastDeployment: jsonb('last_deployment') // Info about the last deployment
});

// Define the table for DApp versions
export const dappVersions = pgTable('dapp_versions', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(),
  version: text('version').notNull(),
  changes: text('changes'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').notNull(), // User ID for collaborative editing
  branch: text('branch').default('main'), // For version control (main, feature/x, etc.)
  parentVersionId: integer('parent_version_id'), // For version history tracking
  commitMessage: text('commit_message'),
  metadata: jsonb('metadata') // Additional version metadata
});

// Define the table for DApp files
export const dappFiles = pgTable('dapp_files', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(), // Direct reference to dapp for easier queries
  dappVersionId: integer('dapp_version_id').notNull(),
  fileType: text('file_type').notNull(), // contract, test, ui, docs, etc.
  fileName: text('file_name').notNull(),
  content: text('content').notNull(),
  path: text('path'), // Optional path information
  createdAt: timestamp('created_at').defaultNow(),
  lastModifiedBy: integer('last_modified_by'),
  lastModifiedAt: timestamp('last_modified_at'),
  metadata: jsonb('metadata') // File metadata like IPFS hash, line counts, etc.
});

// Define the table for file change history
export const fileChangeHistory = pgTable('file_change_history', {
  id: serial('id').primaryKey(),
  fileId: integer('file_id').notNull(),
  userId: integer('user_id').notNull(),
  changeType: text('change_type').notNull(), // create, modify, delete
  previousContent: text('previous_content'),
  newContent: text('new_content'),
  changedAt: timestamp('changed_at').defaultNow(),
  metadata: jsonb('metadata') // Additional change metadata
});

// Define the table for DApp templates
export const dappTemplates = pgTable('dapp_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // token, nft, marketplace, etc.
  popularity: integer('popularity').default(0),
  complexity: text('complexity').notNull(), // simple, moderate, complex
  securityScore: integer('security_score').default(0),
  compatibility: jsonb('compatibility'), // Array of compatible chains
  tags: jsonb('tags'), // Array of tags
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'), // Optional creator ID (admin or community member)
  isPublic: boolean('is_public').default(true),
  featuredOrder: integer('featured_order'), // For showcasing certain templates
  thumbnailUrl: text('thumbnail_url'),
  isVerified: boolean('is_verified').default(false) // If template is verified by admins
});

// Define the table for DApp template files
export const dappTemplateFiles = pgTable('dapp_template_files', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull(),
  fileType: text('file_type').notNull(), // contract, test, ui, docs, etc.
  fileName: text('file_name').notNull(),
  content: text('content').notNull(),
  path: text('path'), // Optional path information
  createdAt: timestamp('created_at').defaultNow()
});

// Define the table for contract schemas
export const contractSchemas = pgTable('contract_schemas', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // token, nft, marketplace, etc.
  schemaDefinition: jsonb('schema_definition').notNull(), // JSON schema definition
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Define the table for DApp creation conversations
export const dappCreationChats = pgTable('dapp_creation_chats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  userDappId: integer('user_dapp_id'), // Nullable until a DApp is generated
  name: text('name'),
  startedAt: timestamp('started_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  status: text('status').notNull().default('active'), // active, completed, abandoned
  additionalInfo: jsonb('additional_info'), // Additional metadata
  settings: jsonb('settings') // Generation settings, AI preferences, etc.
});

// Define the table for conversation messages
export const conversationMessages = pgTable('conversation_messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').notNull(),
  content: text('content').notNull(),
  sender: text('sender').notNull(), // user, mysterion
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata'), // Additional message metadata
  codeSnippets: jsonb('code_snippets'), // Extracted code snippets from message
  relatedFiles: jsonb('related_files') // References to files related to this message
});

// Define collaborative editing sessions
export const collaborativeSessions = pgTable('collaborative_sessions', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(),
  createdBy: integer('created_by').notNull(),
  status: text('status').notNull().default('active'), // active, ended
  createdAt: timestamp('created_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  sessionToken: text('session_token').notNull(),
  settings: jsonb('settings') // Session settings
});

// Define collaborative participants
export const collaborativeParticipants = pgTable('collaborative_participants', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull(),
  userId: integer('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastActiveAt: timestamp('last_active_at'),
  role: text('role').notNull().default('viewer'), // owner, editor, viewer
  color: text('color'), // User highlight color
  cursor: jsonb('cursor'), // Current cursor position
  metadata: jsonb('metadata') // Additional participant metadata
});

// Define the table for comment threads on code
export const codeCommentThreads = pgTable('code_comment_threads', {
  id: serial('id').primaryKey(),
  fileId: integer('file_id').notNull(),
  createdBy: integer('created_by').notNull(),
  startLine: integer('start_line').notNull(),
  endLine: integer('end_line').notNull(),
  status: text('status').notNull().default('open'), // open, resolved
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: integer('resolved_by')
});

// Define the table for comments in threads
export const codeComments = pgTable('code_comments', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').notNull(),
  userId: integer('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  editedAt: timestamp('edited_at'),
  metadata: jsonb('metadata') // Additional comment metadata
});

// Define Zod schemas for insertion
export const insertUserDappSchema = createInsertSchema(userDapps).omit({ id: true });
export const insertDappVersionSchema = createInsertSchema(dappVersions).omit({ id: true });
export const insertDappFileSchema = createInsertSchema(dappFiles).omit({ id: true });
export const insertDappTemplateSchema = createInsertSchema(dappTemplates).omit({ id: true });
export const insertDappTemplateFileSchema = createInsertSchema(dappTemplateFiles).omit({ id: true });
export const insertContractSchemaSchema = createInsertSchema(contractSchemas).omit({ id: true });
export const insertDappCreationChatSchema = createInsertSchema(dappCreationChats).omit({ id: true });
export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({ id: true });
export const insertFileChangeHistorySchema = createInsertSchema(fileChangeHistory).omit({ id: true });
export const insertCollaborativeSessionSchema = createInsertSchema(collaborativeSessions).omit({ id: true });
export const insertCollaborativeParticipantSchema = createInsertSchema(collaborativeParticipants);
export const insertCodeCommentThreadSchema = createInsertSchema(codeCommentThreads).omit({ id: true });
export const insertCodeCommentSchema = createInsertSchema(codeComments).omit({ id: true });

// Define types for insertion
export type InsertUserDapp = z.infer<typeof insertUserDappSchema>;
export type InsertDappVersion = z.infer<typeof insertDappVersionSchema>;
export type InsertDappFile = z.infer<typeof insertDappFileSchema>;
export type InsertDappTemplate = z.infer<typeof insertDappTemplateSchema>;
export type InsertDappTemplateFile = z.infer<typeof insertDappTemplateFileSchema>;
export type InsertContractSchema = z.infer<typeof insertContractSchemaSchema>;
export type InsertDappCreationChat = z.infer<typeof insertDappCreationChatSchema>;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type InsertFileChangeHistory = z.infer<typeof insertFileChangeHistorySchema>;
export type InsertCollaborativeSession = z.infer<typeof insertCollaborativeSessionSchema>;
export type InsertCollaborativeParticipant = z.infer<typeof insertCollaborativeParticipantSchema>;
export type InsertCodeCommentThread = z.infer<typeof insertCodeCommentThreadSchema>;
export type InsertCodeComment = z.infer<typeof insertCodeCommentSchema>;

// Define select types
export type UserDapp = typeof userDapps.$inferSelect;
export type DappVersion = typeof dappVersions.$inferSelect;
export type DappFile = typeof dappFiles.$inferSelect;
export type DappTemplate = typeof dappTemplates.$inferSelect;
export type DappTemplateFile = typeof dappTemplateFiles.$inferSelect;
export type ContractSchema = typeof contractSchemas.$inferSelect;
export type DappCreationChat = typeof dappCreationChats.$inferSelect;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type FileChangeHistory = typeof fileChangeHistory.$inferSelect;
export type CollaborativeSession = typeof collaborativeSessions.$inferSelect;
export type CollaborativeParticipant = typeof collaborativeParticipants.$inferSelect;
export type CodeCommentThread = typeof codeCommentThreads.$inferSelect;
export type CodeComment = typeof codeComments.$inferSelect;

// Define the table for marketplace listings
export const marketplaceListings = pgTable('marketplace_listings', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(),
  sellerId: integer('seller_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: decimal('price').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull().default('active'), // active, sold, suspended, archived
  category: text('category').notNull(),
  tags: jsonb('tags'),
  previewUrl: text('preview_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  featured: boolean('featured').default(false),
  metadata: jsonb('metadata')
});

// Define the table for DApp purchases
export const dappPurchases = pgTable('dapp_purchases', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull(),
  buyerId: integer('buyer_id').notNull(),
  transactionHash: text('transaction_hash'),
  amount: decimal('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(), // pending, completed, refunded, disputed
  purchasedAt: timestamp('purchased_at').defaultNow(),
  deliveredAt: timestamp('delivered_at'),
  metadata: jsonb('metadata')
});

// Define the table for DApp reviews
export const dappReviews = pgTable('dapp_reviews', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(),
  reviewerId: integer('reviewer_id').notNull(),
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Define the table for security audit templates
export const securityAuditTemplates = pgTable('security_audit_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  checks: jsonb('checks').notNull(), // Array of security checks to perform
  severity: text('severity').notNull(), // critical, high, medium, low
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true)
});

// Define the table for browser users
export const browserUsers = pgTable('browser_users', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  browserVersion: text('browser_version'),
  preferences: jsonb('preferences'),
  extensions: jsonb('extensions'),
  walletAddresses: jsonb('wallet_addresses'),
  lastSynced: timestamp('last_synced'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Define the table for sandbox environments
export const sandboxEnvironments = pgTable('sandbox_environments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  environmentType: text('environment_type').notNull(), // ethereum, polygon, local, etc.
  status: text('status').notNull().default('active'),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  isTemplate: boolean('is_template').default(false),
  providerId: text('provider_id'), // ID from cloud provider
  ipAddress: text('ip_address'), // IP address of sandbox
  port: integer('port'), // Port for API access
  resourceUsage: jsonb('resource_usage'), // CPU, memory, storage usage
  lastActivity: timestamp('last_activity')
});

// Define the table for sandbox deployments
export const sandboxDeployments = pgTable('sandbox_deployments', {
  id: serial('id').primaryKey(),
  sandboxId: integer('sandbox_id').notNull(),
  userDappId: integer('user_dapp_id').notNull(),
  dappVersionId: integer('dapp_version_id').notNull(),
  deploymentAddress: text('deployment_address'), // Contract address
  deploymentHash: text('deployment_hash'), // Transaction hash
  deployedAt: timestamp('deployed_at').defaultNow(),
  status: text('status').notNull().default('pending'), // pending, deployed, failed
  logs: text('logs'), // Deployment logs
  config: jsonb('config'), // Deployment configuration
  metadata: jsonb('metadata') // Additional metadata
});

// Define the table for sandbox test transactions
export const sandboxTransactions = pgTable('sandbox_transactions', {
  id: serial('id').primaryKey(),
  deploymentId: integer('deployment_id').notNull(),
  transactionHash: text('transaction_hash'),
  functionName: text('function_name'), // Called function
  parameters: jsonb('parameters'), // Function parameters
  sender: text('sender'), // Transaction sender
  result: jsonb('result'), // Transaction result
  gasUsed: integer('gas_used'),
  status: text('status').notNull(), // success, failed
  executedAt: timestamp('executed_at').defaultNow(),
  errorMessage: text('error_message')
});

// Define the table for multi-chain deployments
export const chainDeployments = pgTable('chain_deployments', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(),
  dappVersionId: integer('dapp_version_id').notNull(),
  chain: text('chain').notNull(), // ethereum, polygon, etc.
  networkType: text('network_type').notNull(), // mainnet, testnet
  deploymentAddress: text('deployment_address'), // Contract address
  deploymentHash: text('deployment_hash'), // Transaction hash
  abi: jsonb('abi'), // Contract ABI
  verified: boolean('verified').default(false), // If verified on explorer
  deployedAt: timestamp('deployed_at').defaultNow(),
  deployedBy: integer('deployed_by').notNull(), // User ID
  status: text('status').notNull(),
  metadata: jsonb('metadata') // Additional metadata
});

// Define Zod schemas for insertion - marketplace, sandbox, and browser
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true });
export const insertDappPurchaseSchema = createInsertSchema(dappPurchases).omit({ id: true });
export const insertDappReviewSchema = createInsertSchema(dappReviews).omit({ id: true });
export const insertSecurityAuditTemplateSchema = createInsertSchema(securityAuditTemplates).omit({ id: true });
export const insertBrowserUserSchema = createInsertSchema(browserUsers).omit({ id: true });
export const insertSandboxEnvironmentSchema = createInsertSchema(sandboxEnvironments).omit({ id: true });
export const insertSandboxDeploymentSchema = createInsertSchema(sandboxDeployments).omit({ id: true });
export const insertSandboxTransactionSchema = createInsertSchema(sandboxTransactions).omit({ id: true });
export const insertChainDeploymentSchema = createInsertSchema(chainDeployments).omit({ id: true });

// Define types for insertion - marketplace, sandbox, and browser
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type InsertDappPurchase = z.infer<typeof insertDappPurchaseSchema>;
export type InsertDappReview = z.infer<typeof insertDappReviewSchema>;
export type InsertSecurityAuditTemplate = z.infer<typeof insertSecurityAuditTemplateSchema>;
export type InsertBrowserUser = z.infer<typeof insertBrowserUserSchema>;
export type InsertSandboxEnvironment = z.infer<typeof insertSandboxEnvironmentSchema>;
export type InsertSandboxDeployment = z.infer<typeof insertSandboxDeploymentSchema>;
export type InsertSandboxTransaction = z.infer<typeof insertSandboxTransactionSchema>;
export type InsertChainDeployment = z.infer<typeof insertChainDeploymentSchema>;

// Define select types - marketplace, sandbox, and browser
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type DappPurchase = typeof dappPurchases.$inferSelect;
export type DappReview = typeof dappReviews.$inferSelect;
export type SecurityAuditTemplate = typeof securityAuditTemplates.$inferSelect;
export type BrowserUser = typeof browserUsers.$inferSelect;
export type SandboxEnvironment = typeof sandboxEnvironments.$inferSelect;
export type SandboxDeployment = typeof sandboxDeployments.$inferSelect;
export type SandboxTransaction = typeof sandboxTransactions.$inferSelect;
export type ChainDeployment = typeof chainDeployments.$inferSelect;

// Export code generation result type
export interface CodeGenResult {
  contractCode: string;
  testCode?: string;
  uiCode?: string;
  apiCode?: string;
  docs?: string;
  securityReport?: {
    issues: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      recommendation: string;
      impact?: string;
      cwe?: string; // Common Weakness Enumeration reference
      references?: string[]; // External documentation links
    }[];
    score: number;
    passedChecks: string[];
    failedChecks: string[];
    gasAnalysis?: {
      totalGas: number;
      functionBreakdown: Record<string, number>;
      optimizationSuggestions: string[];
    };
    compatibilityIssues?: {
      chain: string;
      issues: string[];
    }[];
  };
  deploymentConfig?: {
    compiler: string;
    version: string;
    optimizationLevel: number;
    networks: {
      name: string;
      chainId: number;
      deploymentInstructions: string;
    }[];
  };
  aiCompletionSuggestions?: {
    patterns: {
      pattern: string;
      description: string;
      example: string;
      securityImpact: string;
    }[];
  };
}