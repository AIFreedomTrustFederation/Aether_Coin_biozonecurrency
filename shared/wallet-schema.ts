/**
 * Wallet Schema Definitions for the Aetherion Ecosystem
 * 
 * This file defines the database schema for various wallet types in the Aetherion system,
 * including PassphraseWallet, TorusWallet, and TempleNodeWallet.
 */

import { pgTable, serial, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

/**
 * PassphraseWallet schema definition
 * Stores wallet information secured by a passphrase
 */
export const passphraseWallets = pgTable('passphrase_wallets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  address: text('address').notNull().unique(),
  encryptedPrivateKey: text('encrypted_private_key').notNull(),
  publicKey: text('public_key').notNull(),
  mnemonicHash: text('mnemonic_hash').notNull(),
  encryptedMetadata: text('encrypted_metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
  isTempleNode: boolean('is_temple_node').default(false)
});

/**
 * TorusWallet schema definition
 * Stores wallet information using torus field harmonics
 */
export const torusWallets = pgTable('torus_wallets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  address: text('address').notNull().unique(),
  encryptedPrivateKey: text('encrypted_private_key').notNull(),
  publicKey: text('public_key').notNull(),
  quantumFingerprint: text('quantum_fingerprint').notNull(),
  entanglementHash: text('entanglement_hash').notNull(),
  superpositionStates: text('superposition_states').array(),
  latticeSalt: text('lattice_salt').notNull(),
  encryptedMetadata: text('encrypted_metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * TempleNodeWallet schema definition
 * Stores wallet information for Temple Node architecture
 */
export const templeNodeWallets = pgTable('temple_node_wallets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  nodeId: text('node_id').notNull().unique(),
  torusWalletId: integer('torus_wallet_id').references(() => torusWallets.id),
  templeLayer: text('temple_layer').notNull(),
  priesthoodRole: text('priesthood_role').notNull(),
  zkIdentity: json('zk_identity').notNull(),
  integrityThresholds: json('integrity_thresholds').notNull(),
  harmonyScore: integer('harmony_score').notNull(),
  elderStatus: boolean('elder_status').default(false),
  goldenCenserKey: text('golden_censer_key'),
  activeCovenants: text('active_covenants').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Insert schemas using drizzle-zod
 */
export const InsertPassphraseWallet = createInsertSchema(passphraseWallets, {
  encryptedMetadata: z.string().optional(),
  verifiedAt: z.date().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });

export const InsertTorusWallet = createInsertSchema(torusWallets, {
  encryptedMetadata: z.string().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });

export const InsertTempleNodeWallet = createInsertSchema(templeNodeWallets, {
  goldenCenserKey: z.string().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });

/**
 * Type definitions using z.infer
 */
export type PassphraseWallet = typeof passphraseWallets.$inferSelect;
export type TorusWallet = typeof torusWallets.$inferSelect;
export type TempleNodeWallet = typeof templeNodeWallets.$inferSelect;

// Define types for insert schemas
export type InsertPassphraseWalletType = z.infer<typeof InsertPassphraseWallet>;
export type InsertTorusWalletType = z.infer<typeof InsertTorusWallet>;
export type InsertTempleNodeWalletType = z.infer<typeof InsertTempleNodeWallet>;

/**
 * Relation definitions for wallet schemas
 */
export const passphraseWalletsRelations = relations(passphraseWallets, ({ one }) => ({
  // Relation to be defined when users schema is imported
}));

export const torusWalletsRelations = relations(torusWallets, ({ one, many }) => ({
  // Relation to be defined when users schema is imported
  templeNodeWallets: many(templeNodeWallets)
}));

export const templeNodeWalletsRelations = relations(templeNodeWallets, ({ one }) => ({
  torusWallet: one(torusWallets, {
    fields: [templeNodeWallets.torusWalletId],
    references: [torusWallets.id]
  })
}));