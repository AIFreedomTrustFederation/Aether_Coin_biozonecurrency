# Frontend Synchronization and cPanel Deployment

This directory contains scripts to synchronize the frontend code between the Aether_Coin_biozonecurrency repository (source) and the biozone-harmony-boost repository (target), and optionally deploy to cPanel using the existing `deploy-to-cpanel.sh` script.

## Overview

The synchronization and deployment system ensures that:
1. Both repositories share the same frontend code and components
2. The public-facing website is automatically updated with the latest frontend code
3. The deployment to cPanel can be automated as part of the synchronization process

## Files

- `sync-and-deploy.sh`: The main synchronization and deployment script
- `frontend-sync-deploy.service`: Systemd service file
- `frontend-sync-deploy.timer`: Systemd timer file for scheduling
- `install-sync-deploy-service.sh`: Installation script for the service
- `SYNC-DEPLOY-README.md`: This documentation file

## Installation

### Server-Based Installation

1. Edit the configuration variables in `install-sync-deploy-service.sh`:
   - `SOURCE_REPO`: Path to the Aether_Coin_biozonecurrency repository
   - `TARGET_REPO`: Path to the biozone-harmony-boost repository
   - `SERVICE_USER`: Username to run the service as
   - `SERVICE_GROUP`: Group to run the service as
   - `SLACK_WEBHOOK_URL`: (Optional) Webhook URL for Slack notifications
   - `CPANEL_USERNAME`: Your cPanel username
   - `CPANEL_PASSWORD`: Your cPanel password
   - `CPANEL_HOST`: Your cPanel host
   - `CPANEL_DOMAIN`: Your cPanel domain

2. Run the installation script as root:
   ```bash
   sudo bash install-sync-deploy-service.sh
   ```

3. The script will prompt you to confirm or modify the configuration.

4. After installation, the synchronization and deployment service will run daily at midnight.

### GitHub Actions Setup

To use the GitHub Actions workflow for automated synchronization and deployment:

1. Add the following secrets to your GitHub repository:
   - `FRONTEND_SYNC_TOKEN`: A GitHub personal access token with repo permissions
   - `CPANEL_USERNAME`: Your cPanel username
   - `CPANEL_PASSWORD`: Your cPanel password
   - `CPANEL_HOST`: Your cPanel host
   - `CPANEL_PORT`: Your cPanel port (usually 21 for FTP)
   - `CPANEL_DOMAIN`: Your cPanel domain
   - `CPANEL_PATH`: The path on your cPanel server where files should be deployed
   - `SLACK_WEBHOOK`: (Optional) Webhook URL for Slack notifications

2. The workflow will automatically run when changes are pushed to the frontend code in the source repository.

3. You can also manually trigger the workflow from the GitHub Actions tab.

## Manual Synchronization and Deployment

You can manually trigger the synchronization and deployment process with:

```bash
sudo systemctl start frontend-sync-deploy.service
```

Or run the script directly:

```bash
bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-and-deploy.sh
```

To synchronize without deploying:

```bash
bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-and-deploy.sh
```

To synchronize and deploy:

```bash
bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-and-deploy.sh --deploy
```

## Monitoring

### View Service Status

```bash
systemctl status frontend-sync-deploy.service
systemctl status frontend-sync-deploy.timer
```

### View Logs

```bash
# View systemd logs
journalctl -u frontend-sync-deploy.service

# View script logs
cat /var/log/frontend-sync.log
```

## What Gets Synchronized

The following directories and files are synchronized:

### Directories
- `client`: React components, pages, services
- `public`: Static assets

### Files
- `package.json`: Dependencies and scripts (name and repository fields are updated)
- `package-lock.json`: Dependency lock file
- `tsconfig.json`: TypeScript configuration
- `server-redirect.js`: Server configuration
- `.env.example`: Environment variables example
- `vite.config.ts`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration

## Special Handling

- **package.json**: The name and repository fields are updated to reflect the target repository.
- **.env file**: The script doesn't overwrite the existing .env file but adds any new variables from .env.example.
- **Backups**: Before synchronization, a backup of the target repository is created.
- **cPanel Deployment**: The script uses the existing `deploy-to-cpanel.sh` script in the target repository.

## Integration with deploy-to-cpanel.sh

The synchronization script integrates with your existing `deploy-to-cpanel.sh` script by:

1. First synchronizing the frontend code from source to target repository
2. Then running the `deploy-to-cpanel.sh` script in the target repository
3. Passing necessary environment variables to the deployment script

This ensures that the latest frontend code is deployed to your cPanel hosting environment.

## Troubleshooting

### Service Won't Start

Check the logs for errors:

```bash
journalctl -u frontend-sync-deploy.service
```

Verify the paths in the service file:

```bash
cat /etc/systemd/system/frontend-sync-deploy.service
```

### Synchronization Fails

Check the log file for detailed error messages:

```bash
cat /var/log/frontend-sync.log
```

Common issues:
- Incorrect repository paths
- Permission problems
- Missing directories

### Deployment Fails

Check if the `deploy-to-cpanel.sh` script exists in the target repository:

```bash
ls -la /path/to/biozone-harmony-boost/deploy-to-cpanel.sh
```

Make sure it's executable:

```bash
chmod +x /path/to/biozone-harmony-boost/deploy-to-cpanel.sh
```

Check for any errors in the deployment script:

```bash
bash -x /path/to/biozone-harmony-boost/deploy-to-cpanel.sh
```

### Restoring from Backup

If something goes wrong, you can restore from the backup:

```bash
# Find the latest backup
ls -la /path/to/biozone-harmony-boost_backup_*

# Restore from backup
rm -rf /path/to/biozone-harmony-boost
cp -r /path/to/biozone-harmony-boost_backup_TIMESTAMP /path/to/biozone-harmony-boost
```

## Customization

You can customize the synchronization by editing the `sync-and-deploy.sh` script:

- Add or remove directories in the `SYNC_DIRS` array
- Add or remove files in the `SYNC_FILES` array
- Modify the synchronization frequency by editing the `frontend-sync-deploy.timer` file

## Security Considerations

- The service file contains sensitive information like cPanel credentials. Make sure it's only readable by root.
- Consider using a dedicated GitHub Actions secret for the deployment token with limited permissions.
- Regularly rotate your cPanel password and update the service configuration.
- Use HTTPS for all connections to cPanel.