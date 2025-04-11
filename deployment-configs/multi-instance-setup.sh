#!/bin/bash
# multi-instance-setup.sh
# Creates multiple instances of Aetherion Wallet services for high availability

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
NUM_INSTANCES=3                 # Number of instances to create
BASE_PORT=3000                  # Starting port number
DEPLOY_DIR="/home/deploy/aetherion"  # Base deployment directory
SERVICE_USER="deploy"           # User to run the service
GITHUB_REPO="aifreedomtrust/aetherion-wallet"  # GitHub repository
BRANCH="main"                   # Branch to deploy

# Print banner
echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}     Aetherion Wallet Multi-Instance Setup     ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Ensure required directories exist
echo -e "${BLUE}Ensuring required directories exist...${NC}"
mkdir -p "$DEPLOY_DIR"
chown -R "$SERVICE_USER:$SERVICE_USER" "$DEPLOY_DIR"

# Check for required tools
for tool in curl git npm node systemctl; do
  if ! command -v $tool &> /dev/null; then
    echo -e "${RED}Error: $tool is not installed. Please install it before continuing.${NC}"
    exit 1
  fi
done

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
  echo -e "${BLUE}Updating repository...${NC}"
  cd "$DEPLOY_DIR" || exit 1
  git fetch
  git checkout "$BRANCH"
  git pull
else
  echo -e "${BLUE}Cloning repository...${NC}"
  git clone -b "$BRANCH" "https://github.com/$GITHUB_REPO" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR" || exit 1
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm ci --production

# Build the application
echo -e "${BLUE}Building application...${NC}"
npm run build

# Create instance directories
echo -e "${BLUE}Creating instance directories...${NC}"
for i in $(seq 0 $((NUM_INSTANCES-1))); do
  INSTANCE_DIR="$DEPLOY_DIR-$i"
  PORT=$((BASE_PORT + i))
  
  echo -e "${BLUE}Setting up instance $i on port $PORT...${NC}"
  
  # Create instance directory
  mkdir -p "$INSTANCE_DIR"
  
  # Copy files to instance directory
  cp -r "$DEPLOY_DIR/dist" "$INSTANCE_DIR/"
  cp -r "$DEPLOY_DIR/server-redirect.js" "$INSTANCE_DIR/"
  cp -r "$DEPLOY_DIR/package.json" "$INSTANCE_DIR/"
  
  # Create environment file for this instance
  cat > "$INSTANCE_DIR/.env" << EOL
NODE_ENV=production
PORT=$PORT
HOST=0.0.0.0
DATABASE_URL=${DATABASE_URL}
SESSION_SECRET=${SESSION_SECRET}
DEPLOY_TARGET=dapp
BASE_URL=https://atc.aifreedomtrust.com
INSTANCE_ID=$i
MATRIX_SERVER_URL=${MATRIX_SERVER_URL}
MATRIX_ACCESS_TOKEN=${MATRIX_ACCESS_TOKEN}
MATRIX_USER_ID=${MATRIX_USER_ID}
MATRIX_DEPLOYMENT_ROOM_ID=${MATRIX_DEPLOYMENT_ROOM_ID}
GITHUB_TOKEN=${GITHUB_TOKEN}
EOL
  
  # Create systemd service file
  echo -e "${BLUE}Creating systemd service for instance $i...${NC}"
  cat > "/tmp/aetherion-$i.service" << EOL
[Unit]
Description=Aetherion Wallet Server (Instance $i)
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$INSTANCE_DIR
ExecStart=/usr/bin/node $INSTANCE_DIR/server-redirect.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=INSTANCE_ID=$i
EnvironmentFile=$INSTANCE_DIR/.env

[Install]
WantedBy=multi-user.target
EOL
  
  # Install the service file
  sudo mv "/tmp/aetherion-$i.service" "/etc/systemd/system/aetherion-$i.service"
  sudo systemctl daemon-reload
  sudo systemctl enable "aetherion-$i.service"
  
  echo -e "${GREEN}Instance $i configured on port $PORT${NC}"
done

