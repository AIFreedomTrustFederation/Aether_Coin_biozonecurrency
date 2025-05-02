/**
 * Brand API Routes
 */

import { Router, Request, Response } from 'express';
import { brandService } from '../services/brand-service';
import { z } from 'zod';
import { 
  insertBrandSchema, 
  insertBrandFeatureSchema,
  insertBrandTechnologySchema, 
  insertBrandIntegrationSchema,
  insertBrandTeamMemberSchema,
  insertBrandCaseStudySchema
} from '@shared/schema';

const router = Router();

/**
 * GET /api/brands
 * Get all brands
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const brands = await brandService.getAllBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

/**
 * GET /api/brands/featured
 * Get featured brands
 */
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const featuredBrands = await brandService.getFeaturedBrands();
    res.json(featuredBrands);
  } catch (error) {
    console.error('Error fetching featured brands:', error);
    res.status(500).json({ error: 'Failed to fetch featured brands' });
  }
});

/**
 * GET /api/brands/category/:category
 * Get brands by category
 */
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const brands = await brandService.getBrandsByCategory(category);
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands by category:', error);
    res.status(500).json({ error: 'Failed to fetch brands by category' });
  }
});

/**
 * GET /api/brands/:idOrSlug
 * Get a brand by ID or slug
 */
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const id = !isNaN(Number(idOrSlug)) ? Number(idOrSlug) : null;
    
    let brand;
    if (id !== null) {
      brand = await brandService.getBrandById(id);
    } else {
      brand = await brandService.getBrandBySlug(idOrSlug);
    }
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

/**
 * GET /api/brands/:idOrSlug/details
 * Get full brand details
 */
router.get('/:idOrSlug/details', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const id = !isNaN(Number(idOrSlug)) ? Number(idOrSlug) : idOrSlug;
    
    const brandDetails = await brandService.getFullBrandDetails(id);
    
    if (!brandDetails) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brandDetails);
  } catch (error) {
    console.error('Error fetching brand details:', error);
    res.status(500).json({ error: 'Failed to fetch brand details' });
  }
});

/**
 * GET /api/brands/:id/features
 * Get features for a brand
 */
router.get('/:id/features', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const features = await brandService.getBrandFeatures(id);
    res.json(features);
  } catch (error) {
    console.error('Error fetching brand features:', error);
    res.status(500).json({ error: 'Failed to fetch brand features' });
  }
});

/**
 * GET /api/brands/:id/technologies
 * Get technologies for a brand
 */
router.get('/:id/technologies', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const technologies = await brandService.getTechnologiesWithAlternatives(id);
    res.json(technologies);
  } catch (error) {
    console.error('Error fetching brand technologies:', error);
    res.status(500).json({ error: 'Failed to fetch brand technologies' });
  }
});

/**
 * GET /api/brands/:id/integrations
 * Get integrations for a brand
 */
router.get('/:id/integrations', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const integrations = await brandService.getBrandIntegrations(id);
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching brand integrations:', error);
    res.status(500).json({ error: 'Failed to fetch brand integrations' });
  }
});

/**
 * GET /api/brands/:id/team
 * Get team members for a brand
 */
router.get('/:id/team', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const teamMembers = await brandService.getBrandTeamMembers(id);
    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching brand team members:', error);
    res.status(500).json({ error: 'Failed to fetch brand team members' });
  }
});

/**
 * GET /api/brands/:id/case-studies
 * Get case studies for a brand
 */
router.get('/:id/case-studies', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const caseStudies = await brandService.getBrandCaseStudies(id);
    res.json(caseStudies);
  } catch (error) {
    console.error('Error fetching brand case studies:', error);
    res.status(500).json({ error: 'Failed to fetch brand case studies' });
  }
});

