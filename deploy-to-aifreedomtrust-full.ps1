# =========================================================================
# Aetherion Comprehensive Deployment Script (PowerShell Version)
# =========================================================================
# This script automates the complete deployment process of Aetherion Wallet
# to both IPFS/Filecoin and traditional hosting at www.atc.aifreedomtrust.com
#
# Author: AI Assistant
# =========================================================================

# Text formatting for PowerShell
function Write-ColorOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $true)]
        [string]$Level
    )
    
    $color = "White"
    
    switch ($Level) {
        "INFO" { $color = "Cyan" }
        "SUCCESS" { $color = "Green" }
        "WARNING" { $color = "Yellow" }
        "ERROR" { $color = "Red" }
        "STEP" { $color = "Blue" }
    }
    
    Write-Host "[$([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))] [$Level] $Message" -ForegroundColor $color
    Add-Content -Path $LogFile -Value "[$([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))] [$Level] $Message"
}

function Write-Section {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title
    )
    
    Write-ColorOutput "=================================================================" "STEP"
    Write-ColorOutput "  $Title" "STEP"
    Write-ColorOutput "=================================================================" "STEP"
}

function Test-CommandExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )
    
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

function Test-EnvVarExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$VarName
    )
    
    if (Test-Path $EnvFile) {
        $content = Get-Content $EnvFile -Raw
        return $content -match "^$VarName="
    }
    return $false
}

function Write-DeploymentError {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [int]$ExitCode = 1
    )
    
    Write-ColorOutput $Message "ERROR"
    Write-ColorOutput "Deployment failed. Check $LogFile for details." "ERROR"
    exit $ExitCode
}

# Configuration
$LogFile = "aetherion-deployment-$([DateTime]::Now.ToString('yyyyMMdd-HHmmss')).log"
$EnvFile = ".env"
$RequiredTools = @("node", "npm", "curl")
$RequiredEnvVars = @("WEB3_STORAGE_TOKEN")
$OptionalEnvVars = @("FRACTALCOIN_API_KEY", "FRACTALCOIN_API_ENDPOINT", "SETUP_FILECOIN_INTEGRATION", "ENS_PRIVATE_KEY", "ENS_DOMAIN")

# Create log directory if it doesn't exist
if (-not (Test-Path "deployment-logs")) {
    New-Item -Path "deployment-logs" -ItemType Directory | Out-Null
}

# Set log file path
$LogFile = Join-Path "deployment-logs" $LogFile

# Function to check prerequisites
function Test-Prerequisites {
    Write-Section "Checking Prerequisites"
    
    # Check for required tools
    foreach ($tool in $RequiredTools) {
        if (Test-CommandExists $tool) {
            Write-ColorOutput "✓ $tool is installed" "INFO"
        } else {
            Write-DeploymentError "✗ $tool is not installed. Please install it and try again."
        }
    }
    
    # Check Node.js version
    $nodeVersion = (node -v).Substring(1)
    Write-ColorOutput "Node.js version: $nodeVersion" "INFO"
    
    # Check if .env file exists
    if (Test-Path $EnvFile) {
        Write-ColorOutput "✓ $EnvFile file found" "INFO"
    } else {
        Write-ColorOutput "✗ $EnvFile file not found. Creating from example..." "WARNING"
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" -Destination $EnvFile
            Write-ColorOutput "Created $EnvFile from .env.example. Please edit it with your credentials." "INFO"
        } else {
            Write-DeploymentError "No .env.example file found. Please create a $EnvFile file manually."
        }
    }
    
    # Check for required environment variables
    foreach ($var in $RequiredEnvVars) {
        if (Test-EnvVarExists $var) {
            Write-ColorOutput "✓ $var is set" "INFO"
        } else {
            $value = Read-Host "Enter your $var"
            if ([string]::IsNullOrWhiteSpace($value)) {
                Write-DeploymentError "✗ Required environment variable $var is not provided"
            }
            
            # Append to .env file
            Add-Content -Path $EnvFile -Value "`n$var=$value"
            Write-ColorOutput "✓ Added $var to $EnvFile file" "INFO"
        }
    }
    
    # Check for optional environment variables
    foreach ($var in $OptionalEnvVars) {
        if (Test-EnvVarExists $var) {
            Write-ColorOutput "✓ $var is set" "INFO"
        } else {
            Write-ColorOutput "✗ Optional environment variable $var is not set in $EnvFile" "WARNING"
            
            if ($var -eq "SETUP_FILECOIN_INTEGRATION") {
                $setupFilecoin = Read-Host "Do you want to set up Filecoin integration? (y/n)"
                if ($setupFilecoin.ToLower() -eq "y") {
                    Add-Content -Path $EnvFile -Value "`nSETUP_FILECOIN_INTEGRATION=true"
                    
                    # If setting up Filecoin, we need the API key
                    if (-not (Test-EnvVarExists "FRACTALCOIN_API_KEY")) {
                        $apiKey = Read-Host "Enter your FRACTALCOIN_API_KEY"
                        if (-not [string]::IsNullOrWhiteSpace($apiKey)) {
                            Add-Content -Path $EnvFile -Value "`nFRACTALCOIN_API_KEY=$apiKey"
                        }
                    }
                    
                    # And the API endpoint if not set
                    if (-not (Test-EnvVarExists "FRACTALCOIN_API_ENDPOINT")) {
                        Add-Content -Path $EnvFile -Value "`nFRACTALCOIN_API_ENDPOINT=https://api.fractalcoin.network/v1"
                    }
                    
                    # Set allocation size
                    Add-Content -Path $EnvFile -Value "`nFRACTALCOIN_FILECOIN_ALLOCATION=20"
                } else {
                    Add-Content -Path $EnvFile -Value "`nSETUP_FILECOIN_INTEGRATION=false"
                }
            }
        }
    }
    
    Write-ColorOutput "All prerequisites checked" "SUCCESS"
}

