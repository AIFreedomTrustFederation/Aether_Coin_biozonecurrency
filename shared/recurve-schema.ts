import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, primaryKey, uniqueIndex, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, wallets } from "./schema";

// Enums for Recurve System
export enum InsurancePolicyType {
  WHOLE_LIFE = 'whole_life',
  INDEXED_UNIVERSAL_LIFE = 'indexed_universal_life',
  TERM_LIFE = 'term_life',
  VARIABLE_UNIVERSAL_LIFE = 'variable_universal_life'
}

export enum InsurancePolicyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  LAPSED = 'lapsed',
  MATURED = 'matured',
  SURRENDERED = 'surrendered',
  DEATH_CLAIM = 'death_claim'
}

export enum BeneficiaryType {
  TRUST = 'trust',
  INDIVIDUAL = 'individual',
  NETWORK = 'network'
}

export enum FractalLoanStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REPAID = 'repaid',
  DEFAULTED = 'defaulted',
  COLLATERAL_CLAIMED = 'collateral_claimed'
}

export enum FractalLoanCollateralType {
  POLICY = 'policy',
  TOKEN = 'token',
  HYBRID = 'hybrid'
}

export enum RecurveSyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum RecurveTokenTier {
  PLATINUM = 'platinum',
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze'
}

export enum TorusNodeType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary'
}

// Insurance Policies schema
export const insurancePolicies = pgTable("insurance_policies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  policyProvider: text("policy_provider").notNull(),
  policyNumber: text("policy_number").notNull(),
  policyType: text("policy_type").notNull().$type<InsurancePolicyType>(),
  faceValue: decimal("face_value", { precision: 36, scale: 2 }).notNull(),
  cashValue: decimal("cash_value", { precision: 36, scale: 2 }).notNull(),
  premiumAmount: decimal("premium_amount", { precision: 36, scale: 2 }).notNull(),
  premiumFrequency: text("premium_frequency").notNull(), // monthly, quarterly, annually
  beneficiaryType: text("beneficiary_type").notNull().$type<BeneficiaryType>(),
  beneficiaryId: text("beneficiary_id").notNull(), // trust ID or user ID
  beneficiaryPercentage: decimal("beneficiary_percentage", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().$type<InsurancePolicyStatus>().default(InsurancePolicyStatus.PENDING),
  lastUpdated: timestamp("last_updated").defaultNow(),
  maturityDate: timestamp("maturity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  onchainSyncStatus: text("onchain_sync_status").$type<RecurveSyncStatus>().default(RecurveSyncStatus.PENDING),
  policyDocumentCid: text("policy_document_cid"), // IPFS CID for policy documents
  verificationHash: text("verification_hash"), // Hash of the verified policy details
});

export const insurancePoliciesRelations = relations(insurancePolicies, ({ one, many }) => ({
  user: one(users, {
    fields: [insurancePolicies.userId],
    references: [users.id],
  }),
  recurveTokens: many(recurveTokens),
  fractalLoans: many(fractalLoans),
}));

// Recurve Tokens schema
export const recurveTokens = pgTable("recurve_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  policyId: integer("policy_id").references(() => insurancePolicies.id),
  tokenAddress: text("token_address").notNull(),
  tokenAmount: decimal("token_amount", { precision: 36, scale: 18 }).notNull(),
  tier: text("tier").$type<RecurveTokenTier>().notNull(),
  collateralizationRatio: decimal("collateralization_ratio", { precision: 6, scale: 2 }).notNull(),
  mintedAt: timestamp("minted_at").defaultNow(),
  lastRecalculation: timestamp("last_recalculation").defaultNow(),
  fractalRecursionDepth: integer("fractal_recursion_depth").notNull().default(3),
  mandelbrotParameters: jsonb("mandelbrot_parameters").notNull(),
  status: text("status").notNull().default('active'),
  onchainTxHash: text("onchain_tx_hash"), // Transaction hash for on-chain verification
});

export const recurveTokensRelations = relations(recurveTokens, ({ one, many }) => ({
  user: one(users, {
    fields: [recurveTokens.userId],
    references: [users.id],
  }),
  policy: one(insurancePolicies, {
    fields: [recurveTokens.policyId],
    references: [insurancePolicies.id],
  }),
  torusNodes: many(torusSecurityNodes),
}));

// Fractal Reserve Loans schema
export const fractalLoans = pgTable("fractal_loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  policyId: integer("policy_id").references(() => insurancePolicies.id),
  loanAmount: decimal("loan_amount", { precision: 36, scale: 2 }).notNull(),
  collateralPercentage: decimal("collateral_percentage", { precision: 6, scale: 2 }).notNull(),
  collateralType: text("collateral_type").notNull().$type<FractalLoanCollateralType>(),
  tokenId: integer("token_id").references(() => recurveTokens.id),
  tokenAmount: decimal("token_amount", { precision: 36, scale: 18 }),
  interestRate: decimal("interest_rate", { precision: 6, scale: 4 }).notNull(),
  fractalModelParameters: jsonb("fractal_model_parameters").notNull(),
  originationDate: timestamp("origination_date").defaultNow(),
  maturityDate: timestamp("maturity_date").notNull(),
  status: text("status").notNull().$type<FractalLoanStatus>().default(FractalLoanStatus.PENDING),
  taxCategory: text("tax_category").notNull().default('non_taxable'),
  lastRecalculation: timestamp("last_recalculation").defaultNow(),
  recurveTokenId: integer("recurve_token_id").references(() => recurveTokens.id),
  walletId: integer("wallet_id").references(() => wallets.id),
  repaymentSchedule: jsonb("repayment_schedule"),
  loanPurpose: text("loan_purpose"), // e.g., 'node_funding', 'storage_expansion', 'validator_stake'
});

