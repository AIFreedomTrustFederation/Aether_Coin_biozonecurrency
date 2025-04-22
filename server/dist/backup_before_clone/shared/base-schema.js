"use strict";
/**
 * Base Schema for the Aetherion Ecosystem
 *
 * This file contains the fundamental schema definitions that are used by other schema files.
 * It helps to avoid circular dependencies between schema files.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUserApiKeySchema = exports.insertUserSchema = exports.userApiKeysRelations = exports.userApiKeys = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
// Core User schema - defining only the essential fields here
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
// User API Keys schema - essential for API access control
exports.userApiKeys = (0, pg_core_1.pgTable)("user_api_keys", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    keyName: (0, pg_core_1.text)("key_name").notNull(),
    keyPrefix: (0, pg_core_1.text)("key_prefix").notNull(), // First few chars of the key for display 
    keyHash: (0, pg_core_1.text)("key_hash").notNull(), // Store hashed version of the key for security
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastUsed: (0, pg_core_1.timestamp)("last_used"),
    permissions: (0, pg_core_1.text)("permissions").array(), // e.g., ['read:wallets', 'write:transactions']
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
});
// Define relationships
exports.userApiKeysRelations = (0, drizzle_orm_1.relations)(exports.userApiKeys, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userApiKeys.userId],
        references: [exports.users.id],
    }),
}));
// Export insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
    isActive: true,
    trustMemberSince: true,
});
exports.insertUserApiKeySchema = (0, drizzle_zod_1.createInsertSchema)(exports.userApiKeys).omit({
    id: true,
    createdAt: true,
    lastUsed: true,
});
