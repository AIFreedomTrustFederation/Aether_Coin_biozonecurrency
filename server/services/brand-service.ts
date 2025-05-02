/**
 * Brand Service
 * Provides access to brand information and relationships
 */

import { db } from "../db";
import { 
  brands, brandFeatures, brandTechnologies, brandIntegrations, 
  brandTeamMembers, brandCaseStudies,
  type Brand, type BrandFeature, type BrandTechnology, type BrandIntegration,
  type BrandTeamMember, type BrandCaseStudy, type InsertBrand, 
  type InsertBrandFeature, type InsertBrandTechnology, type InsertBrandIntegration,
  type InsertBrandTeamMember, type InsertBrandCaseStudy
} from "@shared/schema";
import { eq, desc, asc, and, or } from "drizzle-orm";

/**
 * Brand Service class
 * Manages brand operations
 */
export class BrandService {
  /**
   * Get all brands
   */
  async getAllBrands(): Promise<Brand[]> {
    return db.select().from(brands).orderBy(asc(brands.priority), asc(brands.name));
  }

  /**
   * Get featured brands
   */
  async getFeaturedBrands(): Promise<Brand[]> {
    return db.select()
      .from(brands)
      .where(eq(brands.featured, true))
      .orderBy(asc(brands.priority), asc(brands.name));
  }

  /**
   * Get a brand by ID
   */
  async getBrandById(id: number): Promise<Brand | undefined> {
    const results = await db.select()
      .from(brands)
      .where(eq(brands.id, id));
    
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get a brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    const results = await db.select()
      .from(brands)
      .where(eq(brands.slug, slug));
    
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Get brands by category
   */
  async getBrandsByCategory(category: string): Promise<Brand[]> {
    return db.select()
      .from(brands)
      .where(eq(brands.category, category))
      .orderBy(asc(brands.priority), asc(brands.name));
  }

  /**
   * Get features for a brand
   */
  async getBrandFeatures(brandId: number): Promise<BrandFeature[]> {
    return db.select()
      .from(brandFeatures)
      .where(eq(brandFeatures.brandId, brandId))
      .orderBy(asc(brandFeatures.priority));
  }

  /**
   * Get technologies for a brand
   */
  async getBrandTechnologies(brandId: number): Promise<BrandTechnology[]> {
    return db.select()
      .from(brandTechnologies)
      .where(eq(brandTechnologies.brandId, brandId));
  }

  /**
   * Get all technologies with their open source alternatives
   */
  async getTechnologiesWithAlternatives(brandId: number): Promise<(BrandTechnology & { alternative?: BrandTechnology })[]> {
    const technologies = await this.getBrandTechnologies(brandId);
    
    const result: (BrandTechnology & { alternative?: BrandTechnology })[] = [];
    
    for (const tech of technologies) {
      const item: BrandTechnology & { alternative?: BrandTechnology } = { ...tech };
      
      if (tech.openSourceAlternativeId) {
        const alternatives = await db.select()
          .from(brandTechnologies)
          .where(eq(brandTechnologies.id, tech.openSourceAlternativeId));
        
        if (alternatives.length > 0) {
          item.alternative = alternatives[0];
        }
      }
      
      result.push(item);
    }
    
    return result;
  }

  /**
   * Get integrations for a brand (both where it's the source and target)
   */
  async getBrandIntegrations(brandId: number): Promise<
    (BrandIntegration & { 
      sourceBrand: Brand; 
      targetBrand: Brand;
    })[]
  > {
    const integrations = await db.select()
      .from(brandIntegrations)
      .where(
        or(
          eq(brandIntegrations.sourceBrandId, brandId),
          eq(brandIntegrations.targetBrandId, brandId)
        )
      );

    const result: (BrandIntegration & { sourceBrand: Brand; targetBrand: Brand })[] = [];

    for (const integration of integrations) {
      const sourceBrandResult = await db.select()
        .from(brands)
        .where(eq(brands.id, integration.sourceBrandId));
      
      const targetBrandResult = await db.select()
        .from(brands)
        .where(eq(brands.id, integration.targetBrandId));
      
      if (sourceBrandResult.length > 0 && targetBrandResult.length > 0) {
        result.push({
          ...integration,
          sourceBrand: sourceBrandResult[0],
          targetBrand: targetBrandResult[0]
        });
      }
    }

    return result;
  }

  /**
   * Get team members for a brand
   */
  async getBrandTeamMembers(brandId: number): Promise<BrandTeamMember[]> {
    return db.select()
      .from(brandTeamMembers)
      .where(eq(brandTeamMembers.brandId, brandId))
      .orderBy(asc(brandTeamMembers.priority));
  }

  /**
   * Get case studies for a brand
   */
  async getBrandCaseStudies(brandId: number): Promise<BrandCaseStudy[]> {
    return db.select()
      .from(brandCaseStudies)
      .where(eq(brandCaseStudies.brandId, brandId));
  }

  /**
   * Get full brand details including related entities
   */
  async getFullBrandDetails(brandIdOrSlug: number | string): Promise<{
    brand: Brand;
    features: BrandFeature[];
    technologies: (BrandTechnology & { alternative?: BrandTechnology })[];
    integrations: (BrandIntegration & { sourceBrand: Brand; targetBrand: Brand; })[];
    teamMembers: BrandTeamMember[];
    caseStudies: BrandCaseStudy[];
  } | null> {
    let brand: Brand | undefined;
    
    if (typeof brandIdOrSlug === 'number') {
      brand = await this.getBrandById(brandIdOrSlug);
    } else {
      brand = await this.getBrandBySlug(brandIdOrSlug);
    }
    
    if (!brand) {
      return null;
    }
    
    const features = await this.getBrandFeatures(brand.id);
    const technologies = await this.getTechnologiesWithAlternatives(brand.id);
    const integrations = await this.getBrandIntegrations(brand.id);
    const teamMembers = await this.getBrandTeamMembers(brand.id);
    const caseStudies = await this.getBrandCaseStudies(brand.id);
    
    return {
      brand,
      features,
      technologies,
      integrations,
      teamMembers,
      caseStudies
    };
  }

  /**
   * Create a new brand
   */
  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [result] = await db.insert(brands).values(brand).returning();
    return result;
  }

  /**
   * Update a brand
   */
  async updateBrand(id: number, data: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [result] = await db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();
    
    return result;
  }

  /**
   * Add a feature to a brand
   */
  async addBrandFeature(feature: InsertBrandFeature): Promise<BrandFeature> {
    const [result] = await db.insert(brandFeatures).values(feature).returning();
    return result;
  }

  /**
   * Add a technology to a brand
   */
  async addBrandTechnology(technology: InsertBrandTechnology): Promise<BrandTechnology> {
    const [result] = await db.insert(brandTechnologies).values(technology).returning();
    return result;
  }

  /**
   * Create a brand integration
   */
  async createBrandIntegration(integration: InsertBrandIntegration): Promise<BrandIntegration> {
    const [result] = await db.insert(brandIntegrations).values(integration).returning();
    return result;
  }

  /**
   * Add a team member to a brand
   */
  async addBrandTeamMember(teamMember: InsertBrandTeamMember): Promise<BrandTeamMember> {
    const [result] = await db.insert(brandTeamMembers).values(teamMember).returning();
    return result;
  }

  /**
   * Add a case study to a brand
   */
  async addBrandCaseStudy(caseStudy: InsertBrandCaseStudy): Promise<BrandCaseStudy> {
    const [result] = await db.insert(brandCaseStudies).values(caseStudy).returning();
    return result;
  }
}

export const brandService = new BrandService();