import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Set to port 3000 for Replit compatibility
const PORT = process.env.PORT || 3000;

// Serve static files from client/public
app.use(express.static(path.join(__dirname, 'client/public')));

// Handle root requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/index.html'));
});

// Handle status requests
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/status.html'));
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`Replit URL: ${replitUrl}`);
  }
});