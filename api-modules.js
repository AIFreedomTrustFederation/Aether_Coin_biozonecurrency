/**
 * AI Freedom Trust Framework API Modules
 * 
 * This file provides a collection of API modules that can be used by different server implementations
 * (server.js, server-local.js, replit-server.js) to ensure consistent API functionality across environments.
 * 
 * Enhanced with comprehensive error handling and validation
 */

import express from 'express';
import OpenAI from 'openai';

// Import error handling utilities
import { 
  errorHandlerMiddleware, 
  asyncHandler, 
  ApiError
} from './error-handler.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create the brands API router
const brandsRouter = express.Router();

// In-memory brands data
const brands = [
  {
    id: 1,
    name: "Quantum Domain",
    slug: "quantum-domain",
    description: "Secure blockchain architecture implementation for enterprise clients",
    logoUrl: "/assets/brands/quantum-domain-logo.svg",
    primaryColor: "#3A1C71",
    secondaryColor: "#D76D77",
    website: "https://quantumdomain.aifreedomtrust.com",
    technologies: ["Blockchain", "Cryptography", "Quantum Computing"],
    sampleProducts: [
      "Quantum Validator",
      "Secure Node Infrastructure",
      "Multi-signature Authorization"
    ],
    features: [
      "Post-quantum cryptography",
      "Distributed consensus algorithms",
      "Enterprise-grade security"
    ]
  },
  {
    id: 2,
    name: "Zero Trust Framework",
    slug: "zero-trust-framework",
    description: "Adaptive security protocol implementation for distributed systems",
    logoUrl: "/assets/brands/zero-trust-logo.svg",
    primaryColor: "#0F2027",
    secondaryColor: "#2C5364",
    website: "https://zerotrust.aifreedomtrust.com",
    technologies: ["Zero Trust Architecture", "Identity Management", "Behavioral Analytics"],
    sampleProducts: [
      "Continuous Authentication System",
      "Just-in-Time Access Control",
      "Behavioral Threat Analytics"
    ],
    features: [
      "Context-aware authentication",
      "Micro-segmentation",
      "Real-time threat detection"
    ]
  },
  {
    id: 3,
    name: "Fractal Network",
    slug: "fractal-network",
    description: "Self-healing network infrastructure with adaptive routing",
    logoUrl: "/assets/brands/fractal-network-logo.svg",
    primaryColor: "#2E3192",
    secondaryColor: "#1BFFFF",
    website: "https://fractalnetwork.aifreedomtrust.com",
    technologies: ["Mesh Networking", "Self-healing Systems", "Distributed Computing"],
    sampleProducts: [
      "Fractal Mesh Router",
      "Adaptive Network Controller",
      "Resilient Edge Gateway"
    ],
    features: [
      "Dynamic route optimization",
      "Latency-aware load balancing",
      "Fault-tolerant architecture"
    ]
  },
  {
    id: 4,
    name: "AetherMesh",
    slug: "aether-mesh",
    description: "Seamless connectivity solution for IoT and edge computing environments",
    logoUrl: "/assets/brands/aether-mesh-logo.svg",
    primaryColor: "#603813",
    secondaryColor: "#b29f94",
    website: "https://aethermesh.aifreedomtrust.com",
    technologies: ["IoT", "Edge Computing", "Wireless Protocols"],
    sampleProducts: [
      "AetherLink Gateway",
      "Smart Grid Controller",
      "IoT Security Monitor"
    ],
    features: [
      "Low-latency communication",
      "Energy-efficient protocols",
      "Scalable device management"
    ]
  },
  {
    id: 5,
    name: "Fractal Vault",
    slug: "fractal-vault",
    description: "Decentralized storage with quantum-resistant encryption",
    logoUrl: "/assets/brands/fractal-vault-logo.svg",
    primaryColor: "#4C0099",
    secondaryColor: "#8300E5",
    website: "https://fractalvault.aifreedomtrust.com",
    technologies: ["Distributed Storage", "Encryption", "Content Addressing"],
    sampleProducts: [
      "Secure Object Store",
      "Encrypted File System",
      "Distributed Backup Solution"
    ],
    features: [
      "End-to-end encryption",
      "Redundant storage",
      "Content-addressable architecture"
    ]
  },
  {
    id: 6,
    name: "Quantum Guard",
    slug: "quantum-guard",
    description: "Next-generation intrusion detection and prevention system",
    logoUrl: "/assets/brands/quantum-guard-logo.svg",
    primaryColor: "#000428",
    secondaryColor: "#004e92",
    website: "https://quantumguard.aifreedomtrust.com",
    technologies: ["SIEM", "Anomaly Detection", "Threat Intelligence"],
    sampleProducts: [
      "Adaptive Firewall",
      "Behavioral Analysis Engine",
      "Quantum-Resistant Authentication"
    ],
    features: [
      "Real-time attack prevention",
      "Zero-day vulnerability protection",
      "Autonomous threat response"
    ]
  },
  {
    id: 7,
    name: "Mysterion",
    slug: "mysterion",
    description: "Advanced AI assistant platform with multi-modal intelligence capabilities",
    logoUrl: "/assets/brands/mysterion-logo.svg",
    primaryColor: "#6B3FA0",
    secondaryColor: "#C33764",
    website: "https://mysterion.aifreedomtrust.com",
    technologies: ["Artificial Intelligence", "Natural Language Processing", "Multi-modal Learning"],
    sampleProducts: [
      "Mysterion Core Intelligence",
      "Knowledge Integration System",
      "Contextual Understanding Engine"
    ],
    features: [
      "Recursive self-improvement",
      "Multi-modal reasoning capabilities",
      "Advanced context preservation"
    ]
  },
  {
    id: 8,
    name: "Fractal Chain",
    slug: "fractal-chain",
    description: "Scalable blockchain protocol with recursive sharding and quantum security",
    logoUrl: "/assets/brands/fractal-chain-logo.svg",
    primaryColor: "#1A2980",
    secondaryColor: "#26D0CE",
    website: "https://fractalchain.aifreedomtrust.com",
    technologies: ["Blockchain", "Distributed Ledger", "Quantum Cryptography"],
    sampleProducts: [
      "Fractal Node Infrastructure",
      "Recursive Sharding Protocol",
      "Quantum-Secure Transaction Layer"
    ],
    features: [
      "Infinite recursive scaling",
      "Post-quantum security",
      "Energy-efficient consensus"
    ]
  }
];

