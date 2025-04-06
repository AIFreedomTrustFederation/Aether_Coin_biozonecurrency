import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
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
  additionalDetails: jsonb('additional_details') // Can contain securityScore, generatedAt, etc.
});

// Define the table for DApp versions
export const dappVersions = pgTable('dapp_versions', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').notNull(),
  version: text('version').notNull(),
  changes: text('changes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Define the table for DApp files
export const dappFiles = pgTable('dapp_files', {
  id: serial('id').primaryKey(),
  dappVersionId: integer('dapp_version_id').notNull(),
  fileType: text('file_type').notNull(), // contract, test, ui, docs, etc.
  fileName: text('file_name').notNull(),
  content: text('content').notNull(),
  path: text('path'), // Optional path information
  createdAt: timestamp('created_at').defaultNow()
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
  createdBy: integer('created_by') // Optional creator ID (admin or community member)
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
  additionalInfo: jsonb('additional_info') // Additional metadata
});

// Define the table for conversation messages
export const conversationMessages = pgTable('conversation_messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').notNull(),
  content: text('content').notNull(),
  sender: text('sender').notNull(), // user, mysterion
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata') // Additional message metadata
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

// Define types for insertion
export type InsertUserDapp = z.infer<typeof insertUserDappSchema>;
export type InsertDappVersion = z.infer<typeof insertDappVersionSchema>;
export type InsertDappFile = z.infer<typeof insertDappFileSchema>;
export type InsertDappTemplate = z.infer<typeof insertDappTemplateSchema>;
export type InsertDappTemplateFile = z.infer<typeof insertDappTemplateFileSchema>;
export type InsertContractSchema = z.infer<typeof insertContractSchemaSchema>;
export type InsertDappCreationChat = z.infer<typeof insertDappCreationChatSchema>;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;

// Define select types
export type UserDapp = typeof userDapps.$inferSelect;
export type DappVersion = typeof dappVersions.$inferSelect;
export type DappFile = typeof dappFiles.$inferSelect;
export type DappTemplate = typeof dappTemplates.$inferSelect;
export type DappTemplateFile = typeof dappTemplateFiles.$inferSelect;
export type ContractSchema = typeof contractSchemas.$inferSelect;
export type DappCreationChat = typeof dappCreationChats.$inferSelect;
export type ConversationMessage = typeof conversationMessages.$inferSelect;

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
  isTemplate: boolean('is_template').default(false)
});

// Define Zod schemas for insertion - marketplace and browser
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true });
export const insertDappPurchaseSchema = createInsertSchema(dappPurchases).omit({ id: true });
export const insertDappReviewSchema = createInsertSchema(dappReviews).omit({ id: true });
export const insertSecurityAuditTemplateSchema = createInsertSchema(securityAuditTemplates).omit({ id: true });
export const insertBrowserUserSchema = createInsertSchema(browserUsers).omit({ id: true });
export const insertSandboxEnvironmentSchema = createInsertSchema(sandboxEnvironments).omit({ id: true });

// Define types for insertion - marketplace and browser
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type InsertDappPurchase = z.infer<typeof insertDappPurchaseSchema>;
export type InsertDappReview = z.infer<typeof insertDappReviewSchema>;
export type InsertSecurityAuditTemplate = z.infer<typeof insertSecurityAuditTemplateSchema>;
export type InsertBrowserUser = z.infer<typeof insertBrowserUserSchema>;
export type InsertSandboxEnvironment = z.infer<typeof insertSandboxEnvironmentSchema>;

// Define select types - marketplace and browser
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type DappPurchase = typeof dappPurchases.$inferSelect;
export type DappReview = typeof dappReviews.$inferSelect;
export type SecurityAuditTemplate = typeof securityAuditTemplates.$inferSelect;
export type BrowserUser = typeof browserUsers.$inferSelect;
export type SandboxEnvironment = typeof sandboxEnvironments.$inferSelect;

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
    }[];
    score: number;
    passedChecks: string[];
    failedChecks: string[];
  };
}