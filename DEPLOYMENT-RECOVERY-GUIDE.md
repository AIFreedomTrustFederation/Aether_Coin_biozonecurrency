# Aetherion Wallet Deployment Recovery Guide

This guide provides instructions for recovering from various deployment failures. Use these procedures to restore the application to a working state after deployment issues.

## Table of Contents

1. [Database Recovery](#database-recovery)
2. [Application Rollback](#application-rollback)
3. [Server Configuration Recovery](#server-configuration-recovery)
4. [Common Issues and Solutions](#common-issues-and-solutions)

## Database Recovery

### Restoring from a Backup

If a database migration fails or causes data corruption, restore from a backup:

```bash
# List available backups
ls -la ./database_backups/

# Restore from a specific backup file
./db-restore.sh ./database_backups/aetherion_20250401_120000.sql
```

### Recovering from Failed Migrations

If a Drizzle migration fails:

1. Check error messages in the console output
2. Restore from the pre-migration backup that was automatically created
3. Fix the issue in your schema definition
4. Run the migration again with `./db-migrate.sh`

## Application Rollback

### GitHub Actions Deployment Rollback

If a deployment through GitHub Actions fails, the workflow will automatically attempt to roll back to the previous version. You can also manually trigger a rollback:

1. Go to GitHub repository and check Actions tab
2. Find the failed deployment workflow run
3. The rollback step should have been automatically executed
4. If rollback failed, you can manually restore from backups

### Manual Server Rollback

To manually roll back on the server:

```bash
# SSH to the server
ssh user@server

# Go to backups directory
cd ~/aetherion_backups

# List available backups
ls -la

# Stop the Aetherion service
sudo systemctl stop aetherion.service

# Remove failed deployment
rm -rf ~/aetherion

# Copy backup to deployment directory
cp -r ~/aetherion_backups/aetherion_backup_20250401120000 ~/aetherion

# Start the service
sudo systemctl start aetherion.service

# Check service status
sudo systemctl status aetherion.service
```

## Server Configuration Recovery

### Nginx Configuration

If Nginx configuration becomes corrupted:

```bash
# Verify Nginx configuration
sudo nginx -t

# If invalid, restore from default configuration
sudo cp /etc/nginx/sites-available/aetherion-dapp.conf.backup /etc/nginx/sites-available/aetherion-dapp.conf

# Reload Nginx
sudo systemctl reload nginx
```

### Systemd Service Recovery

If the systemd service fails:

```bash
# Check service logs
sudo journalctl -u aetherion.service -n 100

# Recreate the service file if needed
sudo tee /etc/systemd/system/aetherion.service > /dev/null << 'EOL'
[Unit]
Description=Aetherion Wallet Server
After=network.target

[Service]
Type=simple
User=username
WorkingDirectory=/home/username/aetherion
ExecStart=/usr/bin/node /home/username/aetherion/server-redirect.js
Restart=on-failure
Environment=PORT=3000
Environment=NODE_ENV=production
Environment=DEPLOY_TARGET=dapp
Environment=BASE_URL=https://atc.aifreedomtrust.com

[Install]
WantedBy=multi-user.target
EOL

# Reload daemon and restart
sudo systemctl daemon-reload
sudo systemctl restart aetherion.service
```

## Common Issues and Solutions

### Database Connection Issues

If the application fails to connect to the database:

1. Verify environment variables:
   ```bash
   # Check DATABASE_URL environment variable in .env file
   grep DATABASE_URL .env
   ```

2. Check database connectivity:
   ```bash
   # Test connection to database
   pg_isready -h database_host -p 5432
   ```

3. Restart the application:
   ```bash
   sudo systemctl restart aetherion.service
   ```

### Blank Screen After Deployment

If the application shows a blank screen after deployment:

1. Check server logs:
   ```bash
   sudo journalctl -u aetherion.service -n 100
   ```

2. Verify built assets:
   ```bash
   ls -la ~/aetherion/dist
   ```

3. Check for JavaScript console errors in the browser

### API Errors

If API endpoints return errors:

1. Check server logs for API-specific errors
2. Verify that environment variables are correctly set
3. Check database connection status

### Static Assets Not Loading

If static assets (images, CSS, JavaScript) aren't loading:

1. Check Nginx configuration for correct asset paths
2. Verify that assets were properly included in the deployment package
3. Check browser console for specific 404 errors

## Emergency Contacts

In case of critical deployment failures:

- DevOps Team: devops@aifreedomtrust.com
- Database Administrator: dba@aifreedomtrust.com
- Project Lead: lead@aifreedomtrust.com

## Deployment Notifications

Check deployment status notifications in:

- Slack channel: #aetherion-deployments
- Matrix room: #aetherion-deployments:aifreedomtrust.org