# Function to collect deployment credentials
function Get-DeploymentCredentials {
    Write-Section "Collecting Deployment Credentials"
    
    $credentials = @{}
    $credentials.SSH_USER = Read-Host "Enter your SSH Username"
    $credentials.SSH_HOST = Read-Host "Enter your SSH Host (default: www.atc.aifreedomtrust.com)"
    if ([string]::IsNullOrWhiteSpace($credentials.SSH_HOST)) {
        $credentials.SSH_HOST = "www.atc.aifreedomtrust.com"
    }
    $credentials.SSH_PORT = Read-Host "Enter your SSH Port (default: 22)"
    if ([string]::IsNullOrWhiteSpace($credentials.SSH_PORT)) {
        $credentials.SSH_PORT = "22"
    }
    $credentials.SLACK_WEBHOOK_URL = Read-Host -Prompt "Enter your Slack Webhook URL (optional, press enter to skip)"
    
    Write-ColorOutput "Credentials collected successfully!" "SUCCESS"
    return $credentials
}

# Function to install dependencies
function Install-Dependencies {
    Write-Section "Installing Dependencies"
    
    Write-ColorOutput "Installing npm dependencies..." "INFO"
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentError "Failed to install npm dependencies"
    }
    
    Write-ColorOutput "Installing deployment-specific dependencies..." "INFO"
    if (Test-Path "install-deployment-deps.sh") {
        # Use bash to run the script if WSL is available
        if (Test-CommandExists "bash") {
            bash install-deployment-deps.sh
            if ($LASTEXITCODE -ne 0) {
                Write-DeploymentError "Failed to install deployment dependencies"
            }
        } else {
            # Fallback to installing common deployment dependencies
            npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers
            if ($LASTEXITCODE -ne 0) {
                Write-DeploymentError "Failed to install deployment dependencies"
            }
        }
    } else {
        # Install common deployment dependencies if script doesn't exist
        npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers
        if ($LASTEXITCODE -ne 0) {
            Write-DeploymentError "Failed to install deployment dependencies"
        }
    }
    
    Write-ColorOutput "All dependencies installed successfully" "SUCCESS"
}

