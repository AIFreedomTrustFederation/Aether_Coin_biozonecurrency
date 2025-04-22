"use strict";
/**
 * Aetherion API Gateway
 *
 * This module serves as a secure intermediary between frontend clients
 * and backend services. It validates and authenticates all requests using
 * quantum-resistant security protocols before forwarding them to the backend.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Using a direct import with relative path
// In production, this would be a proper package import
const validator_1 = require("../../quantum-validator/src/validator");
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve('../../.env') });
// Initialize the API Gateway
const app = (0, express_1.default)();
const PORT = process.env.API_GATEWAY_PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
// Apply security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting to prevent brute force attacks
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);
// Parse JSON bodies
app.use(express_1.default.json());
// Quantum validation middleware
app.use(async (req, res, next) => {
    try {
        // Extract client ID from headers
        const clientId = req.headers['x-client-id'] || 'unknown-client';
        // Get request data for validation if it's a write operation
        const requestData = ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined;
        // Apply quantum validation to verify request integrity
        // The function itself is not async, but we're wrapping in a try/catch block
        const validationResult = (0, validator_1.validateRequest)(req, clientId, requestData);
        if (!validationResult.isValid) {
            console.warn(`Quantum validation failed: ${validationResult.message}`);
            return res.status(403).json({
                error: 'Access denied: Request failed quantum security validation',
                message: validationResult.message,
                code: 'QUANTUM_VALIDATION_FAILED'
            });
        }
        next();
    }
    catch (error) {
        console.error('Quantum validation error:', error);
        return res.status(500).json({
            error: 'Internal security validation error',
            code: 'QUANTUM_SYSTEM_ERROR'
        });
    }
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', gateway: 'online' });
});
// API documentation
app.get('/api/docs', (req, res) => {
    res.status(200).json({
        version: '1.0.0',
        endpoints: {
            '/api/health': 'Gateway health check',
            '/api/*': 'Proxied to backend services'
        }
    });
});
// Custom middleware to add gateway headers before proxying
app.use('/api', (req, res, next) => {
    // Add gateway headers to the request that will be forwarded
    req.headers['X-API-Gateway-Validated'] = 'true';
    req.headers['X-Quantum-Validation-Timestamp'] = Date.now().toString();
    // Log API request (sanitized for security)
    console.log(`API Gateway forwarding request: ${req.method} ${req.path}`);
    next();
});
// Proxy all API requests to the backend services
app.use('/api', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/'
    }
}));
// Error handling
app.use((err, req, res, next) => {
    console.error('API Gateway Error:', err);
    res.status(500).json({
        error: 'API Gateway error',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Proxying requests to backend at ${BACKEND_URL}`);
});
exports.default = app;
