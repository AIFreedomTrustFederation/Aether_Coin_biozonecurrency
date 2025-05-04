/**
 * Third Application Server
 * A simple Express server for the third application
 * Enhanced with comprehensive error handling
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import pg from 'pg';

// Import error handling utilities
import { 
  errorHandlerMiddleware, 
  asyncHandler, 
  setupGlobalErrorHandlers,
  ApiError 
} from './error-handler.js';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import config
import config from './config.js';

const app = express();
const PORT = process.env.PORT || config.thirdApp.port;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Setup global error handlers
setupGlobalErrorHandlers();

// Parse JSON requests
app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Enhanced health check endpoint with detailed system metrics and database status
app.get('/api/health', asyncHandler(async (req, res) => {
  // Get memory usage in a more readable format
  const formatMemoryUsage = (memoryUsage) => {
    return {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      rawValues: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal, 
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      }
    };
  };
  
  // Calculate uptime in a readable format
  const uptime = process.uptime();
  const uptimeFormatted = {
    days: Math.floor(uptime / (24 * 60 * 60)),
    hours: Math.floor((uptime % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((uptime % (60 * 60)) / 60),
    seconds: Math.floor(uptime % 60),
    formatted: `${Math.floor(uptime / 60)} minutes, ${Math.floor(uptime % 60)} seconds`,
    totalSeconds: uptime
  };
  
  // Check database connection
  let dbStatus = {
    connected: false,
    message: 'Database check not performed',
    checked: false
  };
  
  // Only check database if requested via query param or if DATABASE_URL exists
  if (req.query.checkDb === 'true' || process.env.DATABASE_URL) {
    dbStatus.checked = true;
    
    try {
      if (!process.env.DATABASE_URL) {
        dbStatus.message = 'DATABASE_URL environment variable not set';
      } else {
        const pool = new pg.Pool({
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 3000 // Shorter timeout for health checks
        });
        
        const client = await pool.connect();
        try {
          const result = await client.query('SELECT NOW() as time');
          dbStatus.connected = true;
          dbStatus.message = 'Connected successfully';
          dbStatus.serverTime = result.rows[0].time;
        } finally {
          client.release();
          await pool.end();
        }
      }
    } catch (err) {
      dbStatus.message = `Connection error: ${err.message}`;
      console.error('Database health check failed:', err);
    }
  }
  
  res.json({
    status: 'ok',
    service: config.thirdApp.name,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
      cpuCores: os.cpus().length,
      memoryUsage: formatMemoryUsage(process.memoryUsage()),
      uptime: uptimeFormatted,
      osUptime: os.uptime(),
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
    },
    database: dbStatus,
    appStatus: 'running'
  });
}));

// Root endpoint - Simple UI for the third application with error handling
app.get('/', asyncHandler(async (req, res) => {
  try {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.thirdApp.name}</title>
        <style>
          :root {
            --primary: #1a1c3a;
            --primary-light: #2d307b;
            --secondary: #7857c5;
            --accent: #4e30c5;
            --light: #f8f9fa;
            --dark: #121224;
            --text: #e6e6fa;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--primary);
            color: var(--text);
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          
          h1 {
            background: linear-gradient(45deg, var(--secondary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
            margin-bottom: 2rem;
            font-size: 2.5rem;
          }
          
          .card {
            background-color: var(--dark);
            border-radius: 0.5rem;
            padding: 2rem;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          }
          
          .links {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
          }
          
          .link {
            background-color: var(--secondary);
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.25rem;
            transition: background-color 0.3s ease;
          }
          
          .link:hover {
            background-color: var(--accent);
          }
          
          .footer {
            margin-top: 3rem;
            font-size: 0.9rem;
            opacity: 0.7;
          }
          
          .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
            background-color: #4CAF50; /* Green by default */
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${config.thirdApp.name}</h1>
          <p>This is a simple Express server for the third application in the Aetherion Ecosystem.</p>
          <p>This server is running on port ${PORT} and is accessible through the main proxy server.</p>
          
          <div class="links">
            <a href="${config.mainServer.basePath}" class="link">Main Landing Page</a>
            <a href="${config.brandShowcase.basePath}" class="link">Brand Showcase</a>
            <a href="${config.aetherionWallet.basePath}" class="link">Aetherion Wallet</a>
            <a href="/api/health" class="link">API Health</a>
            <a href="/api/db/status" class="link">Database Status</a>
            <a href="/api/error-test" class="link">Test Error Handling</a>
          </div>
        </div>
        
        <div class="footer">
          <p><span class="status-indicator"></span> Server Status: Online</p>
          <p>Aetherion Ecosystem | &copy; 2025 AI Freedom Trust</p>
        </div>
        
        <script>
          // Simple client-side health check
          async function checkServerHealth() {
            try {
              const response = await fetch('/api/health');
              if (response.ok) {
                document.querySelector('.status-indicator').style.backgroundColor = '#4CAF50'; // Green
              } else {
                document.querySelector('.status-indicator').style.backgroundColor = '#FFC107'; // Yellow/Warning
              }
            } catch (error) {
              document.querySelector('.status-indicator').style.backgroundColor = '#F44336'; // Red/Error
              console.error('Health check failed:', error);
            }
          }
          
          // Check health on page load and every 30 seconds
          checkServerHealth();
          setInterval(checkServerHealth, 30000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving home page:', error);
    throw new ApiError('Failed to serve home page', 500, 'PAGE_RENDER_ERROR');
  }
}));

// Test error route - useful for testing error handling
app.get('/api/error-test', (req, res) => {
  throw new ApiError('This is a test error', 500, 'TEST_ERROR');
});

// Database status endpoint
app.get('/api/db/status', asyncHandler(async (req, res) => {
  const dbStatus = {
    connected: false,
    message: '',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      dbStatus.message = 'DATABASE_URL environment variable not set';
      return res.json(dbStatus);
    }
    
    // Simple query to test the connection
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000
    });
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW() as time');
      dbStatus.connected = true;
      dbStatus.message = `Connected successfully. Server time: ${result.rows[0].time}`;
      dbStatus.serverTime = result.rows[0].time;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    dbStatus.message = `Connection error: ${err.message}`;
    console.error('Database connection error:', err);
  }
  
  res.json(dbStatus);
}));

// Add 404 handler for any undefined routes
app.use((req, res, next) => {
  // Create a new ApiError but don't throw it, pass it to next()
  const notFoundError = new ApiError(`Route not found: ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(notFoundError);
});

// Add error handling middleware - it must be placed after all routes and the 404 handler
app.use(errorHandlerMiddleware);

// Start the server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Starting third app Express server on port ${PORT}`);
  console.log(`✓ Third app server running on port ${PORT}`);
  console.log(`✓ Access at http://localhost:${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Cannot start third app server.`);
    console.error('Please check if another instance is running or change the port in config.js');
  } else {
    console.error(`❌ Failed to start server: ${error.message}`);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down third app server...');
  process.exit();
});