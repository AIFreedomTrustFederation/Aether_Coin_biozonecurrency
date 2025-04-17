/**
 * AI Freedom Trust Framework Server Application
 * Main Express application setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes';

const app = express();

// Apply security middleware
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// General error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;