# Aetherion Wallet Deployment Recovery Guide

This guide provides comprehensive instructions for recovering the Aetherion Wallet deployment in case of failures or issues.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Common Failure Scenarios](#common-failure-scenarios)
3. [Database Recovery](#database-recovery)
4. [Application Recovery](#application-recovery)
5. [Load Balancer Recovery](#load-balancer-recovery)
6. [Complete System Recovery](#complete-system-recovery)
7. [Preventive Measures](#preventive-measures)

## Quick Reference

### Service Status Check

```bash
# Check all instance statuses
for i in {0..2}; do sudo systemctl status aetherion-$i.service; done

# Check monitoring dashboard
sudo systemctl status aetherion-monitoring.service

# Check health check service
sudo systemctl status aetherion-health-check.timer
```

### Quick Restart

```bash
# Restart all instances
for i in {0..2}; do sudo systemctl restart aetherion-$i.service; done

# Restart Nginx
sudo systemctl restart nginx
```

### Log Check

```bash
# Check application logs
for i in {0..2}; do sudo journalctl -u aetherion-$i.service -n 100; done

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check health monitor logs
sudo tail -f /var/log/aetherion/health-monitor.log
```

## Common Failure Scenarios

### 1. Application Instance Down

**Symptoms:**
- 503 Service Unavailable errors
- Slow response times
- Intermittent failures

**Recovery Steps:**

1. Check which instances are down:
   ```bash
   for i in {0..2}; do sudo systemctl is-active aetherion-$i.service; done
   ```

2. Check logs for the failed instance(s):
   ```bash
   sudo journalctl -u aetherion-1.service -n 100
   ```

3. Restart the failed instance(s):
   ```bash
   sudo systemctl restart aetherion-1.service
   ```

4. Verify the instance is running:
   ```bash
   curl http://localhost:3001/health
   ```

### 2. Database Connection Issues

**Symptoms:**
- Error messages containing "database" or "connection"
- All instances showing the same error

**Recovery Steps:**

1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify database connection:
   ```bash
   PGPASSWORD=yourpassword psql -h hostname -U username -d database -c "SELECT 1;"
   ```

3. Check connection string in environment files:
   ```bash
   for i in {0..2}; do grep -h "DATABASE_URL" /home/deploy/aetherion-$i/.env; done
   ```

4. Restart PostgreSQL if needed:
   ```bash
   sudo systemctl restart postgresql
   ```

5. Restart application instances:
   ```bash
   for i in {0..2}; do sudo systemctl restart aetherion-$i.service; done
   ```

### 3. Nginx/Load Balancer Issues

**Symptoms:**
- 502 Bad Gateway errors
- Unable to access the application at all

**Recovery Steps:**

1. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

2. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## Database Recovery

### Restore from Backup

1. Identify the backup file to restore:
   ```bash
   ls -la /home/deploy/aetherion/backups/
   ```

2. Stop all application instances:
   ```bash
   for i in {0..2}; do sudo systemctl stop aetherion-$i.service; done
   ```

3. Restore the database:
   ```bash
   ./db-restore.sh /home/deploy/aetherion/backups/backup-YYYY-MM-DD.sql
   ```

4. Start all application instances:
   ```bash
   for i in {0..2}; do sudo systemctl start aetherion-$i.service; done
   ```

### Recover from Database Corruption

1. Stop all application instances:
   ```bash
   for i in {0..2}; do sudo systemctl stop aetherion-$i.service; done
   ```

2. Run database recovery:
   ```bash
   sudo -u postgres pg_resetxlog /var/lib/postgresql/13/main
   sudo systemctl restart postgresql
   ```

3. If corruption persists, restore from backup:
   ```bash
   ./db-restore.sh /home/deploy/aetherion/backups/backup-YYYY-MM-DD.sql
   ```

4. Start all application instances:
   ```bash
   for i in {0..2}; do sudo systemctl start aetherion-$i.service; done
   ```

## Application Recovery

### Rebuild Application

If the application code is corrupted or has issues:

1. Stop all application instances:
   ```bash
   for i in {0..2}; do sudo systemctl stop aetherion-$i.service; done
   ```

2. Update the repository:
   ```bash
   cd /home/deploy/aetherion
   git fetch
   git checkout main
   git pull
   ```

3. Rebuild the application:
   ```bash
   npm ci --production
   npm run build
   ```

4. Redeploy to all instances:
   ```bash
   for i in {0..2}; do
     cp -r /home/deploy/aetherion/dist /home/deploy/aetherion-$i/
     cp -r /home/deploy/aetherion/server-redirect.js /home/deploy/aetherion-$i/
   done
   ```

5. Start all application instances:
   ```bash
   for i in {0..2}; do sudo systemctl start aetherion-$i.service; done
   ```

### Recover from Disk Space Issues

1. Check disk space:
   ```bash
   df -h
   ```

2. Clear log files:
   ```bash
   sudo find /var/log -type f -name "*.log" -exec truncate -s 0 {} \;
   ```

3. Clear old backups:
   ```bash
   find /home/deploy/aetherion/backups -type f -name "backup-*.sql" -mtime +30 -delete
   ```

4. Clear Nginx cache:
   ```bash
   sudo rm -rf /var/cache/nginx/aetherion_cache/*
   ```

## Load Balancer Recovery

### Reconfigure Nginx

If load balancer configuration is corrupted:

1. Restore the Nginx configuration:
   ```bash
   sudo cp /home/deploy/aetherion/deployment-configs/nginx-load-balancer.conf /etc/nginx/sites-available/aetherion-load-balancer.conf
   ```

2. Verify the configuration:
   ```bash
   sudo nginx -t
   ```

3. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### SSL Certificate Renewal

If SSL certificates expire:

1. Renew Let's Encrypt certificates:
   ```bash
   sudo certbot renew
   ```

2. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## Complete System Recovery

In case of catastrophic failure requiring a complete redeployment:

1. Prepare a new server with Ubuntu 20.04 LTS

2. Copy and restore database backup to the new server

3. Install required dependencies:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx git npm nodejs
   ```

4. Run the automated setup script:
   ```bash
   sudo ./deployment-configs/automated-ha-setup.sh
   ```

## Preventive Measures

To minimize the risk of deployment failures:

1. **Regular Backups**: Ensure daily database backups are running:
   ```bash
   sudo systemctl status aetherion-db-backup.timer
   ```

2. **Regular Health Checks**: Ensure health monitoring is active:
   ```bash
   sudo systemctl status aetherion-health-check.timer
   ```

3. **Monitor Disk Space**: Set up alerts for low disk space:
   ```bash
   echo "df -h | grep -vE '^Filesystem|tmpfs|cdrom|loop' | awk '{ print \$5 \" \" \$1 }' | while read output; do used=\$(echo \$output | awk '{ print \$1 }' | sed 's/%//g'); partition=\$(echo \$output | awk '{ print \$2 }'); if [ \$used -ge 90 ]; then echo \"Running out of space on \$partition (\$used%)\"; fi; done" > /etc/cron.daily/disk-space-check
   chmod +x /etc/cron.daily/disk-space-check
   ```

4. **Keep Software Updated**: Regularly update system packages:
   ```bash
   echo "apt update && apt upgrade -y" > /etc/cron.weekly/system-update
   chmod +x /etc/cron.weekly/system-update
   ```

5. **Monitor SSL Certificate Expiry**: Check certificate expiration:
   ```bash
   echo "certbot certificates | grep 'Expiry Date' | grep -q 'INVALID\|EXPIRED' && echo 'SSL certificate is expired or expiring soon!' || echo 'SSL certificate is valid.'" > /etc/cron.weekly/check-ssl
   chmod +x /etc/cron.weekly/check-ssl
   ```