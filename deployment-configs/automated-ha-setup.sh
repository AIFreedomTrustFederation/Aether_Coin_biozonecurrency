#!/bin/bash
#
# automated-ha-setup.sh
# 
# Automated High-Availability Setup Script for Aetherion Wallet
# This script automates the entire process of setting up a high-availability
# infrastructure for Aetherion Wallet, including load balancing, multi-instance
# deployment, and health monitoring.
#
# Usage: ./automated-ha-setup.sh [--help] [--no-nginx] [--no-monitoring] [--instances=3]

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default configuration
DEPLOY_DIR="/home/deploy/aetherion"
SERVICE_USER="deploy"
NUM_INSTANCES=3
BASE_PORT=3000
INSTALL_NGINX=true
SETUP_MONITORING=true
SETUP_DATABASE_BACKUP=true
DOMAIN="atc.aifreedomtrust.com"
GITHUB_REPO="aifreedomtrust/aetherion-wallet"
BRANCH="main"
DASHBOARD_PORT=8090

# Parse command line arguments
for i in "$@"; do
  case $i in
    --help)
      echo "Automated High-Availability Setup Script for Aetherion Wallet"
      echo ""
      echo "Usage: ./automated-ha-setup.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --help               Show this help message"
      echo "  --no-nginx           Skip Nginx load balancer installation and configuration"
      echo "  --no-monitoring      Skip monitoring dashboard setup"
      echo "  --instances=N        Number of application instances to create (default: 3)"
      echo "  --deploy-dir=PATH    Base deployment directory (default: /home/deploy/aetherion)"
      echo "  --domain=DOMAIN      Domain name for the deployment (default: atc.aifreedomtrust.com)"
      echo "  --user=USER          System user to run the services (default: deploy)"
      echo ""
      exit 0
      ;;
    --no-nginx)
      INSTALL_NGINX=false
      shift
      ;;
    --no-monitoring)
      SETUP_MONITORING=false
      shift
      ;;
    --instances=*)
      NUM_INSTANCES="${i#*=}"
      shift
      ;;
    --deploy-dir=*)
      DEPLOY_DIR="${i#*=}"
      shift
      ;;
    --domain=*)
      DOMAIN="${i#*=}"
      shift
      ;;
    --user=*)
      SERVICE_USER="${i#*=}"
      shift
      ;;
    *)
      # Unknown option
      echo "Unknown option: $i"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Print banner
function print_banner() {
  echo -e "${BLUE}===========================================================${NC}"
  echo -e "${BLUE}     Aetherion Wallet High-Availability Setup     ${NC}"
  echo -e "${BLUE}===========================================================${NC}"
  echo
}

# Check if running as root
function check_root() {
  if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}"
    exit 1
  fi
}

# Check for required tools
function check_dependencies() {
  echo -e "${BLUE}Checking for required dependencies...${NC}"
  
  local MISSING_DEPS=()
  
  # List of required commands
  local REQUIRED_COMMANDS=(
    "curl"
    "git"
    "node"
    "npm"
    "systemctl"
  )
  
  # Check if Nginx is required
  if [ "$INSTALL_NGINX" = true ]; then
    REQUIRED_COMMANDS+=("nginx")
  fi
  
  # Check for each command
  for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command -v "$cmd" &> /dev/null; then
      MISSING_DEPS+=("$cmd")
    fi
  done
  
  # If there are missing dependencies, try to install them
  if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "${YELLOW}The following dependencies are missing: ${MISSING_DEPS[*]}${NC}"
    
    # Ask to install missing dependencies
    read -p "Would you like to install missing dependencies? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Installing missing dependencies...${NC}"
      
      # Update package lists
      apt update
      
      # Install each missing dependency
      for dep in "${MISSING_DEPS[@]}"; do
        case "$dep" in
          "curl")
            apt install -y curl
            ;;
          "git")
            apt install -y git
            ;;
          "node")
            # Node.js might require a PPA
            if ! command -v nodejs &> /dev/null; then
              curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
              apt install -y nodejs
            fi
            ;;
          "npm")
            # NPM typically comes with Node.js
            apt install -y npm
            ;;
          "nginx")
            apt install -y nginx
            ;;
          *)
            echo -e "${YELLOW}Don't know how to install: $dep${NC}"
            ;;
        esac
      done
      
      # Verify installation
      for dep in "${MISSING_DEPS[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
          echo -e "${RED}Failed to install: $dep${NC}"
          exit 1
        fi
      done
      
      echo -e "${GREEN}All dependencies successfully installed!${NC}"
    else
      echo -e "${RED}Cannot continue without required dependencies.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}All required dependencies are installed!${NC}"
  fi
}

