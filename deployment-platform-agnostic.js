/**
 * Scroll Keeper Platform-Agnostic Deployment Script
 * 
 * This script helps deploy the Scroll Keeper application to any environment,
 * with special optimizations for FractalCoin nodes and AICoin AetherCore services.
 * 
 * Usage:
 * node deployment-platform-agnostic.js --target=[fractalcoin|aicoin|standard] --env=[production|staging]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration options based on target platform
const CONFIG = {
  fractalcoin: {
    wsPath: '/fractal/ws',
    apiPath: '/fractal/api',
    serverPort: process.env.FRACTAL_PORT || 5000,
    optimizations: {
      memory: true,
      parallelProcessing: true,
      encryptedStorage: true
    }
  },
  aicoin: {
    wsPath: '/aether/ws',
    apiPath: '/aether/api',
    serverPort: process.env.AETHER_PORT || 5000,
    optimizations: {
      memory: true,
      vectorClustering: true,
      shardedStorage: true
    }
  },
  standard: {
    wsPath: '/ws',
    apiPath: '/api',
    serverPort: process.env.PORT || 5000,
    optimizations: {
      memory: false,
      compression: true
    }
  }
};

// Parse arguments
const args = process.argv.slice(2);
const targetArg = args.find(arg => arg.startsWith('--target='));
const envArg = args.find(arg => arg.startsWith('--env='));

const target = targetArg ? targetArg.split('=')[1] : 'standard';
const env = envArg ? envArg.split('=')[1] : 'production';

if (!CONFIG[target]) {
  console.error(`Error: Unknown target platform '${target}'. Valid options are: fractalcoin, aicoin, standard.`);
  process.exit(1);
}

// Configuration for selected target
const targetConfig = CONFIG[target];

console.log(`
╔═══════════════════════════════════════════════════╗
║         Scroll Keeper Deployment Utility          ║
║                                                   ║
║  Target: ${target.padEnd(40, ' ')}║
║  Environment: ${env.padEnd(36, ' ')}║
║  WebSocket Path: ${targetConfig.wsPath.padEnd(33, ' ')}║
║  API Path: ${targetConfig.apiPath.padEnd(39, ' ')}║
║  Server Port: ${targetConfig.serverPort.toString().padEnd(37, ' ')}║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`);

console.log('Building deployment package...');

// Create deployment directory
const deployDir = path.join(process.cwd(), 'deploy');
if (fs.existsSync(deployDir)) {
  console.log('Cleaning existing deployment directory...');
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

// Copy necessary files
const filesToCopy = [
  'server',
  'public',
  'shared',
  'package.json',
  'server.js',
  '.env.example'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(process.cwd(), file);
  const destPath = path.join(deployDir, file);
  
  if (fs.existsSync(sourcePath)) {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
});

// Create environment file
const envContent = `
# Scroll Keeper Environment Configuration
# Target: ${target}
# Environment: ${env}

PORT=${targetConfig.serverPort}
NODE_ENV=${env}
WEBSOCKET_PATH=${targetConfig.wsPath}
API_PATH=${targetConfig.apiPath}

# Platform-specific optimizations
ENABLE_MEMORY_OPTIMIZATION=${targetConfig.optimizations.memory}
ENABLE_VECTOR_CLUSTERING=${targetConfig.optimizations.vectorClustering || false}
ENABLE_PARALLEL_PROCESSING=${targetConfig.optimizations.parallelProcessing || false}
ENABLE_SHARDED_STORAGE=${targetConfig.optimizations.shardedStorage || false}
ENABLE_ENCRYPTED_STORAGE=${targetConfig.optimizations.encryptedStorage || false}
ENABLE_COMPRESSION=${targetConfig.optimizations.compression || false}

# Add your API keys below
# HUGGINGFACE_API_KEY=
# OPENAI_API_KEY=
`;

fs.writeFileSync(path.join(deployDir, '.env'), envContent);

// Create platform-specific README
const readmeContent = `
# Scroll Keeper Deployment for ${target.charAt(0).toUpperCase() + target.slice(1)}

This package contains a deployment of Scroll Keeper configured for ${target} environment.

## Quick Start

1. Ensure Node.js 18+ is installed
2. Configure your API keys in the .env file
3. Run the following commands:

\`\`\`
npm install
npm start
\`\`\`

## Configuration

The application is preconfigured for ${target} with optimized settings.
Server will run on port ${targetConfig.serverPort}.

## WebSocket

WebSocket server is available at: ${targetConfig.wsPath}

## API

API endpoints are available at: ${targetConfig.apiPath}

`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);

console.log(`
✅ Deployment package created successfully in the 'deploy' directory.
✅ Platform-specific configurations for ${target} have been applied.
✅ The application is ready to be deployed to your ${target} environment.

Next steps:
1. Configure your API keys in the .env file
2. Deploy the contents of the 'deploy' directory to your ${target} server
3. Run 'npm install' and 'npm start' on the server

For FractalCoin and AICoin AetherCore services, use their respective
deployment utilities to deploy the package.
`);

// Helper function to copy directories recursively
function copyDir(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}