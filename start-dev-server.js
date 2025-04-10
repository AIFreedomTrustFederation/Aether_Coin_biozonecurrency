/**
 * Custom startup script for Aetherion development server
 * Ensures the Vite server starts with the correct port and host configuration
 */

const { execSync } = require('child_process');

console.log('Starting Aetherion development server...');
console.log('Setting up Vite with port 5000 and host 0.0.0.0 for external access');

try {
  // Start the Vite development server with specific port and host
  execSync('npx vite --port 5000 --host 0.0.0.0', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_PORT: '5000'
    }
  });
} catch (error) {
  console.error('Error starting development server:', error.message);
  process.exit(1);
}