# Create service user if it doesn't exist
function create_service_user() {
  echo -e "${BLUE}Checking for service user: $SERVICE_USER${NC}"
  
  if id "$SERVICE_USER" &>/dev/null; then
    echo -e "${GREEN}User $SERVICE_USER already exists${NC}"
  else
    echo -e "${BLUE}Creating service user: $SERVICE_USER${NC}"
    useradd -m -s /bin/bash "$SERVICE_USER"
    echo -e "${GREEN}User $SERVICE_USER created${NC}"
  fi
}

# Set up deployment directory
function setup_deploy_dir() {
  echo -e "${BLUE}Setting up deployment directory...${NC}"
  
  mkdir -p "$DEPLOY_DIR"
  chown -R "$SERVICE_USER:$SERVICE_USER" "$DEPLOY_DIR"
  
  echo -e "${GREEN}Deployment directory ready: $DEPLOY_DIR${NC}"
}

# Clone or update repository
function setup_repository() {
  echo -e "${BLUE}Setting up repository...${NC}"
  
  # Switch to service user for git operations
  su - "$SERVICE_USER" -c "
    if [ -d \"$DEPLOY_DIR/.git\" ]; then
      echo 'Updating repository...'
      cd \"$DEPLOY_DIR\" || exit 1
      git fetch
      git checkout $BRANCH
      git pull
    else
      echo 'Cloning repository...'
      git clone -b $BRANCH https://github.com/$GITHUB_REPO \"$DEPLOY_DIR\"
    fi
  "
  
  # Check if the operation was successful
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set up repository${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Repository ready: $DEPLOY_DIR${NC}"
}

# Install application dependencies and build
function build_application() {
  echo -e "${BLUE}Building application...${NC}"
  
  su - "$SERVICE_USER" -c "
    cd \"$DEPLOY_DIR\" || exit 1
    npm ci --production
    npm run build
  "
  
  # Check if the build was successful
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build application${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Application built successfully${NC}"
}

# Set up multiple instances
function setup_instances() {
  echo -e "${BLUE}Setting up $NUM_INSTANCES application instances...${NC}"
  
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
SESSION_SECRET=${SESSION_SECRET:-$(openssl rand -hex 32)}
DEPLOY_TARGET=dapp
BASE_URL=https://$DOMAIN
INSTANCE_ID=$i
MATRIX_SERVER_URL=${MATRIX_SERVER_URL}
MATRIX_ACCESS_TOKEN=${MATRIX_ACCESS_TOKEN}
MATRIX_USER_ID=${MATRIX_USER_ID}
MATRIX_DEPLOYMENT_ROOM_ID=${MATRIX_DEPLOYMENT_ROOM_ID}
GITHUB_TOKEN=${GITHUB_TOKEN}
EOL
    
    # Update ownership of instance directory
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTANCE_DIR"
    
    # Create systemd service file
    cat > "/etc/systemd/system/aetherion-$i.service" << EOL
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
    
    # Enable and start the service
    systemctl daemon-reload
    systemctl enable "aetherion-$i.service"
    systemctl start "aetherion-$i.service"
    
    echo -e "${GREEN}Instance $i configured on port $PORT${NC}"
  done
  
  echo -e "${GREEN}All instances configured and started${NC}"
}

# Set up health check service
function setup_health_check() {
  echo -e "${BLUE}Setting up health check service...${NC}"
  
  # Copy health check script to deployment directory
  cp "$DEPLOY_DIR/deployment-configs/health-monitor.sh" "$DEPLOY_DIR/"
  chmod +x "$DEPLOY_DIR/health-monitor.sh"
  
  # Update ownership
  chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOY_DIR/health-monitor.sh"
  
  # Create directory for logs
  mkdir -p "/var/log/aetherion"
  chown "$SERVICE_USER:$SERVICE_USER" "/var/log/aetherion"
  
  # Create systemd timer and service for health check
  cat > "/etc/systemd/system/aetherion-health-check.service" << EOL
[Unit]
Description=Aetherion Health Check Service
After=network.target

[Service]
Type=oneshot
User=$SERVICE_USER
ExecStart=$DEPLOY_DIR/health-monitor.sh
EOL

  cat > "/etc/systemd/system/aetherion-health-check.timer" << EOL
[Unit]
Description=Run Aetherion Health Check Every 5 Minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
AccuracySec=1min

[Install]
WantedBy=timers.target
EOL

  # Enable and start the timer
  systemctl daemon-reload
  systemctl enable aetherion-health-check.timer
  systemctl start aetherion-health-check.timer
  
  echo -e "${GREEN}Health check service set up and scheduled${NC}"
}

# Set up database backup
function setup_database_backup() {
  if [ "$SETUP_DATABASE_BACKUP" = true ]; then
    echo -e "${BLUE}Setting up database backup...${NC}"
    
    # Copy backup script to deployment directory
    cp "$DEPLOY_DIR/db-backup.sh" "$DEPLOY_DIR/"
    chmod +x "$DEPLOY_DIR/db-backup.sh"
    
    # Update ownership
    chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOY_DIR/db-backup.sh"
    
    # Create backup directory
    mkdir -p "$DEPLOY_DIR/backups"
    chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOY_DIR/backups"
    
    # Create systemd timer and service for database backup
    cat > "/etc/systemd/system/aetherion-db-backup.service" << EOL
[Unit]
Description=Aetherion Database Backup Service
After=network.target

[Service]
Type=oneshot
User=$SERVICE_USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=$DEPLOY_DIR/db-backup.sh $DEPLOY_DIR/backups/backup-\%F-\%H-\%M.sql
Environment=DATABASE_URL=${DATABASE_URL}
EOL

    cat > "/etc/systemd/system/aetherion-db-backup.timer" << EOL
[Unit]
Description=Run Aetherion Database Backup Daily

[Timer]
OnBootSec=15min
OnCalendar=*-*-* 02:00:00
AccuracySec=1min
Persistent=true

[Install]
WantedBy=timers.target
EOL

    # Enable and start the timer
    systemctl daemon-reload
    systemctl enable aetherion-db-backup.timer
    systemctl start aetherion-db-backup.timer
    
    # Set up backup rotation (keep last 14 days)
    cat > "/etc/cron.daily/aetherion-backup-rotate" << EOL
#!/bin/sh
find $DEPLOY_DIR/backups -type f -name "backup-*.sql" -mtime +14 -delete
EOL
    chmod +x "/etc/cron.daily/aetherion-backup-rotate"
    
    echo -e "${GREEN}Database backup set up and scheduled daily at 2 AM${NC}"
  fi
}

# Set up monitoring dashboard
function setup_monitoring_dashboard() {
  if [ "$SETUP_MONITORING" = true ]; then
    echo -e "${BLUE}Setting up monitoring dashboard...${NC}"
    
    # Copy monitoring dashboard to deployment directory
    cp "$DEPLOY_DIR/deployment-configs/monitoring-dashboard.js" "$DEPLOY_DIR/"
    chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOY_DIR/monitoring-dashboard.js"
    
    # Create systemd service for monitoring dashboard
    cat > "/etc/systemd/system/aetherion-monitoring.service" << EOL
[Unit]
Description=Aetherion Wallet Monitoring Dashboard
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node $DEPLOY_DIR/monitoring-dashboard.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=DASHBOARD_PORT=$DASHBOARD_PORT

[Install]
WantedBy=multi-user.target
EOL
    
    # Enable and start the service
    systemctl daemon-reload
    systemctl enable aetherion-monitoring.service
    systemctl start aetherion-monitoring.service
    
    echo -e "${GREEN}Monitoring dashboard set up on port $DASHBOARD_PORT${NC}"
  fi
}

# Set up Nginx load balancer
function setup_nginx() {
  if [ "$INSTALL_NGINX" = true ]; then
    echo -e "${BLUE}Setting up Nginx load balancer...${NC}"
    
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
      echo -e "${RED}Nginx is not installed. Please install it manually or use --no-nginx option.${NC}"
      return 1
    fi
    
    # Create Nginx configuration
    cat > "/etc/nginx/sites-available/aetherion-load-balancer.conf" << EOL
############################################################
# Aetherion Wallet - Load Balancing & Failover Nginx Configuration
############################################################

# Define upstream backend servers
upstream aetherion_backends {
    # Health check with least connection balancing
    least_conn;
    
    # Main backend instances
EOL
    
    # Add upstream servers
    for i in $(seq 0 $((NUM_INSTANCES-1))); do
      PORT=$((BASE_PORT + i))
      if [ "$i" -eq 0 ]; then
        echo "    server 127.0.0.1:$PORT max_fails=3 fail_timeout=30s;" >> "/etc/nginx/sites-available/aetherion-load-balancer.conf"
      else
        echo "    server 127.0.0.1:$PORT max_fails=3 fail_timeout=30s backup;" >> "/etc/nginx/sites-available/aetherion-load-balancer.conf"
      fi
    done
    
    # Continue with the rest of the configuration
    cat >> "/etc/nginx/sites-available/aetherion-load-balancer.conf" << EOL
    
    # Keep connections alive
    keepalive 32;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Improved SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Enhanced security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Buffer settings
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 2 1k;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 15;
    send_timeout 10;
    
    # Primary application at /dapp
    location /dapp {
        # Rate limiting zone - 10 requests per second
        limit_req zone=dapplimit burst=20 nodelay;
        
        # Load balancing
        proxy_pass http://aetherion_backends;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts for proxy
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 16k;
        
        # Add custom response header to track which backend server processed the request
        add_header X-Backend \$upstream_addr;
        
        # Cache configuration for static assets
        location /dapp/assets {
            proxy_pass http://aetherion_backends;
            proxy_cache aetherion_cache;
            proxy_cache_valid 200 301 302 30d;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_lock on;
            expires 30d;
            add_header Cache-Control "public, max-age=2592000";
            add_header X-Cache-Status \$upstream_cache_status;
        }
        
        # API endpoints - no caching
        location /dapp/api {
            proxy_pass http://aetherion_backends;
            add_header Cache-Control "no-store, no-cache, must-revalidate";
            expires 0;
        }
    }
    
    # Monitoring dashboard
    location /monitoring {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://127.0.0.1:$DASHBOARD_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        add_header Content-Type application/json;
        return 200 '{"status":"ok","service":"nginx","timestamp":"\$time_iso8601"}';
    }
    
    # Redirect root to /dapp for convenience
    location = / {
        return 301 /dapp;
    }
    
    # Let's Encrypt SSL renewal 
    location ~ /.well-known {
        allow all;
    }
    
    # Enable compression for text-based assets
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;
}

# Rate limiting zone definition (10 requests per second)
limit_req_zone \$binary_remote_addr zone=dapplimit:10m rate=10r/s;

# Cache definition for static assets
proxy_cache_path /var/cache/nginx/aetherion_cache levels=1:2 keys_zone=aetherion_cache:10m max_size=500m inactive=60m;
EOL
    
    # Create .htpasswd file for monitoring dashboard
    if [ ! -f "/etc/nginx/.htpasswd" ]; then
      echo -e "${BLUE}Setting up basic authentication for monitoring dashboard...${NC}"
      
      # Generate random password if not provided
      MONITOR_PASSWORD=${MONITOR_PASSWORD:-$(openssl rand -base64 12)}
      
      # Create .htpasswd file
      apt-get install -y apache2-utils
      htpasswd -bc /etc/nginx/.htpasswd admin "$MONITOR_PASSWORD"
      
      echo -e "${GREEN}Monitoring dashboard credentials:${NC}"
      echo -e "Username: admin"
      echo -e "Password: $MONITOR_PASSWORD"
    fi
    
    # Create cache directory
    mkdir -p /var/cache/nginx/aetherion_cache
    chown www-data:www-data /var/cache/nginx/aetherion_cache
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/aetherion-load-balancer.conf /etc/nginx/sites-enabled/
    
    # Check Nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
      # Reload Nginx
      systemctl reload nginx
      echo -e "${GREEN}Nginx load balancer configured and reloaded${NC}"
    else
      echo -e "${RED}Nginx configuration test failed. Please check the configuration.${NC}"
      return 1
    fi
  fi
}

# Verify installation
function verify_installation() {
  echo -e "${BLUE}Verifying installation...${NC}"
  
  echo -e "${BLUE}Checking services...${NC}"
  
  # Check if all services are running
  SERVICES_OK=true
  
  for i in $(seq 0 $((NUM_INSTANCES-1))); do
    if systemctl is-active --quiet "aetherion-$i.service"; then
      echo -e "${GREEN}Instance $i is running${NC}"
    else
      echo -e "${RED}Instance $i is not running${NC}"
      SERVICES_OK=false
    fi
  done
  
  if [ "$SETUP_MONITORING" = true ]; then
    if systemctl is-active --quiet "aetherion-monitoring.service"; then
      echo -e "${GREEN}Monitoring dashboard is running${NC}"
    else
      echo -e "${RED}Monitoring dashboard is not running${NC}"
      SERVICES_OK=false
    fi
  fi
  
  # Check health endpoints
  echo -e "${BLUE}Checking health endpoints...${NC}"
  
  # Check first instance health endpoint
  HEALTH_RESPONSE=$(curl -s http://localhost:$BASE_PORT/health)
  if [[ $HEALTH_RESPONSE == *"status"*:"ok"* ]]; then
    echo -e "${GREEN}Health endpoint is responding correctly${NC}"
  else
    echo -e "${RED}Health endpoint is not responding correctly${NC}"
    SERVICES_OK=false
  fi
  
  # Display summary
  echo -e "${BLUE}===========================================================${NC}"
  if [ "$SERVICES_OK" = true ]; then
    echo -e "${GREEN}High-Availability Setup Complete!${NC}"
  else
    echo -e "${YELLOW}High-Availability Setup Complete with Warnings${NC}"
    echo -e "${YELLOW}Please check the issues mentioned above.${NC}"
  fi
  
  echo -e "${BLUE}===========================================================${NC}"
  echo -e "Number of instances: $NUM_INSTANCES"
  echo -e "Port range: $BASE_PORT - $((BASE_PORT + NUM_INSTANCES - 1))"
  if [ "$SETUP_MONITORING" = true ]; then
    echo -e "Monitoring dashboard: http://localhost:$DASHBOARD_PORT"
    echo -e "External monitoring URL: https://$DOMAIN/monitoring"
  fi
  echo -e "Application URL: https://$DOMAIN/dapp"
  echo -e "${BLUE}===========================================================${NC}"
  
  echo -e "${YELLOW}Next steps:${NC}"
  echo -e "1. Ensure SSL certificates are properly set up for $DOMAIN"
  echo -e "2. Test the application through the load balancer: https://$DOMAIN/dapp"
  echo -e "3. Monitor the system for stability over the next 24 hours"
  echo -e "4. Consider adding more instances or scaling to multiple servers if needed"
}

# Main function
function main() {
  print_banner
  check_root
  check_dependencies
  create_service_user
  setup_deploy_dir
  setup_repository
  build_application
  setup_instances
  setup_health_check
  setup_database_backup
  setup_monitoring_dashboard
  setup_nginx
  verify_installation
}

# Run the main function
main