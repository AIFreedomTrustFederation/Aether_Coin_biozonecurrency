/**
 * Financial Wellness Routes
 * 
 * API routes for generating and retrieving financial wellness reports
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { financialWellnessService } from '../services/financial-wellness-service';
import { storage } from '../storage';

const router = Router();

/**
 * @route  GET /api/financial-wellness/report
 * @desc   Generate a financial wellness report for the current user
 * @access Private
 */
router.get('/report', async (req: Request, res: Response) => {
  try {
    // Get user ID from request (set by auth middleware)
    const userId = Number(req.headers['user-id']);
    
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate financial wellness report
    const report = await financialWellnessService.generateFinancialReport(userId);

    // Return the report
    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating financial wellness report:', error);
    return res.status(500).json({ 
      error: 'Failed to generate financial wellness report',
      details: error.message 
    });
  }
});

/**
 * @route  GET /api/financial-wellness/historical-reports
 * @desc   Get historical financial wellness reports
 * @access Private
 */
router.get('/historical-reports', async (req: Request, res: Response) => {
  try {
    // Get user ID from request (set by auth middleware)
    const userId = Number(req.headers['user-id']);
    
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // This is a placeholder endpoint that would retrieve historical reports
    // from a database in a production environment
    
    // For now, we'll return a message that historical reports are not available
    return res.status(200).json({
      message: 'Historical reports feature coming soon!',
      availableReports: [] 
    });
  } catch (error) {
    console.error('Error retrieving historical reports:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve historical reports',
      details: error.message 
    });
  }
});

/**
 * @route  GET /api/financial-wellness/report-pdf
 * @desc   Generate a PDF of the financial wellness report
 * @access Private
 */
router.get('/report-pdf', async (req: Request, res: Response) => {
  try {
    // Get user ID from request (set by auth middleware)
    const userId = Number(req.headers['user-id']);
    
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // This is a placeholder endpoint that would generate PDF reports
    // in a production environment
    
    // For now, return a message that PDF reports are not available
    return res.status(200).json({
      message: 'PDF report generation coming soon!',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF report',
      details: error.message 
    });
  }
});

export default router;