# Frontend Repository Synchronization

This directory contains scripts to synchronize the frontend code between the Aether_Coin_biozonecurrency repository (source) and the biozone-harmony-boost repository (target).

## Overview

The synchronization system ensures that both repositories share the same frontend code, components, and connect to the same dataset. This approach maintains consistency between the developer portal and the public-facing portal.

## Files

- `sync-frontend-repos.sh`: The main synchronization script
- `frontend-sync.service`: Systemd service file
- `frontend-sync.timer`: Systemd timer file for scheduling
- `install-sync-service.sh`: Installation script for the synchronization service
- `FRONTEND-SYNC-README.md`: This documentation file

## Installation

1. Edit the configuration variables in `install-sync-service.sh`:
   - `SOURCE_REPO`: Path to the Aether_Coin_biozonecurrency repository
   - `TARGET_REPO`: Path to the biozone-harmony-boost repository
   - `SERVICE_USER`: Username to run the service as
   - `SERVICE_GROUP`: Group to run the service as
   - `SLACK_WEBHOOK_URL`: (Optional) Webhook URL for Slack notifications

2. Run the installation script as root:
   ```bash
   sudo bash install-sync-service.sh
   ```

3. The script will prompt you to confirm or modify the configuration.

4. After installation, the synchronization service will run every hour.

## Manual Synchronization

You can manually trigger the synchronization process with:

```bash
sudo systemctl start frontend-sync.service
```

Or run the script directly:

```bash
bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-frontend-repos.sh
```

Add the `--force` flag to skip the confirmation prompt:

```bash
bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-frontend-repos.sh --force
```

## Monitoring

### View Service Status

```bash
systemctl status frontend-sync.service
systemctl status frontend-sync.timer
```

### View Logs

```bash
# View systemd logs
journalctl -u frontend-sync.service

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

## Troubleshooting

### Service Won't Start

Check the logs for errors:

```bash
journalctl -u frontend-sync.service
```

Verify the paths in the service file:

```bash
cat /etc/systemd/system/frontend-sync.service
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

You can customize the synchronization by editing the `sync-frontend-repos.sh` script:

- Add or remove directories in the `SYNC_DIRS` array
- Add or remove files in the `SYNC_FILES` array
- Modify the synchronization frequency by editing the `frontend-sync.timer` file