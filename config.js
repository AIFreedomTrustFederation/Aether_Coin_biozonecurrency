/**
 * Aetherion Ecosystem Configuration
 * 
 * This file provides a centralized configuration for all ports and services
 * in the Aetherion Ecosystem. Always refer to this file when setting up
 * or modifying services to ensure consistent port usage.
 */

const config = {
  // Main proxy server
  mainServer: {
    port: process.env.PORT || 5000, // Use port 5000 for Replit workflow compatibility
    basePath: '/',
    name: 'Aetherion Ecosystem Server'
  },
  
  // Brand Showcase application
  brandShowcase: {
    port: 8080,
    basePath: '/brands',
    proxyPath: '/brands',
    vitePort: 8080,
    name: 'Brand Showcase'
  },
  
  // Aetherion Wallet application
  aetherionWallet: {
    port: 8081,
    basePath: '/wallet',
    proxyPath: '/wallet',
    vitePort: 8082,
    name: 'Aetherion Wallet'
  },
  
  // Third application
  thirdApp: {
    port: 8083,
    basePath: '/app3',
    proxyPath: '/app3',
    name: 'Third Application'
  },
  
  // Websocket server (uses the main server)
  websocket: {
    path: '/ws',
    name: 'WebSocket Server'
  },
  
  // API endpoints
  api: {
    health: '/api/health',
    status: '/status',
    name: 'API Endpoints'
  },

  // Build a full URL for any service
  getUrl: function(service, path = '', useReplit = false) {
    const baseUrl = useReplit 
      ? 'https://workspace.aifreedomtrust.repl.co' 
      : `http://localhost:${this[service].port}`;
    return `${baseUrl}${path}`;
  },

  // Get a proxy configuration for any service
  getProxyConfig: function(service) {
    return {
      target: `http://localhost:${this[service].port}`,
      changeOrigin: true,
      logLevel: 'error'
    };
  }
};

// Export as ES module
export default config;