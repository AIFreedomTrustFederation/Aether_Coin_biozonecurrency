/**
 * DApp Schema Definitions
 * This file defines database schema for DApp builder, marketplace, browser integration,
 * and other related features.
 */

import { pgTable, serial, text, timestamp, boolean, integer, real, jsonb, pgEnum, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

// Enums
export const dappStatusEnum = pgEnum('dapp_status', ['draft', 'published', 'archived', 'rejected']);
export const listingStatusEnum = pgEnum('listing_status', ['pending', 'active', 'suspended', 'sold']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'completed', 'refunded', 'disputed']);
export const chatStatusEnum = pgEnum('chat_status', ['active', 'archived', 'deleted']);
export const sandboxStatusEnum = pgEnum('sandbox_status', ['starting', 'running', 'stopped', 'failed']);
export const environmentTypeEnum = pgEnum('environment_type', ['development', 'testing', 'demo']);
export const browserTypeEnum = pgEnum('browser_type', ['brave', 'chromium', 'integrated']);

// Schema Tables

// User DApps (Projects)
export const userDapps = pgTable('user_dapps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  isPublished: boolean('is_published').default(false),
  downloads: integer('downloads').default(0),
  rating: text('rating').default('0'),
  chain: text('chain'),
  contractAddress: text('contract_address'),
  repositoryUrl: text('repository_url'),
  coverImage: text('cover_image'),
  additionalDetails: jsonb('additional_details')
});

// DApp Version Control
export const dappVersions = pgTable('dapp_versions', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').references(() => userDapps.id).notNull(),
  version: text('version').notNull(),
  changes: text('changes'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull()
});

