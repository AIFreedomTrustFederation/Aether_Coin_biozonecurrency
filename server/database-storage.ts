/**
 * DatabaseStorage implementation
 * 
 * This file implements the IStorage interface using PostgreSQL via Drizzle ORM
 */

import { 
  users, User, InsertUser,
  llmPrompts, LlmPrompt, InsertLlmPrompt,
  llmConversations, LlmConversation, InsertLlmConversation,
  llmMessages, LlmMessage, InsertLlmMessage,
  llmFineTuningJobs, LlmFineTuningJob, InsertLlmFineTuningJob,
  sacredPatternRecords, SacredPatternRecord, InsertSacredPatternRecord,
  aiMonitoringLogs, smartContracts, cidEntries, paymentMethods, payments
} from "../shared/schema-proxy";
import { db } from "./db";
import { eq, desc, and, sql, count, avg, isNull } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  /**
   * User Methods
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  /**
   * LLM Prompt Methods
   */
  async getLlmPrompt(id: number): Promise<LlmPrompt | undefined> {
    const [prompt] = await db.select().from(llmPrompts).where(eq(llmPrompts.id, id));
    return prompt;
  }

  async getLlmPromptsByCategory(category: string): Promise<LlmPrompt[]> {
    return db.select().from(llmPrompts).where(eq(llmPrompts.category, category));
  }

  async createLlmPrompt(prompt: InsertLlmPrompt): Promise<LlmPrompt> {
    const [newPrompt] = await db.insert(llmPrompts).values({
      ...prompt,
      updatedAt: new Date()
    }).returning();
    return newPrompt;
  }

  async updateLlmPrompt(id: number, prompt: Partial<InsertLlmPrompt>): Promise<LlmPrompt | undefined> {
    const [updatedPrompt] = await db
      .update(llmPrompts)
      .set({
        ...prompt,
        updatedAt: new Date()
      })
      .where(eq(llmPrompts.id, id))
      .returning();
    return updatedPrompt;
  }

  /**
   * LLM Conversation Methods
   */
  async getLlmConversation(id: number): Promise<LlmConversation | undefined> {
    const [conversation] = await db.select().from(llmConversations).where(eq(llmConversations.id, id));
    return conversation;
  }

  async getLlmConversationsByUserId(userId: number): Promise<LlmConversation[]> {
    return db
      .select()
      .from(llmConversations)
      .where(eq(llmConversations.userId, userId))
      .orderBy(desc(llmConversations.lastMessageAt));
  }

  async createLlmConversation(conversation: InsertLlmConversation): Promise<LlmConversation> {
    const now = new Date();
    const [newConversation] = await db.insert(llmConversations).values({
      ...conversation,
      startedAt: now,
      lastMessageAt: now
    }).returning();
    return newConversation;
  }

  async updateLlmConversation(
    id: number, 
    conversation: Partial<InsertLlmConversation>
  ): Promise<LlmConversation | undefined> {
    const [updatedConversation] = await db
      .update(llmConversations)
      .set({
        ...conversation,
        lastMessageAt: new Date()
      })
      .where(eq(llmConversations.id, id))
      .returning();
    return updatedConversation;
  }

  /**
   * LLM Message Methods
   */
  async getLlmMessage(id: number): Promise<LlmMessage | undefined> {
    const [message] = await db.select().from(llmMessages).where(eq(llmMessages.id, id));
    return message;
  }

  async getLlmMessagesByConversationId(conversationId: number): Promise<LlmMessage[]> {
    return db
      .select()
      .from(llmMessages)
      .where(eq(llmMessages.conversationId, conversationId))
      .orderBy(llmMessages.timestamp);
  }

  async createLlmMessage(message: InsertLlmMessage): Promise<LlmMessage> {
    const [newMessage] = await db.insert(llmMessages).values(message).returning();
    
    // Update the last message timestamp on the conversation
    await db
      .update(llmConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(llmConversations.id, message.conversationId));
      
    return newMessage;
  }

  async getLlmConversationWithMessages(
    conversationId: number
  ): Promise<{ conversation: LlmConversation; messages: LlmMessage[] } | undefined> {
    const conversation = await this.getLlmConversation(conversationId);
    if (!conversation) return undefined;
    
    const messages = await this.getLlmMessagesByConversationId(conversationId);
    return { conversation, messages };
  }

  /**
   * LLM Fine-tuning Methods
   */
  async getLlmFineTuningJob(id: number): Promise<LlmFineTuningJob | undefined> {
    const [job] = await db.select().from(llmFineTuningJobs).where(eq(llmFineTuningJobs.id, id));
    return job;
  }

  async getLlmFineTuningJobsByUserId(userId: number): Promise<LlmFineTuningJob[]> {
    return db
      .select()
      .from(llmFineTuningJobs)
      .where(eq(llmFineTuningJobs.userId, userId))
      .orderBy(desc(llmFineTuningJobs.startedAt));
  }

  async createLlmFineTuningJob(job: InsertLlmFineTuningJob): Promise<LlmFineTuningJob> {
    const [newJob] = await db.insert(llmFineTuningJobs).values(job).returning();
    return newJob;
  }

  async updateLlmFineTuningJobStatus(
    id: number, 
    status: string, 
    metrics?: any
  ): Promise<LlmFineTuningJob | undefined> {
    const updateData: any = { status };
    
    if (status === 'succeeded' || status === 'failed') {
      updateData.completedAt = new Date();
    }
    
    if (metrics) {
      updateData.metrics = metrics;
    }
    
    const [updatedJob] = await db
      .update(llmFineTuningJobs)
      .set(updateData)
      .where(eq(llmFineTuningJobs.id, id))
      .returning();
      
    return updatedJob;
  }

  /**
   * Sacred Pattern Methods
   */
  async getSacredPatternRecord(id: number): Promise<SacredPatternRecord | undefined> {
    const [record] = await db.select().from(sacredPatternRecords).where(eq(sacredPatternRecords.id, id));
    return record;
  }

  async getSacredPatternRecordsByUserId(userId: number): Promise<SacredPatternRecord[]> {
    return db
      .select()
      .from(sacredPatternRecords)
      .where(eq(sacredPatternRecords.userId, userId))
      .orderBy(desc(sacredPatternRecords.timestamp));
  }

  async createSacredPatternRecord(record: InsertSacredPatternRecord): Promise<SacredPatternRecord> {
    const [newRecord] = await db.insert(sacredPatternRecords).values(record).returning();
    return newRecord;
  }

  async getSacredPatternAnalytics(userId: number): Promise<{
    averageGoldenRatio: number;
    averageHarmonicScore: number;
    dominantPrinciples: string[];
  }> {
    // Get average scores
    const [averages] = await db
      .select({
        goldenRatio: avg(sacredPatternRecords.goldenRatioAlignment),
        harmonic: avg(sacredPatternRecords.temporalHarmonicScore)
      })
      .from(sacredPatternRecords)
      .where(eq(sacredPatternRecords.userId, userId));
      
    // Find dominant principles
    const principles = await db
      .select({
        principle: sacredPatternRecords.divinePrinciple,
        count: count(sacredPatternRecords.id)
      })
      .from(sacredPatternRecords)
      .where(and(
        eq(sacredPatternRecords.userId, userId),
        sql`${sacredPatternRecords.divinePrinciple} is not null`
      ))
      .groupBy(sacredPatternRecords.divinePrinciple)
      .orderBy(desc(sql`count`))
      .limit(3);
    
    return {
      averageGoldenRatio: averages?.goldenRatio || 0,
      averageHarmonicScore: averages?.harmonic || 0,
      dominantPrinciples: principles.map(p => p.principle || 'Unknown')
    };
  }

  /**
   * AI Monitoring Methods
   */
  async logAiActivity(userId: number, action: string, details: any): Promise<void> {
    await db.insert(aiMonitoringLogs).values({
      userId,
      timestamp: new Date(),
      action,
      details
    });
  }

  async getAiActivityLogsByUserId(userId: number, limit: number = 100): Promise<any[]> {
    return db
      .select()
      .from(aiMonitoringLogs)
      .where(eq(aiMonitoringLogs.userId, userId))
      .orderBy(desc(aiMonitoringLogs.timestamp))
      .limit(limit);
  }

  async getAiActivitySummary(userId: number): Promise<{ 
    totalInteractions: number; 
    lastInteractionDate: Date | null; 
  }> {
    // Get total count
    const [countResult] = await db
      .select({ count: count() })
      .from(aiMonitoringLogs)
      .where(eq(aiMonitoringLogs.userId, userId));
    
    // Get latest interaction
    const [latestRecord] = await db
      .select({ timestamp: aiMonitoringLogs.timestamp })
      .from(aiMonitoringLogs)
      .where(eq(aiMonitoringLogs.userId, userId))
      .orderBy(desc(aiMonitoringLogs.timestamp))
      .limit(1);
    
    return {
      totalInteractions: countResult?.count || 0,
      lastInteractionDate: latestRecord?.timestamp || null
    };
  }

  /**
   * Smart Contract Methods
   */
  async getSmartContractsByUserId(userId: number): Promise<any[]> {
    return db
      .select()
      .from(smartContracts)
      .where(eq(smartContracts.userId, userId))
      .orderBy(desc(smartContracts.id));
  }

  async createSmartContract(data: any): Promise<any> {
    const [contract] = await db.insert(smartContracts).values(data).returning();
    return contract;
  }

  async updateSmartContractStatus(id: number, status: string): Promise<any> {
    const [contract] = await db
      .update(smartContracts)
      .set({ status })
      .where(eq(smartContracts.id, id))
      .returning();
    return contract;
  }

  /**
   * CID/IPFS Methods
   */
  async getCidEntriesByUserId(userId: number): Promise<any[]> {
    return db
      .select()
      .from(cidEntries)
      .where(eq(cidEntries.userId, userId))
      .orderBy(desc(cidEntries.timestamp));
  }

  async createCidEntry(data: any): Promise<any> {
    const [entry] = await db.insert(cidEntries).values({
      ...data,
      timestamp: new Date()
    }).returning();
    return entry;
  }

  async updateCidEntryMetadata(id: number, metadata: any): Promise<any> {
    const [entry] = await db
      .update(cidEntries)
      .set({ 
        metadata,
        timestamp: new Date() 
      })
      .where(eq(cidEntries.id, id))
      .returning();
    return entry;
  }

  /**
   * Payment Methods
   */
  async getPaymentMethodsByUserId(userId: number): Promise<any[]> {
    return db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
  }

  async createPaymentMethod(data: any): Promise<any> {
    const [method] = await db.insert(paymentMethods).values(data).returning();
    return method;
  }

  async getPaymentHistory(userId: number, limit: number = 20): Promise<any[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.timestamp))
      .limit(limit);
  }
}