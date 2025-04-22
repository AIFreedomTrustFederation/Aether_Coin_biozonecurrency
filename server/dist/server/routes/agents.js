"use strict";
/**
 * Autonomous Agent API Routes
 * Handles all API endpoints for the agent system
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("../storage");
const schema_1 = require("../../shared/schema");
const router = express_1.default.Router();
// Agent Type Routes
// Get all agent types
router.get('/types', async (req, res) => {
    try {
        const category = req.query.category;
        const types = await storage_1.storage.listAgentTypes(category);
        res.json(types);
    }
    catch (error) {
        console.error('Error fetching agent types:', error);
        res.status(500).json({ error: 'Failed to fetch agent types' });
    }
});
// Get a specific agent type
router.get('/types/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid agent type ID' });
        }
        const agentType = await storage_1.storage.getAgentType(id);
        if (!agentType) {
            return res.status(404).json({ error: 'Agent type not found' });
        }
        res.json(agentType);
    }
    catch (error) {
        console.error(`Error fetching agent type ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch agent type' });
    }
});
// Create a new agent type
router.post('/types', async (req, res) => {
    try {
        const result = schema_1.insertAgentTypeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const agentType = await storage_1.storage.createAgentType(result.data);
        res.status(201).json(agentType);
    }
    catch (error) {
        console.error('Error creating agent type:', error);
        res.status(500).json({ error: 'Failed to create agent type' });
    }
});
// Agent Instance Routes
// Get all agent instances
router.get('/instances', async (req, res) => {
    try {
        const status = req.query.status;
        const owner = req.query.owner;
        const instances = await storage_1.storage.listAgentInstances(status, owner);
        res.json(instances);
    }
    catch (error) {
        console.error('Error fetching agent instances:', error);
        res.status(500).json({ error: 'Failed to fetch agent instances' });
    }
});
// Get system-owned agents
router.get('/instances/system', async (req, res) => {
    try {
        // Fetch agents with null owner (system-owned)
        const instances = await storage_1.storage.listAgentInstances(undefined, 'system');
        res.json(instances);
    }
    catch (error) {
        console.error('Error fetching system agent instances:', error);
        res.status(500).json({ error: 'Failed to fetch system agent instances' });
    }
});
// Get a specific agent instance
router.get('/instances/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        const instance = await storage_1.storage.getAgentInstance(id);
        if (!instance) {
            return res.status(404).json({ error: 'Agent instance not found' });
        }
        res.json(instance);
    }
    catch (error) {
        console.error(`Error fetching agent instance ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch agent instance' });
    }
});
// Create a new agent instance
router.post('/instances', async (req, res) => {
    try {
        const result = schema_1.insertAgentInstanceSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const instance = await storage_1.storage.createAgentInstance(result.data);
        res.status(201).json(instance);
    }
    catch (error) {
        console.error('Error creating agent instance:', error);
        res.status(500).json({ error: 'Failed to create agent instance' });
    }
});
// Update agent instance status
router.patch('/instances/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        const { status } = req.body;
        if (!status || !['initializing', 'active', 'paused', 'terminated'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const updatedInstance = await storage_1.storage.updateAgentInstance(id, { status });
        if (!updatedInstance) {
            return res.status(404).json({ error: 'Agent instance not found' });
        }
        res.json(updatedInstance);
    }
    catch (error) {
        console.error(`Error updating agent instance ${req.params.id} status:`, error);
        res.status(500).json({ error: 'Failed to update agent instance status' });
    }
});
// Update agent instance configuration
router.patch('/instances/:id/config', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        const { configuration } = req.body;
        if (!configuration || typeof configuration !== 'object') {
            return res.status(400).json({ error: 'Invalid configuration object' });
        }
        const updatedInstance = await storage_1.storage.updateAgentInstance(id, { configuration });
        if (!updatedInstance) {
            return res.status(404).json({ error: 'Agent instance not found' });
        }
        res.json(updatedInstance);
    }
    catch (error) {
        console.error(`Error updating agent instance ${req.params.id} configuration:`, error);
        res.status(500).json({ error: 'Failed to update agent instance configuration' });
    }
});
// Agent Task Routes
// Get tasks for an agent
router.get('/instances/:id/tasks', async (req, res) => {
    try {
        const agentId = parseInt(req.params.id);
        if (isNaN(agentId)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        const status = req.query.status;
        const tasks = await storage_1.storage.listAgentTasks(agentId, status);
        res.json(tasks);
    }
    catch (error) {
        console.error(`Error fetching tasks for agent ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch agent tasks' });
    }
});
// Create a new task for an agent
router.post('/instances/:id/tasks', async (req, res) => {
    try {
        const agentId = parseInt(req.params.id);
        if (isNaN(agentId)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        // Check if agent exists
        const agent = await storage_1.storage.getAgentInstance(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'Agent instance not found' });
        }
        // Validate and create task
        const taskData = {
            ...req.body,
            agentInstanceId: agentId
        };
        const result = schema_1.insertAgentTaskSchema.safeParse(taskData);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const task = await storage_1.storage.createAgentTask(result.data);
        res.status(201).json(task);
    }
    catch (error) {
        console.error(`Error creating task for agent ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to create agent task' });
    }
});
// Get a specific task
router.get('/tasks/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        const task = await storage_1.storage.getAgentTask(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    }
    catch (error) {
        console.error(`Error fetching task ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});
// Update task status
router.patch('/tasks/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        const { status, result } = req.body;
        if (!status || !['pending', 'in_progress', 'completed', 'failed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const updatedTask = await storage_1.storage.updateAgentTaskStatus(id, status, result);
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    }
    catch (error) {
        console.error(`Error updating task ${req.params.id} status:`, error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});
// Delegation Route - Find the best agent for a task and assign it
router.post('/delegate', async (req, res) => {
    try {
        const { description, category } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'Task description is required' });
        }
        // Find suitable agents based on category (if provided) or status
        const agents = await storage_1.storage.listAgentInstances('active', undefined);
        if (agents.length === 0) {
            return res.status(404).json({ error: 'No active agents available for delegation' });
        }
        // Simple delegation strategy - find the first agent of the right category or the first active agent
        let selectedAgent = agents[0];
        if (category) {
            // Get agent types to check categories
            const agentTypes = await storage_1.storage.listAgentTypes();
            const typeMap = new Map(agentTypes.map(t => [t.id, t]));
            // Find an agent with matching category if possible
            const matchingAgent = agents.find(a => {
                const type = typeMap.get(a.agentTypeId);
                return type && type.category === category;
            });
            if (matchingAgent) {
                selectedAgent = matchingAgent;
            }
        }
        // Create task for the selected agent
        const taskData = {
            agentInstanceId: selectedAgent.id,
            title: description.substring(0, 50), // Use first 50 chars for title
            description,
            priority: 5, // Default priority
            status: 'pending'
        };
        const task = await storage_1.storage.createAgentTask(taskData);
        res.status(201).json({
            task,
            agent: selectedAgent,
            message: `Task delegated to agent ${selectedAgent.name}`
        });
    }
    catch (error) {
        console.error('Error delegating task:', error);
        res.status(500).json({ error: 'Failed to delegate task' });
    }
});
// Agent Team Formation (for complex tasks)
router.post('/teams/form', async (req, res) => {
    try {
        const { taskDescription, teamSize } = req.body;
        if (!taskDescription) {
            return res.status(400).json({ error: 'Task description is required' });
        }
        if (!teamSize || teamSize < 1 || teamSize > 10) {
            return res.status(400).json({ error: 'Invalid team size (must be between 1 and 10)' });
        }
        // Find available agents
        const agents = await storage_1.storage.listAgentInstances('active', undefined);
        if (agents.length === 0) {
            return res.status(404).json({ error: 'No active agents available for team formation' });
        }
        // Select agents for the team (limited by available agents and requested size)
        const teamAgents = agents.slice(0, Math.min(teamSize, agents.length));
        if (teamAgents.length === 0) {
            return res.status(404).json({ error: 'Failed to form team - no suitable agents found' });
        }
        // Generate a unique team ID
        const teamId = `team_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        // In a real implementation, we would create team-related records and tasks
        res.status(201).json({
            teamId,
            agents: teamAgents,
            message: `Team formed with ${teamAgents.length} agents`
        });
    }
    catch (error) {
        console.error('Error forming agent team:', error);
        res.status(500).json({ error: 'Failed to form agent team' });
    }
});
// Monitor team progress
router.get('/teams/:id/progress', (req, res) => {
    try {
        const teamId = req.params.id;
        // This is a placeholder - in a real implementation, we would track team progress
        res.json({
            teamId,
            progress: 0.65, // 65% complete
            status: 'in_progress',
            results: [] // No results yet
        });
    }
    catch (error) {
        console.error(`Error monitoring team ${req.params.id} progress:`, error);
        res.status(500).json({ error: 'Failed to monitor team progress' });
    }
});
// Agent Resource Management
// Allocate resources to an agent
router.post('/instances/:id/resources', (req, res) => {
    try {
        const agentId = parseInt(req.params.id);
        if (isNaN(agentId)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        const { cpu, memory, storage } = req.body;
        // This is a placeholder - in a real implementation, we would allocate actual resources
        res.json({
            agentId,
            allocated: {
                cpu: cpu || 1,
                memory: memory || 512,
                storage: storage || 1024
            },
            message: 'Resources allocated successfully'
        });
    }
    catch (error) {
        console.error(`Error allocating resources for agent ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to allocate resources' });
    }
});
// Get resource usage for an agent
router.get('/instances/:id/resources/usage', (req, res) => {
    try {
        const agentId = parseInt(req.params.id);
        if (isNaN(agentId)) {
            return res.status(400).json({ error: 'Invalid agent instance ID' });
        }
        // This is a placeholder - in a real implementation, we would track actual resource usage
        res.json({
            agentId,
            cpu: 0.35, // 35% utilization
            memory: 256, // MB used
            storage: 512, // MB used
            utilization: 0.42 // 42% overall utilization
        });
    }
    catch (error) {
        console.error(`Error tracking resource usage for agent ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to track resource usage' });
    }
});
// Optimize resource allocation across all agents
router.post('/resources/optimize', (req, res) => {
    try {
        // This is a placeholder - in a real implementation, we would implement resource optimization
        res.json({
            optimized: true,
            changes: [
                { agentId: 1, resource: 'cpu', before: 2, after: 1 },
                { agentId: 2, resource: 'memory', before: 1024, after: 512 }
            ],
            message: 'Resource allocation optimized successfully'
        });
    }
    catch (error) {
        console.error('Error optimizing resource allocation:', error);
        res.status(500).json({ error: 'Failed to optimize resource allocation' });
    }
});
exports.default = router;
