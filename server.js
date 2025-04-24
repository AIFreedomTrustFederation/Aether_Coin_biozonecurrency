/**
 * Scroll Keeper Simple Server Implementation
 * 
 * Platform-agnostic minimal server that demonstrates the core functionality
 * of the Scroll Keeper system for conversation extraction and LLM training.
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import OpenAI from 'openai';
import KeyStorage from './server/services/auth/key-storage.js';
import OpenAIClient from './server/services/api-clients/openai-client.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup environment variables
const PORT = process.env.PORT || 5000;

// Create express app
const app = express();
const httpServer = http.createServer(app);

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Serve the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Simple memory storage for conversations
const conversations = new Map();
const trainingData = new Map();

// Initialize WebSocket server
const wss = new WebSocketServer({ 
  server: httpServer,
  path: '/ws'
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Scroll Keeper WebSocket Server'
  }));
  
  // Message handler
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message.type);
      
      // Handle subscription requests
      if (message.type === 'subscribe') {
        ws.send(JSON.stringify({
          type: 'subscribed',
          topics: message.topics
        }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize key storage
const keyStorage = new KeyStorage();

// API Key management routes
app.post('/api/keys/store', (req, res) => {
  try {
    const { service, apiKey } = req.body;
    
    if (!service || !apiKey) {
      return res.status(400).json({ error: 'Service and API key are required' });
    }
    
    const success = keyStorage.storeKey(service, apiKey);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to store API key' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Key storage error:', error);
    res.status(500).json({ error: 'Failed to store API key: ' + error.message });
  }
});

app.get('/api/keys/check/:service', (req, res) => {
  try {
    const { service } = req.params;
    
    if (!service) {
      return res.status(400).json({ error: 'Service is required' });
    }
    
    const hasKey = keyStorage.hasKey(service);
    
    return res.json({ 
      service,
      hasKey
    });
  } catch (error) {
    console.error('Key check error:', error);
    res.status(500).json({ error: 'Failed to check API key: ' + error.message });
  }
});

app.delete('/api/keys/:service', (req, res) => {
  try {
    const { service } = req.params;
    
    if (!service) {
      return res.status(400).json({ error: 'Service is required' });
    }
    
    const success = keyStorage.deleteKey(service);
    
    return res.json({ 
      success,
      service
    });
  } catch (error) {
    console.error('Key deletion error:', error);
    res.status(500).json({ error: 'Failed to delete API key: ' + error.message });
  }
});

// Chat interface endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, temperature } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }
    
    // Check if we have a stored OpenAI API key
    let apiKey = keyStorage.retrieveKey('openai');
    
    // If no stored key, check environment variable
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY;
    }
    
    // If still no key, return error
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'OpenAI API key is required. Please provide a key.',
        needsKey: true
      });
    }
    
    // Create OpenAI client
    const openaiClient = new OpenAIClient({ apiKey });
    
    // Set intercept callback to capture conversation for training
    openaiClient.setInterceptCallback((endpoint, request, response) => {
      // Store in the conversation store
      const parsedConversation = {
        id: `chat-${Date.now()}`,
        source: 'chat-direct',
        timestamp: new Date().toISOString(),
        model: response.model || model || 'unknown',
        messages: [...messages],
        metadata: {
          usage: response.usage || {},
          requestedAt: new Date().toISOString()
        }
      };
      
      // Add the response to the conversation
      if (response.choices && response.choices.length > 0) {
        parsedConversation.messages.push({
          role: response.choices[0].message.role,
          content: response.choices[0].message.content
        });
      }
      
      // Store the conversation
      conversations.set(parsedConversation.id, parsedConversation);
      
      // Broadcast to clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'conversation_update',
            data: {
              id: parsedConversation.id,
              source: parsedConversation.source,
              messageCount: parsedConversation.messages.length
            }
          }));
        }
      });
    });
    
    // Call OpenAI
    const completion = await openaiClient.createChatCompletion({
      messages,
      model: model || 'gpt-4o',
      temperature: temperature || 0.7
    });
    
    return res.json(completion);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat request failed: ' + error.message });
  }
});

// Conversation extraction endpoint
app.post('/api/extract/conversation', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Extract share ID from URL
    const shareIdMatch = url.match(/\/share\/([a-zA-Z0-9-]+)/);
    
    if (!shareIdMatch) {
      return res.status(400).json({ error: 'Invalid share URL' });
    }
    
    const shareId = shareIdMatch[1];
    
    // In a real implementation, we would call OpenAI's API 
    // Here we'll simulate a successful response
    const conversation = {
      id: `conv-${shareId}`,
      title: `Conversation ${shareId.substring(0, 8)}`,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Hello, how can you help me learn about language models?'
        },
        {
          role: 'assistant',
          content: 'Language models like me are trained on vast amounts of text data to generate human-like responses. I can help you understand concepts, answer questions, and assist with various tasks. What specific aspects of language models would you like to learn about?'
        }
      ],
      metadata: {
        source: 'chatgpt',
        extractedAt: new Date().toISOString(),
        shareUrl: url
      }
    };
    
    // Store the conversation
    conversations.set(conversation.id, conversation);
    
    // Broadcast to connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'conversation_update',
          data: {
            id: conversation.id,
            title: conversation.title,
            messageCount: conversation.messages.length
          }
        }));
      }
    });
    
    return res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Extraction failed: ' + error.message });
  }
});

// Training routes
let trainingStatus = {
  isTraining: false,
  currentStep: 0,
  totalSteps: 0,
  currentModel: 'langs/dolma-7b',
  startTime: null,
  endTime: null,
  loss: null,
  lastUpdated: new Date().toISOString()
};

// Training status endpoint
app.get('/api/training/status', (req, res) => {
  trainingStatus.lastUpdated = new Date().toISOString();
  res.json(trainingStatus);
});

// Start LLM training endpoint
app.post('/api/training/start', async (req, res) => {
  try {
    const { trainingDataId, baseModel, hyperparams } = req.body;
    
    if (trainingStatus.isTraining) {
      return res.status(400).json({ error: 'Training is already in progress' });
    }
    
    if (!trainingDataId) {
      return res.status(400).json({ error: 'Training data ID is required' });
    }
    
    // Get training data
    const trainingDataObject = trainingData.get(trainingDataId);
    
    if (!trainingDataObject) {
      return res.status(404).json({ error: 'Training data not found' });
    }
    
    console.log(`Starting LLM training with ${trainingDataObject.examples.length} examples`);
    
    // Set up training configuration
    const config = {
      baseModel: baseModel || 'langs/dolma-7b',
      epochs: hyperparams?.epochs || 3,
      batchSize: hyperparams?.batchSize || 8,
      learningRate: hyperparams?.learningRate || 2e-5,
      maxSteps: hyperparams?.maxSteps || 1000,
      ...hyperparams
    };
    
    // Update training status
    trainingStatus = {
      isTraining: true,
      currentStep: 0,
      totalSteps: Math.min(
        config.maxSteps, 
        Math.ceil(trainingDataObject.examples.length * config.epochs / config.batchSize)
      ),
      currentModel: config.baseModel,
      startTime: new Date().toISOString(),
      endTime: null,
      loss: null,
      config,
      trainingDataId,
      lastUpdated: new Date().toISOString()
    };
    
    // Create training job
    const trainingJob = {
      id: `training-job-${Date.now()}`,
      status: 'training',
      startTime: trainingStatus.startTime,
      config,
      trainingDataId
    };
    
    // Broadcast to clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'training_update',
          data: trainingStatus
        }));
      }
    });
    
    // Simulate training progress
    simulateTraining();
    
    return res.json({
      success: true,
      jobId: trainingJob.id,
      status: 'training',
      trainingStatus
    });
  } catch (error) {
    console.error('Training start error:', error);
    res.status(500).json({ error: 'Training failed to start: ' + error.message });
  }
});

// OpenAI API interceptor to capture and process conversations
app.post('/api/intercept/openai', async (req, res) => {
  try {
    const { endpoint, request, response } = req.body;
    
    if (!endpoint || !response) {
      return res.status(400).json({ error: 'Endpoint and response are required' });
    }
    
    console.log(`Intercepted OpenAI ${endpoint} response`);
    
    // Process based on endpoint type
    let parsedConversation;
    
    if (endpoint === 'chat/completions') {
      // Parse chat completions
      parsedConversation = {
        id: `chat-${Date.now()}`,
        source: 'chat-completions',
        timestamp: new Date().toISOString(),
        model: response.model || 'unknown',
        messages: [],
        metadata: {
          usage: response.usage || {},
          interceptedAt: new Date().toISOString()
        }
      };
      
      // Add request messages if available
      if (request && request.messages && Array.isArray(request.messages)) {
        request.messages.forEach(msg => {
          parsedConversation.messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }
      
      // Add response message
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0];
        if (choice.message) {
          parsedConversation.messages.push({
            role: choice.message.role,
            content: choice.message.content
          });
        }
      }
    } else if (endpoint === 'completions') {
      // Parse text completions
      parsedConversation = {
        id: `completion-${Date.now()}`,
        source: 'completions',
        timestamp: new Date().toISOString(),
        model: response.model || 'unknown',
        messages: [],
        metadata: {
          usage: response.usage || {},
          interceptedAt: new Date().toISOString()
        }
      };
      
      // Add prompt as user message
      if (request && request.prompt) {
        parsedConversation.messages.push({
          role: 'user',
          content: request.prompt
        });
      }
      
      // Add completion as assistant message
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0];
        parsedConversation.messages.push({
          role: 'assistant',
          content: choice.text
        });
      }
    } else {
      // Other endpoint types
      parsedConversation = {
        id: `api-${Date.now()}`,
        source: endpoint,
        timestamp: new Date().toISOString(),
        metadata: {
          interceptedAt: new Date().toISOString(),
          endpoint
        }
      };
    }
    
    // Store the conversation
    if (parsedConversation.messages && parsedConversation.messages.length > 0) {
      conversations.set(parsedConversation.id, parsedConversation);
      
      // Broadcast to connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'conversation_update',
            data: {
              id: parsedConversation.id,
              source: parsedConversation.source,
              messageCount: parsedConversation.messages.length
            }
          }));
        }
      });
    }
    
    return res.json({
      success: true,
      conversationId: parsedConversation.id,
      parsed: true
    });
  } catch (error) {
    console.error('Interception error:', error);
    res.status(500).json({ error: 'Interception failed: ' + error.message });
  }
});

// Prepare training data from conversations
app.post('/api/training/prepare', async (req, res) => {
  try {
    const { format, conversationIds } = req.body;
    
    if (!format) {
      return res.status(400).json({ error: 'Format is required' });
    }
    
    let selectedConversations = [];
    
    // If specific conversations are requested, use those
    if (conversationIds && Array.isArray(conversationIds) && conversationIds.length > 0) {
      selectedConversations = conversationIds
        .map(id => conversations.get(id))
        .filter(c => c !== undefined);
    } else {
      // Otherwise use all conversations
      selectedConversations = Array.from(conversations.values());
    }
    
    if (selectedConversations.length === 0) {
      return res.status(400).json({ error: 'No valid conversations found' });
    }
    
    console.log(`Preparing ${selectedConversations.length} conversations for training`);
    
    // Process into training examples based on format
    const examples = [];
    let validationExamples = [];
    
    // Different processing for different formats
    if (format === 'chat' || format === 'instruction') {
      // For chat/instruction format, extract prompt-response pairs
      selectedConversations.forEach(conv => {
        const messages = conv.messages;
        
        // Extract pairs (user->assistant)
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].role === 'user' && messages[i+1].role === 'assistant') {
            examples.push({
              id: `${conv.id}-${i}`,
              prompt: messages[i].content,
              response: messages[i+1].content,
              metadata: {
                model: conv.model,
                source: conv.source
              }
            });
          }
        }
      });
    } else if (format === 'completion') {
      // For completion format, concatenate all previous context
      selectedConversations.forEach(conv => {
        const messages = conv.messages;
        
        for (let i = 1; i < messages.length; i++) {
          if (messages[i].role === 'assistant') {
            // Use all previous messages as context
            const context = messages.slice(0, i).map(m => `${m.role}: ${m.content}`).join('\n\n');
            
            examples.push({
              id: `${conv.id}-${i}`,
              context,
              completion: messages[i].content,
              metadata: {
                model: conv.model,
                source: conv.source
              }
            });
          }
        }
      });
    }
    
    // Split into training and validation if we have enough examples
    if (examples.length > 10) {
      const validationCount = Math.floor(examples.length * 0.1); // 10% for validation
      const shuffled = [...examples].sort(() => 0.5 - Math.random());
      validationExamples = shuffled.slice(0, validationCount);
      examples.splice(0, validationCount);
    }
    
    // Create training data object
    const trainingDataObject = {
      id: `training-${Date.now()}`,
      format,
      examples,
      validation: validationExamples,
      timestamp: new Date().toISOString(),
      stats: {
        totalExamples: examples.length + validationExamples.length,
        trainingExamples: examples.length,
        validationExamples: validationExamples.length,
        conversationsUsed: selectedConversations.length
      }
    };
    
    // Store training data
    trainingData.set(trainingDataObject.id, trainingDataObject);
    
    return res.json({
      success: true,
      trainingDataId: trainingDataObject.id,
      stats: trainingDataObject.stats
    });
  } catch (error) {
    console.error('Training preparation error:', error);
    res.status(500).json({ error: 'Training preparation failed: ' + error.message });
  }
});

// Function to simulate training progress
function simulateTraining() {
  if (!trainingStatus.isTraining) return;
  
  const totalSteps = trainingStatus.totalSteps;
  
  // Dynamic update interval - faster at beginning, slower as training progresses
  const getUpdateInterval = (step) => {
    const progressRatio = step / totalSteps;
    return 500 + Math.floor(progressRatio * 1500); // 500ms at start, up to 2000ms near end
  };
  
  // Dynamic step increment - larger jumps at beginning, smaller precise steps at end
  const getStepIncrement = (step) => {
    const remainingSteps = totalSteps - step;
    const baseIncrement = Math.max(1, Math.floor(totalSteps / 120)); // Complete in ~120 updates
    
    if (remainingSteps < totalSteps * 0.1) {
      // Slow down near the end for more precision
      return Math.max(1, Math.floor(baseIncrement / 2));
    }
    
    // Add some randomness
    return baseIncrement + Math.floor(Math.random() * 3);
  };
  
  // Schedule next update
  setTimeout(() => {
    // Calculate step increment for this update
    const stepIncrement = getStepIncrement(trainingStatus.currentStep);
    
    // Update training progress with the calculated increment
    trainingStatus.currentStep += stepIncrement;
    trainingStatus.currentStep = Math.min(trainingStatus.currentStep, totalSteps);
    
    // Calculate progress percentage
    const progress = trainingStatus.currentStep / totalSteps;
    
    // Simulate realistic decreasing loss with noise
    // Start high, quick initial drop, then gradual improvement with occasional spikes
    const baseLoss = 5.0 * Math.exp(-progress * 3.5) + 0.8;
    const noise = (Math.random() - 0.5) * 0.3 * (1 - progress);
    trainingStatus.loss = baseLoss + noise;
    
    // Occasional plateaus and spikes to simulate real training behavior
    if (Math.random() < 0.05) {
      // Small chance of a loss spike
      trainingStatus.loss *= 1.2;
    }
    
    trainingStatus.lastUpdated = new Date().toISOString();
    
    // Broadcast update
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'training_update',
          data: trainingStatus
        }));
      }
    });
    
    // Log to console occasionally (every ~10% progress)
    if (trainingStatus.currentStep % Math.floor(totalSteps / 10) < stepIncrement) {
      console.log(`Training progress: ${Math.floor(progress * 100)}%, Loss: ${trainingStatus.loss.toFixed(4)}`);
    }
    
    // If training is complete
    if (trainingStatus.currentStep >= totalSteps) {
      trainingStatus.isTraining = false;
      trainingStatus.endTime = new Date().toISOString();
      console.log('Training complete! Final loss:', trainingStatus.loss.toFixed(4));
      
      // Broadcast completion
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'training_complete',
            data: {
              ...trainingStatus,
              message: `LLM training complete with final loss of ${trainingStatus.loss.toFixed(4)}!`
            }
          }));
        }
      });
    } else {
      // Continue simulation with dynamic update interval
      simulateTraining();
    }
  }, getUpdateInterval(trainingStatus.currentStep));
}

// Catch-all route to serve the React app for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the React app's index.html for client-side routing
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Scroll Keeper minimal server running on port ${PORT}`);
  console.log(`✓ API available at http://0.0.0.0:${PORT}/api`);
  console.log(`✓ WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
});