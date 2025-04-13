import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { gatewayValidationMiddleware } from "./middleware/gateway-validation";
import session from "express-session";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";
import { 
  apiRateLimiter, 
  authRateLimiter, 
  generateCsrfToken, 
  validateCsrfToken,
  cspConfig,
  xssProtection,
  frameGuard,
  noSniff,
  hsts,
  referrerPolicy,
  permissionsPolicy,
  cspReportHandler
} from "./middleware/security";
import { generateSecureToken } from "./utils/security";

const app = express();

// Basic security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: cspConfig,
  // We'll handle these manually for more control
  xssFilter: false,
  frameguard: false,
  noSniff: false,
  hsts: false,
}));

// Apply custom security headers
app.use(xssProtection);
app.use(frameGuard);
app.use(noSniff);
app.use(hsts);
app.use(referrerPolicy);
app.use(permissionsPolicy);

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://atc.aifreedomtrust.com', 'https://www.atc.aifreedomtrust.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-CSRF-Token'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Parse JSON with size limits to prevent large payload attacks
app.use(express.json({ 
  limit: '1mb',
  verify: (req: Request, res: Response, buf: Buffer) => {
    // Store raw body for HMAC validation if needed
    (req as any).rawBody = buf;
  }
}));

// Parse URL-encoded data with size limits
app.use(express.urlencoded({ 
  extended: false,
  limit: '1mb'
}));

// Generate a strong random secret for session
const sessionSecret = process.env.SESSION_SECRET || generateSecureToken(64);

// Set up session middleware with enhanced security
app.use(session({
  secret: sessionSecret,
  name: 'atc_session', // Custom name instead of default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent JavaScript access to cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Provides CSRF protection with reasonable usability
    path: '/', // Restrict cookie to base path
    domain: process.env.NODE_ENV === 'production' ? '.aifreedomtrust.com' : undefined // Allow subdomains in production
  }
}));

// CSP report endpoint
app.post('/api/csp-report', express.json({ type: 'application/csp-report' }), cspReportHandler);

// Apply rate limiting to all API routes
app.use('/api', apiRateLimiter);

// Apply stricter rate limiting to auth endpoints
app.use('/api/auth', authRateLimiter);

// Generate CSRF token for all requests
app.use(generateCsrfToken);

// Allow direct access to health check endpoint without CSRF
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online', server: 'backend' });
});

// Apply API Gateway validation middleware to all API routes
// In development mode, we still apply it but the middleware itself
// has logic to allow local development requests through
app.use('/api', gatewayValidationMiddleware);
log(`API Gateway validation ${process.env.NODE_ENV === 'production' ? 'strictly enabled' : 'enabled with dev exceptions'} for all API endpoints`);

// Apply CSRF validation to all non-GET API requests
app.use('/api', validateCsrfToken);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Sanitize headers for logging to remove sensitive information
  const sanitizedHeaders = { ...req.headers };
  if (sanitizedHeaders.authorization) {
    sanitizedHeaders.authorization = 'REDACTED';
  }
  if (sanitizedHeaders.cookie) {
    sanitizedHeaders.cookie = 'REDACTED';
  }
  
  // Log request details
  if (path.startsWith("/api")) {
    log(`Request: ${req.method} ${path} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']}`);
  }

  // Capture response for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    // Don't log sensitive data
    if (bodyJson && typeof bodyJson === 'object') {
      capturedJsonResponse = { ...bodyJson };
      // Redact sensitive fields
      ['password', 'token', 'secret', 'key', 'privateKey', 'seedPhrase'].forEach(field => {
        if (capturedJsonResponse[field]) {
          capturedJsonResponse[field] = 'REDACTED';
        }
      });
    } else {
      capturedJsonResponse = bodyJson;
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log response details
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `Response: ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Only include response body in non-production environments or for error responses
      if (process.env.NODE_ENV !== 'production' || res.statusCode >= 400) {
        if (capturedJsonResponse) {
          const responseStr = JSON.stringify(capturedJsonResponse);
          if (responseStr.length > 80) {
            logLine += ` :: ${responseStr.slice(0, 77)}...`;
          } else {
            logLine += ` :: ${responseStr}`;
          }
        }
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ 
      message: "API endpoint not found",
      path: req.originalUrl
    });
  });

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Determine appropriate status code
    const status = err.status || err.statusCode || 500;
    
    // Default error message
    let message = "Internal Server Error";
    
    // In development, show detailed error messages
    // In production, show generic messages for 500 errors
    if (process.env.NODE_ENV !== 'production' || status !== 500) {
      message = err.message || message;
    }
    
    // Create error response
    const errorResponse: Record<string, any> = { message };
    
    // Add error details in development
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = err.stack;
      if (err.errors) {
        errorResponse.errors = err.errors;
      }
    }
    
    // Log error details
    const logData = {
      status,
      message: err.message || 'Unknown error',
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.id || 'unauthenticated'
    };
    
    // Log at appropriate level based on status code
    if (status >= 500) {
      console.error('Server error:', logData);
    } else if (status >= 400) {
      console.warn('Client error:', logData);
    }
    
    // Send error response
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Security headers for static content
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Add security headers for static content
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // Validate port number
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`Invalid port: ${process.env.PORT}`);
    process.exit(1);
  }
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    log(`Serving on port ${port}`);
  });
  
  // Handle graceful shutdown
  const gracefulShutdown = (signal: string) => {
    log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      log('HTTP server closed.');
      // Close database connections, etc.
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      log('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Attempt graceful shutdown
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log but don't shut down for unhandled rejections
  });
})();
