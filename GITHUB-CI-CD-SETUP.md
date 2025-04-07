# GitHub CI/CD Pipeline Setup for Aetherion Wallet

This guide walks you through setting up a comprehensive CI/CD pipeline for the Aetherion Wallet using GitHub Actions.

## Step 1: Create GitHub Actions Workflow File

Create a new file in your repository at the following path:
```
.github/workflows/deploy.yml
```

Copy and paste the following content into the file:

```yaml
name: Aetherion Wallet Deployment

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment Environment'
        required: true
        default: 'production'
        type: choice
        options:
          - staging
          - production

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

  build:
    name: Build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Prepare deployment package
        run: |
          tar -czf aetherion-deploy.tar.gz dist server-redirect.js package.json

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: aetherion-artifacts
          path: aetherion-deploy.tar.gz

  deploy:
    name: Deploy
    needs: build
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment:
      name: ${{ github.event.inputs.environment || 'production' }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: aetherion-artifacts

      - name: Setup SSH key
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add SSH host key
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -p ${{ secrets.DEPLOY_SSH_PORT || 22 }} ${{ secrets.DEPLOY_SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Create backup timestamp
        id: backup-timestamp
        run: echo "timestamp=$(date +%Y%m%d%H%M%S)" >> $GITHUB_OUTPUT

      - name: Backup existing deployment
        run: |
          ssh -p ${{ secrets.DEPLOY_SSH_PORT || 22 }} ${{ secrets.DEPLOY_SSH_USER }}@${{ secrets.DEPLOY_SSH_HOST }} "
            if [ -d ~/aetherion ]; then
              echo 'Backing up existing deployment...'
              mkdir -p ~/aetherion_backups
              BACKUP_DIR=~/aetherion_backups/aetherion_backup_${{ steps.backup-timestamp.outputs.timestamp }}
              cp -r ~/aetherion \$BACKUP_DIR
              echo 'Backup completed: \$BACKUP_DIR'
            else
              echo 'No existing deployment found. Creating directory...'
              mkdir -p ~/aetherion
            fi
          "

      - name: Upload package to server
        run: |
          scp -P ${{ secrets.DEPLOY_SSH_PORT || 22 }} aetherion-deploy.tar.gz ${{ secrets.DEPLOY_SSH_USER }}@${{ secrets.DEPLOY_SSH_HOST }}:~/

      - name: Deploy on server
        id: deploy
        run: |
          ssh -p ${{ secrets.DEPLOY_SSH_PORT || 22 }} ${{ secrets.DEPLOY_SSH_USER }}@${{ secrets.DEPLOY_SSH_HOST }} "
            echo 'Starting deployment on server...'
            
            # Extract deployment package
            mkdir -p ~/aetherion
            tar -xzf ~/aetherion-deploy.tar.gz -C ~/aetherion
            
            # Install dependencies
            cd ~/aetherion && npm install --production
            
            # Setup systemd service if it doesn't exist
            if [ ! -f /etc/systemd/system/aetherion.service ]; then
              echo 'Creating systemd service...'
              echo '[Unit]
          Description=Aetherion Wallet Server
          After=network.target
          
          [Service]
          Type=simple
          User=${{ secrets.DEPLOY_SSH_USER }}
          WorkingDirectory=/home/${{ secrets.DEPLOY_SSH_USER }}/aetherion
          ExecStart=/usr/bin/node /home/${{ secrets.DEPLOY_SSH_USER }}/aetherion/server-redirect.js
          Restart=on-failure
          Environment=PORT=3000
          Environment=NODE_ENV=production
          
          [Install]
          WantedBy=multi-user.target' | sudo tee /etc/systemd/system/aetherion.service
          
              sudo systemctl daemon-reload
              sudo systemctl enable aetherion.service
            fi
            
            # Restart the service
            sudo systemctl restart aetherion.service
            
            # Check service status
            echo 'Service status:'
            sudo systemctl status aetherion.service --no-pager
            
            # Wait for the service to start
            sleep 5
            
            # Check if service is running
            if sudo systemctl is-active --quiet aetherion.service; then
              echo 'Deployment successful: Service is running.'
              # Cleanup
              rm ~/aetherion-deploy.tar.gz
              exit 0
            else
              echo 'Deployment failed: Service is not running.'
              exit 1
            fi
          "

      - name: Rollback on failure
        if: failure() && steps.deploy.outcome == 'failure'
        run: |
          ssh -p ${{ secrets.DEPLOY_SSH_PORT || 22 }} ${{ secrets.DEPLOY_SSH_USER }}@${{ secrets.DEPLOY_SSH_HOST }} "
            echo 'Deployment failed. Rolling back to previous version...'
            
            # Check if backup exists
            BACKUP_DIR=~/aetherion_backups/aetherion_backup_${{ steps.backup-timestamp.outputs.timestamp }}
            if [ -d \$BACKUP_DIR ]; then
              # Remove failed deployment
              rm -rf ~/aetherion
              
              # Restore from backup
              cp -r \$BACKUP_DIR ~/aetherion
              
              # Restart service
              sudo systemctl restart aetherion.service
              
              echo 'Rollback completed successfully!'
            else
              echo 'No backup found for rollback!'
            fi
          "

      - name: Verify deployment
        if: success() && steps.deploy.outcome == 'success'
        run: |
          echo "Waiting for application to start up completely..."
          sleep 10
          
          # Check HTTP status code of the deployed app
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.DEPLOY_SSH_HOST }}:3000)
          
          if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 302 ]; then
            echo "Verification successful! Application is responding with HTTP status: $HTTP_STATUS"
          else
            echo "Warning: Application returned unexpected HTTP status: $HTTP_STATUS"
            # We don't fail the workflow here, just warn
          fi

      - name: Notify Slack on success
        if: success() && steps.deploy.outcome == 'success'
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: good
          SLACK_MESSAGE: ':rocket: Aetherion Wallet successfully deployed to ${{ github.event.inputs.environment || 'production' }}!'
          SLACK_TITLE: Deployment Success
          SLACK_FOOTER: 'GitHub Actions'

      - name: Notify Slack on failure
        if: failure()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: danger
          SLACK_MESSAGE: ':x: Aetherion Wallet deployment to ${{ github.event.inputs.environment || 'production' }} failed! Check GitHub Actions logs for details.'
          SLACK_TITLE: Deployment Failure
          SLACK_FOOTER: 'GitHub Actions'
```

