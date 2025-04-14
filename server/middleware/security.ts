import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import 'express-session';

// Add 'csrfToken' property to session object to fix type issues
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

/**
 * Security middleware collection for enhancing application security
 */

// Rate limiting middleware for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// More strict rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

// Stricter rate limiting for sensitive operations
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sensitive operations, please try again later.' },
});

// CSRF token validation middleware
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests as they should be idempotent
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const storedToken = req.session?.csrfToken;

  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }

  next();
};

// Generate CSRF token middleware
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.csrfToken) {
    if (req.session) {
      req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
    }
  }
  
  // Add CSRF token to response headers for client-side access
  if (req.session && req.session.csrfToken) {
    res.setHeader('X-CSRF-Token', req.session.csrfToken);
  }
  next();
};

// Generic input validation middleware factory
export const validateInput = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against the provided schema
      const validatedData = schema.parse(req.body);
      // Replace request body with validated data
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      next(error);
    }
  };
};

// Content Security Policy configuration
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https://atc.aifreedomtrust.com"],
    connectSrc: ["'self'", "https://api.fractalcoin.network", "https://api.coingecko.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'", "https://js.stripe.com"],
    // Report violations to this endpoint
    reportUri: '/api/csp-report',
  },
  // Only report violations in development, enforce in production
  reportOnly: process.env.NODE_ENV !== 'production',
};

// XSS Protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Set X-XSS-Protection header
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

// Prevent clickjacking attacks
export const frameGuard = (req: Request, res: Response, next: NextFunction) => {
  // Set X-Frame-Options header
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
};

// Prevent MIME type sniffing
export const noSniff = (req: Request, res: Response, next: NextFunction) => {
  // Set X-Content-Type-Options header
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

// Set strict transport security
export const hsts = (req: Request, res: Response, next: NextFunction) => {
  // Only set HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    // Set Strict-Transport-Security header
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};

// Referrer policy
export const referrerPolicy = (req: Request, res: Response, next: NextFunction) => {
  // Set Referrer-Policy header
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Permissions policy
export const permissionsPolicy = (req: Request, res: Response, next: NextFunction) => {
  // Set Permissions-Policy header
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  next();
};

// CSP report endpoint
export const cspReportHandler = (req: Request, res: Response) => {
  console.error('CSP Violation:', req.body);
  res.status(204).end();
};