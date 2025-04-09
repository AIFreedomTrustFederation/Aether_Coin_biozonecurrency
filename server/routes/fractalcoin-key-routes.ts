/**
 * FractalCoin API Key Management Routes
 * 
 * These routes handle generating and retrieving API keys for the FractalCoin network
 */

import express from 'express';
import crypto from 'crypto';
import { storage } from '../storage';
import { z } from 'zod';

const router = express.Router();

// Database of API keys (in-memory for development, should be persisted in production)
interface ApiKeyEntry {
  email: string;
  apiKey: string;
  createdAt: Date;
}

// In-memory storage for demo purposes
// In production, this would use proper database storage
const apiKeys: ApiKeyEntry[] = [];

// Email validation schema
const emailSchema = z.string().email("Invalid email address");

// Generate a random API key
function generateApiKey(): string {
  // Format: prefix_randomString
  const prefix = 'frc';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${prefix}_${randomBytes}`;
}

// Find an API key by email
function findApiKeyByEmail(email: string): ApiKeyEntry | undefined {
  return apiKeys.find(entry => entry.email.toLowerCase() === email.toLowerCase());
}

// Route to generate or retrieve an API key
router.post('/generate-key', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    try {
      emailSchema.parse(email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }
    
    // Look for existing API key
    let existingEntry = findApiKeyByEmail(email);
    let isNew = false;

    // If no existing key, generate a new one
    if (!existingEntry) {
      const newApiKey = generateApiKey();
      existingEntry = {
        email,
        apiKey: newApiKey,
        createdAt: new Date()
      };
      apiKeys.push(existingEntry);
      isNew = true;

      console.log(`Generated new API key for ${email}`);
    } else {
      console.log(`Retrieved existing API key for ${email}`);
    }

    // Send the API key
    res.json({
      success: true,
      apiKey: existingEntry.apiKey,
      isNew,
      message: isNew ? 'API key generated successfully' : 'Existing API key retrieved'
    });

  } catch (error: any) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate or retrieve API key'
    });
  }
});

// Route to revoke an API key (not implemented in this basic version)
router.post('/revoke-key', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    try {
      emailSchema.parse(email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }
    
    // Find and remove the API key
    const index = apiKeys.findIndex(entry => entry.email.toLowerCase() === email.toLowerCase());
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'No API key found for this email address'
      });
    }
    
    // Remove the entry
    apiKeys.splice(index, 1);
    
    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
    
  } catch (error: any) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke API key'
    });
  }
});

// Route to validate an API key
router.post('/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Check if the API key exists
    const entry = apiKeys.find(entry => entry.apiKey === apiKey);
    
    if (!entry) {
      return res.json({
        success: false,
        valid: false,
        message: 'Invalid API key'
      });
    }
    
    res.json({
      success: true,
      valid: true,
      email: entry.email,
      createdAt: entry.createdAt,
      message: 'Valid API key'
    });
    
  } catch (error: any) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate API key'
    });
  }
});

export default router;