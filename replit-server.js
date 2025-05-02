/**
 * Specialized Express server for Replit webview integration
 * This server is designed to work specifically with Replit's webview
 * by serving content directly on the expected port and addressing
 * common Replit-specific connectivity issues.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS for all origins
app.use(cors({ origin: '*' }));

// Body parser middleware
app.use(express.json());

// Connect the WebSocket server directly to the HTTP server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', function connection(ws) {
  console.log('WebSocket client connected');
  
  ws.on('message', function incoming(message) {
    console.log('Received message:', message.toString());
    ws.send(JSON.stringify({ type: 'echo', message: message.toString() }));
  });
  
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket Server' }));
});

// Import brand data from routes-simple.js
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

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    message: 'Replit-specific server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/brands', (req, res) => {
  res.json(brands);
});

app.get('/api/brands/:slug', (req, res) => {
  const { slug } = req.params;
  const brand = brands.find(b => b.slug === slug);
  
  if (!brand) {
    return res.status(404).json({ error: 'Brand not found' });
  }
  
  res.json(brand);
});

// Create a simple landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Serve static files from client directory (for testing)
app.use(express.static(path.join(__dirname, 'client')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Replit-optimized server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/brands`);
});