import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes';

const apiServer = express();

// Middleware
apiServer.use(express.json());
apiServer.use(cors());
apiServer.use(helmet()); // Security headers

// API Routes
apiServer.use('/api', apiRoutes);

// Error handling middleware
apiServer.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

export default apiServer;