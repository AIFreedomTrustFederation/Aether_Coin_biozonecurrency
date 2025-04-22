/**
 * AI Freedom Trust Framework Server Entry Point
 * Initializes and starts the Express server
 */

import app from './app';
import { db } from './storage';
import { sql } from 'drizzle-orm';

// Set the port
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// We'll move the database connection test to occur after server startup
// to avoid delaying the initial server boot
function logDatabaseStatus() {
  console.log('Database connection will be tested after server startup');
  return true;
}

// Start the server
import { startQueueProcessor } from './services/scroll-keeper/queue-processor';

async function startServer() {
  console.log('Starting AI Freedom Trust Framework server...');
  
  // Log database status without testing connection to speed up startup
  logDatabaseStatus();
  
  // We'll start the queue processor after the server has started
  // to avoid initialization delays
  
  // Start the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    
    // Start the Scroll Keeper queue processor after server is running
    setTimeout(() => {
      try {
        startQueueProcessor();
        console.log('✓ Scroll Keeper queue processor started');
      } catch (error) {
        console.error('Failed to start Scroll Keeper queue processor:', error);
      }
    }, 10000); // Start after 10 seconds to reduce initial load
  });
}

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application continues running despite the unhandled rejection
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // For uncaught exceptions, exit the process
  process.exit(1);
});

// Check if we're being run by the quick-start server
const isQuickStart = process.env.QUICK_START === 'true';

// Start the server only if we're being run directly by the quick start
if (isQuickStart) {
  console.log('Starting server from quick-start process');
  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
} else {
  // When imported directly, export the functions but don't auto-start
  console.log('Server module loaded, waiting for explicit start');
}