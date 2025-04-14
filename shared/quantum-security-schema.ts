/**
 * Quantum Security Schema
 * 
 * This file defines the database schema for quantum security events, recommendations,
 * and learnings using Drizzle ORM and Zod validation.
 */

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// Enum for quantum security levels
export enum QuantumSecurityLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  QUANTUM = 'quantum'
}

// Enum for post-quantum algorithms
export enum PostQuantumAlgorithm {
  KYBER = 'kyber',
  DILITHIUM = 'dilithium',
  SPHINCS = 'sphincs',
  FALCON = 'falcon',
  HYBRID = 'hybrid'
}

// Enum for event types
export enum QuantumEventType {
  KEY_GENERATION = 'key_generation',
  ENCRYPTION = 'encryption',
  DECRYPTION = 'decryption',
  SIGNATURE = 'signature',
  VERIFICATION = 'verification',
  AUTHENTICATION = 'authentication',
  PAYMENT = 'payment',
  ATTACK_ATTEMPT = 'attack_attempt',
  ANOMALY = 'anomaly'
}

// Enum for recommendation types
export enum RecommendationType {
  ALGORITHM_CHANGE = 'algorithm_change',
  SECURITY_LEVEL_INCREASE = 'security_level_increase',
  CONFIGURATION_CHANGE = 'configuration_change',
  USER_EDUCATION = 'user_education',
  SYSTEM_UPDATE = 'system_update'
}

// Enum for impact levels
export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Enum for learning types
export enum LearningType {
  PATTERN_RECOGNITION = 'pattern_recognition',
  THREAT_IDENTIFICATION = 'threat_identification',
  USER_BEHAVIOR = 'user_behavior',
  ALGORITHM_PERFORMANCE = 'algorithm_performance',
  SYSTEM_OPTIMIZATION = 'system_optimization'
}

// Quantum Security Events table
export const quantumSecurityEvents = pgTable('quantum_security_events', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  securityLevel: text('security_level').notNull(),
  algorithm: text('algorithm'),
  userId: integer('user_id').references(() => users.id),
  walletId: integer('wallet_id'),
  success: boolean('success').notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow()
});

// Relations for quantum security events
export const quantumSecurityEventsRelations = relations(quantumSecurityEvents, ({ one }) => ({
  user: one(users, {
    fields: [quantumSecurityEvents.userId],
    references: [users.id],
  }),
}));

// Quantum Security Recommendations table
export const quantumSecurityRecommendations = pgTable('quantum_security_recommendations', {
  id: serial('id').primaryKey(),
  recommendationId: text('recommendation_id').notNull().unique(),
  eventId: text('event_id'),
  recommendationType: text('recommendation_type').notNull(),
  description: text('description').notNull(),
  impact: text('impact').notNull(),
  automated: boolean('automated').notNull(),
  appliedAt: timestamp('applied_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations for quantum security recommendations
export const quantumSecurityRecommendationsRelations = relations(quantumSecurityRecommendations, ({ one }) => ({
  event: one(quantumSecurityEvents, {
    fields: [quantumSecurityRecommendations.eventId],
    references: [quantumSecurityEvents.eventId],
  }),
}));

// Quantum Security Learnings table
export const quantumSecurityLearnings = pgTable('quantum_security_learnings', {
  id: serial('id').primaryKey(),
  learningId: text('learning_id').notNull().unique(),
  learningType: text('learning_type').notNull(),
  description: text('description').notNull(),
  confidence: text('confidence').notNull(),
  dataPoints: integer('data_points').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

// Type definitions for TypeScript
export type QuantumSecurityEvent = typeof quantumSecurityEvents.$inferSelect;
export type InsertQuantumSecurityEvent = typeof quantumSecurityEvents.$inferInsert;

export type QuantumSecurityRecommendation = typeof quantumSecurityRecommendations.$inferSelect;
export type InsertQuantumSecurityRecommendation = typeof quantumSecurityRecommendations.$inferInsert;

export type QuantumSecurityLearning = typeof quantumSecurityLearnings.$inferSelect;
export type InsertQuantumSecurityLearning = typeof quantumSecurityLearnings.$inferInsert;

// Zod schemas for validation
export const quantumSecurityEventSchema = z.object({
  eventType: z.enum([
    QuantumEventType.KEY_GENERATION,
    QuantumEventType.ENCRYPTION,
    QuantumEventType.DECRYPTION,
    QuantumEventType.SIGNATURE,
    QuantumEventType.VERIFICATION,
    QuantumEventType.AUTHENTICATION,
    QuantumEventType.PAYMENT,
    QuantumEventType.ATTACK_ATTEMPT,
    QuantumEventType.ANOMALY
  ]),
  securityLevel: z.enum([
    QuantumSecurityLevel.STANDARD,
    QuantumSecurityLevel.ENHANCED,
    QuantumSecurityLevel.QUANTUM
  ]),
  algorithm: z.string().optional(),
  userId: z.number().optional(),
  walletId: z.number().optional(),
  success: z.boolean(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.number().default(() => Date.now())
});

export const securityRecommendationSchema = z.object({
  recommendationId: z.string(),
  eventId: z.string().optional(),
  recommendationType: z.enum([
    RecommendationType.ALGORITHM_CHANGE,
    RecommendationType.SECURITY_LEVEL_INCREASE,
    RecommendationType.CONFIGURATION_CHANGE,
    RecommendationType.USER_EDUCATION,
    RecommendationType.SYSTEM_UPDATE
  ]),
  description: z.string(),
  impact: z.enum([
    ImpactLevel.LOW,
    ImpactLevel.MEDIUM,
    ImpactLevel.HIGH,
    ImpactLevel.CRITICAL
  ]),
  automated: z.boolean(),
  appliedAt: z.number().optional(),
  createdAt: z.number().default(() => Date.now())
});

export const securityLearningSchema = z.object({
  learningId: z.string(),
  learningType: z.enum([
    LearningType.PATTERN_RECOGNITION,
    LearningType.THREAT_IDENTIFICATION,
    LearningType.USER_BEHAVIOR,
    LearningType.ALGORITHM_PERFORMANCE,
    LearningType.SYSTEM_OPTIMIZATION
  ]),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  dataPoints: z.number(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.number().default(() => Date.now())
});

// Types and schemas are already exported when they're defined
// No need to re-export them here