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
    port: 5000,
    basePath: '/',
    name: 'Aetherion Ecosystem Server'
  },
  
  // Brand Showcase application
  brandShowcase: {
    port: 5173,
    basePath: '/brands',
    proxyPath: '/brands',
    vitePort: 5173,
    name: 'Brand Showcase'
  },
  
  // Aetherion Wallet application
  aetherionWallet: {
    port: 5174,
    basePath: '/wallet',
    proxyPath: '/wallet',
    vitePort: 5176,
    name: 'Aetherion Wallet'
  },
  
  // Third application
  thirdApp: {
    port: 5175,
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