## Step 2: Setting Up GitHub Secrets

To secure your deployment process, set up the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Click on `Settings > Secrets and variables > Actions > New secret`
3. Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `DEPLOY_SSH_USER` | Your SSH username for atc.aifreedomtrust.com |
| `DEPLOY_SSH_HOST` | The host address (atc.aifreedomtrust.com) |
| `DEPLOY_SSH_PORT` | The SSH port (usually 22 unless configured otherwise) |
| `SSH_PRIVATE_KEY` | The private SSH key used to connect to the server |
| `SLACK_WEBHOOK_URL` | Webhook URL for Slack notifications (optional) |

## Step 3: Features of this CI/CD Pipeline

### Automated Testing
The pipeline runs all tests before building and deploying, ensuring code quality:
```yaml
- name: Run tests
  run: npm test
```

### Artifact Management
It builds and packages the application, storing artifacts for deployment:
```yaml
- name: Prepare deployment package
  run: |
    tar -czf aetherion-deploy.tar.gz dist server-redirect.js package.json
```

### Backup and Rollback
The pipeline automatically backs up existing deployments and includes rollback mechanisms:
```yaml
- name: Backup existing deployment
  # (code for backup)

- name: Rollback on failure
  if: failure() && steps.deploy.outcome == 'failure'
  # (code for rollback)
```

### Deployment Verification
It verifies that the deployment was successful:
```yaml
- name: Verify deployment
  if: success() && steps.deploy.outcome == 'success'
  # (code for verification)
```

### Slack Notifications
It sends notifications to Slack for both successful and failed deployments:
```yaml
- name: Notify Slack on success
  # (notification configuration)

- name: Notify Slack on failure
  # (notification configuration)
```

## Step 4: Testing the CI/CD Pipeline

To test the CI/CD pipeline:

1. Push changes to the main branch or create a pull request
2. Monitor progress on the Actions tab in your repository
3. Check the deployment on atc.aifreedomtrust.com/dapp and atc.aifreedomtrust.com/wallet

## Step 5: Additional Customizations

### Environment Variables
You can add environment variables to the systemd service by modifying the service creation section:
```yaml
Environment=PORT=3000
Environment=NODE_ENV=production
# Add more environment variables here
```

### Custom Deployment Strategies
You can customize the deployment process by modifying the deploy job. For example, you could:
- Add more deployment environments (staging, development, etc.)
- Implement canary deployments
- Add database migration steps

### Security Enhancements
Consider enhancing security with:
- Code scanning with GitHub Security features
- Dependency vulnerability scanning
- Secret scanning for accidental secret exposure

## Troubleshooting

### SSH Connection Issues
If the deployment fails due to SSH connection issues:
1. Verify that the SSH key has correct permissions on the server
2. Check that the SSH port is correctly configured
3. Ensure the server is accessible from GitHub's IP ranges

### Build Failures
If the build process fails:
1. Check the build logs in GitHub Actions
2. Verify that all dependencies are correctly installed
3. Ensure that the build script in package.json is correct

### Deployment Failures
If the deployment itself fails:
1. Check the systemd service logs on the server: `sudo journalctl -u aetherion`
2. Verify that the server has sufficient disk space and memory
3. Ensure that all required environment variables are set correctly