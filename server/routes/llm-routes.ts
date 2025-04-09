/**
 * LLM Routes
 * 
 * This file contains the API routes for interacting with the LLM service.
 */

import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import { llmService } from "../services/llm-service";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Schema for generating text
const generateTextSchema = z.object({
  prompt: z.string().min(1).max(4000),
  options: z.object({
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(1).optional(),
    topP: z.number().min(0).max(1).optional(),
    modelName: z.string().optional()
  }).optional()
});

// Schema for creating a conversation
const createConversationSchema = z.object({
  title: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Schema for sending a message
const sendMessageSchema = z.object({
  conversationId: z.number().optional(),
  content: z.string().min(1).max(4000),
  role: z.enum(["user", "assistant", "system"]).optional()
});

// Schema for fine-tuning requests
const fineTuningSchema = z.object({
  baseModel: z.string(),
  fineTunedModelName: z.string().optional(),
  trainingFileUrl: z.string().url(),
  validationFileUrl: z.string().url().optional(),
  epochs: z.number().optional(),
  batchSize: z.number().optional(),
  learningRate: z.string().optional(),
  parameters: z.record(z.any()).optional()
});

// Schema for sacred pattern analysis
const sacredPatternSchema = z.object({
  input: z.string().min(1).max(4000),
  category: z.string().optional(),
  linkedEntityType: z.string().optional(),
  linkedEntityId: z.number().optional()
});

/**
 * @route POST /api/llm/generate
 * @desc Generate text using the LLM
 * @access Private
 */
router.post("/generate", authenticateUser, async (req, res) => {
  try {
    const validatedData = generateTextSchema.parse(req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const result = await llmService.generateText(
      validatedData.prompt,
      userId,
      validatedData.options
    );
    
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
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
router.post("/conversations", authenticateUser, async (req, res) => {
  try {
    const validatedData = createConversationSchema.parse(req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const conversation = await storage.createLlmConversation({
      userId,
      title: validatedData.title || "New Conversation",
      tags: validatedData.tags || [],
      isActive: true,
      metadata: {}
    });
    
    return res.json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
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
router.get("/conversations", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const conversations = await storage.getLlmConversationsByUserId(userId);
    return res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * @route GET /api/llm/conversations/:id
 * @desc Get a specific conversation with messages
 * @access Private
 */
router.get("/conversations/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getLlmConversationWithMessages(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Check if the conversation belongs to the user
    if (conversation.conversation.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    return res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * @route POST /api/llm/messages
 * @desc Send a message in a conversation
 * @access Private
 */
router.post("/messages", authenticateUser, async (req, res) => {
  try {
    const validatedData = sendMessageSchema.parse(req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    let conversationId = validatedData.conversationId;
    
    // Create a new conversation if none is provided
    if (!conversationId) {
      const conversation = await storage.createLlmConversation({
        userId,
        title: validatedData.content.substring(0, 30) + "...",
        isActive: true,
        tags: [],
        metadata: {}
      });
      conversationId = conversation.id;
    } else {
      // Verify the conversation belongs to the user
      const conversation = await storage.getLlmConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to conversation" });
      }
    }
    
    // Create user message
    const userMessage = await storage.createLlmMessage({
      conversationId,
      userId,
      role: "user",
      content: validatedData.content,
      promptTokens: validatedData.content.length / 4, // rough estimate
      completionTokens: 0,
      totalTokens: validatedData.content.length / 4
    });
    
    // Generate a response from the LLM
    const llmResponse = await llmService.generateText(
      validatedData.content,
      userId
    );
    
    // Create assistant message
    const assistantMessage = await storage.createLlmMessage({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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
router.post("/fine-tuning", authenticateUser, async (req, res) => {
  try {
    const validatedData = fineTuningSchema.parse(req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Create fine-tuning job record
    const job = await storage.createLlmFineTuningJob({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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
router.post("/sacred-pattern", authenticateUser, async (req, res) => {
  try {
    const validatedData = sacredPatternSchema.parse(req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Generate sacred pattern analysis using the LLM
    const analysis = await llmService.generateSacredPatternAnalysis(
      validatedData.input,
      userId
    );
    
    // Store the analysis
    const record = await storage.createSacredPatternRecord({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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
router.get("/sacred-pattern/analytics", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const analytics = await storage.getSacredPatternAnalytics(userId);
    return res.json(analytics);
  } catch (error) {
    console.error("Error fetching sacred pattern analytics:", error);
    return res.status(500).json({ error: "Failed to fetch sacred pattern analytics" });
  }
});

/**
 * @route POST /api/llm/security-verification
 * @desc Run security verification on text
 * @access Private
 */
router.post("/security-verification", authenticateUser, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Valid text is required" });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const verification = await llmService.runSecurityVerification(text, userId);
    return res.json(verification);
  } catch (error) {
    console.error("Error verifying security:", error);
    return res.status(500).json({ error: "Failed to verify security" });
  }
});

export default router;