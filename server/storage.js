/**
 * Simple Storage Implementation for Scroll Keeper
 * 
 * Provides a basic in-memory storage system that can be extended with
 * database functionality if needed.
 */

// Simplified in-memory storage using plain JavaScript objects
const scrolls = new Map();
let scrollCounter = Date.now();

console.log('✓ Storage module initialized');

// Add a sample scroll for demonstration
const sampleScroll = {
  id: (scrollCounter++).toString(),
  title: "Welcome to Scroll Keeper",
  content: "### System\nWelcome to Scroll Keeper! This is a sample scroll to demonstrate how the system works.\n\n### User\nHow do I use Scroll Keeper to extract knowledge from my ChatGPT conversations?\n\n### ChatGPT\nIt's simple! Just paste a public ChatGPT conversation URL in the Extract tab, and Scroll Keeper will automatically extract all the messages, format them, and save them for your future reference.\n\nYou can then browse your scrolls, search for specific content using semantic search (powered by Hugging Face's AI models), and even find similarities between different conversations.\n\n### User\nThat sounds useful. What makes Scroll Keeper special compared to just bookmarking conversations?\n\n### ChatGPT\nGreat question! Scroll Keeper goes beyond simple bookmarking by:\n\n1. **Extracting the full content** - We pull the complete conversation, not just the link\n2. **Semantic search** - Find relevant information even if it doesn't use the exact keywords you search for\n3. **Knowledge connections** - Discover relationships between different conversations\n4. **WebSocket real-time updates** - Changes sync instantly across all your devices\n5. **Structured storage** - All your AI conversations are organized in one consistent format\n\nThis makes it much easier to build a personal knowledge base from your AI interactions!",
  messages: [
    {
      role: "system",
      content: "Welcome to Scroll Keeper! This is a sample scroll to demonstrate how the system works."
    },
    {
      role: "user",
      content: "How do I use Scroll Keeper to extract knowledge from my ChatGPT conversations?"
    },
    {
      role: "assistant",
      content: "It's simple! Just paste a public ChatGPT conversation URL in the Extract tab, and Scroll Keeper will automatically extract all the messages, format them, and save them for your future reference.\n\nYou can then browse your scrolls, search for specific content using semantic search (powered by Hugging Face's AI models), and even find similarities between different conversations."
    },
    {
      role: "user",
      content: "That sounds useful. What makes Scroll Keeper special compared to just bookmarking conversations?"
    },
    {
      role: "assistant",
      content: "Great question! Scroll Keeper goes beyond simple bookmarking by:\n\n1. **Extracting the full content** - We pull the complete conversation, not just the link\n2. **Semantic search** - Find relevant information even if it doesn't use the exact keywords you search for\n3. **Knowledge connections** - Discover relationships between different conversations\n4. **WebSocket real-time updates** - Changes sync instantly across all your devices\n5. **Structured storage** - All your AI conversations are organized in one consistent format\n\nThis makes it much easier to build a personal knowledge base from your AI interactions!"
    }
  ],
  metadata: {
    source: "sample",
    messageCount: 5
  },
  createdAt: new Date().toISOString()
};

// Add sample to storage
scrolls.set(sampleScroll.id, sampleScroll);

/**
 * Create a new scroll
 * 
 * @param {object} scroll - The scroll data to create
 * @returns {Promise<object>} - The created scroll with ID
 */
async function createScroll(scroll) {
  const id = (scrollCounter++).toString();
  const newScroll = {
    ...scroll,
    id,
    createdAt: scroll.createdAt || new Date().toISOString()
  };
  
  scrolls.set(id, newScroll);
  console.log(`✓ Created scroll with ID: ${id}`);
  return newScroll;
}

/**
 * Get a scroll by ID
 * 
 * @param {string} id - The ID of the scroll to retrieve
 * @returns {Promise<object|null>} - The scroll or null if not found
 */
async function getScrollById(id) {
  return scrolls.get(id) || null;
}

/**
 * Get all scrolls
 * 
 * @returns {Promise<object[]>} - Array of all scrolls
 */
async function getAllScrolls() {
  return Array.from(scrolls.values());
}

/**
 * Update a document in a collection
 * 
 * @param {string} collection - The collection name (e.g., 'scrolls')
 * @param {string} id - The document ID
 * @param {object} updates - The fields to update
 * @returns {Promise<object>} - The updated document
 */
async function updateInDatabase(collection, id, updates) {
  if (collection === 'scrolls') {
    const scroll = scrolls.get(id);
    
    if (!scroll) {
      throw new Error(`Scroll with ID ${id} not found`);
    }
    
    const updatedScroll = {
      ...scroll,
      ...updates,
      id // Ensure ID doesn't get overwritten
    };
    
    scrolls.set(id, updatedScroll);
    return updatedScroll;
  }
  
  throw new Error(`Unknown collection: ${collection}`);
}

/**
 * Delete a document from a collection
 * 
 * @param {string} collection - The collection name (e.g., 'scrolls')
 * @param {string} id - The document ID
 * @returns {Promise<object>} - Success indicator
 */
async function deleteFromDatabase(collection, id) {
  if (collection === 'scrolls') {
    if (!scrolls.has(id)) {
      throw new Error(`Scroll with ID ${id} not found`);
    }
    
    scrolls.delete(id);
    return { success: true };
  }
  
  throw new Error(`Unknown collection: ${collection}`);
}

// Storage interface
const storage = {
  createScroll,
  getScrollById,
  getAllScrolls,
  updateInDatabase,
  deleteFromDatabase
};

// Storage singleton
let storageInstance = storage;

/**
 * Create or get the storage instance
 * 
 * @returns {Object} Storage instance
 */
export function createStorage() {
  return storageInstance;
}

/**
 * Get the singleton storage instance
 * 
 * @returns {Object} Storage instance
 */
export function getStorage() {
  return storageInstance;
}

export default { createStorage, getStorage };