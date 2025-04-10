import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { gatewayValidationMiddleware } from "./middleware/gateway-validation";
import session from "express-session";
import crypto from "crypto";
import MemoryStore from "memorystore";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use a fixed session secret or one from environment for consistency
// Using a static secret for development to ensure session persistence 
const sessionSecret = process.env.SESSION_SECRET || 'aetherion-quantum-fractal-session-secret';

// Create memory store with periodic cleanup
const MemoryStoreSession = MemoryStore(session);
const sessionStore = new MemoryStoreSession({
  checkPeriod: 86400000 // prune expired entries every 24h
});

// Set up session middleware with improved config for development
app.use(session({
  secret: sessionSecret,
  resave: true, // Changed to true to ensure session is saved
  saveUninitialized: true, // Changed to true to create session for all requests
  store: sessionStore, // Use memory store to avoid session loss between requests
  cookie: {
    secure: false, // Changed to false for development - set to true only in HTTPS production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Explicitly setting sameSite to help with Replit environment
  }
}));

// Log session configuration
console.log(`Session configured with store: ${sessionStore ? 'MemoryStore' : 'default'}, secure cookies: ${process.env.NODE_ENV === 'production'}`);

// Allow direct access to health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online', server: 'backend' });
});

// Apply API Gateway validation middleware to all API routes
// In development mode, we still apply it but the middleware itself
// has logic to allow local development requests through
app.use('/api', gatewayValidationMiddleware);
log(`API Gateway validation ${process.env.NODE_ENV === 'production' ? 'strictly enabled' : 'enabled with dev exceptions'} for all API endpoints`);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
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
    log(`serving on port ${port}`);
  });
})();
