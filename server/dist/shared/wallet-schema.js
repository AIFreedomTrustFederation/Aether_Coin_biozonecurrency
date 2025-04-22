"use strict";
/**
 * Wallet Schema Definitions for the Aetherion Ecosystem
 *
 * This file defines the database schema for various wallet types in the Aetherion system,
 * including PassphraseWallet, TorusWallet, and TempleNodeWallet.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.templeNodeWalletsRelations = exports.torusWalletsRelations = exports.passphraseWalletsRelations = exports.InsertTempleNodeWallet = exports.InsertTorusWallet = exports.InsertPassphraseWallet = exports.templeNodeWallets = exports.torusWallets = exports.passphraseWallets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * PassphraseWallet schema definition
 * Stores wallet information secured by a passphrase
 */
exports.passphraseWallets = (0, pg_core_1.pgTable)('passphrase_wallets', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull(),
    address: (0, pg_core_1.text)('address').notNull().unique(),
    encryptedPrivateKey: (0, pg_core_1.text)('encrypted_private_key').notNull(),
    publicKey: (0, pg_core_1.text)('public_key').notNull(),
    mnemonicHash: (0, pg_core_1.text)('mnemonic_hash').notNull(),
    encryptedMetadata: (0, pg_core_1.text)('encrypted_metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    verifiedAt: (0, pg_core_1.timestamp)('verified_at'),
    isTempleNode: (0, pg_core_1.boolean)('is_temple_node').default(false)
});
/**
 * TorusWallet schema definition
 * Stores wallet information using torus field harmonics
 */
exports.torusWallets = (0, pg_core_1.pgTable)('torus_wallets', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull(),
    address: (0, pg_core_1.text)('address').notNull().unique(),
    encryptedPrivateKey: (0, pg_core_1.text)('encrypted_private_key').notNull(),
    publicKey: (0, pg_core_1.text)('public_key').notNull(),
    quantumFingerprint: (0, pg_core_1.text)('quantum_fingerprint').notNull(),
    entanglementHash: (0, pg_core_1.text)('entanglement_hash').notNull(),
    superpositionStates: (0, pg_core_1.text)('superposition_states').array(),
    latticeSalt: (0, pg_core_1.text)('lattice_salt').notNull(),
    encryptedMetadata: (0, pg_core_1.text)('encrypted_metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * TempleNodeWallet schema definition
 * Stores wallet information for Temple Node architecture
 */
exports.templeNodeWallets = (0, pg_core_1.pgTable)('temple_node_wallets', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull(),
    nodeId: (0, pg_core_1.text)('node_id').notNull().unique(),
    torusWalletId: (0, pg_core_1.integer)('torus_wallet_id').references(() => exports.torusWallets.id),
    templeLayer: (0, pg_core_1.text)('temple_layer').notNull(),
    priesthoodRole: (0, pg_core_1.text)('priesthood_role').notNull(),
    zkIdentity: (0, pg_core_1.json)('zk_identity').notNull(),
    integrityThresholds: (0, pg_core_1.json)('integrity_thresholds').notNull(),
    harmonyScore: (0, pg_core_1.integer)('harmony_score').notNull(),
    elderStatus: (0, pg_core_1.boolean)('elder_status').default(false),
    goldenCenserKey: (0, pg_core_1.text)('golden_censer_key'),
    activeCovenants: (0, pg_core_1.text)('active_covenants').array(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * Insert schemas using drizzle-zod
 */
exports.InsertPassphraseWallet = (0, drizzle_zod_1.createInsertSchema)(exports.passphraseWallets, {
    encryptedMetadata: zod_1.z.string().optional(),
    verifiedAt: zod_1.z.date().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });
exports.InsertTorusWallet = (0, drizzle_zod_1.createInsertSchema)(exports.torusWallets, {
    encryptedMetadata: zod_1.z.string().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });
exports.InsertTempleNodeWallet = (0, drizzle_zod_1.createInsertSchema)(exports.templeNodeWallets, {
    goldenCenserKey: zod_1.z.string().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });
/**
 * Relation definitions for wallet schemas
 */
exports.passphraseWalletsRelations = (0, drizzle_orm_1.relations)(exports.passphraseWallets, ({ one }) => ({
// Relation to be defined when users schema is imported
}));
exports.torusWalletsRelations = (0, drizzle_orm_1.relations)(exports.torusWallets, ({ one, many }) => ({
    // Relation to be defined when users schema is imported
    templeNodeWallets: many(exports.templeNodeWallets)
}));
exports.templeNodeWalletsRelations = (0, drizzle_orm_1.relations)(exports.templeNodeWallets, ({ one }) => ({
    torusWallet: one(exports.torusWallets, {
        fields: [exports.templeNodeWallets.torusWalletId],
        references: [exports.torusWallets.id]
    })
}));
