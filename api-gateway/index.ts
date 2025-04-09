import { Router } from 'express';
import widgetRoutes from './widgets/routes';
import { createBlockchainGateway } from './src/blockchain-gateway';

const router = Router();

// Initialize the router with async route handlers
const initializeRouter = async () => {
  try {
    // Create the blockchain gateway
    const blockchainGateway = await createBlockchainGateway();
    
    // Register all API gateway routes
    router.use('/widgets', widgetRoutes);
    router.use('/blockchain', blockchainGateway);
    
    // Root endpoint for API gateway status
    router.get('/', (req, res) => {
      res.json({
        status: 'online',
        version: '1.0.0',
        services: ['widgets', 'blockchain'],
        documentation: '/docs',
      });
    });
    
    // Documentation endpoint
    router.get('/docs', (req, res) => {
      res.json({
        widgets: {
          description: 'Widget management API',
          endpoints: [
            { method: 'GET', path: '/widgets', description: 'Get all widgets' },
            { method: 'POST', path: '/widgets', description: 'Create a new widget' },
          ],
        },
        blockchain: {
          description: 'Blockchain services gateway API',
          endpoints: [
            { method: 'GET', path: '/blockchain/services', description: 'Get all registered blockchain services' },
            { method: 'POST', path: '/blockchain/register-service', description: 'Register a new blockchain service' },
            { method: 'GET', path: '/blockchain/services/:serviceName', description: 'Get details about a specific service' },
            { method: 'POST', path: '/blockchain/services/:serviceName/health-check', description: 'Manually trigger health check for a service' },
            { method: 'PUT', path: '/blockchain/services/:serviceName', description: 'Update a service' },
            { method: 'DELETE', path: '/blockchain/services/:serviceName', description: 'Deregister a service' },
            { method: 'GET', path: '/blockchain/services/filter', description: 'Filter services by type or blockchain' },
            { method: 'GET', path: '/blockchain/health', description: 'Health check for the gateway itself' },
          ],
        },
      });
    });
    
    console.log('API Gateway router initialized successfully');
  } catch (error) {
    console.error('Failed to initialize API Gateway router:', error);
    throw error;
  }
};

// Initialize the router
initializeRouter().catch(error => {
  console.error('Critical error initializing API Gateway:', error);
  process.exit(1);
});

export default router;