# Function to build the application
function Start-ApplicationBuild {
    Write-Section "Building Application"
    
    # Clean previous builds
    Write-ColorOutput "Cleaning previous builds..." "INFO"
    if (Test-Path "npm-scripts.sh" -and (Test-CommandExists "bash")) {
        bash npm-scripts.sh clean
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "Clean script failed, continuing anyway" "WARNING"
        }
    } else {
        # Manual cleanup
        if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue }
        if (Test-Path "build") { Remove-Item -Recurse -Force "build" -ErrorAction SilentlyContinue }
        if (Test-Path ".cache") { Remove-Item -Recurse -Force ".cache" -ErrorAction SilentlyContinue }
        if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue }
    }
    
    # Run TypeScript check
    Write-ColorOutput "Running TypeScript check..." "INFO"
    npm run check
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "TypeScript check failed, continuing anyway" "WARNING"
    }
    
    # Build the application
    Write-ColorOutput "Building application..." "INFO"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentError "Failed to build application"
    }
    
    # Verify build output
    if (Test-Path "dist") {
        Write-ColorOutput "Application built successfully" "SUCCESS"
        return $true
    } else {
        Write-DeploymentError "Build directory not found after build"
        return $false
    }
}

# Function to deploy to Web3.Storage
function Start-Web3StorageDeployment {
    Write-Section "Deploying to Web3.Storage (IPFS/Filecoin)"
    
    Write-ColorOutput "Uploading to Web3.Storage..." "INFO"
    
    # Use the deploy-to-web3.js script if it exists
    if (Test-Path "scripts/deploy-to-web3.js") {
        node scripts/deploy-to-web3.js
        if ($LASTEXITCODE -ne 0) {
            Write-DeploymentError "Failed to deploy to Web3.Storage"
        }
        
        Write-ColorOutput "Deployment to Web3.Storage completed" "SUCCESS"
        return $true
    } else {
        Write-ColorOutput "deploy-to-web3.js script not found" "ERROR"
        return $false
    }
}

# Function to set up FractalCoin-Filecoin bridge
function Initialize-FilecoinBridge {
    Write-Section "Setting Up FractalCoin-Filecoin Bridge"
    
    # Check if bridge setup is enabled
    $envContent = Get-Content $EnvFile -Raw
    if ($envContent -match "SETUP_FILECOIN_INTEGRATION=true") {
        Write-ColorOutput "FractalCoin-Filecoin bridge integration is enabled" "INFO"
        
        # Check for API key
        if (-not (Test-EnvVarExists "FRACTALCOIN_API_KEY")) {
            Write-ColorOutput "FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped." "WARNING"
            return $false
        }
        
        Write-ColorOutput "Setting up FractalCoin-Filecoin bridge..." "INFO"
        
        # Use the fractalcoin-filecoin-bridge.js script if it exists
        if (Test-Path "scripts/fractalcoin-filecoin-bridge.js") {
            node scripts/fractalcoin-filecoin-bridge.js
            if ($LASTEXITCODE -ne 0) {
                Write-DeploymentError "Failed to set up FractalCoin-Filecoin bridge"
            }
            
            Write-ColorOutput "FractalCoin-Filecoin bridge setup completed" "SUCCESS"
            return $true
        } else {
            Write-ColorOutput "fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped." "WARNING"
            return $false
        }
    } else {
        Write-ColorOutput "FractalCoin-Filecoin bridge integration is disabled. Skipping setup." "INFO"
        return $false
    }
}

# Function to create deployment package
function New-DeploymentPackage {
    Write-Section "Creating Deployment Package"
    
    $deployPackage = "aetherion-deploy.tar.gz"
    
    # Check if tar command is available
    if (Test-CommandExists "tar") {
        Write-ColorOutput "Creating deployment package..." "INFO"
        
        # Create tar.gz package
        tar -czf $deployPackage dist server-redirect.js package.json
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "Failed to create deployment package" "ERROR"
            return $false
        }
        
        if (Test-Path $deployPackage) {
            Write-ColorOutput "Deployment package created: $deployPackage" "SUCCESS"
            return $true
        } else {
            Write-ColorOutput "Failed to create deployment package" "ERROR"
            return $false
        }
    } else {
        Write-ColorOutput "tar command not found. Please install tar or use WSL." "ERROR"
        return $false
    }
}

