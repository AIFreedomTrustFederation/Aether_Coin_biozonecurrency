"use strict";
/**
 * AI Freedom Trust Framework Server Application
 * Main Express application setup
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = require("./routes");
require("./storage-extensions"); // Import storage extensions
require("./scroll-keeper-storage-extensions"); // Import Scroll Keeper storage extensions
const app = (0, express_1.default)();
// Apply security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Request parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
});
// API routes
(0, routes_1.registerRoutes)(app);
// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler - keep this as the last route handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested resource '${req.url}' was not found`
    });
});
exports.default = app;
