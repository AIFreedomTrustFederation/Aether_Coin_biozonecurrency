import { db } from "./db";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";
import {
  users,
  achievements,
  userAchievements,
  nftBadges,
  achievementCriteria,
  userActivities,
  limitedAutonomousOrganizations,
  laoMembers,
  tribes,
  tribalAffiliations,
  insuranceRiskPools,
  insurancePolicies,
  insuranceClaims,
  policyPremiums,
  iulPolicies,
  iulPolicyTransactions,
  laoGovernanceProposals,
  laoGovernanceVotes,
  type User,
  type InsertUser,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type NFTBadge,
  type InsertNFTBadge,
  type InsertUserActivity,
  type LAO,
  type InsertLAO,
  type LAOMember,
  type InsertLAOMember,
  type Tribe,
  type InsertTribe,
  type TribalAffiliation,
  type InsertTribalAffiliation,
  type InsuranceRiskPool,
  type InsertInsuranceRiskPool,
  type InsurancePolicy,
  type InsertInsurancePolicy,
  type InsuranceClaim,
  type InsertInsuranceClaim,
  type PolicyPremium,
  type InsertPolicyPremium,
  type IULPolicy,
  type InsertIULPolicy,
  type IULPolicyTransaction,
  type InsertIULPolicyTransaction,
  type LAOGovernanceProposal,
  type InsertLAOGovernanceProposal,
  type LAOGovernanceVote,
  type InsertLAOGovernanceVote
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
  
  // LAO methods
  getLAO(id: number): Promise<LAO | undefined>;
  getLAOByEntityId(wyomingEntityId: string): Promise<LAO | undefined>;
  getLAOByContractAddress(contractAddress: string): Promise<LAO | undefined>;
  getAllLAOs(activeOnly?: boolean): Promise<LAO[]>;
  createLAO(lao: InsertLAO): Promise<LAO>;
  updateLAO(id: number, laoData: Partial<InsertLAO>): Promise<LAO | undefined>;

  // LAO Member methods
  getLAOMember(id: number): Promise<LAOMember | undefined>;
  getLAOMembersByLAO(laoId: number): Promise<(LAOMember & { user: User })[]>;
  getLAOMemberByUserAndLAO(userId: number, laoId: number): Promise<LAOMember | undefined>;
  addLAOMember(member: InsertLAOMember): Promise<LAOMember>;
  updateLAOMember(id: number, memberData: Partial<InsertLAOMember>): Promise<LAOMember | undefined>;
  removeLAOMember(id: number): Promise<void>;

  // Tribe methods
  getTribe(id: number): Promise<Tribe | undefined>;
  getTribesByLAO(laoId: number): Promise<Tribe[]>;
  createTribe(tribe: InsertTribe): Promise<Tribe>;
  updateTribe(id: number, tribeData: Partial<InsertTribe>): Promise<Tribe | undefined>;

  // Tribal Affiliation methods
  getTribalAffiliations(memberId: number): Promise<(TribalAffiliation & { tribe: Tribe })[]>;
  getTribeMembers(tribeId: number): Promise<(TribalAffiliation & { member: LAOMember & { user: User } })[]>;
  addTribalAffiliation(affiliation: InsertTribalAffiliation): Promise<TribalAffiliation>;
  removeTribalAffiliation(tribeId: number, memberId: number): Promise<void>;

  // Insurance Risk Pool methods
  getRiskPool(id: number): Promise<InsuranceRiskPool | undefined>;
  getRiskPoolsByLAO(laoId: number): Promise<InsuranceRiskPool[]>;
  getRiskPoolsByType(policyType: string): Promise<InsuranceRiskPool[]>;
  createRiskPool(riskPool: InsertInsuranceRiskPool): Promise<InsuranceRiskPool>;
  updateRiskPool(id: number, riskPoolData: Partial<InsertInsuranceRiskPool>): Promise<InsuranceRiskPool | undefined>;
  getRiskPoolBalance(id: number): Promise<number>;
  updateRiskPoolBalance(id: number, amount: number, isDeposit: boolean): Promise<InsuranceRiskPool | undefined>;

  // Insurance Policy methods
  getPolicy(id: number): Promise<InsurancePolicy | undefined>;
  getPolicyByNumber(policyNumber: string): Promise<InsurancePolicy | undefined>;
  getPoliciesByHolder(policyHolderId: number): Promise<InsurancePolicy[]>;
  getPoliciesByRiskPool(riskPoolId: number): Promise<InsurancePolicy[]>;
  getPoliciesByTribe(tribeId: number): Promise<InsurancePolicy[]>;
  createPolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy>;
  updatePolicy(id: number, policyData: Partial<InsertInsurancePolicy>): Promise<InsurancePolicy | undefined>;
  activatePolicy(id: number, startDate: Date, endDate: Date): Promise<InsurancePolicy | undefined>;

  // Insurance Claim methods
  getClaim(id: number): Promise<InsuranceClaim | undefined>;
  getClaimByNumber(claimNumber: string): Promise<InsuranceClaim | undefined>;
  getClaimsByPolicy(policyId: number): Promise<InsuranceClaim[]>;
  getClaimsByClaimant(claimantId: number): Promise<InsuranceClaim[]>;
  createClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateClaim(id: number, claimData: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim | undefined>;
  reviewClaim(id: number, reviewedBy: number, approved: boolean, approvedAmount?: number, notes?: string): Promise<InsuranceClaim | undefined>;
  settleClaim(id: number, transactionHash: string): Promise<InsuranceClaim | undefined>;

  // Policy Premium methods
  getPremium(id: number): Promise<PolicyPremium | undefined>;
  getPremiumsByPolicy(policyId: number): Promise<PolicyPremium[]>;
  createPremium(premium: InsertPolicyPremium): Promise<PolicyPremium>;
  recordPremiumPayment(id: number, transactionHash: string): Promise<PolicyPremium | undefined>;

  // IUL Policy methods
  getIULPolicy(id: number): Promise<IULPolicy | undefined>;
  getIULPolicyByNumber(policyNumber: string): Promise<IULPolicy | undefined>;
  getIULPoliciesByMember(memberId: number): Promise<IULPolicy[]>;
  createIULPolicy(policy: InsertIULPolicy): Promise<IULPolicy>;
  updateIULPolicy(id: number, policyData: Partial<InsertIULPolicy>): Promise<IULPolicy | undefined>;
  indexIULPolicy(id: number, indexRate: number): Promise<IULPolicy | undefined>;

  // IUL Policy Transaction methods
  getIULPolicyTransactions(policyId: number): Promise<IULPolicyTransaction[]>;
  recordIULPolicyTransaction(transaction: InsertIULPolicyTransaction): Promise<IULPolicyTransaction>;

  // LAO Governance methods
  getGovernanceProposal(id: number): Promise<LAOGovernanceProposal | undefined>;
  getProposalsByLAO(laoId: number, activeOnly?: boolean): Promise<LAOGovernanceProposal[]>;
  createGovernanceProposal(proposal: InsertLAOGovernanceProposal): Promise<LAOGovernanceProposal>;
  updateGovernanceProposal(id: number, proposalData: Partial<InsertLAOGovernanceProposal>): Promise<LAOGovernanceProposal | undefined>;
  getVotesByProposal(proposalId: number): Promise<(LAOGovernanceVote & { voter: LAOMember })[]>;
  castVote(vote: InsertLAOGovernanceVote): Promise<LAOGovernanceVote>;
  getProposalResults(proposalId: number): Promise<{ forVotes: number, againstVotes: number, abstainVotes: number, totalVotes: number }>;
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

  // LAO methods
  async getLAO(id: number): Promise<LAO | undefined> {
    const [lao] = await db
      .select()
      .from(limitedAutonomousOrganizations)
      .where(eq(limitedAutonomousOrganizations.id, id));
    return lao;
  }

  async getLAOByEntityId(wyomingEntityId: string): Promise<LAO | undefined> {
    const [lao] = await db
      .select()
      .from(limitedAutonomousOrganizations)
      .where(eq(limitedAutonomousOrganizations.wyomingEntityId, wyomingEntityId));
    return lao;
  }

  async getLAOByContractAddress(contractAddress: string): Promise<LAO | undefined> {
    const [lao] = await db
      .select()
      .from(limitedAutonomousOrganizations)
      .where(eq(limitedAutonomousOrganizations.contractAddress, contractAddress));
    return lao;
  }

  async getAllLAOs(activeOnly: boolean = false): Promise<LAO[]> {
    let query = db.select().from(limitedAutonomousOrganizations);
    
    if (activeOnly) {
      query = query.where(eq(limitedAutonomousOrganizations.status, "active"));
    }
    
    return query.orderBy(asc(limitedAutonomousOrganizations.name));
  }

  async createLAO(lao: InsertLAO): Promise<LAO> {
    const [newLAO] = await db
      .insert(limitedAutonomousOrganizations)
      .values(lao)
      .returning();
    return newLAO;
  }

  async updateLAO(id: number, laoData: Partial<InsertLAO>): Promise<LAO | undefined> {
    const [updatedLAO] = await db
      .update(limitedAutonomousOrganizations)
      .set({ ...laoData, updatedAt: new Date() })
      .where(eq(limitedAutonomousOrganizations.id, id))
      .returning();
    return updatedLAO;
  }

  // LAO Member methods
  async getLAOMember(id: number): Promise<LAOMember | undefined> {
    const [member] = await db
      .select()
      .from(laoMembers)
      .where(eq(laoMembers.id, id));
    return member;
  }

  async getLAOMembersByLAO(laoId: number): Promise<(LAOMember & { user: User })[]> {
    return db
      .select({
        member: laoMembers,
        user: users
      })
      .from(laoMembers)
      .innerJoin(users, eq(laoMembers.userId, users.id))
      .where(eq(laoMembers.laoId, laoId))
      .orderBy(asc(users.username))
      .then(rows => rows.map(row => ({
        ...row.member,
        user: row.user
      })));
  }

  async getLAOMemberByUserAndLAO(userId: number, laoId: number): Promise<LAOMember | undefined> {
    const [member] = await db
      .select()
      .from(laoMembers)
      .where(
        and(
          eq(laoMembers.userId, userId),
          eq(laoMembers.laoId, laoId)
        )
      );
    return member;
  }

  async addLAOMember(member: InsertLAOMember): Promise<LAOMember> {
    // Check if user is already a member of this LAO
    const existingMember = await this.getLAOMemberByUserAndLAO(
      member.userId,
      member.laoId
    );

    if (existingMember) {
      throw new Error("User is already a member of this LAO");
    }

    const [newMember] = await db
      .insert(laoMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async updateLAOMember(id: number, memberData: Partial<InsertLAOMember>): Promise<LAOMember | undefined> {
    const [updatedMember] = await db
      .update(laoMembers)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(laoMembers.id, id))
      .returning();
    return updatedMember;
  }

  async removeLAOMember(id: number): Promise<void> {
    // Instead of deleting, set active to false
    await db
      .update(laoMembers)
      .set({ 
        active: false,
        updatedAt: new Date()
      })
      .where(eq(laoMembers.id, id));
  }

  // Tribe methods
  async getTribe(id: number): Promise<Tribe | undefined> {
    const [tribe] = await db
      .select()
      .from(tribes)
      .where(eq(tribes.id, id));
    return tribe;
  }

  async getTribesByLAO(laoId: number): Promise<Tribe[]> {
    return db
      .select()
      .from(tribes)
      .where(eq(tribes.laoId, laoId))
      .orderBy(asc(tribes.name));
  }

  async createTribe(tribe: InsertTribe): Promise<Tribe> {
    const [newTribe] = await db
      .insert(tribes)
      .values(tribe)
      .returning();
    return newTribe;
  }

  async updateTribe(id: number, tribeData: Partial<InsertTribe>): Promise<Tribe | undefined> {
    const [updatedTribe] = await db
      .update(tribes)
      .set({ ...tribeData, updatedAt: new Date() })
      .where(eq(tribes.id, id))
      .returning();
    return updatedTribe;
  }

  // Tribal Affiliation methods
  async getTribalAffiliations(memberId: number): Promise<(TribalAffiliation & { tribe: Tribe })[]> {
    return db
      .select({
        affiliation: tribalAffiliations,
        tribe: tribes
      })
      .from(tribalAffiliations)
      .innerJoin(tribes, eq(tribalAffiliations.tribeId, tribes.id))
      .where(eq(tribalAffiliations.memberId, memberId))
      .then(rows => rows.map(row => ({
        ...row.affiliation,
        tribe: row.tribe
      })));
  }

  async getTribeMembers(tribeId: number): Promise<(TribalAffiliation & { member: LAOMember & { user: User } })[]> {
    const result = await db
      .select({
        affiliation: tribalAffiliations,
        member: laoMembers,
        user: users
      })
      .from(tribalAffiliations)
      .innerJoin(laoMembers, eq(tribalAffiliations.memberId, laoMembers.id))
      .innerJoin(users, eq(laoMembers.userId, users.id))
      .where(eq(tribalAffiliations.tribeId, tribeId));
    
    return result.map(row => ({
      ...row.affiliation,
      member: {
        ...row.member,
        user: row.user
      }
    }));
  }

  async addTribalAffiliation(affiliation: InsertTribalAffiliation): Promise<TribalAffiliation> {
    // Check if member is already part of this tribe
    const [existingAffiliation] = await db
      .select()
      .from(tribalAffiliations)
      .where(
        and(
          eq(tribalAffiliations.tribeId, affiliation.tribeId),
          eq(tribalAffiliations.memberId, affiliation.memberId)
        )
      );
    
    if (existingAffiliation) {
      throw new Error("Member is already part of this tribe");
    }
    
    const [newAffiliation] = await db
      .insert(tribalAffiliations)
      .values(affiliation)
      .returning();
    return newAffiliation;
  }

  async removeTribalAffiliation(tribeId: number, memberId: number): Promise<void> {
    await db
      .update(tribalAffiliations)
      .set({ 
        active: false 
      })
      .where(
        and(
          eq(tribalAffiliations.tribeId, tribeId),
          eq(tribalAffiliations.memberId, memberId)
        )
      );
  }

  // Insurance Risk Pool methods
  async getRiskPool(id: number): Promise<InsuranceRiskPool | undefined> {
    const [riskPool] = await db
      .select()
      .from(insuranceRiskPools)
      .where(eq(insuranceRiskPools.id, id));
    return riskPool;
  }

  async getRiskPoolsByLAO(laoId: number): Promise<InsuranceRiskPool[]> {
    return db
      .select()
      .from(insuranceRiskPools)
      .where(eq(insuranceRiskPools.laoId, laoId))
      .orderBy(asc(insuranceRiskPools.name));
  }

  async getRiskPoolsByType(policyType: string): Promise<InsuranceRiskPool[]> {
    return db
      .select()
      .from(insuranceRiskPools)
      .where(eq(insuranceRiskPools.policyType, policyType))
      .orderBy(asc(insuranceRiskPools.name));
  }

  async createRiskPool(riskPool: InsertInsuranceRiskPool): Promise<InsuranceRiskPool> {
    const [newRiskPool] = await db
      .insert(insuranceRiskPools)
      .values(riskPool)
      .returning();
    return newRiskPool;
  }

  async updateRiskPool(id: number, riskPoolData: Partial<InsertInsuranceRiskPool>): Promise<InsuranceRiskPool | undefined> {
    const [updatedRiskPool] = await db
      .update(insuranceRiskPools)
      .set({ ...riskPoolData, updatedAt: new Date() })
      .where(eq(insuranceRiskPools.id, id))
      .returning();
    return updatedRiskPool;
  }

  async getRiskPoolBalance(id: number): Promise<number> {
    const [riskPool] = await db
      .select({ currentBalance: insuranceRiskPools.currentBalance })
      .from(insuranceRiskPools)
      .where(eq(insuranceRiskPools.id, id));
    
    return Number(riskPool?.currentBalance || 0);
  }

  async updateRiskPoolBalance(id: number, amount: number, isDeposit: boolean): Promise<InsuranceRiskPool | undefined> {
    const riskPool = await this.getRiskPool(id);
    if (!riskPool) return undefined;
    
    const currentBalance = Number(riskPool.currentBalance);
    const newBalance = isDeposit 
      ? currentBalance + amount 
      : Math.max(0, currentBalance - amount);
    
    const [updatedRiskPool] = await db
      .update(insuranceRiskPools)
      .set({ 
        currentBalance: newBalance.toString(),
        updatedAt: new Date()
      })
      .where(eq(insuranceRiskPools.id, id))
      .returning();
    
    return updatedRiskPool;
  }

  // Insurance Policy methods
  async getPolicy(id: number): Promise<InsurancePolicy | undefined> {
    const [policy] = await db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.id, id));
    return policy;
  }

  async getPolicyByNumber(policyNumber: string): Promise<InsurancePolicy | undefined> {
    const [policy] = await db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.policyNumber, policyNumber));
    return policy;
  }

  async getPoliciesByHolder(policyHolderId: number): Promise<InsurancePolicy[]> {
    return db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.policyHolderId, policyHolderId))
      .orderBy(desc(insurancePolicies.createdAt));
  }

  async getPoliciesByRiskPool(riskPoolId: number): Promise<InsurancePolicy[]> {
    return db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.riskPoolId, riskPoolId))
      .orderBy(desc(insurancePolicies.createdAt));
  }

  async getPoliciesByTribe(tribeId: number): Promise<InsurancePolicy[]> {
    return db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.tribeId, tribeId))
      .orderBy(desc(insurancePolicies.createdAt));
  }

  async createPolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy> {
    const [newPolicy] = await db
      .insert(insurancePolicies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async updatePolicy(id: number, policyData: Partial<InsertInsurancePolicy>): Promise<InsurancePolicy | undefined> {
    const [updatedPolicy] = await db
      .update(insurancePolicies)
      .set({ ...policyData, updatedAt: new Date() })
      .where(eq(insurancePolicies.id, id))
      .returning();
    return updatedPolicy;
  }

  async activatePolicy(id: number, startDate: Date, endDate: Date): Promise<InsurancePolicy | undefined> {
    const [activatedPolicy] = await db
      .update(insurancePolicies)
      .set({ 
        status: "active",
        startDate,
        endDate,
        updatedAt: new Date()
      })
      .where(eq(insurancePolicies.id, id))
      .returning();
    return activatedPolicy;
  }

  // Insurance Claim methods
  async getClaim(id: number): Promise<InsuranceClaim | undefined> {
    const [claim] = await db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.id, id));
    return claim;
  }

  async getClaimByNumber(claimNumber: string): Promise<InsuranceClaim | undefined> {
    const [claim] = await db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.claimNumber, claimNumber));
    return claim;
  }

  async getClaimsByPolicy(policyId: number): Promise<InsuranceClaim[]> {
    return db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.policyId, policyId))
      .orderBy(desc(insuranceClaims.filingDate));
  }

  async getClaimsByClaimant(claimantId: number): Promise<InsuranceClaim[]> {
    return db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.claimantId, claimantId))
      .orderBy(desc(insuranceClaims.filingDate));
  }

  async createClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim> {
    const [newClaim] = await db
      .insert(insuranceClaims)
      .values(claim)
      .returning();
    return newClaim;
  }

  async updateClaim(id: number, claimData: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim | undefined> {
    const [updatedClaim] = await db
      .update(insuranceClaims)
      .set({ ...claimData, updatedAt: new Date() })
      .where(eq(insuranceClaims.id, id))
      .returning();
    return updatedClaim;
  }

  async reviewClaim(
    id: number, 
    reviewedBy: number, 
    approved: boolean, 
    approvedAmount?: number, 
    notes?: string
  ): Promise<InsuranceClaim | undefined> {
    const status = approved ? "approved" : "rejected";
    
    const [reviewedClaim] = await db
      .update(insuranceClaims)
      .set({ 
        status,
        reviewedBy,
        approvedAmount: approved ? approvedAmount : null,
        reviewDate: new Date(),
        notes,
        updatedAt: new Date()
      })
      .where(eq(insuranceClaims.id, id))
      .returning();
    
    return reviewedClaim;
  }

  async settleClaim(id: number, transactionHash: string): Promise<InsuranceClaim | undefined> {
    const [settledClaim] = await db
      .update(insuranceClaims)
      .set({ 
        status: "paid",
        settlementDate: new Date(),
        settlementTransactionHash: transactionHash,
        updatedAt: new Date()
      })
      .where(eq(insuranceClaims.id, id))
      .returning();
    
    return settledClaim;
  }

  // Policy Premium methods
  async getPremium(id: number): Promise<PolicyPremium | undefined> {
    const [premium] = await db
      .select()
      .from(policyPremiums)
      .where(eq(policyPremiums.id, id));
    return premium;
  }

  async getPremiumsByPolicy(policyId: number): Promise<PolicyPremium[]> {
    return db
      .select()
      .from(policyPremiums)
      .where(eq(policyPremiums.policyId, policyId))
      .orderBy(asc(policyPremiums.dueDate));
  }

  async createPremium(premium: InsertPolicyPremium): Promise<PolicyPremium> {
    const [newPremium] = await db
      .insert(policyPremiums)
      .values(premium)
      .returning();
    return newPremium;
  }

  async recordPremiumPayment(id: number, transactionHash: string): Promise<PolicyPremium | undefined> {
    const [paidPremium] = await db
      .update(policyPremiums)
      .set({ 
        status: "paid",
        paidDate: new Date(),
        transactionHash,
        updatedAt: new Date()
      })
      .where(eq(policyPremiums.id, id))
      .returning();
    
    return paidPremium;
  }

  // IUL Policy methods
  async getIULPolicy(id: number): Promise<IULPolicy | undefined> {
    const [policy] = await db
      .select()
      .from(iulPolicies)
      .where(eq(iulPolicies.id, id));
    return policy;
  }

  async getIULPolicyByNumber(policyNumber: string): Promise<IULPolicy | undefined> {
    const [policy] = await db
      .select()
      .from(iulPolicies)
      .where(eq(iulPolicies.policyNumber, policyNumber));
    return policy;
  }

  async getIULPoliciesByMember(memberId: number): Promise<IULPolicy[]> {
    return db
      .select()
      .from(iulPolicies)
      .where(eq(iulPolicies.memberId, memberId))
      .orderBy(desc(iulPolicies.issueDate));
  }

  async createIULPolicy(policy: InsertIULPolicy): Promise<IULPolicy> {
    const [newPolicy] = await db
      .insert(iulPolicies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async updateIULPolicy(id: number, policyData: Partial<InsertIULPolicy>): Promise<IULPolicy | undefined> {
    const [updatedPolicy] = await db
      .update(iulPolicies)
      .set({ ...policyData, updatedAt: new Date() })
      .where(eq(iulPolicies.id, id))
      .returning();
    return updatedPolicy;
  }

  async indexIULPolicy(id: number, indexRate: number): Promise<IULPolicy | undefined> {
    // Get the current policy
    const policy = await this.getIULPolicy(id);
    if (!policy) return undefined;
    
    // Calculate new values based on index rate
    const currentValue = Number(policy.currentValue);
    const valueIncrease = currentValue * (indexRate / 100);
    const newValue = currentValue + valueIncrease;
    
    // Update the policy
    const [updatedPolicy] = await db
      .update(iulPolicies)
      .set({ 
        currentValue: newValue.toString(),
        cashValue: (Number(policy.cashValue) + valueIncrease * 0.8).toString(), // 80% of growth goes to cash value
        lastIndexingDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(iulPolicies.id, id))
      .returning();
    
    // Record the transaction
    await this.recordIULPolicyTransaction({
      policyId: id,
      transactionType: "indexing",
      amount: valueIncrease.toString(),
      description: `Policy indexed at ${indexRate}% rate`,
      transactionDate: new Date(),
      createdAt: new Date()
    });
    
    return updatedPolicy;
  }

  // IUL Policy Transaction methods
  async getIULPolicyTransactions(policyId: number): Promise<IULPolicyTransaction[]> {
    return db
      .select()
      .from(iulPolicyTransactions)
      .where(eq(iulPolicyTransactions.policyId, policyId))
      .orderBy(desc(iulPolicyTransactions.transactionDate));
  }

  async recordIULPolicyTransaction(transaction: InsertIULPolicyTransaction): Promise<IULPolicyTransaction> {
    const [newTransaction] = await db
      .insert(iulPolicyTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // LAO Governance methods
  async getGovernanceProposal(id: number): Promise<LAOGovernanceProposal | undefined> {
    const [proposal] = await db
      .select()
      .from(laoGovernanceProposals)
      .where(eq(laoGovernanceProposals.id, id));
    return proposal;
  }

  async getProposalsByLAO(laoId: number, activeOnly: boolean = false): Promise<LAOGovernanceProposal[]> {
    let query = db
      .select()
      .from(laoGovernanceProposals)
      .where(eq(laoGovernanceProposals.laoId, laoId));
    
    if (activeOnly) {
      const now = new Date();
      query = query.where(
        and(
          eq(laoGovernanceProposals.status, "active"),
          sql`${laoGovernanceProposals.endDate} > ${now}`
        )
      );
    }
    
    return query.orderBy(desc(laoGovernanceProposals.startDate));
  }

  async createGovernanceProposal(proposal: InsertLAOGovernanceProposal): Promise<LAOGovernanceProposal> {
    const [newProposal] = await db
      .insert(laoGovernanceProposals)
      .values(proposal)
      .returning();
    return newProposal;
  }

  async updateGovernanceProposal(
    id: number, 
    proposalData: Partial<InsertLAOGovernanceProposal>
  ): Promise<LAOGovernanceProposal | undefined> {
    const [updatedProposal] = await db
      .update(laoGovernanceProposals)
      .set({ ...proposalData, updatedAt: new Date() })
      .where(eq(laoGovernanceProposals.id, id))
      .returning();
    return updatedProposal;
  }

  async getVotesByProposal(proposalId: number): Promise<(LAOGovernanceVote & { voter: LAOMember })[]> {
    return db
      .select({
        vote: laoGovernanceVotes,
        voter: laoMembers
      })
      .from(laoGovernanceVotes)
      .innerJoin(laoMembers, eq(laoGovernanceVotes.voterId, laoMembers.id))
      .where(eq(laoGovernanceVotes.proposalId, proposalId))
      .orderBy(desc(laoGovernanceVotes.votedAt))
      .then(rows => rows.map(row => ({
        ...row.vote,
        voter: row.voter
      })));
  }

  async castVote(vote: InsertLAOGovernanceVote): Promise<LAOGovernanceVote> {
    // Check if voter has already voted on this proposal
    const [existingVote] = await db
      .select()
      .from(laoGovernanceVotes)
      .where(
        and(
          eq(laoGovernanceVotes.proposalId, vote.proposalId),
          eq(laoGovernanceVotes.voterId, vote.voterId)
        )
      );
    
    if (existingVote) {
      throw new Error("User has already voted on this proposal");
    }
    
    const [newVote] = await db
      .insert(laoGovernanceVotes)
      .values(vote)
      .returning();
    return newVote;
  }

  async getProposalResults(proposalId: number): Promise<{ 
    forVotes: number; 
    againstVotes: number; 
    abstainVotes: number; 
    totalVotes: number; 
  }> {
    const votes = await db
      .select({
        vote: laoGovernanceVotes.vote,
        weight: laoGovernanceVotes.voteWeight
      })
      .from(laoGovernanceVotes)
      .where(eq(laoGovernanceVotes.proposalId, proposalId));
    
    const results = {
      forVotes: 0,
      againstVotes: 0,
      abstainVotes: 0,
      totalVotes: votes.length
    };
    
    votes.forEach(v => {
      const weight = Number(v.weight);
      switch(v.vote) {
        case 'for':
          results.forVotes += weight;
          break;
        case 'against':
          results.againstVotes += weight;
          break;
        case 'abstain':
          results.abstainVotes += weight;
          break;
      }
    });
    
    return results;
  }
}

// Create an instance of the storage
export const storage = new DatabaseStorage();