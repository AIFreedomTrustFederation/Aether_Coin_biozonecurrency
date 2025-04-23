/**
 * Scroll Keeper Storage Extensions
 * 
 * Extends the basic storage interface with methods specific to the Scroll Keeper
 * functionality, including vector embeddings and advanced search capabilities.
 */

/**
 * Extends storage with Scroll Keeper-specific methods
 * 
 * @param {object} storage - The base storage instance to extend
 * @returns {object} - The extended storage object
 */
export function extendStorageWithScrollKeeper(storage) {
  // Check if the storage already has the scroll keeper extensions
  if (storage.hasScrollKeeperExtensions) {
    return storage;
  }
  
  // In-memory storage for embeddings if not using a database
  const embeddingsMap = new Map();
  
  // Add method to update embeddings for a scroll
  storage.updateScrollEmbeddings = async (scrollId, embeddings) => {
    try {
      // Get the scroll to update
      const scroll = await storage.getScrollById(scrollId);
      if (!scroll) {
        throw new Error(`Scroll with ID ${scrollId} not found`);
      }
      
      // Update in database if available, or use in-memory map
      if (storage.updateInDatabase) {
        await storage.updateInDatabase('scrolls', scrollId, { embeddings });
      } else {
        embeddingsMap.set(scrollId, embeddings);
      }
      
      return { success: true, scrollId };
    } catch (error) {
      console.error('Error updating scroll embeddings:', error);
      throw error;
    }
  };
  
  // Override getScrollById to include embeddings
  const originalGetScrollById = storage.getScrollById;
  storage.getScrollById = async (id) => {
    const scroll = await originalGetScrollById(id);
    
    if (scroll) {
      // Add embeddings if stored in-memory
      if (!scroll.embeddings && embeddingsMap.has(id)) {
        scroll.embeddings = embeddingsMap.get(id);
      }
    }
    
    return scroll;
  };
  
  // Override getAllScrolls to include embeddings
  const originalGetAllScrolls = storage.getAllScrolls;
  storage.getAllScrolls = async () => {
    const scrolls = await originalGetAllScrolls();
    
    // Add embeddings from in-memory map if needed
    scrolls.forEach(scroll => {
      if (!scroll.embeddings && embeddingsMap.has(scroll.id)) {
        scroll.embeddings = embeddingsMap.get(scroll.id);
      }
    });
    
    return scrolls;
  };
  
  // Add method to search scrolls by keyword
  storage.searchScrollsByKeyword = async (keyword) => {
    if (!keyword || typeof keyword !== 'string') {
      return [];
    }
    
    const scrolls = await storage.getAllScrolls();
    const normalizedKeyword = keyword.toLowerCase();
    
    return scrolls.filter(scroll => 
      scroll.title.toLowerCase().includes(normalizedKeyword) || 
      (scroll.content && scroll.content.toLowerCase().includes(normalizedKeyword))
    );
  };
  
  // Add tag management for scrolls
  storage.addTagToScroll = async (scrollId, tag) => {
    const scroll = await storage.getScrollById(scrollId);
    if (!scroll) {
      throw new Error(`Scroll with ID ${scrollId} not found`);
    }
    
    // Initialize tags array if it doesn't exist
    if (!scroll.tags) {
      scroll.tags = [];
    }
    
    // Add tag if it doesn't already exist
    if (!scroll.tags.includes(tag)) {
      scroll.tags.push(tag);
      
      // Update in database if available
      if (storage.updateInDatabase) {
        await storage.updateInDatabase('scrolls', scrollId, { tags: scroll.tags });
      }
    }
    
    return { success: true, scrollId, tags: scroll.tags };
  };
  
  // Remove a tag from a scroll
  storage.removeTagFromScroll = async (scrollId, tag) => {
    const scroll = await storage.getScrollById(scrollId);
    if (!scroll) {
      throw new Error(`Scroll with ID ${scrollId} not found`);
    }
    
    // Remove tag if it exists
    if (scroll.tags && scroll.tags.includes(tag)) {
      scroll.tags = scroll.tags.filter(t => t !== tag);
      
      // Update in database if available
      if (storage.updateInDatabase) {
        await storage.updateInDatabase('scrolls', scrollId, { tags: scroll.tags });
      }
    }
    
    return { success: true, scrollId, tags: scroll.tags || [] };
  };
  
  // Get all unique tags in the system
  storage.getAllTags = async () => {
    const scrolls = await storage.getAllScrolls();
    const tagSet = new Set();
    
    scrolls.forEach(scroll => {
      if (scroll.tags && Array.isArray(scroll.tags)) {
        scroll.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet).sort();
  };
  
  // Get scrolls by tag
  storage.getScrollsByTag = async (tag) => {
    const scrolls = await storage.getAllScrolls();
    
    return scrolls.filter(scroll => 
      scroll.tags && Array.isArray(scroll.tags) && scroll.tags.includes(tag)
    );
  };
  
  // Mark that we've added the extensions
  storage.hasScrollKeeperExtensions = true;
  
  return storage;
}

export default extendStorageWithScrollKeeper;