/**
 * POST /api/brands
 * Create a new brand
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsedData = insertBrandSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid brand data', 
        details: parsedData.error.format() 
      });
    }
    
    const newBrand = await brandService.createBrand(parsedData.data);
    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

/**
 * PUT /api/brands/:id
 * Update a brand
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const existingBrand = await brandService.getBrandById(id);
    
    if (!existingBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    // Partial validation of update data
    const updateSchema = insertBrandSchema.partial();
    const parsedData = updateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid brand data', 
        details: parsedData.error.format() 
      });
    }
    
    const updatedBrand = await brandService.updateBrand(id, parsedData.data);
    res.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

/**
 * POST /api/brands/:id/features
 * Add a feature to a brand
 */
router.post('/:id/features', async (req: Request, res: Response) => {
  try {
    const brandId = Number(req.params.id);
    
    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const existingBrand = await brandService.getBrandById(brandId);
    
    if (!existingBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    const data = { ...req.body, brandId };
    const parsedData = insertBrandFeatureSchema.safeParse(data);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid feature data', 
        details: parsedData.error.format() 
      });
    }
    
    const newFeature = await brandService.addBrandFeature(parsedData.data);
    res.status(201).json(newFeature);
  } catch (error) {
    console.error('Error adding brand feature:', error);
    res.status(500).json({ error: 'Failed to add brand feature' });
  }
});

/**
 * POST /api/brands/:id/technologies
 * Add a technology to a brand
 */
router.post('/:id/technologies', async (req: Request, res: Response) => {
  try {
    const brandId = Number(req.params.id);
    
    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const existingBrand = await brandService.getBrandById(brandId);
    
    if (!existingBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    const data = { ...req.body, brandId };
    const parsedData = insertBrandTechnologySchema.safeParse(data);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid technology data', 
        details: parsedData.error.format() 
      });
    }
    
    const newTechnology = await brandService.addBrandTechnology(parsedData.data);
    res.status(201).json(newTechnology);
  } catch (error) {
    console.error('Error adding brand technology:', error);
    res.status(500).json({ error: 'Failed to add brand technology' });
  }
});

/**
 * POST /api/brands/integrations
 * Create a brand integration
 */
router.post('/integrations', async (req: Request, res: Response) => {
  try {
    const parsedData = insertBrandIntegrationSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid integration data', 
        details: parsedData.error.format() 
      });
    }
    
    const newIntegration = await brandService.createBrandIntegration(parsedData.data);
    res.status(201).json(newIntegration);
  } catch (error) {
    console.error('Error creating brand integration:', error);
    res.status(500).json({ error: 'Failed to create brand integration' });
  }
});

/**
 * POST /api/brands/:id/team
 * Add a team member to a brand
 */
router.post('/:id/team', async (req: Request, res: Response) => {
  try {
    const brandId = Number(req.params.id);
    
    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const existingBrand = await brandService.getBrandById(brandId);
    
    if (!existingBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    const data = { ...req.body, brandId };
    const parsedData = insertBrandTeamMemberSchema.safeParse(data);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid team member data', 
        details: parsedData.error.format() 
      });
    }
    
    const newTeamMember = await brandService.addBrandTeamMember(parsedData.data);
    res.status(201).json(newTeamMember);
  } catch (error) {
    console.error('Error adding brand team member:', error);
    res.status(500).json({ error: 'Failed to add brand team member' });
  }
});

/**
 * POST /api/brands/:id/case-studies
 * Add a case study to a brand
 */
router.post('/:id/case-studies', async (req: Request, res: Response) => {
  try {
    const brandId = Number(req.params.id);
    
    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const existingBrand = await brandService.getBrandById(brandId);
    
    if (!existingBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    const data = { ...req.body, brandId };
    const parsedData = insertBrandCaseStudySchema.safeParse(data);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid case study data', 
        details: parsedData.error.format() 
      });
    }
    
    const newCaseStudy = await brandService.addBrandCaseStudy(parsedData.data);
    res.status(201).json(newCaseStudy);
  } catch (error) {
    console.error('Error adding brand case study:', error);
    res.status(500).json({ error: 'Failed to add brand case study' });
  }
});

export default router;