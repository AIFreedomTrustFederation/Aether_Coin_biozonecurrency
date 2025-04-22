"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const apiServer = (0, express_1.default)();
// Middleware
apiServer.use(express_1.default.json());
apiServer.use((0, cors_1.default)());
apiServer.use((0, helmet_1.default)()); // Security headers
// API Routes
apiServer.use('/api', routes_1.default);
// Error handling middleware
apiServer.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});
exports.default = apiServer;
