/**
 * Scroll Keeper - Search Routes
 * 
 * Implements semantic search capabilities for finding related scrolls
 * and knowledge within the Scroll Keeper system.
 */

import express from 'express';
import { createHash } from 'crypto';
import { HfInference } from '@huggingface/inference';
import { getStorage } from '../storage.js';

const router = express.Router();
const storage = getStorage();

// Initialize Hugging Face client if API key is available
let hf = null;
try {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (apiKey && apiKey.trim() !== '') {
    console.log('✓ Initializing Hugging Face client with provided API key');
    hf = new HfInference(apiKey);
    console.log('✓ Hugging Face client initialized successfully');
  } else {
    console.log('⚠️ No valid HUGGINGFACE_API_KEY found, semantic search will use fallback similarity');
  }
} catch (error) {
  console.error('Failed to initialize Hugging Face client:', error);
}

// Embeddings model for semantic search
const EMBEDDINGS_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

/**
 * Generate embeddings for text using Hugging Face
 * 
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbeddings(text) {
  if (!hf) {
    // Fallback to a simple hash-based embedding when no API key is available
    return generateFallbackEmbedding(text);
  }

  try {
    // Truncate text if it's too long (model has a token limit)
    const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;
    
    const response = await hf.featureExtraction({
      model: EMBEDDINGS_MODEL,
      inputs: truncatedText
    });
    
    return response;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Fallback to simple embedding on error
    return generateFallbackEmbedding(text);
  }
}

/**
 * Generate a fallback embedding using a hashing technique
 * This is not as good as ML-based embeddings but can work as a backup
 * 
 * @param {string} text - The text to embed
 * @returns {number[]} - A simple vector representation
 */
function generateFallbackEmbedding(text) {
  // Create a basic 32-dimension vector from hashing
  const dimensions = 32;
  const vector = new Array(dimensions).fill(0);
  
  // Normalize and clean the text
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalizedText.split(/\s+/);
  
  // Generate a hash for each word and distribute across the vector
  words.forEach(word => {
    const hash = createHash('md5').update(word).digest('hex');
    
    // Use parts of the hash to fill different dimensions
    for (let i = 0; i < dimensions && i < hash.length - 1; i++) {
      const value = parseInt(hash.substring(i, i + 2), 16) / 255;
      vector[i] += value;
    }
  });
  
  // Normalize the vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / (magnitude || 1));
}

/**
 * Calculate cosine similarity between two vectors
 * 
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let vec1Magnitude = 0;
  let vec2Magnitude = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    vec1Magnitude += vec1[i] * vec1[i];
    vec2Magnitude += vec2[i] * vec2[i];
  }
  
  vec1Magnitude = Math.sqrt(vec1Magnitude);
  vec2Magnitude = Math.sqrt(vec2Magnitude);
  
  if (vec1Magnitude === 0 || vec2Magnitude === 0) {
    return 0;
  }
  
  return dotProduct / (vec1Magnitude * vec2Magnitude);
}

// Create embeddings for a scroll
router.post('/embed/:id', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const scroll = await storage.getScrollById(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ error: 'Scroll not found' });
    }
    
    // Create a representative text for embedding
    const textToEmbed = `${scroll.title}. ${scroll.content ? scroll.content.substring(0, 10000) : ''}`;
    const embeddings = await generateEmbeddings(textToEmbed);
    
    // Store the embeddings with the scroll
    await storage.updateScrollEmbeddings(scrollId, embeddings);
    
    res.json({ 
      message: 'Embeddings created successfully',
      scrollId,
      dimensions: embeddings.length
    });
  } catch (error) {
    console.error('Error creating embeddings:', error);
    res.status(500).json({ error: 'Failed to create embeddings' });
  }
});

// Search for scrolls by query text (semantic search)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({ error: 'Invalid or too short query' });
    }
    
    // Generate embeddings for the query
    const queryEmbeddings = await generateEmbeddings(query);
    
    // Get all scrolls
    const scrolls = await storage.getAllScrolls();
    
    // Calculate similarity scores for each scroll
    const results = await Promise.all(
      scrolls.map(async (scroll) => {
        // If the scroll doesn't have embeddings, generate them
        if (!scroll.embeddings) {
          const textToEmbed = `${scroll.title}. ${scroll.content ? scroll.content.substring(0, 10000) : ''}`;
          scroll.embeddings = await generateEmbeddings(textToEmbed);
          // Store them for future use
          await storage.updateScrollEmbeddings(scroll.id, scroll.embeddings);
        }
        
        const similarity = cosineSimilarity(queryEmbeddings, scroll.embeddings);
        
        return {
          id: scroll.id,
          title: scroll.title,
          similarity,
          createdAt: scroll.createdAt,
          // Include a snippet of content
          snippet: scroll.content 
            ? scroll.content.substring(0, 200) + (scroll.content.length > 200 ? '...' : '')
            : 'No content available'
        };
      })
    );
    
    // Sort by similarity score and limit to top 10
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .filter(result => result.similarity > 0.3) // Only include reasonably similar results
      .slice(0, 10);
    
    res.json({
      query,
      results: topResults
    });
  } catch (error) {
    console.error('Error searching scrolls:', error);
    res.status(500).json({ error: 'Failed to search scrolls' });
  }
});

// Find similar scrolls to a specific scroll
router.get('/similar/:id', async (req, res) => {
  try {
    const scrollId = req.params.id;
    const scroll = await storage.getScrollById(scrollId);
    
    if (!scroll) {
      return res.status(404).json({ error: 'Scroll not found' });
    }
    
    // If the scroll doesn't have embeddings, generate them
    if (!scroll.embeddings) {
      const textToEmbed = `${scroll.title}. ${scroll.content ? scroll.content.substring(0, 10000) : ''}`;
      scroll.embeddings = await generateEmbeddings(textToEmbed);
      // Store them for future use
      await storage.updateScrollEmbeddings(scrollId, scroll.embeddings);
    }
    
    // Get all other scrolls
    const allScrolls = await storage.getAllScrolls();
    
    // Calculate similarity scores
    const results = await Promise.all(
      allScrolls
        .filter(s => s.id !== scrollId) // Exclude the current scroll
        .map(async (otherScroll) => {
          // If the other scroll doesn't have embeddings, generate them
          if (!otherScroll.embeddings) {
            const textToEmbed = `${otherScroll.title}. ${otherScroll.content ? otherScroll.content.substring(0, 10000) : ''}`;
            otherScroll.embeddings = await generateEmbeddings(textToEmbed);
            // Store them for future use
            await storage.updateScrollEmbeddings(otherScroll.id, otherScroll.embeddings);
          }
          
          const similarity = cosineSimilarity(scroll.embeddings, otherScroll.embeddings);
          
          return {
            id: otherScroll.id,
            title: otherScroll.title,
            similarity,
            createdAt: otherScroll.createdAt,
            // Include a snippet of content
            snippet: otherScroll.content 
              ? otherScroll.content.substring(0, 200) + (otherScroll.content.length > 200 ? '...' : '')
              : 'No content available'
          };
        })
    );
    
    // Sort by similarity score and limit to top 5
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .filter(result => result.similarity > 0.4) // Only include reasonably similar results
      .slice(0, 5);
    
    res.json({
      scrollId,
      results: topResults
    });
  } catch (error) {
    console.error('Error finding similar scrolls:', error);
    res.status(500).json({ error: 'Failed to find similar scrolls' });
  }
});

export default router;