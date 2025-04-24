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
app.get('/api/training/status', (req, res) => {
  res.json({
    isTraining: false,
    currentStep: 0,
    totalSteps: 0,
    currentModel: 'langs/dolma-7b',
    lastUpdated: new Date().toISOString()
  });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Scroll Keeper minimal server running on port ${PORT}`);
  console.log(`✓ API available at http://0.0.0.0:${PORT}/api`);
  console.log(`✓ WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
});