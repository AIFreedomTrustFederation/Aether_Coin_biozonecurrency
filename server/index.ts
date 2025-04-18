/**
 * AI Freedom Trust Framework Server Entry Point
 * Initializes and starts the Express server
 */

import app from './app';
import { db } from './storage';

// Set the port
const PORT = process.env.PORT || 3000;

// Test the database connection
async function testDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

// Start the server
async function startServer() {
  console.log('Starting AI Freedom Trust Framework server...');
  
  // Test database connection before starting the server
  const databaseConnected = await testDatabaseConnection();
  
  if (!databaseConnected) {
    console.warn('Warning: Server starting without database connection');
  }
  
  // Start the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
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

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});