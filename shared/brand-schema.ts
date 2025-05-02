/**
 * AI Freedom Trust Framework - Brand Schema
 * Core types and schemas for brand showcase
 */

import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb, real, date } from 'drizzle-orm/pg-core';

// Brand entity schema
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description').notNull(),
  logoPath: text('logo_path'),
  bannerPath: text('banner_path'),
  primaryColor: text('primary_color'),
  secondaryColor: text('secondary_color'),
  category: text('category').notNull(), // ai, blockchain, security, development, infrastructure
  githubRepo: text('github_repo'),
  documentationUrl: text('documentation_url'),
  status: text('status').default('active').notNull(), // active, beta, archived
  featured: boolean('featured').default(false),
  priority: integer('priority').default(10),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Brand features schema
export const brandFeatures = pgTable('brand_features', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name'), // name of lucide icon
  priority: integer('priority').default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Technology stack items for brands
export const brandTechnologies = pgTable('brand_technologies', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // frontend, backend, database, infrastructure, ai, blockchain
  logoPath: text('logo_path'),
  isOpenSource: boolean('is_open_source').default(true),
  hasOwnImplementation: boolean('has_own_implementation').default(false),
  openSourceAlternativeId: integer('open_source_alternative_id').references(() => brandTechnologies.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Integration points between brands
export const brandIntegrations = pgTable('brand_integrations', {
  id: serial('id').primaryKey(),
  sourceBrandId: integer('source_brand_id').references(() => brands.id).notNull(),
  targetBrandId: integer('target_brand_id').references(() => brands.id).notNull(),
  integrationType: text('integration_type').notNull(), // uses, enhances, depends_on, extends
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Team members associated with brands
export const brandTeamMembers = pgTable('brand_team_members', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  avatarPath: text('avatar_path'),
  bio: text('bio'),
  priority: integer('priority').default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Case studies or examples of brand usage
export const brandCaseStudies = pgTable('brand_case_studies', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imagePath: text('image_path'),
  url: text('url'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create Zod schemas for data validation
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertBrandFeatureSchema = createInsertSchema(brandFeatures).omit({ id: true });
export const insertBrandTechnologySchema = createInsertSchema(brandTechnologies).omit({ id: true });
export const insertBrandIntegrationSchema = createInsertSchema(brandIntegrations).omit({ id: true });
export const insertBrandTeamMemberSchema = createInsertSchema(brandTeamMembers).omit({ id: true });
export const insertBrandCaseStudySchema = createInsertSchema(brandCaseStudies).omit({ id: true });

// TypeScript type definitions for use in the application
export type Brand = typeof brands.$inferSelect;
export type BrandFeature = typeof brandFeatures.$inferSelect;
export type BrandTechnology = typeof brandTechnologies.$inferSelect;
export type BrandIntegration = typeof brandIntegrations.$inferSelect;
export type BrandTeamMember = typeof brandTeamMembers.$inferSelect;
export type BrandCaseStudy = typeof brandCaseStudies.$inferSelect;

// Insert types for use with forms and API endpoints
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertBrandFeature = z.infer<typeof insertBrandFeatureSchema>;
export type InsertBrandTechnology = z.infer<typeof insertBrandTechnologySchema>;
export type InsertBrandIntegration = z.infer<typeof insertBrandIntegrationSchema>;
export type InsertBrandTeamMember = z.infer<typeof insertBrandTeamMemberSchema>;
export type InsertBrandCaseStudy = z.infer<typeof insertBrandCaseStudySchema>;