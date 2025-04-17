/**
 * FractalDNS Server Entry Point
 * Run this file to start the FractalDNS server
 */

const FractalDnsServer = require('./fractalDnsServer');
const { createLogger } = require('./utils/logger');
const config = require('./config');

// Initialize logger
const logger = createLogger('main');

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});

/**
 * Main function
 */
async function main() {
  try {
    logger.info('Starting FractalDNS server...');
    
    // Banner
    console.log(`
    ███████╗██████╗  █████╗  ██████╗████████╗ █████╗ ██╗     ██████╗ ███╗   ██╗███████╗
    ██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██║     ██╔══██╗████╗  ██║██╔════╝
    █████╗  ██████╔╝███████║██║        ██║   ███████║██║     ██║  ██║██╔██╗ ██║███████╗
    ██╔══╝  ██╔══██╗██╔══██║██║        ██║   ██╔══██║██║     ██║  ██║██║╚██╗██║╚════██║
    ██║     ██║  ██║██║  ██║╚██████╗   ██║   ██║  ██║███████╗██████╔╝██║ ╚████║███████║
    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═══╝╚══════╝
    ======== Quantum-Resistant Decentralized DNS Server for Aetherion ========                                                                           
    `);
    
    // Create server instance
    const server = new FractalDnsServer();
    
    // Start server
    await server.start();
    
    // Display server info
    const udpAddress = config.server.enableUdp ? `${config.server.address}:${config.server.port} (UDP)` : 'disabled';
    const tcpAddress = config.server.enableTcp ? `${config.server.address}:${config.server.port} (TCP)` : 'disabled';
    const webAdminAddress = config.webAdmin.enabled ? 
      `${config.webAdmin.address}:${config.webAdmin.port} (${config.webAdmin.sslEnabled ? 'HTTPS' : 'HTTP'})` : 
      'disabled';
    
    logger.info(`Server running at: ${udpAddress}, ${tcpAddress}`);
    logger.info(`Web Admin Interface: ${webAdminAddress}`);
    
    // Register shutdown handler
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT signal. Shutting down...');
      await server.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal. Shutting down...');
      await server.stop();
      process.exit(0);
    });
    
    logger.info('FractalDNS server started successfully');
  } catch (error) {
    logger.error('Failed to start FractalDNS server', error);
    process.exit(1);
  }
}

// Run the server
main();