// DApp Files
export const dappFiles = pgTable('dapp_files', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').references(() => userDapps.id).notNull(),
  dappVersionId: integer('dapp_version_id').references(() => dappVersions.id),
  name: text('name').notNull(),
  path: text('path').notNull(),
  content: text('content').notNull(),
  fileType: text('file_type').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

// DApp Templates
export const dappTemplates = pgTable('dapp_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  complexity: text('complexity').notNull(),
  schemaId: integer('schema_id').notNull(),
  baseCode: text('base_code').notNull(),
  parameters: jsonb('parameters').notNull(),
  popularity: integer('popularity').default(0),
  tags: jsonb('tags').default([]),
  thumbnail: text('thumbnail'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

// Contract Schemas
export const contractSchemas = pgTable('contract_schemas', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  compatibility: jsonb('compatibility').notNull(),
  parameters: jsonb('parameters').notNull(),
  dependencies: jsonb('dependencies').notNull(),
  securityConsiderations: jsonb('security_considerations').notNull(),
  baseCode: text('base_code').notNull(),
  testCases: jsonb('test_cases').notNull(),
  uiComponents: jsonb('ui_components').notNull(),
  version: text('version').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

// Contract Templates
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  schemaId: integer('schema_id').references(() => contractSchemas.id).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  templateCode: text('template_code').notNull(),
  parameters: jsonb('parameters').notNull(),
  popularity: integer('popularity').default(0),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

// Marketplace Listings
export const marketplaceListings = pgTable('marketplace_listings', {
  id: serial('id').primaryKey(),
  dappId: integer('dapp_id').references(() => userDapps.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: text('price').notNull(),
  currency: text('currency').notNull(),
  pricingModel: text('pricing_model').notNull(),
  category: text('category').notNull(),
  tags: text('tags').notNull(), // JSON string
  images: text('images').notNull(), // JSON string
  featured: boolean('featured').default(false),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// DApp Purchases
export const dappPurchases = pgTable('dapp_purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  listingId: integer('listing_id').references(() => marketplaceListings.id).notNull(),
  transactionHash: text('transaction_hash'),
  price: text('price').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  licenseKey: text('license_key').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  renewedAt: timestamp('renewed_at')
});

// DApp Reviews
export const dappReviews = pgTable('dapp_reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dappId: integer('dapp_id').references(() => userDapps.id).notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  review: text('review').notNull(),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  mysterionVerified: boolean('mysterion_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Browser Integration - User Browser Settings
export const browserUsers = pgTable('browser_users', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  browserType: text('browser_type').notNull(),
  settings: jsonb('settings').notNull(),
  installedExtensions: jsonb('installed_extensions').default([]),
  bookmarks: jsonb('bookmarks').default([]),
  history: jsonb('history').default([]),
  syncEnabled: boolean('sync_enabled').default(false),
  lastSync: timestamp('last_sync'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Sandbox Environments
export const sandboxEnvironments = pgTable('sandbox_environments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  userDappId: integer('user_dapp_id').references(() => userDapps.id).notNull(),
  environmentType: text('environment_type').notNull(),
  status: text('status').notNull(),
  configuration: jsonb('configuration').notNull(),
  endpoints: jsonb('endpoints').notNull(),
  logs: jsonb('logs').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at')
});

// Mysterion Conversation Messages
export const conversationMessages = pgTable('conversation_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dappId: integer('dapp_id').references(() => userDapps.id),
  message: text('message').notNull(),
  sender: text('sender').notNull(), // 'user' or 'mysterion'
  timestamp: timestamp('timestamp').defaultNow(),
  intent: text('intent'),
  entities: jsonb('entities'),
  sentiment: text('sentiment'),
  processed: boolean('processed').default(false)
});

// DApp Creation Chats
export const dappCreationChats = pgTable('dapp_creation_chats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dappId: integer('dapp_id').references(() => userDapps.id),
  intent: text('intent').notNull(),
  complexity: text('complexity').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  lastMessageAt: timestamp('last_message_at'),
  status: text('status').notNull(),
  generatedSchemas: jsonb('generated_schemas').default([]),
  suggestedTemplates: jsonb('suggested_templates').default([])
});

// Relations

export const userDappsRelations = relations(userDapps, ({ one, many }) => ({
  user: one(users, {
    fields: [userDapps.userId],
    references: [users.id]
  }),
  versions: many(dappVersions),
  files: many(dappFiles),
  listings: many(marketplaceListings)
}));

export const dappVersionsRelations = relations(dappVersions, ({ one, many }) => ({
  dapp: one(userDapps, {
    fields: [dappVersions.userDappId],
    references: [userDapps.id]
  }),
  files: many(dappFiles)
}));

export const dappFilesRelations = relations(dappFiles, ({ one }) => ({
  dapp: one(userDapps, {
    fields: [dappFiles.userDappId],
    references: [userDapps.id]
  }),
  version: one(dappVersions, {
    fields: [dappFiles.dappVersionId],
    references: [dappVersions.id]
  })
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one, many }) => ({
  dapp: one(userDapps, {
    fields: [marketplaceListings.dappId],
    references: [userDapps.id]
  }),
  seller: one(users, {
    fields: [marketplaceListings.userId],
    references: [users.id]
  }),
  purchases: many(dappPurchases)
}));

export const dappPurchasesRelations = relations(dappPurchases, ({ one }) => ({
  user: one(users, {
    fields: [dappPurchases.userId],
    references: [users.id]
  }),
  listing: one(marketplaceListings, {
    fields: [dappPurchases.listingId],
    references: [marketplaceListings.id]
  })
}));

export const dappReviewsRelations = relations(dappReviews, ({ one }) => ({
  user: one(users, {
    fields: [dappReviews.userId],
    references: [users.id]
  }),
  dapp: one(userDapps, {
    fields: [dappReviews.dappId],
    references: [userDapps.id]
  })
}));

export const browserUsersRelations = relations(browserUsers, ({ one }) => ({
  user: one(users, {
    fields: [browserUsers.userId],
    references: [users.id]
  })
}));

export const sandboxEnvironmentsRelations = relations(sandboxEnvironments, ({ one }) => ({
  user: one(users, {
    fields: [sandboxEnvironments.userId],
    references: [users.id]
  }),
  dapp: one(userDapps, {
    fields: [sandboxEnvironments.userDappId],
    references: [userDapps.id]
  })
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
  user: one(users, {
    fields: [conversationMessages.userId],
    references: [users.id]
  }),
  dapp: one(userDapps, {
    fields: [conversationMessages.dappId],
    references: [userDapps.id]
  })
}));

export const dappCreationChatsRelations = relations(dappCreationChats, ({ one }) => ({
  user: one(users, {
    fields: [dappCreationChats.userId],
    references: [users.id]
  }),
  dapp: one(userDapps, {
    fields: [dappCreationChats.dappId],
    references: [userDapps.id]
  })
}));

// Zod Schemas for Validation

export const insertUserDappSchema = createInsertSchema(userDapps).omit({ id: true });
export type InsertUserDapp = z.infer<typeof insertUserDappSchema>;
export type UserDapp = typeof userDapps.$inferSelect;

export const insertDappVersionSchema = createInsertSchema(dappVersions).omit({ id: true });
export type InsertDappVersion = z.infer<typeof insertDappVersionSchema>;
export type DappVersion = typeof dappVersions.$inferSelect;

export const insertDappFileSchema = createInsertSchema(dappFiles).omit({ id: true });
export type InsertDappFile = z.infer<typeof insertDappFileSchema>;
export type DappFile = typeof dappFiles.$inferSelect;

export const insertDappTemplateSchema = createInsertSchema(dappTemplates).omit({ id: true });
export type InsertDappTemplate = z.infer<typeof insertDappTemplateSchema>;
export type DappTemplate = typeof dappTemplates.$inferSelect;

export const insertContractSchemaSchema = createInsertSchema(contractSchemas).omit({ id: true });
export type InsertContractSchema = z.infer<typeof insertContractSchemaSchema>;
export type ContractSchema = typeof contractSchemas.$inferSelect;

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({ id: true });
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type ContractTemplate = typeof contractTemplates.$inferSelect;

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true });
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

export const insertDappPurchaseSchema = createInsertSchema(dappPurchases).omit({ id: true });
export type InsertDappPurchase = z.infer<typeof insertDappPurchaseSchema>;
export type DappPurchase = typeof dappPurchases.$inferSelect;

export const insertDappReviewSchema = createInsertSchema(dappReviews).omit({ id: true });
export type InsertDappReview = z.infer<typeof insertDappReviewSchema>;
export type DappReview = typeof dappReviews.$inferSelect;

export const insertBrowserUserSchema = createInsertSchema(browserUsers).omit({ id: true });
export type InsertBrowserUser = z.infer<typeof insertBrowserUserSchema>;
export type BrowserUser = typeof browserUsers.$inferSelect;

export const insertSandboxEnvironmentSchema = createInsertSchema(sandboxEnvironments).omit({ id: true });
export type InsertSandboxEnvironment = z.infer<typeof insertSandboxEnvironmentSchema>;
export type SandboxEnvironment = typeof sandboxEnvironments.$inferSelect;

export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({ id: true });
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type ConversationMessage = typeof conversationMessages.$inferSelect;

export const insertDappCreationChatSchema = createInsertSchema(dappCreationChats).omit({ id: true });
export type InsertDappCreationChat = z.infer<typeof insertDappCreationChatSchema>;
export type DappCreationChat = typeof dappCreationChats.$inferSelect;