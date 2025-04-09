import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// Dedicated schema for wallet passphrases
export const passphraseWallets = pgTable("passphrase_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletId: text("wallet_id").notNull(), // The unique wallet ID from the frontend
  name: text("name").notNull(),
  address: text("address").notNull(),
  encryptedMnemonic: text("encrypted_mnemonic").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
  publicKey: text("public_key").notNull(),
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  security: jsonb("security").default({}), // Security parameters, encryption settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations for passphrase wallets
export const passphraseWalletsRelations = relations(passphraseWallets, ({ one }) => ({
  user: one(users, {
    fields: [passphraseWallets.userId],
    references: [users.id],
  }),
}));

// Insert schema for passphrase wallets
export const insertPassphraseWalletSchema = createInsertSchema(passphraseWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types export
export type PassphraseWallet = typeof passphraseWallets.$inferSelect;
export type InsertPassphraseWallet = z.infer<typeof insertPassphraseWalletSchema>;