export const fractalLoansRelations = relations(fractalLoans, ({ one }) => ({
  user: one(users, {
    fields: [fractalLoans.userId],
    references: [users.id],
  }),
  policy: one(insurancePolicies, {
    fields: [fractalLoans.policyId],
    references: [insurancePolicies.id],
  }),
  recurveToken: one(recurveTokens, {
    fields: [fractalLoans.recurveTokenId],
    references: [recurveTokens.id],
  }),
  wallet: one(wallets, {
    fields: [fractalLoans.walletId],
    references: [wallets.id],
  }),
}));

// Torus Security Nodes schema
export const torusSecurityNodes = pgTable("torus_security_nodes", {
  id: serial("id").primaryKey(),
  nodeType: text("node_type").notNull().$type<TorusNodeType>(),
  recurveTokenId: integer("recurve_token_id").references(() => recurveTokens.id),
  userId: integer("user_id").notNull().references(() => users.id),
  securityLevel: integer("security_level").notNull(),
  backingAmount: decimal("backing_amount", { precision: 36, scale: 2 }).notNull(),
  recursionDepth: integer("recursion_depth").notNull(),
  mandelbrotParameters: jsonb("mandelbrot_parameters").notNull(),
  networkPosition: jsonb("network_position").notNull(), // position in the torus
  lastVerified: timestamp("last_verified").defaultNow(),
  validatorAddress: text("validator_address"), // Blockchain address of the validator
  status: text("status").notNull().default('active'),
});

export const torusSecurityNodesRelations = relations(torusSecurityNodes, ({ one }) => ({
  user: one(users, {
    fields: [torusSecurityNodes.userId],
    references: [users.id],
  }),
  recurveToken: one(recurveTokens, {
    fields: [torusSecurityNodes.recurveTokenId],
    references: [recurveTokens.id],
  }),
}));

// Network Insurance Policies
export const networkInsurancePolicies = pgTable("network_insurance_policies", {
  id: serial("id").primaryKey(),
  policyProvider: text("policy_provider").notNull(),
  policyNumber: text("policy_number").notNull(),
  policyType: text("policy_type").notNull().$type<InsurancePolicyType>(),
  faceValue: decimal("face_value", { precision: 36, scale: 2 }).notNull(),
  fundedBy: text("funded_by").notNull(), // 'network_fees', 'contributions'
  premiumAmount: decimal("premium_amount", { precision: 36, scale: 2 }).notNull(),
  premiumFrequency: text("premium_frequency").notNull(), // monthly, quarterly, annually
  policyPurpose: text("policy_purpose").notNull(), // 'network_security', 'torus_backing'
  status: text("status").notNull().$type<InsurancePolicyStatus>().default(InsurancePolicyStatus.ACTIVE),
  createdAt: timestamp("created_at").defaultNow(),
  lastPremiumPaid: timestamp("last_premium_paid"),
  maturityDate: timestamp("maturity_date"),
  managedBy: integer("managed_by").references(() => users.id), // Trust member managing this policy
});

// Mandelbrot Recursion Logs
export const mandelbrotRecursionEvents = pgTable("mandelbrot_recursion_events", {
  id: serial("id").primaryKey(),
  recursionType: text("recursion_type").notNull(), // rebalance, recalculation, expansion
  iterationCount: integer("iteration_count").notNull(),
  startValue: jsonb("start_value").notNull(),
  endValue: jsonb("end_value").notNull(),
  affectedSystems: jsonb("affected_systems").notNull(), // which systems were recalculated
  stabilityMetric: decimal("stability_metric", { precision: 10, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  executionTimeMs: integer("execution_time_ms").notNull(),
  triggerReason: text("trigger_reason").notNull(),
  userId: integer("user_id").references(() => users.id), // User who triggered this, if applicable
});

// Create insert schemas
export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  onchainSyncStatus: true,
});

export const insertRecurveTokenSchema = createInsertSchema(recurveTokens).omit({
  id: true,
  mintedAt: true,
  lastRecalculation: true,
});

export const insertFractalLoanSchema = createInsertSchema(fractalLoans).omit({
  id: true,
  originationDate: true,
  lastRecalculation: true,
});

export const insertTorusSecurityNodeSchema = createInsertSchema(torusSecurityNodes).omit({
  id: true,
  lastVerified: true,
});

export const insertNetworkInsurancePolicySchema = createInsertSchema(networkInsurancePolicies).omit({
  id: true,
  createdAt: true,
});

export const insertMandelbrotRecursionEventSchema = createInsertSchema(mandelbrotRecursionEvents).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;

export type RecurveToken = typeof recurveTokens.$inferSelect;
export type InsertRecurveToken = z.infer<typeof insertRecurveTokenSchema>;

export type FractalLoan = typeof fractalLoans.$inferSelect;
export type InsertFractalLoan = z.infer<typeof insertFractalLoanSchema>;

export type TorusSecurityNode = typeof torusSecurityNodes.$inferSelect;
export type InsertTorusSecurityNode = z.infer<typeof insertTorusSecurityNodeSchema>;

export type NetworkInsurancePolicy = typeof networkInsurancePolicies.$inferSelect;
export type InsertNetworkInsurancePolicy = z.infer<typeof insertNetworkInsurancePolicySchema>;

export type MandelbrotRecursionEvent = typeof mandelbrotRecursionEvents.$inferSelect;
export type InsertMandelbrotRecursionEvent = z.infer<typeof insertMandelbrotRecursionEventSchema>;