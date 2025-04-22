"use strict";
/**
 * API Gateway Configuration
 * Contains environment variables and configuration settings for the API Gateway
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SERVICES = exports.TIMEOUTS = exports.HEALTH_CHECK = exports.LOGGING = exports.JWT_SECRET = exports.CORS_OPTIONS = exports.RATE_LIMIT = exports.PORT = exports.DB_CONNECTION_STRING = void 0;
// Database connection string
exports.DB_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
// API Gateway port
exports.PORT = parseInt(process.env.API_GATEWAY_PORT || '3001', 10);
// Rate limiting configuration
exports.RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};
// CORS configuration
exports.CORS_OPTIONS = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};
// JWT secret for authentication
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Logging configuration
exports.LOGGING = {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
};
// Health check configuration
exports.HEALTH_CHECK = {
    path: '/health',
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000', 10), // 1 minute
};
// Timeout configuration
exports.TIMEOUTS = {
    // Timeout for proxied requests
    proxyTimeout: parseInt(process.env.PROXY_TIMEOUT || '30000', 10), // 30 seconds
    // Timeout for service registration
    registrationTimeout: parseInt(process.env.REGISTRATION_TIMEOUT || '5000', 10), // 5 seconds
};
// Default services to register on startup (for development)
exports.DEFAULT_SERVICES = process.env.NODE_ENV === 'development' ? [
    {
        serviceName: 'fractalcoin-service',
        serviceEndpoint: 'http://localhost:3002',
        serviceType: 'blockchain',
        blockchainType: 'fractalcoin',
        healthCheckPath: '/health',
        description: 'FractalCoin Blockchain Service',
    },
    {
        serviceName: 'filecoin-service',
        serviceEndpoint: 'http://localhost:3003',
        serviceType: 'blockchain',
        blockchainType: 'filecoin',
        healthCheckPath: '/health',
        description: 'Filecoin Blockchain Service',
    },
    {
        serviceName: 'aethercoin-service',
        serviceEndpoint: 'http://localhost:3004',
        serviceType: 'blockchain',
        blockchainType: 'aethercoin',
        healthCheckPath: '/health',
        description: 'AetherCoin Blockchain Service',
    },
] : [];
