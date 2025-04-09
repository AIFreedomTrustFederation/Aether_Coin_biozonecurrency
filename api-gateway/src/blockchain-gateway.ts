/**
 * Microservice-Oriented Blockchain Gateway
 * Provides dynamic service discovery and routing for blockchain services
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import { DB_CONNECTION_STRING } from '../config';

// Service registry schema
const ServiceRegistrySchema = z.object({
  serviceName: z.string().min(3),
  serviceEndpoint: z.string().url(),
  serviceType: z.enum(['blockchain', 'storage', 'identity', 'governance', 'training', 'sharding', 'bridge']),
  blockchainType: z.enum(['aethercoin', 'fractalcoin', 'filecoin', 'ethereum', 'other']).optional(),
  apiKey: z.string().optional(),
  healthCheckPath: z.string().optional().default('/health'),
  description: z.string().optional(),
});

// Health check response schema
const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  uptime: z.number().optional(),
  details: z.record(z.any()).optional(),
});

type ServiceInfo = {
  id: string;
  name: string;
  endpoint: string;
  type: string;
  blockchain?: string;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  registeredAt: Date;
  lastHealthCheck?: Date;
  healthCheckPath: string;
  apiKey?: string;
  description?: string;
  metadata?: Record<string, any>;
};

// In-memory service registry for quick access
const serviceRegistry = new Map<string, ServiceInfo>();

// Database client using postgres client
const sql = postgres(DB_CONNECTION_STRING, { ssl: 'require' });

/**
 * Initialize the database schema if needed
 */