// GET /api/brands - Get all brands
brandsRouter.get('/', asyncHandler(async (req, res) => {
  // Simplified handler - asyncHandler will catch and process any errors
  res.json(brands);
}));

// GET /api/brands/:slug - Get a specific brand by slug  
brandsRouter.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const brand = brands.find(b => b.slug === slug);
  
  if (!brand) {
    throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  }
  
  res.json(brand);
}));

// GET /api/brands/id/:id - Get a specific brand by id
brandsRouter.get('/id/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    throw new ApiError('Invalid ID format', 400, 'INVALID_ID_FORMAT');
  }
  
  const brand = brands.find(b => b.id === id);
  
  if (!brand) {
    throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  }
  
  res.json(brand);
}));

// GET /api/brands/:slug/enhanced - Get enhanced description for a brand using AI
brandsRouter.get('/:slug/enhanced', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const brand = brands.find(b => b.slug === slug);
  
  if (!brand) {
    throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  }
  
  // Check if OpenAI API key is present
  if (!process.env.OPENAI_API_KEY) {
    throw new ApiError('OpenAI API key not configured', 503, 'OPENAI_API_KEY_MISSING');
  }
  
  // Generate enhanced description using OpenAI
  const prompt = `
    Generate an enhanced marketing description for a technology brand called "${brand.name}".
    The brand specializes in: ${brand.technologies.join(', ')}.
    Their core offering is: "${brand.description}"
    Some of their key features include: ${brand.features.join(', ')}.
    
    Write a compelling, professional 2-paragraph description that highlights their unique value proposition
    and positions them as a leader in their field. Focus on business benefits and innovative aspects.
    Keep the tone professional and avoid hyperbole.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a skilled technology marketing copywriter specializing in B2B SaaS products." },
        { role: "user", content: prompt }
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const enhancedDescription = response.choices[0].message.content.trim();
    
    res.json({
      ...brand,
      enhancedDescription
    });
  } catch (error) {
    console.error(`OpenAI API error:`, error);
    throw new ApiError(
      'Failed to generate enhanced description: ' + error.message,
      500,
      'OPENAI_API_ERROR'
    );
  }
}));

// GET /api/brands/:slug/trends - Get technology trends for a brand using AI
brandsRouter.get('/:slug/trends', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const brand = brands.find(b => b.slug === slug);
  
  if (!brand) {
    throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  }
  
  // Check if OpenAI API key is present
  if (!process.env.OPENAI_API_KEY) {
    throw new ApiError('OpenAI API key not configured', 503, 'OPENAI_API_KEY_MISSING');
  }
  
  // Generate technology trends using OpenAI
  const prompt = `
    Analyze current technology trends related to: ${brand.technologies.join(', ')}.
    Focus on how these trends relate to: "${brand.description}"
    
    Provide 3 specific trends that would be relevant to ${brand.name}'s business.
    
    Format the response as a JSON array with objects containing:
    - title: The name of the trend
    - description: A brief explanation of the trend and its relevance
    
    Keep each description under 100 words and focus on business impact.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a technology analyst specializing in identifying meaningful business trends." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.5,
    });

    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    const trends = result.trends || [];
    
    res.json({
      brand,
      trends
    });
  } catch (error) {
    console.error(`OpenAI API error:`, error);
    throw new ApiError(
      'Failed to generate technology trends: ' + error.message,
      500,
      'OPENAI_API_ERROR'
    );
  }
}));

// Health check endpoint
const healthRouter = express.Router();

healthRouter.get('/', asyncHandler(async (req, res) => {
  // Gather system health metrics
  const memoryUsage = process.memoryUsage();
  const healthMetrics = {
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  // Check for OpenAI API availability
  if (process.env.OPENAI_API_KEY) {
    healthMetrics.services = {
      ...healthMetrics.services,
      openai: {
        status: 'configured',
        message: 'OpenAI API key found'
      }
    };
  } else {
    healthMetrics.services = {
      ...healthMetrics.services,
      openai: {
        status: 'not_configured',
        message: 'OpenAI API key missing'
      }
    };
  }
  
  res.json(healthMetrics);
}));

// Export a function that registers all routes
export function registerApiModules(app) {
  try {
    // Register common express middleware if needed
    app.use(express.json()); // Parse JSON request body
    
    // Add error handling middleware
    app.use(errorHandlerMiddleware);
    
    // Register brand routes
    app.use('/api/brands', brandsRouter);
    
    // Register health check
    app.use('/api/health', healthRouter);
    
    console.log('✓ API modules registered successfully');
    
    return app;
  } catch (error) {
    console.error('❌ Failed to register API modules:', error);
    throw error; // Propagate the error up
  }
}

// Export individual routers for more fine-grained usage
export {
  brandsRouter,
  healthRouter
};