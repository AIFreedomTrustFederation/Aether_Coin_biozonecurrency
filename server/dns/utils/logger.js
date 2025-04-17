/**
 * Logger utility for FractalDNS
 * Provides consistent logging across components
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Map string levels to numeric values
const LOG_LEVEL_MAP = {
  error: LOG_LEVELS.ERROR,
  warn: LOG_LEVELS.WARN,
  info: LOG_LEVELS.INFO,
  debug: LOG_LEVELS.DEBUG,
  trace: LOG_LEVELS.TRACE
};

// Create log directory if needed
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

// Current log level from config
const currentLevel = LOG_LEVEL_MAP[config.logging.level.toLowerCase()] || LOG_LEVELS.INFO;

/**
 * Logger class
 */
class Logger {
  /**
   * Create a new logger
   * @param {string} moduleName - Name of the module (used as prefix in logs)
   */
  constructor(moduleName) {
    this.moduleName = moduleName;
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string|Error} message - Message to log
   * @param {Object} [data] - Additional data to log
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, data) {
    // Format timestamp
    const timestamp = config.logging.timestamps
      ? new Date().toISOString()
      : '';
    
    // Handle Error objects
    if (message instanceof Error) {
      const error = message;
      message = error.message;
      if (!data) {
        data = {
          stack: error.stack,
          name: error.name
        };
      } else {
        data.stack = error.stack;
        data.name = error.name;
      }
    }
    
    // Format data if present
    let dataStr = '';
    if (data) {
      try {
        if (typeof data === 'object') {
          dataStr = JSON.stringify(data);
        } else {
          dataStr = String(data);
        }
      } catch (err) {
        dataStr = '[Unserializable data]';
      }
    }
    
    return `${timestamp ? timestamp + ' ' : ''}[${level.toUpperCase()}] [${this.moduleName}] ${message}${dataStr ? ' ' + dataStr : ''}`;
  }

  /**
   * Write log to file
   * @param {string} message - Formatted log message
   */
  writeToFile(message) {
    if (!config.logging.file) return;
    
    fs.appendFile(config.logging.file, message + '\n', (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }

  /**
   * Log a message at the specified level
   * @param {number} level - Numeric log level
   * @param {string} levelName - Log level name
   * @param {string|Error} message - Message to log
   * @param {Object} [data] - Additional data to log
   */
  log(level, levelName, message, data) {
    if (level > currentLevel) return;
    
    const formattedMessage = this.formatMessage(levelName, message, data);
    
    // Write to console if enabled
    if (config.logging.console) {
      const consoleMethod = level === LOG_LEVELS.ERROR ? 'error'
        : level === LOG_LEVELS.WARN ? 'warn'
        : 'log';
      console[consoleMethod](formattedMessage);
    }
    
    // Write to file if enabled
    this.writeToFile(formattedMessage);
  }

  /**
   * Log error message
   * @param {string|Error} message - Message or Error to log
   * @param {Object} [data] - Additional data
   */
  error(message, data) {
    this.log(LOG_LEVELS.ERROR, 'error', message, data);
  }

  /**
   * Log warning message
   * @param {string|Error} message - Message or Error to log
   * @param {Object} [data] - Additional data
   */
  warn(message, data) {
    this.log(LOG_LEVELS.WARN, 'warn', message, data);
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {Object} [data] - Additional data
   */
  info(message, data) {
    this.log(LOG_LEVELS.INFO, 'info', message, data);
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   * @param {Object} [data] - Additional data
   */
  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, 'debug', message, data);
  }

  /**
   * Log trace message
   * @param {string} message - Message to log
   * @param {Object} [data] - Additional data
   */
  trace(message, data) {
    this.log(LOG_LEVELS.TRACE, 'trace', message, data);
  }
}

/**
 * Create a new logger for the specified module
 * @param {string} moduleName - Module name
 * @returns {Logger} Logger instance
 */
function createLogger(moduleName) {
  return new Logger(moduleName || 'app');
}

module.exports = {
  createLogger,
  LOG_LEVELS
};