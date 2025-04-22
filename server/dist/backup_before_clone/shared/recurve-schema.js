"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMandelbrotRecursionEventSchema = exports.insertNetworkInsurancePolicySchema = exports.insertTorusSecurityNodeSchema = exports.insertFractalLoanSchema = exports.insertRecurveTokenSchema = exports.insertInsurancePolicySchema = exports.mandelbrotRecursionEvents = exports.networkInsurancePolicies = exports.torusSecurityNodesRelations = exports.torusSecurityNodes = exports.fractalLoansRelations = exports.fractalLoans = exports.recurveTokensRelations = exports.recurveTokens = exports.insurancePoliciesRelations = exports.insurancePolicies = exports.TorusNodeType = exports.RecurveTokenTier = exports.RecurveSyncStatus = exports.FractalLoanCollateralType = exports.FractalLoanStatus = exports.BeneficiaryType = exports.InsurancePolicyStatus = exports.InsurancePolicyType = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
const base_schema_1 = require("./base-schema");
const schema_1 = require("./schema");
// Enums for Recurve System
var InsurancePolicyType;
(function (InsurancePolicyType) {
    InsurancePolicyType["WHOLE_LIFE"] = "whole_life";
    InsurancePolicyType["INDEXED_UNIVERSAL_LIFE"] = "indexed_universal_life";
    InsurancePolicyType["TERM_LIFE"] = "term_life";
    InsurancePolicyType["VARIABLE_UNIVERSAL_LIFE"] = "variable_universal_life";
})(InsurancePolicyType || (exports.InsurancePolicyType = InsurancePolicyType = {}));
var InsurancePolicyStatus;
(function (InsurancePolicyStatus) {
    InsurancePolicyStatus["ACTIVE"] = "active";
    InsurancePolicyStatus["PENDING"] = "pending";
    InsurancePolicyStatus["LAPSED"] = "lapsed";
    InsurancePolicyStatus["MATURED"] = "matured";
    InsurancePolicyStatus["SURRENDERED"] = "surrendered";
    InsurancePolicyStatus["DEATH_CLAIM"] = "death_claim";
})(InsurancePolicyStatus || (exports.InsurancePolicyStatus = InsurancePolicyStatus = {}));
var BeneficiaryType;
(function (BeneficiaryType) {
    BeneficiaryType["TRUST"] = "trust";
    BeneficiaryType["INDIVIDUAL"] = "individual";
    BeneficiaryType["NETWORK"] = "network";
})(BeneficiaryType || (exports.BeneficiaryType = BeneficiaryType = {}));
var FractalLoanStatus;
(function (FractalLoanStatus) {
    FractalLoanStatus["ACTIVE"] = "active";
    FractalLoanStatus["PENDING"] = "pending";
    FractalLoanStatus["REPAID"] = "repaid";
    FractalLoanStatus["DEFAULTED"] = "defaulted";
    FractalLoanStatus["COLLATERAL_CLAIMED"] = "collateral_claimed";
})(FractalLoanStatus || (exports.FractalLoanStatus = FractalLoanStatus = {}));
var FractalLoanCollateralType;
(function (FractalLoanCollateralType) {
    FractalLoanCollateralType["POLICY"] = "policy";
    FractalLoanCollateralType["TOKEN"] = "token";
    FractalLoanCollateralType["HYBRID"] = "hybrid";
})(FractalLoanCollateralType || (exports.FractalLoanCollateralType = FractalLoanCollateralType = {}));
var RecurveSyncStatus;
(function (RecurveSyncStatus) {
    RecurveSyncStatus["SYNCED"] = "synced";
    RecurveSyncStatus["PENDING"] = "pending";
    RecurveSyncStatus["FAILED"] = "failed";
})(RecurveSyncStatus || (exports.RecurveSyncStatus = RecurveSyncStatus = {}));
var RecurveTokenTier;
(function (RecurveTokenTier) {
    RecurveTokenTier["PLATINUM"] = "platinum";
    RecurveTokenTier["GOLD"] = "gold";
    RecurveTokenTier["SILVER"] = "silver";
    RecurveTokenTier["BRONZE"] = "bronze";
})(RecurveTokenTier || (exports.RecurveTokenTier = RecurveTokenTier = {}));
var TorusNodeType;
(function (TorusNodeType) {
    TorusNodeType["PRIMARY"] = "primary";
    TorusNodeType["SECONDARY"] = "secondary";
    TorusNodeType["TERTIARY"] = "tertiary";
})(TorusNodeType || (exports.TorusNodeType = TorusNodeType = {}));
// Insurance Policies schema
exports.insurancePolicies = (0, pg_core_1.pgTable)("insurance_policies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => base_schema_1.users.id),
    policyProvider: (0, pg_core_1.text)("policy_provider").notNull(),
    policyNumber: (0, pg_core_1.text)("policy_number").notNull(),
    policyType: (0, pg_core_1.text)("policy_type").notNull().$type(),
    faceValue: (0, pg_core_1.decimal)("face_value", { precision: 36, scale: 2 }).notNull(),
    cashValue: (0, pg_core_1.decimal)("cash_value", { precision: 36, scale: 2 }).notNull(),
    premiumAmount: (0, pg_core_1.decimal)("premium_amount", { precision: 36, scale: 2 }).notNull(),
    premiumFrequency: (0, pg_core_1.text)("premium_frequency").notNull(), // monthly, quarterly, annually
    beneficiaryType: (0, pg_core_1.text)("beneficiary_type").notNull().$type(),
    beneficiaryId: (0, pg_core_1.text)("beneficiary_id").notNull(), // trust ID or user ID
    beneficiaryPercentage: (0, pg_core_1.decimal)("beneficiary_percentage", { precision: 5, scale: 2 }).notNull(),
    status: (0, pg_core_1.text)("status").notNull().$type().default(InsurancePolicyStatus.PENDING),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
    maturityDate: (0, pg_core_1.timestamp)("maturity_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    onchainSyncStatus: (0, pg_core_1.text)("onchain_sync_status").$type().default(RecurveSyncStatus.PENDING),
    policyDocumentCid: (0, pg_core_1.text)("policy_document_cid"), // IPFS CID for policy documents
    verificationHash: (0, pg_core_1.text)("verification_hash"), // Hash of the verified policy details
});
exports.insurancePoliciesRelations = (0, drizzle_orm_1.relations)(exports.insurancePolicies, ({ one, many }) => ({
    user: one(base_schema_1.users, {
        fields: [exports.insurancePolicies.userId],
        references: [base_schema_1.users.id],
    }),
    recurveTokens: many(exports.recurveTokens),
    fractalLoans: many(exports.fractalLoans),
}));
// Recurve Tokens schema
exports.recurveTokens = (0, pg_core_1.pgTable)("recurve_tokens", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => base_schema_1.users.id),
    policyId: (0, pg_core_1.integer)("policy_id").references(() => exports.insurancePolicies.id),
    tokenAddress: (0, pg_core_1.text)("token_address").notNull(),
    tokenAmount: (0, pg_core_1.decimal)("token_amount", { precision: 36, scale: 18 }).notNull(),
    tier: (0, pg_core_1.text)("tier").$type().notNull(),
    collateralizationRatio: (0, pg_core_1.decimal)("collateralization_ratio", { precision: 6, scale: 2 }).notNull(),
    mintedAt: (0, pg_core_1.timestamp)("minted_at").defaultNow(),
    lastRecalculation: (0, pg_core_1.timestamp)("last_recalculation").defaultNow(),
    fractalRecursionDepth: (0, pg_core_1.integer)("fractal_recursion_depth").notNull().default(3),
    mandelbrotParameters: (0, pg_core_1.jsonb)("mandelbrot_parameters").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default('active'),
    onchainTxHash: (0, pg_core_1.text)("onchain_tx_hash"), // Transaction hash for on-chain verification
});
exports.recurveTokensRelations = (0, drizzle_orm_1.relations)(exports.recurveTokens, ({ one, many }) => ({
    user: one(base_schema_1.users, {
        fields: [exports.recurveTokens.userId],
        references: [base_schema_1.users.id],
    }),
    policy: one(exports.insurancePolicies, {
        fields: [exports.recurveTokens.policyId],
        references: [exports.insurancePolicies.id],
    }),
    torusNodes: many(exports.torusSecurityNodes),
}));
// Fractal Reserve Loans schema
exports.fractalLoans = (0, pg_core_1.pgTable)("fractal_loans", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => base_schema_1.users.id),
    policyId: (0, pg_core_1.integer)("policy_id").references(() => exports.insurancePolicies.id),
    loanAmount: (0, pg_core_1.decimal)("loan_amount", { precision: 36, scale: 2 }).notNull(),
    collateralPercentage: (0, pg_core_1.decimal)("collateral_percentage", { precision: 6, scale: 2 }).notNull(),
    collateralType: (0, pg_core_1.text)("collateral_type").notNull().$type(),
    tokenId: (0, pg_core_1.integer)("token_id").references(() => exports.recurveTokens.id),
    tokenAmount: (0, pg_core_1.decimal)("token_amount", { precision: 36, scale: 18 }),
    interestRate: (0, pg_core_1.decimal)("interest_rate", { precision: 6, scale: 4 }).notNull(),
    fractalModelParameters: (0, pg_core_1.jsonb)("fractal_model_parameters").notNull(),
    originationDate: (0, pg_core_1.timestamp)("origination_date").defaultNow(),
    maturityDate: (0, pg_core_1.timestamp)("maturity_date").notNull(),
    status: (0, pg_core_1.text)("status").notNull().$type().default(FractalLoanStatus.PENDING),
    taxCategory: (0, pg_core_1.text)("tax_category").notNull().default('non_taxable'),
    lastRecalculation: (0, pg_core_1.timestamp)("last_recalculation").defaultNow(),
    recurveTokenId: (0, pg_core_1.integer)("recurve_token_id").references(() => exports.recurveTokens.id),
    walletId: (0, pg_core_1.integer)("wallet_id").references(() => schema_1.wallets.id),
    repaymentSchedule: (0, pg_core_1.jsonb)("repayment_schedule"),
    loanPurpose: (0, pg_core_1.text)("loan_purpose"), // e.g., 'node_funding', 'storage_expansion', 'validator_stake'
});
exports.fractalLoansRelations = (0, drizzle_orm_1.relations)(exports.fractalLoans, ({ one }) => ({
    user: one(base_schema_1.users, {
        fields: [exports.fractalLoans.userId],
        references: [base_schema_1.users.id],
    }),
    policy: one(exports.insurancePolicies, {
        fields: [exports.fractalLoans.policyId],
        references: [exports.insurancePolicies.id],
    }),
    recurveToken: one(exports.recurveTokens, {
        fields: [exports.fractalLoans.recurveTokenId],
        references: [exports.recurveTokens.id],
    }),
    wallet: one(schema_1.wallets, {
        fields: [exports.fractalLoans.walletId],
        references: [schema_1.wallets.id],
    }),
}));
// Torus Security Nodes schema
exports.torusSecurityNodes = (0, pg_core_1.pgTable)("torus_security_nodes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    nodeType: (0, pg_core_1.text)("node_type").notNull().$type(),
    recurveTokenId: (0, pg_core_1.integer)("recurve_token_id").references(() => exports.recurveTokens.id),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => base_schema_1.users.id),
    securityLevel: (0, pg_core_1.integer)("security_level").notNull(),
    backingAmount: (0, pg_core_1.decimal)("backing_amount", { precision: 36, scale: 2 }).notNull(),
    recursionDepth: (0, pg_core_1.integer)("recursion_depth").notNull(),
    mandelbrotParameters: (0, pg_core_1.jsonb)("mandelbrot_parameters").notNull(),
    networkPosition: (0, pg_core_1.jsonb)("network_position").notNull(), // position in the torus
    lastVerified: (0, pg_core_1.timestamp)("last_verified").defaultNow(),
    validatorAddress: (0, pg_core_1.text)("validator_address"), // Blockchain address of the validator
    status: (0, pg_core_1.text)("status").notNull().default('active'),
});
exports.torusSecurityNodesRelations = (0, drizzle_orm_1.relations)(exports.torusSecurityNodes, ({ one }) => ({
    user: one(base_schema_1.users, {
        fields: [exports.torusSecurityNodes.userId],
        references: [base_schema_1.users.id],
    }),
    recurveToken: one(exports.recurveTokens, {
        fields: [exports.torusSecurityNodes.recurveTokenId],
        references: [exports.recurveTokens.id],
    }),
}));
// Network Insurance Policies
exports.networkInsurancePolicies = (0, pg_core_1.pgTable)("network_insurance_policies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    policyProvider: (0, pg_core_1.text)("policy_provider").notNull(),
    policyNumber: (0, pg_core_1.text)("policy_number").notNull(),
    policyType: (0, pg_core_1.text)("policy_type").notNull().$type(),
    faceValue: (0, pg_core_1.decimal)("face_value", { precision: 36, scale: 2 }).notNull(),
    fundedBy: (0, pg_core_1.text)("funded_by").notNull(), // 'network_fees', 'contributions'
    premiumAmount: (0, pg_core_1.decimal)("premium_amount", { precision: 36, scale: 2 }).notNull(),
    premiumFrequency: (0, pg_core_1.text)("premium_frequency").notNull(), // monthly, quarterly, annually
    policyPurpose: (0, pg_core_1.text)("policy_purpose").notNull(), // 'network_security', 'torus_backing'
    status: (0, pg_core_1.text)("status").notNull().$type().default(InsurancePolicyStatus.ACTIVE),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    lastPremiumPaid: (0, pg_core_1.timestamp)("last_premium_paid"),
    maturityDate: (0, pg_core_1.timestamp)("maturity_date"),
    managedBy: (0, pg_core_1.integer)("managed_by").references(() => base_schema_1.users.id), // Trust member managing this policy
});
// Mandelbrot Recursion Logs
exports.mandelbrotRecursionEvents = (0, pg_core_1.pgTable)("mandelbrot_recursion_events", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    recursionType: (0, pg_core_1.text)("recursion_type").notNull(), // rebalance, recalculation, expansion
    iterationCount: (0, pg_core_1.integer)("iteration_count").notNull(),
    startValue: (0, pg_core_1.jsonb)("start_value").notNull(),
    endValue: (0, pg_core_1.jsonb)("end_value").notNull(),
    affectedSystems: (0, pg_core_1.jsonb)("affected_systems").notNull(), // which systems were recalculated
    stabilityMetric: (0, pg_core_1.decimal)("stability_metric", { precision: 10, scale: 8 }).notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    executionTimeMs: (0, pg_core_1.integer)("execution_time_ms").notNull(),
    triggerReason: (0, pg_core_1.text)("trigger_reason").notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => base_schema_1.users.id), // User who triggered this, if applicable
});
// Create insert schemas
exports.insertInsurancePolicySchema = (0, drizzle_zod_1.createInsertSchema)(exports.insurancePolicies).omit({
    id: true,
    createdAt: true,
    lastUpdated: true,
    onchainSyncStatus: true,
});
exports.insertRecurveTokenSchema = (0, drizzle_zod_1.createInsertSchema)(exports.recurveTokens).omit({
    id: true,
    mintedAt: true,
    lastRecalculation: true,
});
exports.insertFractalLoanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fractalLoans).omit({
    id: true,
    originationDate: true,
    lastRecalculation: true,
});
exports.insertTorusSecurityNodeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.torusSecurityNodes).omit({
    id: true,
    lastVerified: true,
});
exports.insertNetworkInsurancePolicySchema = (0, drizzle_zod_1.createInsertSchema)(exports.networkInsurancePolicies).omit({
    id: true,
    createdAt: true,
});
exports.insertMandelbrotRecursionEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mandelbrotRecursionEvents).omit({
    id: true,
    timestamp: true,
});
