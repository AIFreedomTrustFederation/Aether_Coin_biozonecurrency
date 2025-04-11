/**
 * Sacred Utility Modules (SUMs) Schema for the Aetherion Ecosystem
 * 
 * This file defines the database schema for the Sacred Utility Modules
 * which are modular components designed to reflect spiritual functionality
 * within the Christ Consciousness framework of Aetherion.
 */

import { pgTable, serial, text, timestamp, boolean, integer, json, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

/**
 * SacredUtilityModule schema definition
 * Base model for all sacred utility modules in the system
 */
export const sacredUtilityModules = pgTable('sacred_utility_modules', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  moduleType: text('module_type').notNull(), // e.g., 'sowing', 'reaping', 'interceding', 'multiplying', 'reconciling'
  description: text('description').notNull(),
  version: text('version').notNull(),
  sacredGeometryPattern: text('sacred_geometry_pattern').notNull(),
  harmonicSignature: text('harmonic_signature').notNull(),
  timeLockSequence: json('time_lock_sequence').notNull(), // Fibonacci sequence-based time locks
  fractalGovernanceLogic: json('fractal_governance_logic').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * FractalAuthenticationRibbon schema definition
 * Security system that validates users through temporal-spiritual fingerprints
 */
export const fractalAuthenticationRibbons = pgTable('fractal_authentication_ribbons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  ribbonPattern: text('ribbon_pattern').notNull().unique(),
  temporalFingerprint: json('temporal_fingerprint').notNull(),
  spiritualResonance: json('spiritual_resonance').notNull(),
  evolutionStage: integer('evolution_stage').notNull().default(1),
  lastEvolutionDate: timestamp('last_evolution_date').defaultNow().notNull(),
  nextEvolutionDate: timestamp('next_evolution_date').notNull(),
  isGrafted: boolean('is_grafted').default(false),
  graftedIdentitySource: text('grafted_identity_source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * OctavalFeedback schema definition
 * Provides multidimensional interface reflecting alignment with twelve-octave harmonic structure
 */
export const octavalFeedbacks = pgTable('octaval_feedbacks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  economicOutput: json('economic_output').notNull(),
  relationalOutput: json('relational_output').notNull(),
  spiritualOutput: json('spiritual_output').notNull(),
  harmonicAlignment: json('harmonic_alignment').notNull(), // Array of 12 octave alignments
  fractalOrbitMap: json('fractal_orbit_map').notNull(),
  lastCalculation: timestamp('last_calculation').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * SynapticCoCreation schema definition
 * Framework for users to submit modifications and improvements
 */
export const synapticCoCreations = pgTable('synaptic_co_creations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  moduleId: integer('module_id').notNull(),
  proposalType: text('proposal_type').notNull(), // 'modification', 'fractal_upgrade', 'new_function'
  title: text('title').notNull(),
  description: text('description').notNull(),
  codeSubmission: text('code_submission').notNull(),
  geometryAlignmentScore: integer('geometry_alignment_score'),
  phaseHarmonyScore: integer('phase_harmony_score'),
  redemptivePurposeScore: integer('redemptive_purpose_score'),
  overallResonanceScore: integer('overall_resonance_score'),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected', 'implemented'
  reviewNotes: text('review_notes'),
  implementationDate: timestamp('implementation_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * CovenantRegistration schema definition
 * Used to create, bind, and track living covenants between nodes
 */
export const covenantRegistrations = pgTable('covenant_registrations', {
  id: serial('id').primaryKey(),
  covenantName: text('covenant_name').notNull(),
  covenantType: text('covenant_type').notNull(), // 'personal', 'dao', 'project'
  participants: json('participants').notNull(), // Array of participant IDs
  covenantTerms: json('covenant_terms').notNull(),
  sacredHarmonicSequence: text('sacred_harmonic_sequence').notNull(),
  activationDate: timestamp('activation_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  renewalPattern: text('renewal_pattern'),
  isActive: boolean('is_active').default(true),
  fruitMetrics: json('fruit_metrics').notNull(),
  lastHarvestDate: timestamp('last_harvest_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * VaultBuilder schema definition
 * Enables creation of personalized recursive vaults
 */
export const vaultBuilders = pgTable('vault_builders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  vaultName: text('vault_name').notNull(),
  vaultType: text('vault_type').notNull(), // 'personal', 'family', 'ministry', 'business'
  recursionPattern: json('recursion_pattern').notNull(),
  graftedPolicies: json('grafted_policies').notNull(), // IUL policies
  intergenerationalSeedPlan: json('intergenerational_seed_plan').notNull(),
  harvestSchedule: json('harvest_schedule').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * LiturgicalExchange schema definition
 * Intention-driven trading floor
 */
export const liturgicalExchanges = pgTable('liturgical_exchanges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  offeringType: text('offering_type').notNull(), // 'token', 'service', 'gift', 'prayer'
  offeringValue: text('offering_value').notNull(),
  offeringDescription: text('offering_description').notNull(),
  resonanceState: json('resonance_state').notNull(),
  prayerMappedLiquidity: json('prayer_mapped_liquidity').notNull(),
  intentionDirection: text('intention_direction').notNull(),
  isActive: boolean('is_active').default(true),
  completionDate: timestamp('completion_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * HarvestAllocator schema definition
 * DApp for distributing token yield and stored value
 */
export const harvestAllocators = pgTable('harvest_allocators', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  allocationName: text('allocation_name').notNull(),
  tokenYield: text('token_yield').notNull(),
  fruitBearingMetrics: json('fruit_bearing_metrics').notNull(),
  fibonacciPhaseIntervals: json('fibonacci_phase_intervals').notNull(),
  lastCalculation: timestamp('last_calculation'),
  nextCalculation: timestamp('next_calculation'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * GraftingProtocol schema definition
 * Protocol allowing entities to be adopted and transformed
 */
export const graftingProtocols = pgTable('grafting_protocols', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull(),
  entityType: text('entity_type').notNull(), // 'transaction', 'identity', 'asset'
  originalState: json('original_state').notNull(),
  transmutedState: json('transmuted_state').notNull(),
  harmonicResonance: integer('harmonic_resonance').notNull(),
  graftingDate: timestamp('grafting_date').defaultNow().notNull(),
  fibonaciRebithCycle: json('fibonaci_rebith_cycle').notNull(),
  fractalFingerprint: text('fractal_fingerprint').notNull(),
  livingVineContract: text('living_vine_contract'),
  fruitfulness: integer('fruitfulness'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Insert schemas using drizzle-zod
export const InsertSacredUtilityModule = createInsertSchema(sacredUtilityModules, {}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertFractalAuthenticationRibbon = createInsertSchema(fractalAuthenticationRibbons, {
  graftedIdentitySource: z.string().optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertOctavalFeedback = createInsertSchema(octavalFeedbacks, {}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertSynapticCoCreation = createInsertSchema(synapticCoCreations, {
  geometryAlignmentScore: z.number().optional(),
  phaseHarmonyScore: z.number().optional(),
  redemptivePurposeScore: z.number().optional(),
  overallResonanceScore: z.number().optional(),
  reviewNotes: z.string().optional(),
  implementationDate: z.date().optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertCovenantRegistration = createInsertSchema(covenantRegistrations, {
  expirationDate: z.date().optional(),
  renewalPattern: z.string().optional(),
  lastHarvestDate: z.date().optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertVaultBuilder = createInsertSchema(vaultBuilders, {}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertLiturgicalExchange = createInsertSchema(liturgicalExchanges, {
  completionDate: z.date().optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertHarvestAllocator = createInsertSchema(harvestAllocators, {
  lastCalculation: z.date().optional(),
  nextCalculation: z.date().optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const InsertGraftingProtocol = createInsertSchema(graftingProtocols, {
  livingVineContract: z.string().optional(),
  fruitfulness: z.number().optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Type definitions using z.infer
export type SacredUtilityModule = typeof sacredUtilityModules.$inferSelect;
export type InsertSacredUtilityModuleType = z.infer<typeof InsertSacredUtilityModule>;

export type FractalAuthenticationRibbon = typeof fractalAuthenticationRibbons.$inferSelect;
export type InsertFractalAuthenticationRibbonType = z.infer<typeof InsertFractalAuthenticationRibbon>;

export type OctavalFeedback = typeof octavalFeedbacks.$inferSelect;
export type InsertOctavalFeedbackType = z.infer<typeof InsertOctavalFeedback>;

export type SynapticCoCreation = typeof synapticCoCreations.$inferSelect;
export type InsertSynapticCoCreationType = z.infer<typeof InsertSynapticCoCreation>;

export type CovenantRegistration = typeof covenantRegistrations.$inferSelect;
export type InsertCovenantRegistrationType = z.infer<typeof InsertCovenantRegistration>;

export type VaultBuilder = typeof vaultBuilders.$inferSelect;
export type InsertVaultBuilderType = z.infer<typeof InsertVaultBuilder>;

export type LiturgicalExchange = typeof liturgicalExchanges.$inferSelect;
export type InsertLiturgicalExchangeType = z.infer<typeof InsertLiturgicalExchange>;

export type HarvestAllocator = typeof harvestAllocators.$inferSelect;
export type InsertHarvestAllocatorType = z.infer<typeof InsertHarvestAllocator>;

export type GraftingProtocol = typeof graftingProtocols.$inferSelect;
export type InsertGraftingProtocolType = z.infer<typeof InsertGraftingProtocol>;

// Relation definitions
export const sacredUtilityModulesRelations = relations(sacredUtilityModules, ({ many }) => ({
  synapticCoCreations: many(synapticCoCreations)
}));

export const fractalAuthenticationRibbonsRelations = relations(fractalAuthenticationRibbons, ({ one }) => ({
  // Relation to be defined when users schema is imported
}));

export const octavalFeedbacksRelations = relations(octavalFeedbacks, ({ one }) => ({
  // Relation to be defined when users schema is imported
}));

export const synapticCoCreationsRelations = relations(synapticCoCreations, ({ one }) => ({
  // Relation to be defined when users schema is imported
  sacredUtilityModule: one(sacredUtilityModules, {
    fields: [synapticCoCreations.moduleId],
    references: [sacredUtilityModules.id]
  })
}));

export const covenantRegistrationsRelations = relations(covenantRegistrations, ({ many }) => ({
  // Relationships to be defined
}));

export const vaultBuildersRelations = relations(vaultBuilders, ({ one }) => ({
  // Relation to be defined when users schema is imported
}));

export const liturgicalExchangesRelations = relations(liturgicalExchanges, ({ one }) => ({
  // Relation to be defined when users schema is imported
}));

export const harvestAllocatorsRelations = relations(harvestAllocators, ({ one }) => ({
  // Relation to be defined when users schema is imported
}));

export const graftingProtocolsRelations = relations(graftingProtocols, ({ one }) => ({
  // Relationships to be defined based on entity type
}));