# Function to deploy to traditional hosting
function Start-TraditionalDeployment {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Credentials
    )
    
    Write-Section "Deploying to Traditional Hosting"
    
    # Check if we have SSH credentials
    if ([string]::IsNullOrWhiteSpace($Credentials.SSH_USER) -or [string]::IsNullOrWhiteSpace($Credentials.SSH_HOST)) {
        Write-ColorOutput "SSH credentials not provided. Skipping traditional deployment." "WARNING"
        return $false
    }
    
    # Create deployment package
    $packageSuccess = New-DeploymentPackage
    if (-not $packageSuccess) {
        Write-ColorOutput "Failed to create deployment package. Aborting traditional deployment." "ERROR"
        return $false
    }
    
    # Upload package to server
    Write-ColorOutput "Uploading package to $($Credentials.SSH_HOST)..." "INFO"
    
    # Check if scp command is available
    if (Test-CommandExists "scp") {
        scp -P $Credentials.SSH_PORT aetherion-deploy.tar.gz "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST):~/"
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "Failed to upload package to server" "ERROR"
            return $false
        }
        
        Write-ColorOutput "Package uploaded successfully" "SUCCESS"
    } else {
        Write-ColorOutput "scp command not found. Please install OpenSSH or use WSL." "ERROR"
        return $false
    }
    
    # Deploy on server
    Write-ColorOutput "Deploying on server..." "INFO"
    
    # Check if ssh command is available
    if (Test-CommandExists "ssh") {
        $sshCmd = @"
        echo 'Starting deployment on server...'

        # Extract deployment package
        mkdir -p ~/aetherion
        tar -xzf ~/aetherion-deploy.tar.gz -C ~/aetherion

        # Install dependencies
        cd ~/aetherion; npm install --production

        # Setup systemd service if it doesn't exist
        if (-not (Test-Path /etc/systemd/system/aetherion.service)) {
          echo 'Creating systemd service...'
          echo '[Unit]
Description=Aetherion Wallet Server
After=network.target

[Service]
Type=simple
User=$($Credentials.SSH_USER)
WorkingDirectory=/home/$($Credentials.SSH_USER)/aetherion
ExecStart=/usr/bin/node /home/$($Credentials.SSH_USER)/aetherion/server-redirect.js
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

        # Cleanup
        rm ~/aetherion-deploy.tar.gz
        echo 'Deployment completed!'
"@
        
        $sshString = "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST)"
        ssh -p $Credentials.SSH_PORT $sshString $sshCmd
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "Failed to deploy on server" "ERROR"
            return $false
        }
        
        Write-ColorOutput "Deployment on server completed successfully" "SUCCESS"
        return $true
    } else {
        Write-ColorOutput "ssh command not found. Please install OpenSSH or use WSL." "ERROR"
        return $false
    }
}

# Function to extract CID from logs
function Get-CidFromLogs {
    $logContent = Get-Content $LogFile -Raw
    if ($logContent -match "CID: ([a-zA-Z0-9]+)") {
        return $matches[1]
    }
    return $null
}

# Function to display deployment summary
function Show-DeploymentSummary {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Credentials,
        
        [Parameter(Mandatory = $true)]
        [bool]$BuildSuccess,
        
        [Parameter(Mandatory = $true)]
        [bool]$Web3StorageSuccess,
        
        [Parameter(Mandatory = $true)]
        [bool]$BridgeSetupSuccess,
        
        [Parameter(Mandatory = $true)]
        [bool]$TraditionalDeploymentSuccess
    )
    
    Write-Section "Deployment Summary"
    
    # Extract CID from logs
    $cid = Get-CidFromLogs
    
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host "                  AETHERION DEPLOYMENT SUMMARY                   " -ForegroundColor Magenta
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host ""
    
    Write-Host "Build Status:" -ForegroundColor Cyan
    if ($BuildSuccess) {
        Write-Host "Status: " -NoNewline
        Write-Host "Success" -ForegroundColor Green
    } else {
        Write-Host "Status: " -NoNewline
        Write-Host "Failed" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "Traditional Web Hosting:" -ForegroundColor Cyan
    Write-Host "Domain: www.atc.aifreedomtrust.com"
    if ($TraditionalDeploymentSuccess) {
        Write-Host "URL: https://www.atc.aifreedomtrust.com"
        Write-Host "Status: " -NoNewline
        Write-Host "Active" -ForegroundColor Green
    } else {
        Write-Host "Status: " -NoNewline
        Write-Host "Not deployed or failed" -ForegroundColor Yellow
    }
    Write-Host ""
    
    Write-Host "IPFS/Filecoin Deployment:" -ForegroundColor Cyan
    if ($Web3StorageSuccess -and $cid) {
        Write-Host "Content CID: $cid"
        Write-Host "Gateway URL: https://$cid.ipfs.dweb.link/"
        Write-Host "Status: " -NoNewline
        Write-Host "Active" -ForegroundColor Green
    } else {
        Write-Host "Status: " -NoNewline
        Write-Host "Not deployed or failed" -ForegroundColor Yellow
    }
    Write-Host ""
    
    Write-Host "FractalCoin-Filecoin Bridge:" -ForegroundColor Cyan
    if ($BridgeSetupSuccess) {
        Write-Host "Status: " -NoNewline
        Write-Host "Active" -ForegroundColor Green
    } else {
        Write-Host "Status: " -NoNewline
        Write-Host "Not configured or skipped" -ForegroundColor Yellow
    }
    Write-Host ""
    
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Access your application at:"
    if ($TraditionalDeploymentSuccess) {
        Write-Host "   - Traditional hosting: https://www.atc.aifreedomtrust.com"
    }
    if ($Web3StorageSuccess -and $cid) {
        Write-Host "   - IPFS/Filecoin: https://$cid.ipfs.dweb.link/"
    }
    Write-Host "2. Monitor your application performance"
    Write-Host "3. Set up monitoring and alerts"
    Write-Host ""
    
    Write-Host "=================================================================" -ForegroundColor Magenta
}

