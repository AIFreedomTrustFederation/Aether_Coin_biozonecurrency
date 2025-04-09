/**
 * Base Schema for the Aetherion Ecosystem
 * 
 * This file contains the fundamental schema definitions that are used by other schema files.
 * It helps to avoid circular dependencies between schema files.
 */

import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Core User schema - defining only the essential fields here
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'admin', 'super_admin'
  isTrustMember: boolean("is_trust_member").default(false), // Whether this user is an AI Freedom Trust member
  trustMemberSince: timestamp("trust_member_since"), // When the user became a trust member
  trustMemberLevel: text("trust_member_level"), // Level of trust membership: 'associate', 'full', 'governing'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true),
});

// User API Keys schema - essential for API access control
export const userApiKeys = pgTable("user_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  keyName: text("key_name").notNull(),
  keyPrefix: text("key_prefix").notNull(), // First few chars of the key for display 
  keyHash: text("key_hash").notNull(), // Store hashed version of the key for security
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  permissions: text("permissions").array(), // e.g., ['read:wallets', 'write:transactions']
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Define relationships
export const userApiKeysRelations = relations(userApiKeys, ({ one }) => ({
  user: one(users, {
    fields: [userApiKeys.userId],
    references: [users.id],
  }),
}));

// Export insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  isActive: true,
  trustMemberSince: true,
});

export const insertUserApiKeySchema = createInsertSchema(userApiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

// Define and export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof insertUserSchema._type;

export type UserApiKey = typeof userApiKeys.$inferSelect;
export type InsertUserApiKey = typeof insertUserApiKeySchema._type;