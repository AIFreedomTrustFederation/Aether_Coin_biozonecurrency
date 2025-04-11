/**
 * Simple launcher script for the Aetherion server
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Aetherion Server...');

const server = exec('node server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Server execution error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Server stderr: ${stderr}`);
  }
  
  console.log(`Server stdout: ${stdout}`);
});

server.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

console.log('Server process started. Use Ctrl+C to stop.');