# Function to send Slack notification
function Send-SlackNotification {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WebhookUrl,
        
        [Parameter(Mandatory = $true)]
        [string]$Message
    )
    
    if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
        return
    }
    
    try {
        Write-ColorOutput "Sending notification to Slack..." "INFO"
        
        $payload = @{
            text = $Message
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json"
        
        Write-ColorOutput "Notification sent successfully!" "SUCCESS"
    } catch {
        Write-ColorOutput "Failed to send Slack notification: $_" "ERROR"
    }
}

# Function to clean up after deployment
function Start-Cleanup {
    Write-Section "Cleaning Up"
    
    # Remove local package
    if (Test-Path "aetherion-deploy.tar.gz") {
        Remove-Item -Force "aetherion-deploy.tar.gz"
    }
    
    Write-ColorOutput "Cleanup completed" "SUCCESS"
}

# Main execution
function Main {
    # Create log file
    New-Item -Path $LogFile -ItemType File -Force | Out-Null
    
    # Display banner
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host "            AETHERION COMPREHENSIVE DEPLOYMENT SCRIPT            " -ForegroundColor Magenta
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host ""
    
    Write-ColorOutput "Starting deployment process..." "INFO"
    Write-ColorOutput "Log file: $LogFile" "INFO"
    
    try {
        # Run deployment steps
        Test-Prerequisites
        $credentials = Get-DeploymentCredentials
        Install-Dependencies
        $buildSuccess = Start-ApplicationBuild
        
        # Deploy to Web3.Storage
        $web3StorageSuccess = Start-Web3StorageDeployment
        
        # Set up FractalCoin-Filecoin bridge
        $bridgeSetupSuccess = Initialize-FilecoinBridge
        
        # Deploy to traditional hosting
        $traditionalDeploymentSuccess = Start-TraditionalDeployment -Credentials $credentials
        
        # Display deployment summary
        Show-DeploymentSummary -Credentials $credentials -BuildSuccess $buildSuccess -Web3StorageSuccess $web3StorageSuccess -BridgeSetupSuccess $bridgeSetupSuccess -TraditionalDeploymentSuccess $traditionalDeploymentSuccess
        
        # Send notification
        if (-not [string]::IsNullOrWhiteSpace($credentials.SLACK_WEBHOOK_URL)) {
            Send-SlackNotification -WebhookUrl $credentials.SLACK_WEBHOOK_URL -Message "✅ Aetherion Wallet deployment to www.atc.aifreedomtrust.com completed successfully!"
        }
        
        # Cleanup
        Start-Cleanup
        
        Write-ColorOutput "Deployment process completed successfully!" "SUCCESS"
    } catch {
        Write-ColorOutput "Deployment failed: $_" "ERROR"
        
        if ($credentials -and -not [string]::IsNullOrWhiteSpace($credentials.SLACK_WEBHOOK_URL)) {
            Send-SlackNotification -WebhookUrl $credentials.SLACK_WEBHOOK_URL -Message "❌ Aetherion Wallet deployment to www.atc.aifreedomtrust.com failed: $_"
        }
        
        exit 1
    }
}

# Execute main function
Main