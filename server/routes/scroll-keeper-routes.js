/**
 * Scroll Keeper API Routes
 * 
 * Handles core API routes for the Scroll Keeper module, including 
 * scroll creation, retrieval, and ChatGPT conversation extraction.
 */

import express from 'express';
import { getStorage } from '../storage.js';
import { extractConversation, conversationToScroll } from '../services/scroll-keeper/chat-extractor.js';
import { extendStorageWithScrollKeeper } from '../scroll-keeper-storage-extensions.js';

const router = express.Router();
const storage = extendStorageWithScrollKeeper(getStorage());

// Get all scrolls
router.get('/scrolls', async (req, res) => {
  try {
    const scrolls = await storage.getAllScrolls();
    // Return only basic info for listing
    const scrollListing = scrolls.map(scroll => ({
      id: scroll.id,
      title: scroll.title,
      createdAt: scroll.createdAt,
      updatedAt: scroll.updatedAt,
      userId: scroll.userId,
      tags: scroll.tags || [],
      source: scroll.metadata?.source,
      messageCount: scroll.metadata?.messageCount
    }));
    
    res.json({ scrolls: scrollListing });
  } catch (error) {
    console.error('Error getting scrolls:', error);
    res.status(500).json({ error: 'Failed to get scrolls' });
  }
});

// Get a single scroll by ID
router.get('/scrolls/:id', async (req, res) => {
  try {
    const scroll = await storage.getScrollById(req.params.id);
    
    if (!scroll) {
      return res.status(404).json({ error: 'Scroll not found' });
    }
    
    res.json(scroll);
  } catch (error) {
    console.error('Error getting scroll:', error);
    res.status(500).json({ error: 'Failed to get scroll' });
  }
});

// Create a new scroll
router.post('/scrolls', async (req, res) => {
  try {
    const { title, content, userId, metadata } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const scroll = {
      title,
      content,
      userId: userId || null,
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    };
    
    const newScroll = await storage.createScroll(scroll);
    res.status(201).json(newScroll);
  } catch (error) {
    console.error('Error creating scroll:', error);
    res.status(500).json({ error: 'Failed to create scroll' });
  }
});

// Update a scroll
router.put('/scrolls/:id', async (req, res) => {
  try {
    const { title, content, metadata, tags } = req.body;
    const scrollId = req.params.id;
    
    const scroll = await storage.getScrollById(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ error: 'Scroll not found' });
    }
    
    // Update fields if provided
    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (metadata) updates.metadata = { ...scroll.metadata, ...metadata };
    if (tags) updates.tags = tags;
    updates.updatedAt = new Date().toISOString();
    
    const updatedScroll = await storage.updateInDatabase('scrolls', scrollId, updates);
    res.json(updatedScroll);
  } catch (error) {
    console.error('Error updating scroll:', error);
    res.status(500).json({ error: 'Failed to update scroll' });
  }
});

// Delete a scroll
router.delete('/scrolls/:id', async (req, res) => {
  try {
    const scrollId = req.params.id;
    
    const scroll = await storage.getScrollById(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ error: 'Scroll not found' });
    }
    
    await storage.deleteFromDatabase('scrolls', scrollId);
    res.json({ message: 'Scroll deleted successfully', id: scrollId });
  } catch (error) {
    console.error('Error deleting scroll:', error);
    res.status(500).json({ error: 'Failed to delete scroll' });
  }
});

// Extract a ChatGPT conversation
router.post('/extract', async (req, res) => {
  try {
    const { url, userId } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Extracting conversation from: ${url}`);
    
    const conversation = await extractConversation(url);
    
    if (!conversation) {
      return res.status(500).json({ error: 'Failed to extract conversation' });
    }
    
    // Convert to scroll format
    const scroll = conversationToScroll(conversation, userId);
    
    // Store in database
    const newScroll = await storage.createScroll(scroll);
    
    res.json({ 
      message: 'ChatGPT conversation extracted successfully', 
      scrollId: newScroll.id,
      title: newScroll.title
    });
  } catch (error) {
    console.error('Error extracting conversation:', error);
    res.status(500).json({ error: 'Failed to extract conversation' });
  }
});

// Add a tag to a scroll
router.post('/scrolls/:id/tags', async (req, res) => {
  try {
    const { tag } = req.body;
    const scrollId = req.params.id;
    
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required' });
    }
    
    const result = await storage.addTagToScroll(scrollId, tag);
    res.json(result);
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// Remove a tag from a scroll
router.delete('/scrolls/:id/tags/:tag', async (req, res) => {
  try {
    const { id, tag } = req.params;
    
    const result = await storage.removeTagFromScroll(id, tag);
    res.json(result);
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await storage.getAllTags();
    res.json({ tags });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

// Get scrolls by tag
router.get('/tags/:tag/scrolls', async (req, res) => {
  try {
    const { tag } = req.params;
    const scrolls = await storage.getScrollsByTag(tag);
    
    // Return only basic info for listing
    const scrollListing = scrolls.map(scroll => ({
      id: scroll.id,
      title: scroll.title,
      createdAt: scroll.createdAt,
      updatedAt: scroll.updatedAt,
      userId: scroll.userId,
      tags: scroll.tags || [],
      source: scroll.metadata?.source,
      messageCount: scroll.metadata?.messageCount
    }));
    
    res.json({ tag, scrolls: scrollListing });
  } catch (error) {
    console.error('Error getting scrolls by tag:', error);
    res.status(500).json({ error: 'Failed to get scrolls by tag' });
  }
});

// Search scrolls by keyword
router.get('/search/keyword', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const scrolls = await storage.searchScrollsByKeyword(q);
    
    // Return only basic info with snippets
    const results = scrolls.map(scroll => {
      let snippet = '';
      
      if (scroll.content) {
        // Try to find the keyword in the content and create a snippet
        const contentLower = scroll.content.toLowerCase();
        const keywordLower = q.toLowerCase();
        const keywordIndex = contentLower.indexOf(keywordLower);
        
        if (keywordIndex !== -1) {
          // Get context around the keyword
          const startIndex = Math.max(0, keywordIndex - 50);
          const endIndex = Math.min(scroll.content.length, keywordIndex + q.length + 50);
          snippet = scroll.content.substring(startIndex, endIndex);
          
          // Add ellipsis if needed
          if (startIndex > 0) snippet = '...' + snippet;
          if (endIndex < scroll.content.length) snippet = snippet + '...';
        } else {
          // Just use the beginning of the content
          snippet = scroll.content.substring(0, 100) + (scroll.content.length > 100 ? '...' : '');
        }
      }
      
      return {
        id: scroll.id,
        title: scroll.title,
        createdAt: scroll.createdAt,
        updatedAt: scroll.updatedAt,
        snippet,
        tags: scroll.tags || []
      };
    });
    
    res.json({ query: q, results });
  } catch (error) {
    console.error('Error searching scrolls:', error);
    res.status(500).json({ error: 'Failed to search scrolls' });
  }
});

export default router;