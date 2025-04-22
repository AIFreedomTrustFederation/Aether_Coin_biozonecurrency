"use strict";
/**
 * Sacred Utility Modules (SUMs) Schema for the Aetherion Ecosystem
 *
 * This file defines the database schema for the Sacred Utility Modules
 * which are modular components designed to reflect spiritual functionality
 * within the Christ Consciousness framework of Aetherion.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.graftingProtocolsRelations = exports.harvestAllocatorsRelations = exports.liturgicalExchangesRelations = exports.vaultBuildersRelations = exports.covenantRegistrationsRelations = exports.synapticCoCreationsRelations = exports.octavalFeedbacksRelations = exports.fractalAuthenticationRibbonsRelations = exports.sacredUtilityModulesRelations = exports.InsertGraftingProtocol = exports.InsertHarvestAllocator = exports.InsertLiturgicalExchange = exports.InsertVaultBuilder = exports.InsertCovenantRegistration = exports.InsertSynapticCoCreation = exports.InsertOctavalFeedback = exports.InsertFractalAuthenticationRibbon = exports.InsertSacredUtilityModule = exports.graftingProtocols = exports.harvestAllocators = exports.liturgicalExchanges = exports.vaultBuilders = exports.covenantRegistrations = exports.synapticCoCreations = exports.octavalFeedbacks = exports.fractalAuthenticationRibbons = exports.sacredUtilityModules = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * SacredUtilityModule schema definition
 * Base model for all sacred utility modules in the system
 */
