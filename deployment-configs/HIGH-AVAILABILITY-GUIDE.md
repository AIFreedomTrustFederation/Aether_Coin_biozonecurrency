# Aetherion Wallet High Availability Deployment Guide

This guide provides instructions for setting up Aetherion Wallet in a high-availability configuration to ensure maximum uptime and reliability.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Multi-Instance Deployment](#multi-instance-deployment)
4. [Load Balancer Configuration](#load-balancer-configuration)
5. [Health Monitoring](#health-monitoring)
6. [Database High Availability](#database-high-availability)
7. [Backup and Recovery](#backup-and-recovery)
8. [Scaling Considerations](#scaling-considerations)

## System Requirements

For a robust high-availability setup, you'll need:

- A server with at least 4 CPU cores and 8GB RAM
- 40GB+ SSD storage
- Ubuntu 20.04 LTS or later
- Nginx (for load balancing)
- Node.js 18+ and npm
- PostgreSQL 13+
- Let's Encrypt SSL certificates

## Infrastructure Setup

### 1. Initial Server Setup

Ensure your server is properly secured:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx fail2ban ufw

# Configure firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2. SSL Certificate Setup

Obtain SSL certificates for your domain:

```bash
sudo certbot --nginx -d atc.aifreedomtrust.com
```

## Multi-Instance Deployment

The `multi-instance-setup.sh` script will set up multiple instances of Aetherion Wallet to run simultaneously.

### Prerequisites

1. Ensure you have set the required environment variables or they are available in your environment:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `GITHUB_TOKEN`
   - `MATRIX_SERVER_URL` (optional)
   - `MATRIX_ACCESS_TOKEN` (optional)
   - `MATRIX_USER_ID` (optional)
   - `MATRIX_DEPLOYMENT_ROOM_ID` (optional)

2. Make the script executable:

```bash
chmod +x deployment-configs/multi-instance-setup.sh
```

### Running the Setup

```bash
sudo ./deployment-configs/multi-instance-setup.sh
```

This script will:
- Clone the Aetherion Wallet repository
- Create multiple instances (3 by default) with different port numbers
- Set up systemd services for each instance
- Create a health check service

## Load Balancer Configuration

Configure Nginx as a load balancer using the provided configuration:

```bash
# Copy the configuration file
sudo cp deployment-configs/nginx-load-balancer.conf /etc/nginx/sites-available/aetherion-load-balancer.conf

# Enable the site
sudo ln -s /etc/nginx/sites-available/aetherion-load-balancer.conf /etc/nginx/sites-enabled/

# Create cache directory
sudo mkdir -p /var/cache/nginx/aetherion_cache
sudo chown www-data:www-data /var/cache/nginx/aetherion_cache

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## Health Monitoring

### Setting Up the Health Monitor

1. Make the script executable:

```bash
chmod +x deployment-configs/health-monitor.sh
```

2. Set up a cron job to run the health check every 5 minutes:

```bash
(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/deployment-configs/health-monitor.sh") | crontab -
```

### Testing the Monitoring

Manually run the health check to ensure it's working:

```bash
./deployment-configs/health-monitor.sh
```

## Database High Availability

For PostgreSQL high availability, you can set up a primary-replica configuration.

### 1. Primary Server Configuration

Edit `/etc/postgresql/13/main/postgresql.conf` on the primary server:

```
listen_addresses = '*'
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
```

Edit `/etc/postgresql/13/main/pg_hba.conf` to allow replication:

```
host replication replica_user all md5
```

### 2. Replica Server Configuration

On the replica server, create a base backup:

```bash
pg_basebackup -h primary_server_ip -D /var/lib/postgresql/13/main -U replica_user -P -v
```

Create a `recovery.conf` file:

```
standby_mode = 'on'
primary_conninfo = 'host=primary_server_ip port=5432 user=replica_user password=your_password'
trigger_file = '/tmp/postgresql.trigger'
```

### 3. Automated Failover

For automated failover, consider using `repmgr` or `Patroni`.

## Backup and Recovery

Use the provided scripts for database backup and recovery:

```bash
# Regular backups (set up as a cron job)
0 2 * * * /path/to/db-backup.sh

# Restore from backup if needed
./db-restore.sh /path/to/backup_file.sql
```

## Scaling Considerations

### Vertical Scaling

- Increase CPU/memory on the server as needed
- Monitor resource usage using the health monitoring script

### Horizontal Scaling

- Add more application instances by modifying NUM_INSTANCES in multi-instance-setup.sh
- Update the Nginx load balancer configuration to include the new instances
- Consider deploying across multiple servers for geographic redundancy

### CDN Integration

For static assets, consider integrating a CDN like Cloudflare:

1. Sign up for Cloudflare and add your domain
2. Set up page rules for caching static assets
3. Update the production DNS to use Cloudflare nameservers

## Troubleshooting

### Service Startup Issues

Check service status and logs:

```bash
sudo systemctl status aetherion-0.service
sudo journalctl -u aetherion-0.service
```

### Load Balancer Issues

Check Nginx error logs:

```bash
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues

Verify PostgreSQL is running and accessible:

```bash
sudo systemctl status postgresql
psql -U postgres -c "SELECT 1;"
```