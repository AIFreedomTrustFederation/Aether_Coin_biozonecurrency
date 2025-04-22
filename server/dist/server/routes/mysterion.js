"use strict";
/**
 * Mysterion API Routes
 * Handles all API endpoints for the Mysterion intelligence system
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("../storage");
const schema_1 = require("../../shared/schema");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Knowledge Node Routes
// Get all knowledge nodes with optional filtering
router.get('/knowledge/nodes', async (req, res) => {
    try {
        const nodeType = req.query.type;
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const nodes = await storage_1.storage.listKnowledgeNodes(nodeType, limit);
        res.json(nodes);
    }
    catch (error) {
        console.error('Error fetching knowledge nodes:', error);
        res.status(500).json({ error: 'Failed to fetch knowledge nodes' });
    }
});
// Create a new knowledge node
router.post('/knowledge/nodes', async (req, res) => {
    try {
        const result = schema_1.insertMysterionKnowledgeNodeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const node = await storage_1.storage.createKnowledgeNode(result.data);
        res.status(201).json(node);
    }
    catch (error) {
        console.error('Error creating knowledge node:', error);
        res.status(500).json({ error: 'Failed to create knowledge node' });
    }
});
// Get a specific knowledge node by ID
router.get('/knowledge/nodes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid node ID' });
        }
        const node = await storage_1.storage.getKnowledgeNode(id);
        if (!node) {
            return res.status(404).json({ error: 'Knowledge node not found' });
        }
        res.json(node);
    }
    catch (error) {
        console.error(`Error fetching knowledge node ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch knowledge node' });
    }
});
// Update a knowledge node
router.patch('/knowledge/nodes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid node ID' });
        }
        // Validate update fields
        const updateSchema = schema_1.insertMysterionKnowledgeNodeSchema.partial();
        const result = updateSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const updatedNode = await storage_1.storage.updateKnowledgeNode(id, result.data);
        if (!updatedNode) {
            return res.status(404).json({ error: 'Knowledge node not found' });
        }
        res.json(updatedNode);
    }
    catch (error) {
        console.error(`Error updating knowledge node ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update knowledge node' });
    }
});
// Delete a knowledge node
router.delete('/knowledge/nodes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid node ID' });
        }
        const success = await storage_1.storage.deleteKnowledgeNode(id);
        if (!success) {
            return res.status(404).json({ error: 'Knowledge node not found' });
        }
        res.status(204).end();
    }
    catch (error) {
        console.error(`Error deleting knowledge node ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete knowledge node' });
    }
});
// Search for knowledge nodes
router.get('/knowledge/nodes/search', async (req, res) => {
    try {
        const query = req.query.query;
        const type = req.query.type;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        // This is a placeholder for a more sophisticated search implementation
        // In a real implementation, you would likely use a search index
        const allNodes = await storage_1.storage.listKnowledgeNodes(type, 1000);
        // Simple search implementation (case-insensitive partial match)
        const queryLower = query.toLowerCase();
        const filteredNodes = allNodes.filter(node => node.title.toLowerCase().includes(queryLower) ||
            node.content.toLowerCase().includes(queryLower)).slice(0, limit);
        res.json(filteredNodes);
    }
    catch (error) {
        console.error('Error searching knowledge nodes:', error);
        res.status(500).json({ error: 'Failed to search knowledge nodes' });
    }
});
// Knowledge Edge Routes
// Create a new knowledge edge
router.post('/knowledge/edges', async (req, res) => {
    try {
        const result = schema_1.insertMysterionKnowledgeEdgeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const edge = await storage_1.storage.createKnowledgeEdge(result.data);
        res.status(201).json(edge);
    }
    catch (error) {
        console.error('Error creating knowledge edge:', error);
        res.status(500).json({ error: 'Failed to create knowledge edge' });
    }
});
// Delete a knowledge edge
router.delete('/knowledge/edges/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid edge ID' });
        }
        const success = await storage_1.storage.deleteKnowledgeEdge(id);
        if (!success) {
            return res.status(404).json({ error: 'Knowledge edge not found' });
        }
        res.status(204).end();
    }
    catch (error) {
        console.error(`Error deleting knowledge edge ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete knowledge edge' });
    }
});
// Get connections for a node
router.get('/knowledge/nodes/:id/connections', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid node ID' });
        }
        const connections = await storage_1.storage.getNodeConnections(id);
        res.json(connections);
    }
    catch (error) {
        console.error(`Error fetching connections for node ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch node connections' });
    }
});
// Improvement Routes
// Get all improvements with optional status filtering
router.get('/knowledge/improvements', async (req, res) => {
    try {
        const status = req.query.status;
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const improvements = await storage_1.storage.listImprovements(status, limit);
        res.json(improvements);
    }
    catch (error) {
        console.error('Error fetching improvements:', error);
        res.status(500).json({ error: 'Failed to fetch improvements' });
    }
});
// Create a new improvement
router.post('/knowledge/improvements', async (req, res) => {
    try {
        const result = schema_1.insertMysterionImprovementSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const improvement = await storage_1.storage.createImprovement(result.data);
        res.status(201).json(improvement);
    }
    catch (error) {
        console.error('Error creating improvement:', error);
        res.status(500).json({ error: 'Failed to create improvement' });
    }
});
// Get a specific improvement by ID
router.get('/knowledge/improvements/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid improvement ID' });
        }
        const improvement = await storage_1.storage.getImprovement(id);
        if (!improvement) {
            return res.status(404).json({ error: 'Improvement not found' });
        }
        res.json(improvement);
    }
    catch (error) {
        console.error(`Error fetching improvement ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch improvement' });
    }
});
// Update improvement status
router.patch('/knowledge/improvements/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid improvement ID' });
        }
        // Validate status
        const statusSchema = zod_1.z.object({
            status: zod_1.z.enum(['proposed', 'approved', 'implemented', 'rejected'])
        });
        const result = statusSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { status } = result.data;
        let implementedAt;
        if (status === 'implemented') {
            implementedAt = new Date();
        }
        const updatedImprovement = await storage_1.storage.updateImprovementStatus(id, status, implementedAt);
        if (!updatedImprovement) {
            return res.status(404).json({ error: 'Improvement not found' });
        }
        res.json(updatedImprovement);
    }
    catch (error) {
        console.error(`Error updating improvement ${req.params.id} status:`, error);
        res.status(500).json({ error: 'Failed to update improvement status' });
    }
});
// Knowledge Graph Advanced Operations
// Graph traversal
router.get('/knowledge/graph/traverse/:startNodeId', async (req, res) => {
    try {
        const startNodeId = parseInt(req.params.startNodeId);
        if (isNaN(startNodeId)) {
            return res.status(400).json({ error: 'Invalid start node ID' });
        }
        const depth = req.query.depth ? parseInt(req.query.depth) : 2;
        const relationshipType = req.query.relationshipType;
        // Simple BFS traversal implementation
        const visited = new Set();
        const queue = [startNodeId];
        const result = [];
        let currentDepth = 0;
        while (queue.length > 0 && currentDepth < depth) {
            const levelSize = queue.length;
            for (let i = 0; i < levelSize; i++) {
                const nodeId = queue.shift();
                if (visited.has(nodeId)) {
                    continue;
                }
                visited.add(nodeId);
                const node = await storage_1.storage.getKnowledgeNode(nodeId);
                if (node) {
                    result.push(node);
                    const connections = await storage_1.storage.getNodeConnections(nodeId);
                    // Process outgoing connections
                    for (const edge of connections.outgoing) {
                        if (!relationshipType || edge.relationshipType === relationshipType) {
                            if (!visited.has(edge.targetId)) {
                                queue.push(edge.targetId);
                            }
                        }
                    }
                }
            }
            currentDepth++;
        }
        res.json(result);
    }
    catch (error) {
        console.error(`Error traversing graph from node ${req.params.startNodeId}:`, error);
        res.status(500).json({ error: 'Failed to traverse graph' });
    }
});
// API Key Management Routes
// Get all API keys
router.get('/api-keys', (req, res) => {
    // This would be implemented with proper authentication
    res.json({ apiKeys: [] });
});
// Create a new API key
router.post('/api-keys', (req, res) => {
    // This would be implemented with proper key management
    res.status(201).json({ id: Math.floor(Math.random() * 1000), ...req.body });
});
// Update an API key
router.patch('/api-keys/:id', (req, res) => {
    // This would be implemented with proper key management
    res.json({ id: parseInt(req.params.id), ...req.body });
});
// Delete an API key
router.delete('/api-keys/:id', (req, res) => {
    // This would be implemented with proper key management
    res.status(204).end();
});
// Text Generation Route
router.post('/generate', (req, res) => {
    // This would be implemented with proper LLM integration
    const { prompt } = req.body;
    // Simple response for demonstration
    res.json({
        text: `Response to: ${prompt}\n\nThis is a placeholder response from the Mysterion AI system. In a real implementation, this would connect to an actual language model.`
    });
});
// Contribution Points Route
router.get('/contribution', (req, res) => {
    // This would be implemented to track user contributions
    res.json({ points: 100 });
});
// System Health Route
router.get('/system/health', (req, res) => {
    // This would provide real system health metrics
    res.json({
        status: 'healthy',
        components: {
            api: { status: 'operational', metrics: { responseTime: 45, errorRate: 0.01 } },
            database: { status: 'operational', metrics: { connections: 5, queryTime: 12 } },
            storage: { status: 'operational', metrics: { usage: 0.45, iops: 120 } },
            processing: { status: 'operational', metrics: { queue: 2, processingTime: 235 } }
        }
    });
});
exports.default = router;