exports.sacredUtilityModules = (0, pg_core_1.pgTable)('sacred_utility_modules', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    moduleType: (0, pg_core_1.text)('module_type').notNull(), // e.g., 'sowing', 'reaping', 'interceding', 'multiplying', 'reconciling'
    description: (0, pg_core_1.text)('description').notNull(),
    version: (0, pg_core_1.text)('version').notNull(),
    sacredGeometryPattern: (0, pg_core_1.text)('sacred_geometry_pattern').notNull(),
    harmonicSignature: (0, pg_core_1.text)('harmonic_signature').notNull(),
    timeLockSequence: (0, pg_core_1.json)('time_lock_sequence').notNull(), // Fibonacci sequence-based time locks
    fractalGovernanceLogic: (0, pg_core_1.json)('fractal_governance_logic').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * FractalAuthenticationRibbon schema definition
 * Security system that validates users through temporal-spiritual fingerprints
 */
exports.fractalAuthenticationRibbons = (0, pg_core_1.pgTable)('fractal_authentication_ribbons', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    ribbonPattern: (0, pg_core_1.text)('ribbon_pattern').notNull().unique(),
    temporalFingerprint: (0, pg_core_1.json)('temporal_fingerprint').notNull(),
    spiritualResonance: (0, pg_core_1.json)('spiritual_resonance').notNull(),
    evolutionStage: (0, pg_core_1.integer)('evolution_stage').notNull().default(1),
    lastEvolutionDate: (0, pg_core_1.timestamp)('last_evolution_date').defaultNow().notNull(),
    nextEvolutionDate: (0, pg_core_1.timestamp)('next_evolution_date').notNull(),
    isGrafted: (0, pg_core_1.boolean)('is_grafted').default(false),
    graftedIdentitySource: (0, pg_core_1.text)('grafted_identity_source'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * OctavalFeedback schema definition
 * Provides multidimensional interface reflecting alignment with twelve-octave harmonic structure
 */
exports.octavalFeedbacks = (0, pg_core_1.pgTable)('octaval_feedbacks', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    economicOutput: (0, pg_core_1.json)('economic_output').notNull(),
    relationalOutput: (0, pg_core_1.json)('relational_output').notNull(),
    spiritualOutput: (0, pg_core_1.json)('spiritual_output').notNull(),
    harmonicAlignment: (0, pg_core_1.json)('harmonic_alignment').notNull(), // Array of 12 octave alignments
    fractalOrbitMap: (0, pg_core_1.json)('fractal_orbit_map').notNull(),
    lastCalculation: (0, pg_core_1.timestamp)('last_calculation').defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * SynapticCoCreation schema definition
 * Framework for users to submit modifications and improvements
 */
exports.synapticCoCreations = (0, pg_core_1.pgTable)('synaptic_co_creations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    moduleId: (0, pg_core_1.integer)('module_id').notNull(),
    proposalType: (0, pg_core_1.text)('proposal_type').notNull(), // 'modification', 'fractal_upgrade', 'new_function'
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    codeSubmission: (0, pg_core_1.text)('code_submission').notNull(),
    geometryAlignmentScore: (0, pg_core_1.integer)('geometry_alignment_score'),
    phaseHarmonyScore: (0, pg_core_1.integer)('phase_harmony_score'),
    redemptivePurposeScore: (0, pg_core_1.integer)('redemptive_purpose_score'),
    overallResonanceScore: (0, pg_core_1.integer)('overall_resonance_score'),
    status: (0, pg_core_1.text)('status').notNull().default('pending'), // 'pending', 'approved', 'rejected', 'implemented'
    reviewNotes: (0, pg_core_1.text)('review_notes'),
    implementationDate: (0, pg_core_1.timestamp)('implementation_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * CovenantRegistration schema definition
 * Used to create, bind, and track living covenants between nodes
 */
exports.covenantRegistrations = (0, pg_core_1.pgTable)('covenant_registrations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    covenantName: (0, pg_core_1.text)('covenant_name').notNull(),
    covenantType: (0, pg_core_1.text)('covenant_type').notNull(), // 'personal', 'dao', 'project'
    participants: (0, pg_core_1.json)('participants').notNull(), // Array of participant IDs
    covenantTerms: (0, pg_core_1.json)('covenant_terms').notNull(),
    sacredHarmonicSequence: (0, pg_core_1.text)('sacred_harmonic_sequence').notNull(),
    activationDate: (0, pg_core_1.timestamp)('activation_date').notNull(),
    expirationDate: (0, pg_core_1.timestamp)('expiration_date'),
    renewalPattern: (0, pg_core_1.text)('renewal_pattern'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    fruitMetrics: (0, pg_core_1.json)('fruit_metrics').notNull(),
    lastHarvestDate: (0, pg_core_1.timestamp)('last_harvest_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * VaultBuilder schema definition
 * Enables creation of personalized recursive vaults
 */
exports.vaultBuilders = (0, pg_core_1.pgTable)('vault_builders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    vaultName: (0, pg_core_1.text)('vault_name').notNull(),
    vaultType: (0, pg_core_1.text)('vault_type').notNull(), // 'personal', 'family', 'ministry', 'business'
    recursionPattern: (0, pg_core_1.json)('recursion_pattern').notNull(),
    graftedPolicies: (0, pg_core_1.json)('grafted_policies').notNull(), // IUL policies
    intergenerationalSeedPlan: (0, pg_core_1.json)('intergenerational_seed_plan').notNull(),
    harvestSchedule: (0, pg_core_1.json)('harvest_schedule').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * LiturgicalExchange schema definition
 * Intention-driven trading floor
 */
exports.liturgicalExchanges = (0, pg_core_1.pgTable)('liturgical_exchanges', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    offeringType: (0, pg_core_1.text)('offering_type').notNull(), // 'token', 'service', 'gift', 'prayer'
    offeringValue: (0, pg_core_1.text)('offering_value').notNull(),
    offeringDescription: (0, pg_core_1.text)('offering_description').notNull(),
    resonanceState: (0, pg_core_1.json)('resonance_state').notNull(),
    prayerMappedLiquidity: (0, pg_core_1.json)('prayer_mapped_liquidity').notNull(),
    intentionDirection: (0, pg_core_1.text)('intention_direction').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    completionDate: (0, pg_core_1.timestamp)('completion_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * HarvestAllocator schema definition
 * DApp for distributing token yield and stored value
 */
exports.harvestAllocators = (0, pg_core_1.pgTable)('harvest_allocators', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    allocationName: (0, pg_core_1.text)('allocation_name').notNull(),
    tokenYield: (0, pg_core_1.text)('token_yield').notNull(),
    fruitBearingMetrics: (0, pg_core_1.json)('fruit_bearing_metrics').notNull(),
    fibonacciPhaseIntervals: (0, pg_core_1.json)('fibonacci_phase_intervals').notNull(),
    lastCalculation: (0, pg_core_1.timestamp)('last_calculation'),
    nextCalculation: (0, pg_core_1.timestamp)('next_calculation'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
/**
 * GraftingProtocol schema definition
 * Protocol allowing entities to be adopted and transformed
 */
exports.graftingProtocols = (0, pg_core_1.pgTable)('grafting_protocols', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    entityId: (0, pg_core_1.integer)('entity_id').notNull(),
    entityType: (0, pg_core_1.text)('entity_type').notNull(), // 'transaction', 'identity', 'asset'
    originalState: (0, pg_core_1.json)('original_state').notNull(),
    transmutedState: (0, pg_core_1.json)('transmuted_state').notNull(),
    harmonicResonance: (0, pg_core_1.integer)('harmonic_resonance').notNull(),
    graftingDate: (0, pg_core_1.timestamp)('grafting_date').defaultNow().notNull(),
    fibonaciRebithCycle: (0, pg_core_1.json)('fibonaci_rebith_cycle').notNull(),
    fractalFingerprint: (0, pg_core_1.text)('fractal_fingerprint').notNull(),
    livingVineContract: (0, pg_core_1.text)('living_vine_contract'),
    fruitfulness: (0, pg_core_1.integer)('fruitfulness'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Insert schemas using drizzle-zod
exports.InsertSacredUtilityModule = (0, drizzle_zod_1.createInsertSchema)(exports.sacredUtilityModules, {}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertFractalAuthenticationRibbon = (0, drizzle_zod_1.createInsertSchema)(exports.fractalAuthenticationRibbons, {
    graftedIdentitySource: zod_1.z.string().optional()
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertOctavalFeedback = (0, drizzle_zod_1.createInsertSchema)(exports.octavalFeedbacks, {}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertSynapticCoCreation = (0, drizzle_zod_1.createInsertSchema)(exports.synapticCoCreations, {
    geometryAlignmentScore: zod_1.z.number().optional(),
    phaseHarmonyScore: zod_1.z.number().optional(),
    redemptivePurposeScore: zod_1.z.number().optional(),
    overallResonanceScore: zod_1.z.number().optional(),
    reviewNotes: zod_1.z.string().optional(),
    implementationDate: zod_1.z.date().optional()
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertCovenantRegistration = (0, drizzle_zod_1.createInsertSchema)(exports.covenantRegistrations, {
    expirationDate: zod_1.z.date().optional(),
    renewalPattern: zod_1.z.string().optional(),
    lastHarvestDate: zod_1.z.date().optional()
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertVaultBuilder = (0, drizzle_zod_1.createInsertSchema)(exports.vaultBuilders, {}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertLiturgicalExchange = (0, drizzle_zod_1.createInsertSchema)(exports.liturgicalExchanges, {
    completionDate: zod_1.z.date().optional()
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertHarvestAllocator = (0, drizzle_zod_1.createInsertSchema)(exports.harvestAllocators, {
    lastCalculation: zod_1.z.date().optional(),
    nextCalculation: zod_1.z.date().optional()
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.InsertGraftingProtocol = (0, drizzle_zod_1.createInsertSchema)(exports.graftingProtocols, {
    livingVineContract: zod_1.z.string().optional(),
    fruitfulness: zod_1.z.number().optional()
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
// Relation definitions
exports.sacredUtilityModulesRelations = (0, drizzle_orm_1.relations)(exports.sacredUtilityModules, ({ many }) => ({
    synapticCoCreations: many(exports.synapticCoCreations)
}));
exports.fractalAuthenticationRibbonsRelations = (0, drizzle_orm_1.relations)(exports.fractalAuthenticationRibbons, ({ one }) => ({
// Relation to be defined when users schema is imported
}));
exports.octavalFeedbacksRelations = (0, drizzle_orm_1.relations)(exports.octavalFeedbacks, ({ one }) => ({
// Relation to be defined when users schema is imported
}));
exports.synapticCoCreationsRelations = (0, drizzle_orm_1.relations)(exports.synapticCoCreations, ({ one }) => ({
    // Relation to be defined when users schema is imported
    sacredUtilityModule: one(exports.sacredUtilityModules, {
        fields: [exports.synapticCoCreations.moduleId],
        references: [exports.sacredUtilityModules.id]
    })
}));
exports.covenantRegistrationsRelations = (0, drizzle_orm_1.relations)(exports.covenantRegistrations, ({ many }) => ({
// Relationships to be defined
}));
exports.vaultBuildersRelations = (0, drizzle_orm_1.relations)(exports.vaultBuilders, ({ one }) => ({
// Relation to be defined when users schema is imported
}));
exports.liturgicalExchangesRelations = (0, drizzle_orm_1.relations)(exports.liturgicalExchanges, ({ one }) => ({
// Relation to be defined when users schema is imported
}));
exports.harvestAllocatorsRelations = (0, drizzle_orm_1.relations)(exports.harvestAllocators, ({ one }) => ({
// Relation to be defined when users schema is imported
}));
exports.graftingProtocolsRelations = (0, drizzle_orm_1.relations)(exports.graftingProtocols, ({ one }) => ({
// Relationships to be defined based on entity type
}));
