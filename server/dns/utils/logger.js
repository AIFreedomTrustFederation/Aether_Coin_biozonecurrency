/**
 * Logger utilities for FractalDNS
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level (can be changed at runtime)
let currentLogLevel = LOG_LEVELS.INFO;

// Color codes for console output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m'
};

/**
 * Create a logger instance
 * @param {string} module - Module name
 * @returns {object} - Logger object
 */
function createLogger(module) {
  const logFile = path.join(logsDir, `${module}.log`);
  
  const formatLogMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    let formattedMeta = '';
    
    if (Object.keys(meta).length > 0) {
      try {
        formattedMeta = ` ${JSON.stringify(meta)}`;
      } catch (error) {
        formattedMeta = ` [Error serializing metadata: ${error.message}]`;
      }
    }
    
    return `[${timestamp}] [${level}] [${module}] ${message}${formattedMeta}`;
  };
  
  const writeToLogFile = (message) => {
    fs.appendFileSync(logFile, message + '\n');
  };
  
  // Create the logger object
  const logger = {
    debug: (message, meta) => {
      if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        const logMessage = formatLogMessage('DEBUG', message, meta);
        console.log(`${COLORS.GRAY}${logMessage}${COLORS.RESET}`);
        writeToLogFile(logMessage);
      }
    },
    
    info: (message, meta) => {
      if (currentLogLevel <= LOG_LEVELS.INFO) {
        const logMessage = formatLogMessage('INFO', message, meta);
        console.log(`${COLORS.GREEN}${logMessage}${COLORS.RESET}`);
        writeToLogFile(logMessage);
      }
    },
    
    warn: (message, meta) => {
      if (currentLogLevel <= LOG_LEVELS.WARN) {
        const logMessage = formatLogMessage('WARN', message, meta);
        console.log(`${COLORS.YELLOW}${logMessage}${COLORS.RESET}`);
        writeToLogFile(logMessage);
      }
    },
    
    error: (message, meta) => {
      if (currentLogLevel <= LOG_LEVELS.ERROR) {
        let logMessage;
        if (message instanceof Error) {
          logMessage = formatLogMessage('ERROR', message.message, {
            ...meta,
            stack: message.stack,
            name: message.name
          });
        } else {
          logMessage = formatLogMessage('ERROR', message, meta);
        }
        
        console.error(`${COLORS.RED}${logMessage}${COLORS.RESET}`);
        writeToLogFile(logMessage);
      }
    },
    
    setLevel: (level) => {
      if (LOG_LEVELS[level] !== undefined) {
        currentLogLevel = LOG_LEVELS[level];
      } else {
        console.error(`Invalid log level: ${level}`);
      }
    }
  };
  
  return logger;
}

/**
 * Set the global log level
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 */
function setGlobalLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLogLevel = LOG_LEVELS[level];
  } else {
    console.error(`Invalid log level: ${level}`);
  }
}

module.exports = {
  createLogger,
  setGlobalLogLevel,
  LOG_LEVELS
};