import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { Server as WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { parse } from 'url';

// Store active WebSocket connections
const clients = new Set<WebSocket>();

// Track the WebSocket server instance
let wsServer: WebSocketServer | null = null;

/**
 * Initialize the WebSocket server if it hasn't been already
 */
const initWebSocketServer = (req: NextApiRequest, res: NextApiResponse) => {
  // Only create one WebSocket server, even if this API route is called multiple times
  if (!wsServer) {
    // Get the server instance from the response
    const httpServer = res.socket?.server as unknown as HttpServer;
    
    if (!httpServer) {
      console.error('Failed to get HTTP server from response');
      res.status(500).end('Failed to initialize WebSocket server');
      return;
    }
    
    // Create a new WebSocket server on top of the existing HTTP server
    wsServer = new WebSocketServer({ 
      noServer: true,
      // Implement robust security with client verification
      verifyClient: (info, callback) => {
        // Add any security checks here
        const { origin, secure } = info.req.headers;
        console.log(`WebSocket connection attempt from origin: ${origin}, secure: ${secure}`);
        
        // Always accept in development, but could implement token checks, etc.
        callback(true);
      },
    });
    
    // Handle new WebSocket connections
    wsServer.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket client connected');
      clients.add(ws);
      
      // Send a welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Mysterion WebSocket Server',
        timestamp: Date.now()
      }));
      
      // Handle messages from clients
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString());
          handleMessage(ws, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      // Handle client disconnection
      ws.onclose = () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
      };
      
      // Handle errors
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
      };
    });
    
    // Handle WebSocket upgrade requests
    httpServer.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url || '', true);
      
      // Only handle WebSocket connections to our specific path
      if (pathname === '/api/ws') {
        wsServer!.handleUpgrade(request, socket, head, (ws) => {
          wsServer!.emit('connection', ws, request);
        });
      }
    });
    
    console.log('WebSocket server initialized on /api/ws');
  }
};

/**
 * Handle incoming WebSocket messages
 */
const handleMessage = (ws: WebSocket, data: any) => {
  console.log('Received message:', data);
  
  // Handle ping messages with pong response
  if (data.type === 'ping') {
    ws.send(JSON.stringify({
      type: 'pong',
      timestamp: Date.now()
    }));
    return;
  }
  
  // Handle log messages
  if (data.type === 'log') {
    console.log(`[Client Log] ${data.event.level}: ${data.event.message}`);
    // Could store logs, forward to monitoring system, etc.
    return;
  }
  
  // Handle custom messages from Mysterion
  if (data.type === 'mysterion') {
    // Process Mysterion messages
    return;
  }
};

/**
 * Broadcast a message to all connected clients
 */
export const broadcastMessage = (message: any) => {
  const messageStr = JSON.stringify(message);
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
};

// API route handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle regular HTTP requests to this endpoint
  if (req.method === 'GET') {
    // Initialize WebSocket server
    initWebSocketServer(req, res);
    
    // Return info about the WebSocket endpoint
    res.status(200).json({
      message: 'WebSocket server is running',
      clients: clients.size,
      endpoint: '/api/ws',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Accept POST requests to broadcast messages
  if (req.method === 'POST') {
    try {
      const message = req.body;
      broadcastMessage(message);
      res.status(200).json({
        message: 'Broadcast successful',
        recipients: clients.size
      });
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      res.status(500).json({ error: 'Failed to broadcast message' });
    }
    return;
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}