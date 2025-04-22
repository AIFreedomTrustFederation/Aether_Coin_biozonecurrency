"use strict";
/**
 * LLM Routes
 *
 * This file contains the API routes for interacting with the LLM service.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const storage_1 = require("../storage");
const llm_service_1 = require("../services/llm-service");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Schema for generating text
const generateTextSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).max(4000),
    options: zod_1.z.object({
        maxTokens: zod_1.z.number().optional(),
        temperature: zod_1.z.number().min(0).max(1).optional(),
        topP: zod_1.z.number().min(0).max(1).optional(),
        modelName: zod_1.z.string().optional()
    }).optional()
});
// Schema for creating a conversation
const createConversationSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Schema for sending a message
const sendMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.number().optional(),
    content: zod_1.z.string().min(1).max(4000),
    role: zod_1.z.enum(["user", "assistant", "system"]).optional()
});
// Schema for fine-tuning requests
const fineTuningSchema = zod_1.z.object({
    baseModel: zod_1.z.string(),
    fineTunedModelName: zod_1.z.string().optional(),
    trainingFileUrl: zod_1.z.string().url(),
    validationFileUrl: zod_1.z.string().url().optional(),
    epochs: zod_1.z.number().optional(),
    batchSize: zod_1.z.number().optional(),
    learningRate: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()).optional()
});
// Schema for sacred pattern analysis
const sacredPatternSchema = zod_1.z.object({
    input: zod_1.z.string().min(1).max(4000),
    category: zod_1.z.string().optional(),
    linkedEntityType: zod_1.z.string().optional(),
    linkedEntityId: zod_1.z.number().optional()
});
/**
 * @route POST /api/llm/generate
 * @desc Generate text using the LLM
 * @access Private
 */
router.post("/generate", auth_1.authenticateUser, async (req, res) => {
    try {
        const validatedData = generateTextSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const result = await llm_service_1.llmService.generateText(validatedData.prompt, userId, validatedData.options);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error generating text:", error);
        return res.status(500).json({ error: "Failed to generate text" });
    }
});
/**
 * @route POST /api/llm/conversations
 * @desc Create a new conversation
 * @access Private
 */
router.post("/conversations", auth_1.authenticateUser, async (req, res) => {
    try {
        const validatedData = createConversationSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const conversation = await storage_1.storage.createLlmConversation({
            userId,
            title: validatedData.title || "New Conversation",
            tags: validatedData.tags || [],
            isActive: true,
            metadata: {}
        });
        return res.json(conversation);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error creating conversation:", error);
        return res.status(500).json({ error: "Failed to create conversation" });
    }
});
/**
 * @route GET /api/llm/conversations
 * @desc Get all conversations for the user
 * @access Private
 */
router.get("/conversations", auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const conversations = await storage_1.storage.getLlmConversationsByUserId(userId);
        return res.json(conversations);
    }
    catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ error: "Failed to fetch conversations" });
    }
});
/**
 * @route GET /api/llm/conversations/:id
 * @desc Get a specific conversation with messages
 * @access Private
 */
router.get("/conversations/:id", auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const conversationId = parseInt(req.params.id);
        const conversation = await storage_1.storage.getLlmConversationWithMessages(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        // Check if the conversation belongs to the user
        if (conversation.conversation.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        return res.json(conversation);
    }
    catch (error) {
        console.error("Error fetching conversation:", error);
        return res.status(500).json({ error: "Failed to fetch conversation" });
    }
});
/**
 * @route POST /api/llm/messages
 * @desc Send a message in a conversation
 * @access Private
 */