# Create health endpoint
echo -e "${BLUE}Creating health check script...${NC}"
cat > "$DEPLOY_DIR/health-check.js" << EOL
/**
 * Health Check Script for Aetherion Wallet
 * 
 * This script provides a simple health check endpoint for the application.
 * It can be used by load balancers and monitoring tools to check if the
 * application is running correctly.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');

// Configuration
const PORT = process.env.HEALTH_PORT || 8080;
const INSTANCE_ID = process.env.INSTANCE_ID || '0';
const APP_PORT = process.env.PORT || 3000;

// Create simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    // Basic health check
    const healthStatus = {
      status: 'ok',
      instance: INSTANCE_ID,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      hostname: os.hostname(),
      system: {
        loadAvg: os.loadavg(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        cpus: os.cpus().length
      }
    };
    
    // Check application port
    checkApplicationPort(APP_PORT)
      .then(isRunning => {
        healthStatus.appPortActive = isRunning;
        if (!isRunning) {
          healthStatus.status = 'degraded';
        }
        sendResponse(res, healthStatus);
      })
      .catch(err => {
        healthStatus.status = 'degraded';
        healthStatus.appPortActive = false;
        healthStatus.error = err.message;
        sendResponse(res, healthStatus);
      });
  } else {
    // Not found
    res.writeHead(404);
    res.end('Not found');
  }
});

// Helper to check if a port is in use
function checkApplicationPort(port) {
  return new Promise((resolve) => {
    const testSocket = new http.Agent();
    const req = http.request({
      agent: testSocket,
      port: port,
      host: 'localhost',
      path: '/health',
      method: 'GET',
      timeout: 2000
    });
    
    req.on('response', () => {
      resolve(true);
      req.abort();
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      resolve(false);
      req.abort();
    });
    
    req.end();
  });
}

// Helper to send JSON response
function sendResponse(res, data) {
  res.writeHead(data.status === 'ok' ? 200 : 503, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data, null, 2));
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Health check server running on port \${PORT}\`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down health check server');
  server.close(() => {
    console.log('Health check server closed');
    process.exit(0);
  });
});
EOL

# Create health check service
echo -e "${BLUE}Creating health check service...${NC}"
cat > "/tmp/aetherion-health.service" << EOL
[Unit]
Description=Aetherion Wallet Health Check Server
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node $DEPLOY_DIR/health-check.js
Restart=on-failure
RestartSec=10
Environment=HEALTH_PORT=8080
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Install the health check service file
sudo mv "/tmp/aetherion-health.service" "/etc/systemd/system/aetherion-health.service"
sudo systemctl daemon-reload
sudo systemctl enable "aetherion-health.service"

# Start all services
echo -e "${BLUE}Starting all services...${NC}"
for i in $(seq 0 $((NUM_INSTANCES-1))); do
  echo -e "${BLUE}Starting instance $i...${NC}"
  sudo systemctl start "aetherion-$i.service"
done

# Start health check service
sudo systemctl start "aetherion-health.service"

# Check if services are running
echo -e "${BLUE}Checking service status...${NC}"
for i in $(seq 0 $((NUM_INSTANCES-1))); do
  if sudo systemctl is-active --quiet "aetherion-$i.service"; then
    echo -e "${GREEN}Instance $i is running${NC}"
  else
    echo -e "${RED}Instance $i failed to start${NC}"
  fi
done

if sudo systemctl is-active --quiet "aetherion-health.service"; then
  echo -e "${GREEN}Health check service is running${NC}"
else
  echo -e "${RED}Health check service failed to start${NC}"
fi

# Display summary
echo -e "${GREEN}===== Setup Complete =====${NC}"
echo -e "Number of instances: $NUM_INSTANCES"
echo -e "Port range: $BASE_PORT - $((BASE_PORT + NUM_INSTANCES - 1))"
echo -e "Health check port: 8080"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Configure Nginx load balancer using the provided configuration."
echo -e "2. Set up the health monitoring script as a cron job."
echo -e "3. Verify that all instances are accessible through the load balancer."