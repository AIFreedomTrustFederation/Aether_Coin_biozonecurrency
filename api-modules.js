/**
 * AI Freedom Trust Framework API Modules
 * 
 * This file provides a collection of API modules that can be used by different server implementations
 * (server.js, server-local.js, replit-server.js) to ensure consistent API functionality across environments.
 */

import express from 'express';

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
  }
];

// GET /api/brands - Get all brands
brandsRouter.get('/', async (req, res) => {
  try {
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/brands/:slug - Get a specific brand by slug
brandsRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = brands.find(b => b.slug === slug);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    console.error(`Error fetching brand with slug ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// GET /api/brands/id/:id - Get a specific brand by id
brandsRouter.get('/id/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const brand = brands.find(b => b.id === id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    console.error(`Error fetching brand with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Health check endpoint
const healthRouter = express.Router();

healthRouter.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Export a function that registers all routes
export function registerApiModules(app) {
  // Register brand routes
  app.use('/api/brands', brandsRouter);
  
  // Register health check
  app.use('/api/health', healthRouter);
  
  console.log('✓ API modules registered successfully');
  
  return app;
}

// Export individual routers for more fine-grained usage
export {
  brandsRouter,
  healthRouter
};