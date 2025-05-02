/**
 * AI Freedom Trust Framework API Routes
 * 
 * This file provides a JavaScript wrapper around the TypeScript routes in server/routes.ts
 * to make it compatible with the server.js express app.
 */

import express from 'express';

// Create the brand routes router
const brandRoutes = express.Router();

// Import database connection
import { db } from './server/db.js';
import { brands } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// GET /api/brands - Get all brands
brandRoutes.get('/', async (req, res) => {
  try {
    const allBrands = await db.select().from(brands);
    res.json(allBrands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/brands/:slug - Get a specific brand by slug
brandRoutes.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [brand] = await db.select().from(brands).where(eq(brands.slug, slug));
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    console.error(`Error fetching brand with slug ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Export a function that registers all routes
export async function registerRoutes(app) {
  // Register brand routes
  app.use('/api/brands', brandRoutes);
  
  return app;
}