async function initializeDatabase() {
  try {
    // Create service registry table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS service_registry (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        endpoint TEXT NOT NULL,
        type TEXT NOT NULL,
        blockchain TEXT,
        health_status TEXT NOT NULL DEFAULT 'unknown',
        registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_health_check TIMESTAMP,
        health_check_path TEXT NOT NULL DEFAULT '/health',
        api_key TEXT,
        description TEXT,
        metadata JSONB
      );
    `;
    
    // Load existing services into memory
    const result = await sql`SELECT * FROM service_registry`;
    for (const row of result.rows) {
      serviceRegistry.set(row.name, {
        id: row.id,
        name: row.name,
        endpoint: row.endpoint,
        type: row.type,
        blockchain: row.blockchain,
        healthStatus: row.health_status,
        registeredAt: row.registered_at,
        lastHealthCheck: row.last_health_check,
        healthCheckPath: row.health_check_path,
        apiKey: row.api_key,
        description: row.description,
        metadata: row.metadata,
      });
    }
    
    console.log(`Loaded ${serviceRegistry.size} services from database`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Create the blockchain gateway router
 */
export async function createBlockchainGateway() {
  const router = express.Router();
  
  // Initialize database
  await initializeDatabase();
  
  // Health check endpoint for the gateway itself
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      servicesCount: serviceRegistry.size,
      timestamp: new Date().toISOString()
    });
  });
  
  // Get all registered services
  router.get('/services', (req, res) => {
    const services = Array.from(serviceRegistry.values()).map(service => ({
      name: service.name,
      type: service.type,
      blockchain: service.blockchain,
      healthStatus: service.healthStatus,
      lastHealthCheck: service.lastHealthCheck,
      description: service.description,
    }));
    
    res.json(services);
  });
  
  // Get services filtered by type or blockchain
  router.get('/services/filter', (req, res) => {
    const { type, blockchain } = req.query;
    
    let filteredServices = Array.from(serviceRegistry.values());
    
    if (type) {
      filteredServices = filteredServices.filter(service => service.type === type);
    }
    
    if (blockchain) {
      filteredServices = filteredServices.filter(service => service.blockchain === blockchain);
    }
    
    const services = filteredServices.map(service => ({
      name: service.name,
      type: service.type,
      blockchain: service.blockchain,
      healthStatus: service.healthStatus,
      lastHealthCheck: service.lastHealthCheck,
      description: service.description,
    }));
    
    res.json(services);
  });
  
  // Register a new blockchain service
  router.post('/register-service', async (req, res) => {
    try {
      // Validate the request body
      const validatedData = ServiceRegistrySchema.parse(req.body);
      
      // Check if service with this name already exists
      if (serviceRegistry.has(validatedData.serviceName)) {
        return res.status(409).json({ error: 'Service with this name already exists' });
      }
      
      // Generate a unique ID for this service
      const serviceId = uuidv4();
      
      // Create service info
      const serviceInfo: ServiceInfo = {
        id: serviceId,
        name: validatedData.serviceName,
        endpoint: validatedData.serviceEndpoint,
        type: validatedData.serviceType,
        blockchain: validatedData.blockchainType,
        healthStatus: 'unknown',
        registeredAt: new Date(),
        healthCheckPath: validatedData.healthCheckPath,
        apiKey: validatedData.apiKey,
        description: validatedData.description,
      };
      
      // Store in registry
      serviceRegistry.set(validatedData.serviceName, serviceInfo);
      
      // Store in database
      await sql`
        INSERT INTO service_registry (
          id, name, endpoint, type, blockchain, health_check_path, api_key, description
        ) VALUES (
          ${serviceId}, ${validatedData.serviceName}, ${validatedData.serviceEndpoint}, 
          ${validatedData.serviceType}, ${validatedData.blockchainType}, 
          ${validatedData.healthCheckPath}, ${validatedData.apiKey}, ${validatedData.description}
        )
      `;
      
      // Perform initial health check
      performHealthCheck(serviceInfo);
      
      res.status(201).json({
        message: 'Service registered successfully',
        serviceId,
        name: validatedData.serviceName,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid service data', details: error.errors });
      }
      
      console.error('Failed to register service:', error);
      res.status(500).json({ error: 'Failed to register service' });
    }
  });
  
  // Update an existing service
  router.put('/services/:serviceName', async (req, res) => {
    const { serviceName } = req.params;
    
    // Check if service exists
    if (!serviceRegistry.has(serviceName)) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    try {
      // Validate the request body
      const validatedData = ServiceRegistrySchema.partial().parse(req.body);
      
      // Get the current service info
      const currentService = serviceRegistry.get(serviceName)!;
      
      // Update the service info
      const updatedService: ServiceInfo = {
        ...currentService,
        endpoint: validatedData.serviceEndpoint || currentService.endpoint,
        type: validatedData.serviceType || currentService.type,
        blockchain: validatedData.blockchainType || currentService.blockchain,
        healthCheckPath: validatedData.healthCheckPath || currentService.healthCheckPath,
        apiKey: validatedData.apiKey !== undefined ? validatedData.apiKey : currentService.apiKey,
        description: validatedData.description || currentService.description,
      };
      
      // Update in registry
      serviceRegistry.set(serviceName, updatedService);
      
      // Update in database
      await dbClient.query(`
        UPDATE service_registry SET
          endpoint = $1,
          type = $2,
          blockchain = $3,
          health_check_path = $4,
          api_key = $5,
          description = $6
        WHERE name = $7
      `, [
        updatedService.endpoint,
        updatedService.type,
        updatedService.blockchain,
        updatedService.healthCheckPath,
        updatedService.apiKey,
        updatedService.description,
        serviceName,
      ]);
      
      // Perform health check on updated service
      performHealthCheck(updatedService);
      
      res.json({
        message: 'Service updated successfully',
        name: serviceName,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid service data', details: error.errors });
      }
      
      console.error('Failed to update service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });
  
  // Deregister a service
  router.delete('/services/:serviceName', async (req, res) => {
    const { serviceName } = req.params;
    
    // Check if service exists
    if (!serviceRegistry.has(serviceName)) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    try {
      // Remove from registry
      serviceRegistry.delete(serviceName);
      
      // Remove from database
      await dbClient.query('DELETE FROM service_registry WHERE name = $1', [serviceName]);
      
      res.json({
        message: 'Service deregistered successfully',
        name: serviceName,
      });
    } catch (error) {
      console.error('Failed to deregister service:', error);
      res.status(500).json({ error: 'Failed to deregister service' });
    }
  });
  
  // Manually trigger health check for a service
  router.post('/services/:serviceName/health-check', async (req, res) => {
    const { serviceName } = req.params;
    
    // Check if service exists
    if (!serviceRegistry.has(serviceName)) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    try {
      const service = serviceRegistry.get(serviceName)!;
      const healthStatus = await performHealthCheck(service);
      
      res.json({
        name: serviceName,
        healthStatus,
        lastCheckedAt: service.lastHealthCheck,
      });
    } catch (error) {
      console.error(`Failed to check health for service ${serviceName}:`, error);
      res.status(500).json({ error: 'Failed to check service health' });
    }
  });
  
  // Get detailed information about a service
  router.get('/services/:serviceName', (req, res) => {
    const { serviceName } = req.params;
    
    // Check if service exists
    if (!serviceRegistry.has(serviceName)) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service = serviceRegistry.get(serviceName)!;
    
    // Don't expose sensitive information
    const serviceInfo = {
      name: service.name,
      endpoint: service.endpoint,
      type: service.type,
      blockchain: service.blockchain,
      healthStatus: service.healthStatus,
      registeredAt: service.registeredAt,
      lastHealthCheck: service.lastHealthCheck,
      description: service.description,
      metadata: service.metadata,
    };
    
    res.json(serviceInfo);
  });
  
  // Create dynamic proxy routes for registered services
  router.use('/:serviceName/*', (req, res, next) => {
    const serviceName = req.params.serviceName;
    const service = serviceRegistry.get(serviceName);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    if (service.healthStatus === 'unhealthy') {
      console.warn(`Allowing request to unhealthy service: ${serviceName}`);
      // We'll allow the request, but log a warning
    }
    
    // Create proxy to the service
    const proxy = createProxyMiddleware({
      target: service.endpoint,
      changeOrigin: true,
      pathRewrite: (path) => path.replace(`/blockchain-gateway/${serviceName}`, ''),
      onProxyReq: (proxyReq) => {
        // Add API key if available
        if (service.apiKey) {
          proxyReq.setHeader('X-API-Key', service.apiKey);
        }
        
        // Add trace ID for request tracking
        const traceId = uuidv4();
        proxyReq.setHeader('X-Trace-Id', traceId);
        
        // Add timestamp
        proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
      },
      onError: (err, req, res) => {
        console.error(`Proxy error for service ${serviceName}:`, err);
        res.status(502).json({
          error: 'Service communication error',
          message: 'The gateway could not communicate with the requested service',
          service: serviceName
        });
        
        // Mark service as potentially unhealthy and schedule a health check
        setTimeout(() => performHealthCheck(service), 5000);
      }
    });
    
    proxy(req, res, next);
  });
  
  // Start periodic health checks
  startPeriodicHealthChecks();
  
  return router;
}

/**
 * Perform a health check on a service
 */
async function performHealthCheck(service: ServiceInfo): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    console.log(`Performing health check for service: ${service.name}`);
    
    const healthCheckUrl = `${service.endpoint}${service.healthCheckPath}`;
    
    const headers: Record<string, string> = {};
    if (service.apiKey) {
      headers['X-API-Key'] = service.apiKey;
    }
    
    const response = await fetch(healthCheckUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate the health check response
    try {
      const healthCheck = HealthCheckResponseSchema.parse(data);
      service.healthStatus = healthCheck.status;
    } catch (error) {
      console.warn(`Invalid health check response from ${service.name}:`, error);
      service.healthStatus = 'degraded';
    }
    
    service.lastHealthCheck = new Date();
    
    // Update in database
    await dbClient.query(`
      UPDATE service_registry SET
        health_status = $1,
        last_health_check = $2
      WHERE name = $3
    `, [
      service.healthStatus,
      service.lastHealthCheck,
      service.name,
    ]);
    
    return service.healthStatus;
  } catch (error) {
    console.error(`Health check failed for service ${service.name}:`, error);
    
    service.healthStatus = 'unhealthy';
    service.lastHealthCheck = new Date();
    
    // Update in database
    await dbClient.query(`
      UPDATE service_registry SET
        health_status = $1,
        last_health_check = $2
      WHERE name = $3
    `, [
      service.healthStatus,
      service.lastHealthCheck,
      service.name,
    ]);
    
    return 'unhealthy';
  }
}

/**
 * Start periodic health checks for all services
 */
function startPeriodicHealthChecks() {
  const CHECK_INTERVAL = 60 * 1000; // Check every minute
  
  setInterval(() => {
    console.log('Running periodic health checks for all services');
    
    serviceRegistry.forEach(service => {
      performHealthCheck(service).catch(error => {
        console.error(`Error during periodic health check for ${service.name}:`, error);
      });
    });
  }, CHECK_INTERVAL);
}

// Initialize when directly executed
// ES module version of the CommonJS "if (require.main === module)" pattern
import { fileURLToPath } from 'url';
const isMainModule = import.meta.url === fileURLToPath(new URL(import.meta.url));

if (isMainModule) {
  (async () => {
    try {
      await initializeDatabase();
      console.log('Blockchain gateway initialized');
    } catch (error) {
      console.error('Failed to initialize blockchain gateway:', error);
      process.exit(1);
    }
  })();
}