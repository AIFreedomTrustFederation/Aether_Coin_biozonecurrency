import { pgTable, serial, text, integer, timestamp, pgEnum, boolean, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define an enum for API key types
export const apiKeyTypeEnum = pgEnum('api_key_type', ['openai', 'stripe', 'etherscan', 'matrix', 'custom']);

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
});

// User API Keys table
export const userApiKeys = pgTable('user_api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  keyType: apiKeyTypeEnum('key_type').notNull(),
  keyName: text('key_name').notNull(),
  keyId: text('key_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsed: timestamp('last_used'),
  isActive: boolean('is_active').default(true).notNull(),
});

// Brands table
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  logo: text('logo'),
  website: text('website'),
  technologies: text('technologies').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Domain records table
export const domainRecords = pgTable('domain_records', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id),
  domain: text('domain').notNull(),
  recordType: text('record_type').notNull(), // A, CNAME, MX, TXT, etc.
  value: text('value').notNull(),
  ttl: integer('ttl').default(300).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DApp table
export const userDapps = pgTable('user_dapps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  repository: text('repository'),
  deploymentUrl: text('deployment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DApp versions table
export const dappVersions = pgTable('dapp_versions', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').references(() => userDapps.id).notNull(),
  version: text('version').notNull(),
  changelog: text('changelog'),
  commitHash: text('commit_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// DApp files table
export const dappFiles = pgTable('dapp_files', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').references(() => userDapps.id).notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  fileContent: text('file_content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Code comment threads table
export const codeCommentThreads = pgTable('code_comment_threads', {
  id: serial('id').primaryKey(),
  fileId: integer('file_id').references(() => dappFiles.id).notNull(),
  startLine: integer('start_line').notNull(),
  endLine: integer('end_line').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Code comments table
export const codeComments = pgTable('code_comments', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => codeCommentThreads.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Collaborative sessions table
export const collaborativeSessions = pgTable('collaborative_sessions', {
  id: serial('id').primaryKey(),
  userDappId: integer('user_dapp_id').references(() => userDapps.id).notNull(),
  name: text('name').notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  isActive: boolean('is_active').default(true).notNull(),
});

// Wallets table
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  network: text('network').notNull(),
  type: text('type').notNull(), // ethereum, bitcoin, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  txHash: text('tx_hash').notNull(),
  amount: text('amount').notNull(),
  token: text('token').notNull(),
  status: text('status').notNull(), // pending, confirmed, failed
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata'),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(userApiKeys),
  dapps: many(userDapps),
  wallets: many(wallets),
}));

export const userApiKeysRelations = relations(userApiKeys, ({ one }) => ({
  user: one(users, {
    fields: [userApiKeys.userId],
    references: [users.id],
  }),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  domainRecords: many(domainRecords),
}));

export const domainRecordsRelations = relations(domainRecords, ({ one }) => ({
  brand: one(brands, {
    fields: [domainRecords.brandId],
    references: [brands.id],
  }),
}));

export const userDappsRelations = relations(userDapps, ({ one, many }) => ({
  user: one(users, {
    fields: [userDapps.userId],
    references: [users.id],
  }),
  versions: many(dappVersions),
  files: many(dappFiles),
  collaborativeSessions: many(collaborativeSessions),
}));

export const dappVersionsRelations = relations(dappVersions, ({ one }) => ({
  dapp: one(userDapps, {
    fields: [dappVersions.userDappId],
    references: [userDapps.id],
  }),
}));

export const dappFilesRelations = relations(dappFiles, ({ one, many }) => ({
  dapp: one(userDapps, {
    fields: [dappFiles.userDappId],
    references: [userDapps.id],
  }),
  commentThreads: many(codeCommentThreads),
}));

export const codeCommentThreadsRelations = relations(codeCommentThreads, ({ one, many }) => ({
  file: one(dappFiles, {
    fields: [codeCommentThreads.fileId],
    references: [dappFiles.id],
  }),
  comments: many(codeComments),
}));

export const codeCommentsRelations = relations(codeComments, ({ one }) => ({
  thread: one(codeCommentThreads, {
    fields: [codeComments.threadId],
    references: [codeCommentThreads.id],
  }),
  user: one(users, {
    fields: [codeComments.userId],
    references: [users.id],
  }),
}));

export const collaborativeSessionsRelations = relations(collaborativeSessions, ({ one }) => ({
  dapp: one(userDapps, {
    fields: [collaborativeSessions.userDappId],
    references: [userDapps.id],
  }),
  creator: one(users, {
    fields: [collaborativeSessions.createdBy],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type UserApiKey = typeof userApiKeys.$inferSelect;
export type InsertUserApiKey = typeof userApiKeys.$inferInsert;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

export type DomainRecord = typeof domainRecords.$inferSelect;
export type InsertDomainRecord = typeof domainRecords.$inferInsert;

export type UserDapp = typeof userDapps.$inferSelect;
export type InsertUserDapp = typeof userDapps.$inferInsert;

export type DappVersion = typeof dappVersions.$inferSelect;
export type InsertDappVersion = typeof dappVersions.$inferInsert;

export type DappFile = typeof dappFiles.$inferSelect;
export type InsertDappFile = typeof dappFiles.$inferInsert;

export type CodeCommentThread = typeof codeCommentThreads.$inferSelect;
export type InsertCodeCommentThread = typeof codeCommentThreads.$inferInsert;

export type CodeComment = typeof codeComments.$inferSelect;
export type InsertCodeComment = typeof codeComments.$inferInsert;

export type CollaborativeSession = typeof collaborativeSessions.$inferSelect;
export type InsertCollaborativeSession = typeof collaborativeSessions.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;