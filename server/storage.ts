import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import {
  users,
  achievements,
  userAchievements,
  nftBadges,
  achievementCriteria,
  userActivities,
  type User,
  type InsertUser,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type NFTBadge,
  type InsertNFTBadge,
  type InsertUserActivity
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  updateUserSecurityScore(id: number, scoreChange: number): Promise<User | undefined>;
  
  // Achievement methods
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // User Achievement methods
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  awardAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  checkUserHasAchievement(userId: number, achievementId: number): Promise<boolean>;
  
  // NFT Badge methods
  getNFTBadge(id: number): Promise<NFTBadge | undefined>;
  getNFTBadgesByUser(userId: number): Promise<NFTBadge[]>;
  createNFTBadge(badge: InsertNFTBadge): Promise<NFTBadge>;
  updateNFTBadge(id: number, badgeData: Partial<InsertNFTBadge>): Promise<NFTBadge | undefined>;
  
  // User Activity methods
  recordUserActivity(activity: InsertUserActivity): Promise<void>;
  getUserSecurityScore(userId: number): Promise<number>;
  getUserActivities(userId: number, limit?: number): Promise<typeof userActivities.$inferSelect[]>;
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserSecurityScore(id: number, scoreChange: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    const newScore = user.securityScore + scoreChange;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        securityScore: newScore,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements).orderBy(asc(achievements.category), asc(achievements.difficulty));
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.category, category))
      .orderBy(asc(achievements.difficulty));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return db
      .select({
        userAchievement: userAchievements,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.dateEarned))
      .then(rows => rows.map(row => ({
        ...row.userAchievement,
        achievement: row.achievement
      })));
  }

  async awardAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    // First check if the user already has this achievement
    const exists = await this.checkUserHasAchievement(
      userAchievement.userId,
      userAchievement.achievementId
    );

    if (exists) {
      throw new Error("User already has this achievement");
    }

    // Get the achievement to determine point value
    const achievement = await this.getAchievement(userAchievement.achievementId);
    if (!achievement) {
      throw new Error("Achievement not found");
    }

    // Award the achievement and update user's security score
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values(userAchievement)
      .returning();

    // Update the user's security score
    await this.updateUserSecurityScore(userAchievement.userId, achievement.pointsValue);

    return newUserAchievement;
  }

  async checkUserHasAchievement(userId: number, achievementId: number): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
    return !!existing;
  }

  // NFT Badge methods
  async getNFTBadge(id: number): Promise<NFTBadge | undefined> {
    const [badge] = await db
      .select()
      .from(nftBadges)
      .where(eq(nftBadges.id, id));
    return badge;
  }

  async getNFTBadgesByUser(userId: number): Promise<NFTBadge[]> {
    const userAchievementIds = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    if (userAchievementIds.length === 0) return [];

    return db
      .select()
      .from(nftBadges)
      .where(
        sql`${nftBadges.achievementId} IN (${userAchievementIds.map(ua => ua.achievementId).join(',')})`
      );
  }

  async createNFTBadge(badge: InsertNFTBadge): Promise<NFTBadge> {
    const [newBadge] = await db
      .insert(nftBadges)
      .values(badge)
      .returning();
    return newBadge;
  }

  async updateNFTBadge(id: number, badgeData: Partial<InsertNFTBadge>): Promise<NFTBadge | undefined> {
    const [updatedBadge] = await db
      .update(nftBadges)
      .set({ ...badgeData, updatedAt: new Date() })
      .where(eq(nftBadges.id, id))
      .returning();
    return updatedBadge;
  }

  // User Activity methods
  async recordUserActivity(activity: InsertUserActivity): Promise<void> {
    await db
      .insert(userActivities)
      .values(activity);
  }

  async getUserSecurityScore(userId: number): Promise<number> {
    const [user] = await db
      .select({ securityScore: users.securityScore })
      .from(users)
      .where(eq(users.id, userId));
    
    return user?.securityScore || 0;
  }

  async getUserActivities(userId: number, limit: number = 20): Promise<typeof userActivities.$inferSelect[]> {
    return db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);
  }
}

// Create an instance of the storage
export const storage = new DatabaseStorage();