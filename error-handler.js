/**
 * Centralized Error Handling for Aetherion Ecosystem
 * 
 * This module provides standardized error handling utilities for all servers
 * in the Aetherion ecosystem, ensuring consistent error responses and logging.
 */

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standardized error response format
export function formatErrorResponse(error) {
  return {
    error: {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    timestamp: new Date().toISOString()
  };
}

// Express error handling middleware
export function errorHandlerMiddleware(err, req, res, next) {
  console.error('Error caught by middleware:', err);
  
  const statusCode = err.statusCode || 500;
  const errorResponse = formatErrorResponse(err);
  
  // Log detailed error info for server-side errors
  if (statusCode >= 500) {
    console.error('Server error:', {
      path: req.path,
      method: req.method,
      body: req.body,
      error: err,
      stack: err.stack
    });
  }
  
  res.status(statusCode).json(errorResponse);
}

// Async handler to simplify route error handling
export function asyncHandler(fn) {
  return function(req, res, next) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Utility for validating required environment variables
export function validateEnvVars(requiredVars) {
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}

// Utility for safe JSON parsing
export function safeJsonParse(data) {
  try {
    return { data: JSON.parse(data), error: null };
  } catch (error) {
    return { data: null, error: new Error('Invalid JSON format') };
  }
}

// Custom wrapper for child process spawning
export function safeSpawn(command, args, options) {
  try {
    const process = spawn(command, args, options);
    return { process, error: null };
  } catch (error) {
    console.error(`Failed to spawn process: ${command}`, error);
    return { process: null, error };
  }
}

// Utility for safe file operations
export function safeFileOperation(operation, ...args) {
  try {
    const result = operation(...args);
    return { result, error: null };
  } catch (error) {
    console.error('File operation failed:', error);
    return { result: null, error };
  }
}

// Monitor process for unhandled errors
export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
    console.error(error.stack);
    // Give the server a second to finish current requests
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION! 💥', reason);
    // Give the server a second to finish current requests
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
}

// Import necessary dependencies
import { spawn } from 'child_process';