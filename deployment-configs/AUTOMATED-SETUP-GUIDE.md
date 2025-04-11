# Aetherion Wallet Automated High-Availability Setup Guide

This guide provides instructions for using the automated high-availability setup script for Aetherion Wallet.

## Overview

The `automated-ha-setup.sh` script automates the entire process of setting up a high-availability infrastructure for Aetherion Wallet, including:

- Multi-instance deployment
- Load balancing with Nginx
- Health monitoring and automated recovery
- Database backups
- Monitoring dashboard

## Prerequisites

Before running the script, ensure you have:

- A server running Ubuntu 20.04 LTS or later
- Root access to the server
- Domain name pointing to the server (e.g., `atc.aifreedomtrust.com`)
- SSL certificates for the domain (Let's Encrypt recommended)
- PostgreSQL database connection string

## Environment Variables

Set the following environment variables before running the script:

```bash
# Required
export DATABASE_URL="postgresql://username:password@hostname:5432/database"
export SESSION_SECRET="your-session-secret"  # Will be auto-generated if not provided
export GITHUB_TOKEN="your-github-token"  # For repository access

# Optional (for Matrix notifications)
export MATRIX_SERVER_URL="https://matrix.org"
export MATRIX_ACCESS_TOKEN="your-matrix-access-token"
export MATRIX_USER_ID="@user:matrix.org"
export MATRIX_DEPLOYMENT_ROOM_ID="!roomid:matrix.org"
```

## Basic Usage

1. Copy the entire `deployment-configs` directory to your server
2. Make the script executable:
   ```bash
   chmod +x deployment-configs/automated-ha-setup.sh
   ```
3. Set the required environment variables
4. Run the script with root privileges:
   ```bash
   sudo ./deployment-configs/automated-ha-setup.sh
   ```

## Advanced Options

The script supports various command-line options:

```
Options:
  --help               Show help message
  --no-nginx           Skip Nginx load balancer installation and configuration
  --no-monitoring      Skip monitoring dashboard setup
  --instances=N        Number of application instances to create (default: 3)
  --deploy-dir=PATH    Base deployment directory (default: /home/deploy/aetherion)
  --domain=DOMAIN      Domain name for the deployment (default: atc.aifreedomtrust.com)
  --user=USER          System user to run the services (default: deploy)
```

### Examples

Create 5 instances instead of the default 3:
```bash
sudo ./automated-ha-setup.sh --instances=5
```

Use a different domain:
```bash
sudo ./automated-ha-setup.sh --domain=wallet.example.com
```

Skip Nginx configuration (if you want to configure it manually):
```bash
sudo ./automated-ha-setup.sh --no-nginx
```

## Verification

After the script completes, it will:

1. Verify that all services are running
2. Check the health endpoints
3. Display a summary with the next steps

## Accessing the Monitoring Dashboard

The monitoring dashboard will be available at:
- Internal URL: `http://localhost:8090`
- External URL: `https://yourdomain.com/monitoring`

Default credentials:
- Username: `admin`
- Password: Auto-generated (displayed at the end of setup)

## Troubleshooting

If any issues occur during setup:

1. Check the service status:
   ```bash
   sudo systemctl status aetherion-0.service
   ```

2. View service logs:
   ```bash
   sudo journalctl -u aetherion-0.service
   ```

3. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

4. Check the health monitoring logs:
   ```bash
   sudo tail -f /var/log/aetherion/health-monitor.log
   ```

## Manual Components

If you prefer to set up components manually, refer to these individual files:

- `nginx-load-balancer.conf` - Nginx load balancer configuration
- `health-monitor.sh` - Health monitoring script
- `multi-instance-setup.sh` - Multi-instance setup script
- `monitoring-dashboard.js` - Monitoring dashboard

## Scaling Further

For even more robust high availability:

1. Set up multiple servers with this script
2. Use DNS round-robin or a global load balancer
3. Set up a database replication cluster
4. Consider using a CDN for static assets