"use strict";
/**
 * Scroll Keeper Vector Store
 *
 * Manages vector embeddings for scrolls and reflections
 * to enable semantic search functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeVectorStore = initializeVectorStore;
exports.processEmbeddingForScroll = processEmbeddingForScroll;
exports.processEmbeddingForReflection = processEmbeddingForReflection;
exports.searchSimilarScrolls = searchSimilarScrolls;
exports.searchSimilarReflections = searchSimilarReflections;
const storage_1 = require("../../storage");
const chromadb_1 = require("chromadb");
const inference_1 = require("@huggingface/inference");
// Configure ChromaDB client
const client = new chromadb_1.ChromaClient();
let scrollsCollection = null;
let reflectionsCollection = null;
// Create a custom embedding function that uses Hugging Face
class HuggingFaceEmbeddingFunction {
    constructor() {
        try {
            this.hf = new inference_1.HfInference(process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY);
            this.model = "sentence-transformers/all-MiniLM-L6-v2"; // A good, free model for embeddings
            this.available = true;
            console.log('HuggingFace embedding function initialized successfully');
        }
        catch (error) {
            console.warn('Failed to initialize HuggingFace inference:', error);
            this.available = false;
            this.model = "";
        }
    }
    async generate(texts) {
        if (!this.available) {
            console.warn("HuggingFace inference is not available, returning empty embeddings");
            // Return placeholder embeddings (empty arrays) when HF is not available
            return texts.map(() => []);
        }
        try {
            const embeddings = await Promise.all(texts.map(async (text) => {
                const response = await this.hf.featureExtraction({
                    model: this.model,
                    inputs: text
                });
                return response; // Response is already a number[]
            }));
            return embeddings;
        }
        catch (error) {
            console.error("Error generating embeddings:", error);
            // Return placeholder embeddings if an error occurs
            return texts.map(() => []);
        }
    }
}
// Initialize embedding function using Hugging Face
const embeddingFunction = new HuggingFaceEmbeddingFunction();
/**
 * Initialize the vector collections
 */
async function initializeVectorStore() {
    try {
        // Check if collections exist, create them if they don't
        const collections = await client.listCollections();
        const hasScrollsCollection = collections.some((c) => c.name === 'scrolls');
        const hasReflectionsCollection = collections.some((c) => c.name === 'reflections');
        if (!hasScrollsCollection && embeddingFunction) {
            scrollsCollection = await client.createCollection({
                name: 'scrolls',
                embeddingFunction
            });
            console.log('Created scrolls collection in ChromaDB');
        }
        else if (hasScrollsCollection && embeddingFunction) {
            scrollsCollection = await client.getCollection({
                name: 'scrolls',
                embeddingFunction
            });
            console.log('Retrieved existing scrolls collection from ChromaDB');
        }
        if (!hasReflectionsCollection && embeddingFunction) {
            reflectionsCollection = await client.createCollection({
                name: 'reflections',
                embeddingFunction
            });
            console.log('Created reflections collection in ChromaDB');
        }
        else if (hasReflectionsCollection && embeddingFunction) {
            reflectionsCollection = await client.getCollection({
                name: 'reflections',
                embeddingFunction
            });
            console.log('Retrieved existing reflections collection from ChromaDB');
        }
        if (!embeddingFunction) {
            console.warn('Embedding function is not available, vector embeddings disabled');
        }
    }
    catch (error) {
        console.error('Error initializing vector store:', error);
        throw error;
    }
}
/**
 * Process embedding generation for a scroll
 */
async function processEmbeddingForScroll(scrollId) {
    try {
        // Get the scroll
        const scroll = await storage_1.storage.getScroll(scrollId);
        if (!scroll) {
            console.error(`Scroll with ID ${scrollId} not found`);
            return false;
        }
        // Check if embedding function is available
        if (!embeddingFunction || !scrollsCollection) {
            console.warn('Embedding function or collection not available, skipping embedding generation');
            return false;
        }
        // Add the scroll to the vector store
        await scrollsCollection.add({
            ids: [scrollId],
            metadatas: [{
                    title: scroll.title,
                    userId: scroll.userId?.toString() || ''
                }],
            documents: [scroll.content]
        });
        // Update the scroll with embedding status
        await storage_1.storage.updateScroll(scrollId, {
            vectorEmbedding: { status: 'generated', timestamp: new Date() }
        });
        return true;
    }
    catch (error) {
        console.error(`Error processing embedding for scroll ${scrollId}:`, error);
        return false;
    }
}
/**
 * Process embedding generation for a reflection
 */
