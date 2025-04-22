"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
const gateway_validation_1 = require("./middleware/gateway-validation");
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = __importDefault(require("crypto"));
// Import storage extensions to fix TypeScript errors and provide mock implementations
require("./storage-extensions");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Generate a random secret for session
const sessionSecret = process.env.SESSION_SECRET || crypto_1.default.randomBytes(64).toString('hex');
// Set up session middleware
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Allow direct access to health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'online', server: 'backend' });
});
// Apply API Gateway validation middleware to all API routes
// In development mode, we still apply it but the middleware itself
// has logic to allow local development requests through
app.use('/api', gateway_validation_1.gatewayValidationMiddleware);
(0, vite_1.log)(`API Gateway validation ${process.env.NODE_ENV === 'production' ? 'strictly enabled' : 'enabled with dev exceptions'} for all API endpoints`);
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
(async () => {
    const server = await (0, routes_1.registerRoutes)(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        console.error('Server error:', err);
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await (0, vite_1.setupVite)(app, server);
    }
    else {
        (0, vite_1.serveStatic)(app);
    }
    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
    }, () => {
        (0, vite_1.log)(`serving on port ${port}`);
    });
})();
