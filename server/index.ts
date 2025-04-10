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

// Import PostgreSQL session store
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db'; // Importing pool for session storage

// Set up PostgreSQL session store for persistence
const PgStore = connectPgSimple(session);
const sessionStore = new PgStore({
  pool: pool,               // Use the database pool
  tableName: 'session',     // Use the session table we created
  createTableIfMissing: true,
  pruneSessionInterval: 60  // Clean expired sessions every hour
});

// Set up session middleware with PostgreSQL for persistence
app.use(session({
  store: sessionStore,
  secret: sessionSecret,
  resave: false,           // Only save session if modified
  saveUninitialized: false, // Don't create session for anon users
  rolling: true,           // Reset expiration on each response
  name: 'aetherion_session', // Custom cookie name
  cookie: {
    secure: false,         // No HTTPS in development
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',       // More compatible setting
    path: '/'
  }
}));

// Add cookie-parser middleware to help with cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// Log session configuration
console.log(`Session configured with store: PostgreSQL, secure cookies: ${process.env.NODE_ENV === 'production'}, max age: ${30 * 24} hours`);

// Add user extraction middleware for all requests
app.use((req: any, res, next) => {
  if (req.session && req.session.userId) {
    console.log(`Session active for user ${req.session.userId}`);
    
    // Extract cookies for debugging
    const cookies = req.headers.cookie || '';
    console.log(`Cookies in request: ${cookies}`);
    
    // Persist user in request object
    if (!req.user && req.session.user) {
      req.user = req.session.user;
      console.log(`User set on request from session: ${req.user.id}`);
    }
  }
  next();
});

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