router.post("/messages", auth_1.authenticateUser, async (req, res) => {
    try {
        const validatedData = sendMessageSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        let conversationId = validatedData.conversationId;
        // Create a new conversation if none is provided
        if (!conversationId) {
            const conversation = await storage_1.storage.createLlmConversation({
                userId,
                title: validatedData.content.substring(0, 30) + "...",
                isActive: true,
                tags: [],
                metadata: {}
            });
            conversationId = conversation.id;
        }
        else {
            // Verify the conversation belongs to the user
            const conversation = await storage_1.storage.getLlmConversation(conversationId);
            if (!conversation || conversation.userId !== userId) {
                return res.status(403).json({ error: "Unauthorized access to conversation" });
            }
        }
        // Create user message
        const userMessage = await storage_1.storage.createLlmMessage({
            conversationId,
            userId,
            role: "user",
            content: validatedData.content,
            promptTokens: validatedData.content.length / 4, // rough estimate
            completionTokens: 0,
            totalTokens: validatedData.content.length / 4
        });
        // Generate a response from the LLM
        const llmResponse = await llm_service_1.llmService.generateText(validatedData.content, userId);
        // Create assistant message
        const assistantMessage = await storage_1.storage.createLlmMessage({
            conversationId,
            userId,
            role: "assistant",
            content: llmResponse.text,
            promptTokens: llmResponse.usage.promptTokens,
            completionTokens: llmResponse.usage.completionTokens,
            totalTokens: llmResponse.usage.totalTokens,
            metadata: llmResponse.metadata
        });
        // Update the conversation's last message timestamp (already done by createLlmMessage)
        return res.json({
            userMessage,
            assistantMessage,
            conversationId
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Failed to send message" });
    }
});
/**
 * @route POST /api/llm/fine-tuning
 * @desc Start a fine-tuning job
 * @access Private
 */
router.post("/fine-tuning", auth_1.authenticateUser, async (req, res) => {
    try {
        const validatedData = fineTuningSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Create fine-tuning job record
        const job = await storage_1.storage.createLlmFineTuningJob({
            userId,
            baseModel: validatedData.baseModel,
            fineTunedModelName: validatedData.fineTunedModelName,
            status: "queued",
            trainingFileUrl: validatedData.trainingFileUrl,
            validationFileUrl: validatedData.validationFileUrl,
            epochs: validatedData.epochs,
            batchSize: validatedData.batchSize,
            learningRate: validatedData.learningRate,
            parameters: validatedData.parameters
        });
        // In a real implementation, you would start the fine-tuning job here
        // For now, we'll just return the job
        return res.json(job);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error starting fine-tuning job:", error);
        return res.status(500).json({ error: "Failed to start fine-tuning job" });
    }
});
/**
 * @route POST /api/llm/sacred-pattern
 * @desc Analyze input for sacred patterns
 * @access Private
 */
router.post("/sacred-pattern", auth_1.authenticateUser, async (req, res) => {
    try {
        const validatedData = sacredPatternSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Generate sacred pattern analysis using the LLM
        const analysis = await llm_service_1.llmService.generateSacredPatternAnalysis(validatedData.input, userId);
        // Store the analysis
        const record = await storage_1.storage.createSacredPatternRecord({
            userId,
            input: validatedData.input,
            analysis,
            divinePrinciple: analysis.divinePrinciple,
            goldenRatioAlignment: analysis.goldenRatioAlignment,
            temporalHarmonicScore: analysis.temporalHarmonicScore,
            category: validatedData.category,
            linkedEntityType: validatedData.linkedEntityType,
            linkedEntityId: validatedData.linkedEntityId
        });
        return res.json({
            record,
            analysis
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error analyzing sacred pattern:", error);
        return res.status(500).json({ error: "Failed to analyze sacred pattern" });
    }
});
/**
 * @route GET /api/llm/sacred-pattern/analytics
 * @desc Get sacred pattern analytics for user
 * @access Private
 */
router.get("/sacred-pattern/analytics", auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const analytics = await storage_1.storage.getSacredPatternAnalytics(userId);
        return res.json(analytics);
    }
    catch (error) {
        console.error("Error fetching sacred pattern analytics:", error);
        return res.status(500).json({ error: "Failed to fetch sacred pattern analytics" });
    }
});
/**
 * @route POST /api/llm/security-verification
 * @desc Run security verification on text
 * @access Private
 */
router.post("/security-verification", auth_1.authenticateUser, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: "Valid text is required" });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const verification = await llm_service_1.llmService.runSecurityVerification(text, userId);
        return res.json(verification);
    }
    catch (error) {
        console.error("Error verifying security:", error);
        return res.status(500).json({ error: "Failed to verify security" });
    }
});
exports.default = router;
