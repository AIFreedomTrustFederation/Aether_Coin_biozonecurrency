/**
 * Scroll Keeper Minimal Server
 * 
 * Platform-agnostic server for Scroll Keeper functionality
 * Provides API endpoints and WebSocket for conversation extraction and LLM training
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import modules
import OpenAITokenProvider from './services/auth/providers/openai-token.js';
import CredentialManager from './services/auth/credential-manager.js';
import OpenAIClient from './services/api-clients/openai-client.js';
import ApiClientFactory from './services/api-clients/client-factory.js';
import OpenAIInterceptor from './services/api-clients/openai-interceptor.js';
import ConversationParser from './services/scroll-keeper/parsers/conversation-parser.js';
import TrainingProcessor from './services/scroll-keeper/training/training-processor.js';
import LangsTrainer from './services/scroll-keeper/training/langs-trainer.js';
import WebSocketHandler from './services/scroll-keeper/ws-handler.js';

// Setup environment variables
const PORT = process.env.PORT || 5000;

// Memory storage service (simplified for example)
class MemoryStorage {
  constructor() {
    this.conversations = new Map();
    this.trainingData = new Map();
    this.trainingResults = new Map();
    console.log('✓ Storage module initialized');
  }

  async storeConversation(conversation) {
    this.conversations.set(conversation.id, conversation);
    return conversation.id;
  }

  async getConversation(id) {
    return this.conversations.get(id);
  }

  async storeTrainingData(trainingData) {
    const id = `training-${Date.now()}`;
    this.trainingData.set(id, trainingData);
    return id;
  }

  async storeTrainingResults(results) {
    this.trainingResults.set(results.id, results);
    return results.id;
  }
}

// Initialize Hugging Face client (simplified for example)
class HuggingFaceClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    
    if (!this.apiKey) {
      console.warn('No Hugging Face API key provided, some functionality may be limited');
    } else {
      console.log('✓ Initializing Hugging Face client with provided API key');
    }
    
    console.log('✓ Hugging Face client initialized successfully');
  }
  
  async generateEmbeddings(text) {
    // Simplified - would actually call Hugging Face API
    return { 
      dimensions: 384,
      values: Array(384).fill(0).map(() => Math.random() - 0.5)
    };
  }
}

// Create express app
const app = express();
const httpServer = http.createServer(app);

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup static file serving
app.use(express.static(path.join(__dirname, '../public')));

// Initialize storage
const storage = new MemoryStorage();

// Initialize auth providers
const openAITokenProvider = new OpenAITokenProvider({
  defaultToken: process.env.OPENAI_API_KEY
});

const credentialManager = new CredentialManager();

// Initialize authentication providers map
const authProviders = {
  openai: openAITokenProvider
};

// Initialize API clients
const apiClientFactory = new ApiClientFactory({
  authProviders
});

// Initialize Hugging Face client
const hfClient = new HuggingFaceClient(process.env.HUGGINGFACE_API_KEY);

// Initialize conversation parser
const conversationParser = new ConversationParser({
  storage,
  vectorizer: hfClient
});

// Initialize training processor
const trainingProcessor = new TrainingProcessor({
  storage,
  config: {
    contextWindowSize: 4096,
    formatType: 'instruction'
  }
});

// Initialize Langs trainer
const langsTrainer = new LangsTrainer({
  storage,
  hfClient,
  config: {
    baseModel: 'langs/dolma-7b'
  }
});

// Initialize OpenAI interceptor
const openAIInterceptor = new OpenAIInterceptor({
  parser: conversationParser,
  storage
});

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler({
  server: httpServer,
  path: '/ws'
});

// Setup API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Authentication routes
app.post('/api/auth/token', async (req, res) => {
  try {
    const { service, token } = req.body;
    
    if (!service || !token) {
      return res.status(400).json({ error: 'Service and token are required' });
    }
    
    // Validate token
    if (service === 'openai') {
      const isValid = await openAITokenProvider.validateToken(token);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Generate a session ID
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Store token
      openAITokenProvider.setToken(sessionId, token);
      
      return res.json({
        sessionId,
        service,
        expires: new Date(Date.now() + 3600 * 1000).toISOString()
      });
    } else {
      return res.status(400).json({ error: 'Unsupported service' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Conversation extraction routes
app.post('/api/extract/conversation', async (req, res) => {
  try {
    const { url, sessionId } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Extract share ID from URL
    const shareIdMatch = url.match(/\/share\/([a-zA-Z0-9-]+)/);
    
    if (!shareIdMatch) {
      return res.status(400).json({ error: 'Invalid share URL' });
    }
    
    const shareId = shareIdMatch[1];
    
    // Get OpenAI client
    const openaiClient = apiClientFactory.getClient('openai');
    
    // Extract conversation
    const conversation = await openaiClient.extractSharedConversation(shareId, sessionId);
    
    // Parse conversation
    const parsedConversation = await conversationParser.parseConversation(
      conversation, 'shared-conversations', { shareId, shareUrl: url }
    );
    
    return res.json({
      success: true,
      conversation: parsedConversation
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Extraction failed: ' + error.message });
  }
});

// Training routes
app.post('/api/training/prepare', async (req, res) => {
  try {
    const { conversations, config } = req.body;
    
    if (!conversations || !Array.isArray(conversations)) {
      return res.status(400).json({ error: 'Valid conversations array is required' });
    }
    
    // Process training data
    const trainingData = await trainingProcessor.processConversations(conversations, config);
    
    return res.json({
      success: true,
      stats: trainingData.stats,
      exampleCount: trainingData.examples.length,
      validationCount: trainingData.validation.length
    });
  } catch (error) {
    console.error('Training preparation error:', error);
    res.status(500).json({ error: 'Training preparation failed: ' + error.message });
  }
});

app.post('/api/training/start', async (req, res) => {
  try {
    const { trainingDataId, config } = req.body;
    
    if (!trainingDataId) {
      return res.status(400).json({ error: 'Training data ID is required' });
    }
    
    // Get training data
    const trainingData = storage.trainingData.get(trainingDataId);
    
    if (!trainingData) {
      return res.status(404).json({ error: 'Training data not found' });
    }
    
    // Prepare for Langs
    const preparedData = await langsTrainer.prepareTrainingData(trainingData);
    
    // Start training
    const trainingJob = await langsTrainer.startTraining(preparedData, config);
    
    return res.json({
      success: true,
      jobId: trainingJob.id,
      model: trainingJob.model,
      status: trainingJob.status
    });
  } catch (error) {
    console.error('Training start error:', error);
    res.status(500).json({ error: 'Training failed to start: ' + error.message });
  }
});

app.get('/api/training/status', (req, res) => {
  const status = langsTrainer.getStatus();
  res.json(status);
});

// Add OpenAI interceptor middleware
app.use(openAIInterceptor.middleware());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Scroll Keeper minimal server running on port ${PORT}`);
  console.log(`✓ API available at http://0.0.0.0:${PORT}/api`);
  
  // Initialize WebSocket handler
  wsHandler.initialize();
  console.log(`✓ WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down...');
  
  // Close WebSocket server
  wsHandler.shutdown();
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Export for testing
export { app, httpServer };