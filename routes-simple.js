/**
 * AI Freedom Trust Framework API Routes
 * 
 * This file provides a JavaScript wrapper around the TypeScript routes in server/routes.ts
 * to make it compatible with the server.js express app.
 */

import express from 'express';

// Create the brand routes router
const brandRoutes = express.Router();

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
brandRoutes.get('/', async (req, res) => {
  try {
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/brands/:slug - Get a specific brand by slug
brandRoutes.get('/:slug', async (req, res) => {
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

// Export a function that registers all routes
export async function registerRoutes(app) {
  // Register brand routes
  app.use('/api/brands', brandRoutes);
  
  return app;
}