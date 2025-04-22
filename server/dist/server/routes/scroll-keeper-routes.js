"use strict";
/**
 * Scroll Keeper Routes
 *
 * API endpoints for the Scroll Keeper functionality
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const storage_1 = require("../storage");
const scroll_keeper_schema_1 = require("../../shared/scroll-keeper-schema");
const scroll_ingestor_1 = require("../services/scroll-keeper/scroll-ingestor");
const vectorstore_1 = require("../services/scroll-keeper/vectorstore");
const llm_engine_1 = require("../services/scroll-keeper/llm-engine");
const router = express_1.default.Router();
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
        const userId = req.query.userId ? parseInt(req.query.userId) : 1; // Default to user 1 for demo
        const scrolls = await storage_1.storage.getScrollsByUserId(userId);
        res.json(scrolls);
    }
    catch (error) {
        console.error('Error fetching scrolls:', error);
        res.status(500).json({ message: 'Failed to fetch scrolls' });
    }
});
// Get a specific scroll by ID
router.get('/scrolls/:id', async (req, res) => {
    try {
        const scrollId = req.params.id;
        const scroll = await storage_1.storage.getScroll(scrollId);
        if (!scroll) {
            return res.status(404).json({ message: 'Scroll not found' });
        }
        res.json(scroll);
    }
    catch (error) {
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
        const scrollId = await (0, scroll_ingestor_1.processScrollFromUrl)(url, userIdNum);
        if (!scrollId) {
            return res.status(500).json({ message: 'Failed to process URL' });
        }
        // Get the created scroll
        const scroll = await storage_1.storage.getScroll(scrollId);
        // Queue a reflection generation task
        await storage_1.storage.createProcessingQueueItem({
            taskType: 'reflection_generation',
            payload: { scrollId },
            priority: 3
        });
        res.status(201).json(scroll);
    }
    catch (error) {
        console.error('Error creating scroll from URL:', error);
        res.status(500).json({ message: 'Failed to create scroll from URL' });
    }
});
// Create a new scroll manually
router.post('/scrolls', async (req, res) => {
    try {
        const scrollData = scroll_keeper_schema_1.insertScrollSchema.parse(req.body);
        const scroll = await storage_1.storage.createScroll(scrollData);
        // Queue embedding generation
        await storage_1.storage.createProcessingQueueItem({
            taskType: 'embedding_generation',
            payload: { scrollId: scroll.id, text: scroll.content },
            priority: 5
        });
        res.status(201).json(scroll);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
        const scroll = await storage_1.storage.getScroll(scrollId);
        if (!scroll) {
            return res.status(404).json({ message: 'Scroll not found' });
        }
        const updatedScroll = await storage_1.storage.updateScroll(scrollId, updates);
        // If content was updated, queue a new embedding generation
        if (updates.content && updates.content !== scroll.content) {
            await storage_1.storage.createProcessingQueueItem({
                taskType: 'embedding_generation',
                payload: { scrollId, text: updates.content },
                priority: 5
            });
        }
        res.json(updatedScroll);
    }
    catch (error) {
        console.error(`Error updating scroll ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to update scroll' });
    }
});
// Delete a scroll
router.delete('/scrolls/:id', async (req, res) => {
    try {
        const scrollId = req.params.id;
        const success = await storage_1.storage.deleteScroll(scrollId);
        if (!success) {
            return res.status(404).json({ message: 'Scroll not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting scroll ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to delete scroll' });
    }
});
// Search scrolls
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }
        const results = await (0, vectorstore_1.searchSimilarScrolls)(query, limit);
        res.json(results);
    }
    catch (error) {
        console.error('Error searching scrolls:', error);
        res.status(500).json({ message: 'Failed to search scrolls' });
    }
});
// Get reflections for a scroll
router.get('/scrolls/:id/reflections', async (req, res) => {
    try {
        const scrollId = req.params.id;
        const reflections = await storage_1.storage.getReflectionsByScrollId(scrollId);
        res.json(reflections);
    }
    catch (error) {
        console.error(`Error fetching reflections for scroll ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to fetch reflections' });
    }
});
// Generate a reflection for a scroll
router.post('/scrolls/:id/reflections', async (req, res) => {
    try {
        const scrollId = req.params.id;
        const scroll = await storage_1.storage.getScroll(scrollId);
        if (!scroll) {
            return res.status(404).json({ message: 'Scroll not found' });
        }
        // Generate the reflection
        const reflectionId = await (0, llm_engine_1.generateReflectionForScroll)(scrollId);
        if (!reflectionId) {
            return res.status(500).json({ message: 'Failed to generate reflection' });
        }
        // Get the created reflection
        const reflection = await storage_1.storage.getReflection(parseInt(reflectionId));
        res.status(201).json(reflection);
    }
    catch (error) {
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
        const result = await (0, llm_engine_1.generateAnswerFromScrolls)(question, userIdNum);
        if (!result) {
            return res.status(500).json({ message: 'Failed to generate answer' });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error generating answer:', error);
        res.status(500).json({ message: 'Failed to generate answer' });
    }
});
// Get user settings
router.get('/settings', async (req, res) => {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId) : 1; // Default to user 1 for demo
        const settings = await storage_1.storage.getScrollKeeperSettingsByUserId(userId);
        if (!settings) {
            // Create default settings if none exist
            const defaultSettings = await storage_1.storage.createScrollKeeperSettings({
                userId,
                theme: 'cosmic',
                allowPublicSharing: 'false'
            });
            return res.json(defaultSettings);
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});
// Update user settings
router.patch('/settings/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;
        const settings = await storage_1.storage.getScrollKeeperSettings(id);
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        const updatedSettings = await storage_1.storage.updateScrollKeeperSettings(id, updates);
        res.json(updatedSettings);
    }
    catch (error) {
        console.error(`Error updating settings ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
});
// Get processing queue status
router.get('/queue/status', async (req, res) => {
    try {
        const pendingTasks = await storage_1.storage.getPendingProcessingQueueItems(100);
        // Group tasks by type
        const taskCounts = pendingTasks.reduce((acc, task) => {
            acc[task.taskType] = (acc[task.taskType] || 0) + 1;
            return acc;
        }, {});
        res.json({
            pendingTasksCount: pendingTasks.length,
            taskCounts
        });
    }
    catch (error) {
        console.error('Error fetching queue status:', error);
        res.status(500).json({ message: 'Failed to fetch queue status' });
    }
});
exports.default = router;
