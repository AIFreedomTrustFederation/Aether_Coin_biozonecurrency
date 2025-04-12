import { pgTable, serial, text, timestamp, varchar, integer, json, boolean, uniqueIndex, pgEnum, numeric, decimal, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  walletAddress: varchar("wallet_address", { length: 255 }).unique(),
  securityScore: integer("security_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Achievement categories enum
export const achievementCategoryEnum = pgEnum("achievement_category", [
  "account_security",
  "wallet_security",
  "communication_security",
  "quantum_security",
  "transaction_security",
  "node_operations",
  "special_events"
]);

// Difficulty levels enum
export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
  "master"
]);

// Define achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: achievementCategoryEnum("category").notNull(),
  difficulty: difficultyLevelEnum("difficulty").notNull(),
  pointsValue: integer("points_value").notNull(),
  imageUrl: text("image_url").notNull(),
  nftMetadata: json("nft_metadata"),
  requirementDescription: text("requirement_description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define user_achievements table (many-to-many relationship)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  dateEarned: timestamp("date_earned").defaultNow().notNull(),
  nftTokenId: varchar("nft_token_id", { length: 255 }),
  nftMinted: boolean("nft_minted").default(false).notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }),
}, (table) => {
  return {
    userAchievementUnique: uniqueIndex("user_achievement_unique").on(table.userId, table.achievementId),
  };
});

