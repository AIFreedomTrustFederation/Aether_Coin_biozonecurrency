/**
 * Scroll Keeper Routes
 * 
 * API endpoints for the Scroll Keeper functionality
 */

import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertScrollSchema, insertReflectionSchema, insertScrollKeeperSettingsSchema } from '../../shared/scroll-keeper-schema';
import { processScrollFromUrl } from '../services/scroll-keeper/scroll-ingestor';
import { searchSimilarScrolls } from '../services/scroll-keeper/vectorstore';
import { generateReflectionForScroll, generateAnswerFromScrolls } from '../services/scroll-keeper/llm-engine';

const router = express.Router();

// Middleware to log API requests
router.use((req, res, next) => {
  console.log(`Scroll Keeper API Request: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Scroll Keeper' });
});

// Get all scrolls for current user
router.get('/scrolls', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1; // Default to user 1 for demo
    const scrolls = await storage.getScrollsByUserId(userId);
    res.json(scrolls);
  } catch (error) {
    console.error('Error fetching scrolls:', error);
    res.status(500).json({ message: 'Failed to fetch scrolls' });
  }
});

// Get a specific scroll by ID
router.get('/scrolls/:id', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const scroll = await storage.getScroll(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ message: 'Scroll not found' });
    }
    
    res.json(scroll);
  } catch (error) {
    console.error(`Error fetching scroll ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch scroll' });
  }
});

// Create a new scroll from a URL
router.post('/scrolls/from-url', async (req, res) => {
  try {
    const { url, userId } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    const userIdNum = userId ? parseInt(userId) : 1; // Default to user 1 for demo
    
    // Process the URL and create a scroll
    const scrollId = await processScrollFromUrl(url, userIdNum);
    
    if (!scrollId) {
      return res.status(500).json({ message: 'Failed to process URL' });
    }
    
    // Get the created scroll
    const scroll = await storage.getScroll(scrollId);
    
    // Queue a reflection generation task
    await storage.createProcessingQueueItem({
      taskType: 'reflection_generation',
      payload: { scrollId },
      priority: 3
    });
    
    res.status(201).json(scroll);
  } catch (error) {
    console.error('Error creating scroll from URL:', error);
    res.status(500).json({ message: 'Failed to create scroll from URL' });
  }
});

// Create a new scroll manually
router.post('/scrolls', async (req, res) => {
  try {
    const scrollData = insertScrollSchema.parse(req.body);
    const scroll = await storage.createScroll(scrollData);
    
    // Queue embedding generation
    await storage.createProcessingQueueItem({
      taskType: 'embedding_generation',
      payload: { scrollId: scroll.id, text: scroll.content },
      priority: 5
    });
    
    res.status(201).json(scroll);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid scroll data', errors: error.errors });
    }
    console.error('Error creating scroll:', error);
    res.status(500).json({ message: 'Failed to create scroll' });
  }
});

// Update a scroll
router.patch('/scrolls/:id', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const updates = req.body;
    
    const scroll = await storage.getScroll(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ message: 'Scroll not found' });
    }
    
    const updatedScroll = await storage.updateScroll(scrollId, updates);
    
    // If content was updated, queue a new embedding generation
    if (updates.content && updates.content !== scroll.content) {
      await storage.createProcessingQueueItem({
        taskType: 'embedding_generation',
        payload: { scrollId, text: updates.content },
        priority: 5
      });
    }
    
    res.json(updatedScroll);
  } catch (error) {
    console.error(`Error updating scroll ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update scroll' });
  }
});

// Delete a scroll
router.delete('/scrolls/:id', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const success = await storage.deleteScroll(scrollId);
    
    if (!success) {
      return res.status(404).json({ message: 'Scroll not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting scroll ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete scroll' });
  }
});

// Search scrolls
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const results = await searchSimilarScrolls(query, limit);
    res.json(results);
  } catch (error) {
    console.error('Error searching scrolls:', error);
    res.status(500).json({ message: 'Failed to search scrolls' });
  }
});

// Get reflections for a scroll
router.get('/scrolls/:id/reflections', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const reflections = await storage.getReflectionsByScrollId(scrollId);
    res.json(reflections);
  } catch (error) {
    console.error(`Error fetching reflections for scroll ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch reflections' });
  }
});

// Generate a reflection for a scroll
router.post('/scrolls/:id/reflections', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const scroll = await storage.getScroll(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ message: 'Scroll not found' });
    }
    
    // Generate the reflection
    const reflectionId = await generateReflectionForScroll(scrollId);
    
    if (!reflectionId) {
      return res.status(500).json({ message: 'Failed to generate reflection' });
    }
    
    // Get the created reflection
    const reflection = await storage.getReflection(parseInt(reflectionId));
    
    res.status(201).json(reflection);
  } catch (error) {
    console.error(`Error generating reflection for scroll ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to generate reflection' });
  }
});

// Answer a question using scrolls
router.post('/answer', async (req, res) => {
  try {
    const { question, userId } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }
    
    const userIdNum = userId ? parseInt(userId) : null;
    
    // Generate the answer
    const result = await generateAnswerFromScrolls(question, userIdNum);
    
    if (!result) {
      return res.status(500).json({ message: 'Failed to generate answer' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error generating answer:', error);
    res.status(500).json({ message: 'Failed to generate answer' });
  }
});

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1; // Default to user 1 for demo
    const settings = await storage.getScrollKeeperSettingsByUserId(userId);
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await storage.createScrollKeeperSettings({
        userId,
        theme: 'cosmic',
        allowPublicSharing: 'false'
      });
      
      return res.json(defaultSettings);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update user settings
router.patch('/settings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const settings = await storage.getScrollKeeperSettings(id);
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    const updatedSettings = await storage.updateScrollKeeperSettings(id, updates);
    res.json(updatedSettings);
  } catch (error) {
    console.error(`Error updating settings ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Get processing queue status
router.get('/queue/status', async (req, res) => {
  try {
    const pendingTasks = await storage.getPendingProcessingQueueItems(100);
    
    // Group tasks by type
    const taskCounts = pendingTasks.reduce((acc: Record<string, number>, task) => {
      acc[task.taskType] = (acc[task.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      pendingTasksCount: pendingTasks.length,
      taskCounts
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ message: 'Failed to fetch queue status' });
  }
});

export default router;