async function processEmbeddingForReflection(reflectionId) {
    try {
        // Get the reflection
        const reflection = await storage_1.storage.getReflection(reflectionId);
        if (!reflection) {
            console.error(`Reflection with ID ${reflectionId} not found`);
            return false;
        }
        // Check if embedding function is available
        if (!embeddingFunction || !reflectionsCollection) {
            console.warn('Embedding function or collection not available, skipping embedding generation');
            return false;
        }
        // Prepare the content for embedding
        const content = `Question: ${reflection.question}\nAnswer: ${reflection.answer}`;
        // Add the reflection to the vector store
        await reflectionsCollection.add({
            ids: [reflectionId.toString()],
            metadatas: [{
                    userId: reflection.userId?.toString() || '',
                    scrollId: reflection.scrollIds?.[0] || ''
                }],
            documents: [content]
        });
        // Update the reflection with embedding status
        await storage_1.storage.updateReflection(reflectionId, {
            vectorEmbedding: { status: 'generated', timestamp: new Date() }
        });
        return true;
    }
    catch (error) {
        console.error(`Error processing embedding for reflection ${reflectionId}:`, error);
        return false;
    }
}
/**
 * Search for scrolls similar to a given query
 */
async function searchSimilarScrolls(query, limit = 5, userId) {
    try {
        if (!embeddingFunction || !scrollsCollection) {
            throw new Error('Vector search not available');
        }
        // Query parameters
        const queryParams = {
            queryTexts: [query],
            nResults: limit
        };
        // Add user filter if specified
        if (userId !== undefined) {
            queryParams.whereDocument = {
                $contains: { userId: userId.toString() }
            };
        }
        // Query the vector store
        const results = await scrollsCollection.query(queryParams);
        // Get the scrolls from storage
        const scrollIds = results.ids[0] || [];
        const scores = results.distances ? results.distances[0] : [];
        const scrolls = await Promise.all(scrollIds.map(id => storage_1.storage.getScroll(id)));
        // Filter out null results
        const validScrolls = scrolls.filter(s => s !== null);
        return {
            scrolls: validScrolls,
            scores: scores
        };
    }
    catch (error) {
        console.error('Error searching similar scrolls:', error);
        return { scrolls: [], scores: [] };
    }
}
/**
 * Search for reflections similar to a given query
 */
async function searchSimilarReflections(query, limit = 5, userId) {
    try {
        if (!embeddingFunction || !reflectionsCollection) {
            throw new Error('Vector search not available');
        }
        // Query parameters
        const queryParams = {
            queryTexts: [query],
            nResults: limit
        };
        // Add user filter if specified
        if (userId !== undefined) {
            queryParams.whereDocument = {
                $contains: { userId: userId.toString() }
            };
        }
        // Query the vector store
        const results = await reflectionsCollection.query(queryParams);
        // Get the reflections from storage
        const reflectionIds = results.ids[0] || [];
        const scores = results.distances ? results.distances[0] : [];
        const reflections = await Promise.all(reflectionIds.map(id => storage_1.storage.getReflection(parseInt(id))));
        // Filter out null results
        const validReflections = reflections.filter(r => r !== null);
        return {
            reflections: validReflections,
            scores: scores
        };
    }
    catch (error) {
        console.error('Error searching similar reflections:', error);
        return { reflections: [], scores: [] };
    }
}
// Initialize the vector store asynchronously without blocking server startup
setTimeout(() => {
    initializeVectorStore()
        .then(() => console.log('Vector store initialization completed'))
        .catch(error => console.error('Failed to initialize vector store:', error));
}, 5000); // Delay initialization by 5 seconds to allow server to start
