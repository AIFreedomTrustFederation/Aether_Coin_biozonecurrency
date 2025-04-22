/**
 * Minimal Server for Scroll Keeper
 * 
 * This is a simplified version of the main server that starts quickly
 * but provides basic functionality of the Scroll Keeper API.
 * It also includes WebSocket support for real-time updates.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { extractConversation, conversationToScroll } from './services/scroll-keeper/chat-extractor.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on a different path than Vite's HMR
const wss = new WebSocketServer({ server, path: '/ws' });

// Apply middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for testing
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve files from the public directory

// Serve dashboard at root
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Serve original WebSocket test page
app.get('/websocket-test', (req, res) => {
  res.sendFile('websocket-test.html', { root: '.' });
});

// Basic status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    message: 'Scroll Keeper minimal server is running',
    version: '1.0.0'
  });
});

// Scroll Keeper API routes
app.get('/api/scrollkeeper/status', (req, res) => {
  res.json({
    status: 'operational',
    message: 'Scroll Keeper service is available in minimal mode',
    features: [
      'Basic conversation storage',
      'Simple retrieval',
      'ChatGPT conversation extraction (basic metadata only)',
      'Real-time updates via WebSockets'
    ],
    documentation: {
      extraction: {
        endpoint: '/api/scrollkeeper/extract',
        method: 'POST',
        parameters: {
          url: 'ChatGPT shared conversation URL (https://chat.openai.com/share/... or https://chatgpt.com/share/...)',
          userId: 'Optional user ID to associate with the scroll'
        },
        limitations: 'Currently only extracts basic metadata such as title and URL. Content extraction is limited due to ChatGPT\'s dynamic JavaScript rendering.'
      }
    }
  });
});

// Simple storage for scrolls (in-memory for quick start)
const scrolls = [];

// API endpoint for scrolls is implemented below with WebSocket support

// API endpoint to get scrolls
app.get('/api/scrollkeeper/scrolls', (req, res) => {
  try {
    const { userId } = req.query;
    
    let filteredScrolls = scrolls;
    if (userId) {
      filteredScrolls = scrolls.filter(scroll => scroll.userId === userId);
    }
    
    res.json({
      scrolls: filteredScrolls.map(s => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        userId: s.userId
      }))
    });
  } catch (error) {
    console.error('Error fetching scrolls:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch scrolls'
    });
  }
});

// API endpoint to get a specific scroll
app.get('/api/scrollkeeper/scrolls/:id', (req, res) => {
  try {
    const { id } = req.params;
    const scroll = scrolls.find(s => s.id === id);
    
    if (!scroll) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Scroll with ID ${id} not found`
      });
    }
    
    res.json({ scroll });
  } catch (error) {
    console.error(`Error fetching scroll ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch scroll'
    });
  }
});

// API endpoint to search scrolls (simplified)
app.get('/api/scrollkeeper/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query is required'
      });
    }
    
    // Simple search implementation (case-insensitive text matching)
    const matchingScrolls = scrolls.filter(scroll => 
      scroll.title.toLowerCase().includes(query.toLowerCase()) || 
      scroll.content.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      scrolls: matchingScrolls.map(s => ({
        id: s.id,
        title: s.title,
        preview: s.content.substring(0, 100) + '...',
        createdAt: s.createdAt,
        userId: s.userId
      }))
    });
  } catch (error) {
    console.error('Error searching scrolls:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search scrolls'
    });
  }
});

// ChatGPT conversation extraction endpoint
app.post('/api/scrollkeeper/extract', async (req, res) => {
  try {
    const { url, userId } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ChatGPT conversation URL is required'
      });
    }
    
    console.log(`Extracting conversation from: ${url}`);
    
    // Extract conversation
    const conversation = await extractConversation(url);
    
    // Convert to scroll format
    const scrollData = conversationToScroll(conversation, userId);
    
    // Create scroll
    const scrollId = Date.now().toString();
    const scroll = {
      id: scrollId,
      title: scrollData.title,
      content: scrollData.content,
      userId: scrollData.userId,
      metadata: scrollData.metadata,
      createdAt: new Date().toISOString()
    };
    
    scrolls.push(scroll);
    
    // Broadcast to subscribed clients
    broadcastMessage('scroll_created', {
      id: scroll.id,
      title: scroll.title,
      userId: scroll.userId,
      source: 'chatgpt'
    }, scroll.userId);
    
    res.status(201).json({
      message: 'ChatGPT conversation extracted successfully',
      scrollId,
      title: scroll.title
    });
  } catch (error) {
    console.error('Error extracting ChatGPT conversation:', error);
    res.status(500).json({
      error: 'Extraction Failed',
      message: error.message || 'Failed to extract ChatGPT conversation'
    });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Scroll Keeper WebSocket server',
    timestamp: new Date().toISOString()
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
      } else if (data.type === 'subscribe') {
        // Subscribe to notifications for a specific userId
        ws.userId = data.userId;
        ws.send(JSON.stringify({
          type: 'subscribed',
          userId: data.userId,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Broadcast to all connected clients if they match userId
function broadcastMessage(type, data, targetUserId = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // If targetUserId is provided, only send to matching clients
      if (targetUserId === null || client.userId === targetUserId) {
        client.send(JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString()
        }));
      }
    }
  });
}

// Modify the scroll creation to broadcast updates
app.post('/api/scrollkeeper/scrolls', (req, res) => {
  try {
    const { title, content, userId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title and content are required'
      });
    }
    
    const scrollId = Date.now().toString();
    const scroll = {
      id: scrollId,
      title,
      content,
      userId: userId || null,
      createdAt: new Date().toISOString()
    };
    
    scrolls.push(scroll);
    
    // Broadcast to subscribed clients
    broadcastMessage('scroll_created', {
      id: scroll.id,
      title: scroll.title,
      userId: scroll.userId
    }, scroll.userId);
    
    res.status(201).json({
      message: 'Scroll created successfully',
      scrollId
    });
  } catch (error) {
    console.error('Error creating scroll:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create scroll'
    });
  }
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.url}' was not found`
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Scroll Keeper minimal server running on port ${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log(`✓ WebSocket server available at ws://localhost:${PORT}/ws`);
});