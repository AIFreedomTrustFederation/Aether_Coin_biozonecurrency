import { pgTable, serial, text, timestamp, varchar, integer, json, boolean, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
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