// Define achievement_criteria table
export const achievementCriteria = pgTable("achievement_criteria", {
  id: serial("id").primaryKey(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  criteriaType: varchar("criteria_type", { length: 100 }).notNull(),
  criteriaValue: json("criteria_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define user_activities table to track progress toward achievements
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  activityData: json("activity_data"),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define nft_badges table to store NFT metadata
export const nftBadges = pgTable("nft_badges", {
  id: serial("id").primaryKey(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  tokenId: varchar("token_id", { length: 255 }).unique(),
  metadata: json("metadata").notNull(),
  imageUrl: text("image_url").notNull(),
  badgeRarity: varchar("badge_rarity", { length: 50 }).notNull(),
  mintedAt: timestamp("minted_at"),
  contractAddress: varchar("contract_address", { length: 255 }),
  chainId: integer("chain_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true });
export const insertNftBadgeSchema = createInsertSchema(nftBadges).omit({ id: true });
export const insertAchievementCriteriaSchema = createInsertSchema(achievementCriteria).omit({ id: true });
export const insertUserActivitySchema = createInsertSchema(userActivities).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type NFTBadge = typeof nftBadges.$inferSelect;
export type InsertNFTBadge = z.infer<typeof insertNftBadgeSchema>;

export type AchievementCriteria = typeof achievementCriteria.$inferSelect;
export type InsertAchievementCriteria = z.infer<typeof insertAchievementCriteriaSchema>;

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

// =====================================================
// LAO and Insurance System Schema
// =====================================================

// Limited Autonomous Organization (LAO) entity status enum
export const laoEntityStatusEnum = pgEnum("lao_entity_status", [
  "pending",
  "active",
  "suspended",
  "dissolved"
]);

// LAO member role enum
export const laoMemberRoleEnum = pgEnum("lao_member_role", [
  "owner",
  "manager",
  "member",
  "advisor",
  "custodian"
]);

// Insurance policy type enum
export const insurancePolicyTypeEnum = pgEnum("insurance_policy_type", [
  "asset_protection",
  "health",
  "life",
  "liability",
  "business",
  "property",
  "cyber_security",
  "quantum_protection"
]);

// Insurance policy status enum
export const insurancePolicyStatusEnum = pgEnum("insurance_policy_status", [
  "pending",
  "active",
  "suspended",
  "cancelled",
  "expired",
  "claimed"
]);

// Insurance claim status enum
export const insuranceClaimStatusEnum = pgEnum("insurance_claim_status", [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "appealed",
  "paid"
]);

// Define limited_autonomous_organizations table
export const limitedAutonomousOrganizations = pgTable("limited_autonomous_organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  wyomingEntityId: varchar("wyoming_entity_id", { length: 100 }).unique(),
  contractAddress: varchar("contract_address", { length: 255 }).unique(),
  chainId: integer("chain_id").notNull(),
  status: laoEntityStatusEnum("status").default("pending").notNull(),
  governanceContract: varchar("governance_contract", { length: 255 }),
  treasuryAddress: varchar("treasury_address", { length: 255 }).notNull(),
  metadataUri: text("metadata_uri"),
  description: text("description"),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  formationDate: timestamp("formation_date").defaultNow().notNull(),
  renewalDate: timestamp("renewal_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define lao_members table
export const laoMembers = pgTable("lao_members", {
  id: serial("id").primaryKey(),
  laoId: integer("lao_id").references(() => limitedAutonomousOrganizations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: laoMemberRoleEnum("role").default("member").notNull(),
  votingPower: integer("voting_power").default(1).notNull(),
  membershipTokenId: varchar("membership_token_id", { length: 255 }),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
  profileData: json("profile_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    laoMemberUnique: uniqueIndex("lao_member_unique").on(table.laoId, table.userId),
  };
});

// Define tribes (sub-organizations within LAOs)
export const tribes = pgTable("tribes", {
  id: serial("id").primaryKey(),
  laoId: integer("lao_id").references(() => limitedAutonomousOrganizations.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  leadMemberId: integer("lead_member_id").references(() => laoMembers.id),
  tokenId: varchar("token_id", { length: 255 }),
  treasuryAddress: varchar("treasury_address", { length: 255 }),
  membershipCriteria: json("membership_criteria"),
  metadataUri: text("metadata_uri"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define tribal affiliations (many-to-many relationship between lao_members and tribes)
export const tribalAffiliations = pgTable("tribal_affiliations", {
  id: serial("id").primaryKey(),
  tribeId: integer("tribe_id").references(() => tribes.id).notNull(),
  memberId: integer("member_id").references(() => laoMembers.id).notNull(),
  role: varchar("role", { length: 100 }).default("member").notNull(),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    tribalAffiliationUnique: uniqueIndex("tribal_affiliation_unique").on(table.tribeId, table.memberId),
  };
});

// Define insurance_risk_pools table
export const insuranceRiskPools = pgTable("insurance_risk_pools", {
  id: serial("id").primaryKey(),
  laoId: integer("lao_id").references(() => limitedAutonomousOrganizations.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  policyType: insurancePolicyTypeEnum("policy_type").notNull(),
  coverageLimit: decimal("coverage_limit", { precision: 18, scale: 6 }).notNull(),
  premiumRate: decimal("premium_rate", { precision: 10, scale: 4 }).notNull(),
  minimumRequiredBalance: decimal("minimum_required_balance", { precision: 18, scale: 6 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 18, scale: 6 }).default("0").notNull(),
  reserveRatio: decimal("reserve_ratio", { precision: 5, scale: 2 }).default("0.1").notNull(),
  contractAddress: varchar("contract_address", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  riskModelParameters: json("risk_model_parameters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define insurance_policies table
export const insurancePolicies = pgTable("insurance_policies", {
  id: serial("id").primaryKey(),
  policyNumber: varchar("policy_number", { length: 100 }).notNull().unique(),
  riskPoolId: integer("risk_pool_id").references(() => insuranceRiskPools.id).notNull(),
  policyHolderId: integer("policy_holder_id").references(() => laoMembers.id).notNull(),
  tribeId: integer("tribe_id").references(() => tribes.id),
  type: insurancePolicyTypeEnum("type").notNull(),
  status: insurancePolicyStatusEnum("status").default("pending").notNull(),
  coverageAmount: decimal("coverage_amount", { precision: 18, scale: 6 }).notNull(),
  deductible: decimal("deductible", { precision: 18, scale: 6 }).default("0").notNull(),
  premium: decimal("premium", { precision: 18, scale: 6 }).notNull(),
  termLength: integer("term_length").notNull(), // in days
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  renewalDate: timestamp("renewal_date"),
  autoRenewal: boolean("auto_renewal").default(false).notNull(),
  policyData: json("policy_data"),
  contractAddress: varchar("contract_address", { length: 255 }),
  tokenId: varchar("token_id", { length: 255 }),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define insurance_claims table
export const insuranceClaims = pgTable("insurance_claims", {
  id: serial("id").primaryKey(),
  claimNumber: varchar("claim_number", { length: 100 }).notNull().unique(),
  policyId: integer("policy_id").references(() => insurancePolicies.id).notNull(),
  claimantId: integer("claimant_id").references(() => laoMembers.id).notNull(),
  status: insuranceClaimStatusEnum("status").default("submitted").notNull(),
  filingDate: timestamp("filing_date").defaultNow().notNull(),
  incidentDate: timestamp("incident_date").notNull(),
  description: text("description").notNull(),
  requestedAmount: decimal("requested_amount", { precision: 18, scale: 6 }).notNull(),
  approvedAmount: decimal("approved_amount", { precision: 18, scale: 6 }),
  evidence: json("evidence"),
  reviewedBy: integer("reviewed_by").references(() => laoMembers.id),
  reviewDate: timestamp("review_date"),
  settlementDate: timestamp("settlement_date"),
  settlementTransactionHash: varchar("settlement_transaction_hash", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define policy_premiums table
export const policyPremiums = pgTable("policy_premiums", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").references(() => insurancePolicies.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define iul_policies table (Indexed Universal Life Policies)
export const iulPolicies = pgTable("iul_policies", {
  id: serial("id").primaryKey(),
  policyNumber: varchar("policy_number", { length: 100 }).notNull().unique(),
  memberId: integer("member_id").references(() => laoMembers.id).notNull(),
  policyType: varchar("policy_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  initialPremium: decimal("initial_premium", { precision: 18, scale: 6 }).notNull(),
  currentValue: decimal("current_value", { precision: 18, scale: 6 }).notNull(),
  deathBenefit: decimal("death_benefit", { precision: 18, scale: 6 }).notNull(),
  cashValue: decimal("cash_value", { precision: 18, scale: 6 }).default("0").notNull(),
  loanBalance: decimal("loan_balance", { precision: 18, scale: 6 }).default("0").notNull(),
  indexStrategy: json("index_strategy").notNull(),
  beneficiaries: json("beneficiaries").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  lastIndexingDate: timestamp("last_indexing_date").defaultNow().notNull(),
  contractAddress: varchar("contract_address", { length: 255 }),
  tokenId: varchar("token_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define iul_policy_transactions table
export const iulPolicyTransactions = pgTable("iul_policy_transactions", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").references(() => iulPolicies.id).notNull(),
  transactionType: varchar("transaction_type", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  description: text("description"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define lao_governance_proposals
export const laoGovernanceProposals = pgTable("lao_governance_proposals", {
  id: serial("id").primaryKey(),
  laoId: integer("lao_id").references(() => limitedAutonomousOrganizations.id).notNull(),
  creatorId: integer("creator_id").references(() => laoMembers.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  proposalType: varchar("proposal_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  metadata: json("metadata"),
  implementation: text("implementation"),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define lao_governance_votes
export const laoGovernanceVotes = pgTable("lao_governance_votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => laoGovernanceProposals.id).notNull(),
  voterId: integer("voter_id").references(() => laoMembers.id).notNull(),
  vote: varchar("vote", { length: 50 }).notNull(),
  voteWeight: decimal("vote_weight", { precision: 10, scale: 2 }).default("1").notNull(),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    voterProposalUnique: uniqueIndex("voter_proposal_unique").on(table.proposalId, table.voterId),
  };
});

// Zod schemas for validation
export const insertLAOSchema = createInsertSchema(limitedAutonomousOrganizations).omit({ id: true });
export const insertLAOMemberSchema = createInsertSchema(laoMembers).omit({ id: true });
export const insertTribeSchema = createInsertSchema(tribes).omit({ id: true });
export const insertTribalAffiliationSchema = createInsertSchema(tribalAffiliations).omit({ id: true });
export const insertInsuranceRiskPoolSchema = createInsertSchema(insuranceRiskPools).omit({ id: true });
export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({ id: true });
export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({ id: true });
export const insertPolicyPremiumSchema = createInsertSchema(policyPremiums).omit({ id: true });
export const insertIULPolicySchema = createInsertSchema(iulPolicies).omit({ id: true });
export const insertIULPolicyTransactionSchema = createInsertSchema(iulPolicyTransactions).omit({ id: true });
export const insertLAOGovernanceProposalSchema = createInsertSchema(laoGovernanceProposals).omit({ id: true });
export const insertLAOGovernanceVoteSchema = createInsertSchema(laoGovernanceVotes).omit({ id: true });

// Types for LAO and Insurance system
export type LAO = typeof limitedAutonomousOrganizations.$inferSelect;
export type InsertLAO = z.infer<typeof insertLAOSchema>;

export type LAOMember = typeof laoMembers.$inferSelect;
export type InsertLAOMember = z.infer<typeof insertLAOMemberSchema>;

export type Tribe = typeof tribes.$inferSelect;
export type InsertTribe = z.infer<typeof insertTribeSchema>;

export type TribalAffiliation = typeof tribalAffiliations.$inferSelect;
export type InsertTribalAffiliation = z.infer<typeof insertTribalAffiliationSchema>;

export type InsuranceRiskPool = typeof insuranceRiskPools.$inferSelect;
export type InsertInsuranceRiskPool = z.infer<typeof insertInsuranceRiskPoolSchema>;

export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;

export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;

export type PolicyPremium = typeof policyPremiums.$inferSelect;
export type InsertPolicyPremium = z.infer<typeof insertPolicyPremiumSchema>;

export type IULPolicy = typeof iulPolicies.$inferSelect;
export type InsertIULPolicy = z.infer<typeof insertIULPolicySchema>;

export type IULPolicyTransaction = typeof iulPolicyTransactions.$inferSelect;
export type InsertIULPolicyTransaction = z.infer<typeof insertIULPolicyTransactionSchema>;

export type LAOGovernanceProposal = typeof laoGovernanceProposals.$inferSelect;
export type InsertLAOGovernanceProposal = z.infer<typeof insertLAOGovernanceProposalSchema>;

export type LAOGovernanceVote = typeof laoGovernanceVotes.$inferSelect;
export type InsertLAOGovernanceVote = z.infer<typeof insertLAOGovernanceVoteSchema>;