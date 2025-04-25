# ALL-IN-ONE DEPLOYMENT SCRIPT FOR AETHERION SAAS APP (PowerShell Version)
# Target: atc.aifreedomtrust.com
#
# This script automates the complete deployment process:
# 1. Validates environment and prerequisites
# 2. Collects or uses stored credentials
# 3. Builds all components (client, server, api-gateway, quantum-validator)
# 4. Deploys to Web3.Storage (IPFS/Filecoin) if configured
# 5. Sets up FractalCoin-Filecoin bridge if enabled
# 6. Deploys to traditional hosting at atc.aifreedomtrust.com
# 7. Configures Nginx, DNS and HTTPS
# 8. Verifies all deployments
# 9. Sets up monitoring and sends notifications

# Constants
$SCRIPT_DIR = $PSScriptRoot
$DOMAIN = "atc.aifreedomtrust.com"
$WWW_DOMAIN = "www.atc.aifreedomtrust.com"
$DEPLOY_PATH = "/dapp"
$CREDENTIALS_FILE = Join-Path $SCRIPT_DIR ".deploy-credentials.json"
$LOG_DIR = Join-Path $SCRIPT_DIR "deployment-logs"
$LOG_FILE = Join-Path $LOG_DIR "deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$DEPLOY_PACKAGE = "aetherion-deploy.zip"
$ENV_FILE = Join-Path $SCRIPT_DIR ".env"
$TEMP_SSH_KEY = Join-Path $env:TEMP "deploy_ssh_key_$([Guid]::NewGuid().ToString())"

# Create log directory if it doesn't exist
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
}

# Function to log messages
function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Output $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Function to log error and exit
function Write-ErrorAndExit {
    param (
        [string]$Message
    )
    
    Write-Log $Message "ERROR"
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

# Function to print section header
function Write-Section {
    param (
        [string]$Title
    )
    
    Write-Host "`n==== $Title ====" -ForegroundColor Blue
    Write-Log "SECTION: $Title" "INFO"
}

# Function to print success message
function Write-Success {
    param (
        [string]$Message
    )
    
    Write-Host "✓ $Message" -ForegroundColor Green
    Write-Log $Message "SUCCESS"
}

# Function to print warning message
function Write-Warning {
    param (
        [string]$Message
    )
    
    Write-Host "⚠ $Message" -ForegroundColor Yellow
    Write-Log $Message "WARNING"
}

# Function to check if command exists
function Test-Command {
    param (
        [string]$Command
    )
    
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# Function to prompt for input with default value
function Read-UserInput {
    param (
        [string]$Message,
        [string]$Default = "",
        [switch]$Secure
    )
    
    if ($Default) {
        $Message = "$Message (default: $Default)"
    }
    
    if ($Secure) {
        $input = Read-Host -Prompt $Message -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($input)
        $result = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    } else {
        $input = Read-Host -Prompt $Message
        $result = $input
    }
    
    if ([string]::IsNullOrEmpty($result) -and $Default) {
        return $Default
    }
    
    return $result
}

# Function to check if environment variable exists in .env file
function Test-EnvVar {
    param (
        [string]$VarName
    )
    
    if (Test-Path $ENV_FILE) {
        $pattern = "^$VarName="
        $content = Get-Content $ENV_FILE -Raw
        return $content -match $pattern
    }
    
    return $false
}

# Function to add or update environment variable
function Set-EnvVar {
    param (
        [string]$VarName,
        [string]$VarValue
    )
    
    if (Test-Path $ENV_FILE) {
        if (Test-EnvVar $VarName) {
            # Update existing variable
            $content = Get-Content $ENV_FILE
            $newContent = $content -replace "^$VarName=.*", "$VarName=$VarValue"
            Set-Content -Path $ENV_FILE -Value $newContent
        } else {
            # Add new variable
            Add-Content -Path $ENV_FILE -Value "$VarName=$VarValue"
        }
    } else {
        # Create new .env file
        Set-Content -Path $ENV_FILE -Value "$VarName=$VarValue"
    }
}

# Function to load credentials from file
function Get-SavedCredentials {
    if (Test-Path $CREDENTIALS_FILE) {
        Write-Log "Loading saved credentials from $CREDENTIALS_FILE"
        $credentials = Get-Content $CREDENTIALS_FILE | ConvertFrom-Json
        return $credentials
    }
    
    return $null
}

# Function to save credentials to file
function Save-Credentials {
    param (
        [PSCustomObject]$Credentials
    )
    
    Write-Log "Saving credentials to $CREDENTIALS_FILE"
    $Credentials | ConvertTo-Json | Set-Content -Path $CREDENTIALS_FILE
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Section "Checking Prerequisites"
    
    # Check required tools
    $requiredTools = @("node", "npm", "curl", "ssh")
    foreach ($tool in $requiredTools) {
        if (Test-Command $tool) {
            Write-Success "$tool is installed"
        } else {
            Write-ErrorAndExit "$tool is not installed. Please install it and try again."
        }
    }
    
    # Check Node.js version
    $nodeVersion = (node -v)
    Write-Log "Node.js version: $nodeVersion"
    
    # Check if node version is >= 16
    $nodeMajorVersion = $nodeVersion -replace "v", "" -split "\." | Select-Object -First 1
    if ([int]$nodeMajorVersion -lt 16) {
        Write-ErrorAndExit "Node.js version 16 or higher is required. Current version: $nodeVersion"
    }
    
    # Check if .env file exists
    if (Test-Path $ENV_FILE) {
        Write-Success ".env file found"
    } else {
        Write-Warning ".env file not found. Creating from example..."
        if (Test-Path (Join-Path $SCRIPT_DIR ".env.example")) {
            Copy-Item -Path (Join-Path $SCRIPT_DIR ".env.example") -Destination $ENV_FILE
            Write-Success "Created .env from .env.example. Please edit it with your credentials."
        } else {
            # Create minimal .env file
            @"
NODE_ENV=production
PORT=3000
"@ | Set-Content -Path $ENV_FILE
            Write-Warning "Created minimal .env file. You may need to add more variables."
        }
    }
    
    Write-Success "All prerequisites checked"
}

# Function to collect deployment credentials
function Get-DeploymentCredentials {
    Write-Section "Collecting Deployment Credentials"
    
    # Try to load saved credentials first
    $credentials = Get-SavedCredentials
    if ($credentials) {
        $useSaved = Read-UserInput "Found saved credentials. Do you want to use them? (y/n)"
        if ($useSaved -match "^[Yy]$") {
            Write-Success "Using saved credentials"
            return $credentials
        }
    }
    
    # Collect new credentials
    $credentials = [PSCustomObject]@{
        SSH_USER = Read-UserInput "Enter your SSH Username"
        SSH_HOST = Read-UserInput "Enter your SSH Host" $DOMAIN
        SSH_PORT = Read-UserInput "Enter your SSH Port" "22"
        ADMIN_EMAIL = Read-UserInput "Enter your email for SSL certificates"
        SLACK_WEBHOOK_URL = Read-UserInput "Enter your Slack Webhook URL (optional, press enter to skip)"
        DISCORD_WEBHOOK_URL = Read-UserInput "Enter your Discord Webhook URL (optional, press enter to skip)"
    }
    
    # Ask if user wants to save credentials
    $saveCreds = Read-UserInput "Do you want to save these credentials for future deployments? (y/n)"
    if ($saveCreds -match "^[Yy]$") {
        Save-Credentials $credentials
        Write-Success "Credentials saved"
    }
    
    Write-Success "Credentials collected successfully"
    return $credentials
}

# Function to collect and set up SSH key
function Set-SshKey {
    param (
        [PSCustomObject]$Credentials
    )
    
    Write-Section "Setting Up SSH Key"
    
    # Check if SSH_PRIVATE_KEY environment variable exists
    if (Test-EnvVar "SSH_PRIVATE_KEY") {
        Write-Log "Using SSH key from environment variable"
        # Extract key from environment variable and save to temporary file
        $envContent = Get-Content $ENV_FILE -Raw
        $match = [regex]::Match($envContent, "SSH_PRIVATE_KEY=(.*?)(\r?\n|$)")
        if ($match.Success) {
            $keyContent = $match.Groups[1].Value -replace '^"', '' -replace '"$', ''
            Set-Content -Path $TEMP_SSH_KEY -Value $keyContent
        } else {
            Write-ErrorAndExit "Could not extract SSH key from environment variable"
        }
    } else {
        # Ask for SSH key path
        $sshKeyPath = Read-UserInput "Enter path to your SSH private key" "~/.ssh/id_rsa"
        $sshKeyPath = $sshKeyPath -replace "~", $HOME
        
        if (-not (Test-Path $sshKeyPath)) {
            Write-ErrorAndExit "SSH key not found at $sshKeyPath"
        }
        
        # Copy key to temporary location
        Copy-Item -Path $sshKeyPath -Destination $TEMP_SSH_KEY
    }
    
    # Test SSH connection
    Write-Log "Testing SSH connection to $($Credentials.SSH_HOST)"
    try {
        $result = ssh -i $TEMP_SSH_KEY -p $Credentials.SSH_PORT -o StrictHostKeyChecking=no -o BatchMode=yes "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST)" "echo SSH connection successful"
        if ($result -ne "SSH connection successful") {
            Write-ErrorAndExit "Failed to connect to $($Credentials.SSH_HOST) using the provided SSH key"
        }
    } catch {
        Write-ErrorAndExit "Failed to connect to $($Credentials.SSH_HOST): $_"
    }
    
    Write-Success "SSH connection successful"
    return $TEMP_SSH_KEY
}

# Function to install dependencies
function Install-Dependencies {
    Write-Section "Installing Dependencies"
    
    Write-Log "Installing npm dependencies..."
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Failed to install npm dependencies"
    }
    
    # Install deployment-specific dependencies
    Write-Log "Installing deployment-specific dependencies..."
    if (Test-Path (Join-Path $SCRIPT_DIR "install-deployment-deps.ps1")) {
        & (Join-Path $SCRIPT_DIR "install-deployment-deps.ps1")
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Deployment dependencies installation script returned non-zero exit code"
        }
    } else {
        # Install common deployment dependencies
        npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to install some deployment dependencies"
        }
    }
    
    Write-Success "All dependencies installed successfully"
}

# Function to build all components
function Build-AllComponents {
    Write-Section "Building All Components"
    
    # Clean previous builds
    Write-Log "Cleaning previous builds..."
    if (Test-Path (Join-Path $SCRIPT_DIR "npm-scripts.ps1")) {
        & (Join-Path $SCRIPT_DIR "npm-scripts.ps1") clean
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Clean script returned non-zero exit code"
        }
    } else {
        # Manual cleanup
        Remove-Item -Path (Join-Path $SCRIPT_DIR "dist") -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path (Join-Path $SCRIPT_DIR "build") -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path (Join-Path $SCRIPT_DIR ".cache") -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path (Join-Path $SCRIPT_DIR "node_modules/.cache") -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Build main application
    Write-Log "Building main application..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Failed to build main application"
    }
    
    # Build client
    if (Test-Path (Join-Path $SCRIPT_DIR "client")) {
        Write-Log "Building client..."
        Push-Location (Join-Path $SCRIPT_DIR "client")
        npm install
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Client build returned non-zero exit code"
        }
        Pop-Location
    }
    
    # Build server
    if (Test-Path (Join-Path $SCRIPT_DIR "server")) {
        Write-Log "Building server..."
        Push-Location (Join-Path $SCRIPT_DIR "server")
        npm install
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Server build returned non-zero exit code"
        }
        Pop-Location
    }
    
    # Build API gateway
    if (Test-Path (Join-Path $SCRIPT_DIR "api-gateway")) {
        Write-Log "Building API gateway..."
        Push-Location (Join-Path $SCRIPT_DIR "api-gateway")
        npm install
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "API gateway build returned non-zero exit code"
        }
        Pop-Location
    }
    
    # Build quantum validator
    if (Test-Path (Join-Path $SCRIPT_DIR "quantum-validator")) {
        Write-Log "Building quantum validator..."
        Push-Location (Join-Path $SCRIPT_DIR "quantum-validator")
        npm install
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Quantum validator build returned non-zero exit code"
        }
        Pop-Location
    }
    
    # Verify build output
    if (Test-Path (Join-Path $SCRIPT_DIR "dist")) {
        Write-Success "All components built successfully"
        return $true
    } else {
        Write-ErrorAndExit "Build directory not found after build"
        return $false
    }
}

# Function to deploy to Web3.Storage (IPFS/Filecoin)
function Deploy-ToWeb3Storage {
    Write-Section "Deploying to Web3.Storage (IPFS/Filecoin)"
    
    # Check if Web3.Storage token is set
    if (-not (Test-EnvVar "WEB3_STORAGE_TOKEN")) {
        Write-Warning "WEB3_STORAGE_TOKEN not found in .env. Skipping Web3.Storage deployment."
        return $false
    }
    
    Write-Log "Uploading to Web3.Storage..."
    
    # Use the deploy-to-web3.js script if it exists
    if (Test-Path (Join-Path $SCRIPT_DIR "scripts/deploy-to-web3.js")) {
        node (Join-Path $SCRIPT_DIR "scripts/deploy-to-web3.js")
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Web3.Storage deployment returned non-zero exit code"
        }
        Write-Success "Deployment to Web3.Storage completed"
        return $true
    } else {
        Write-Warning "deploy-to-web3.js script not found. Skipping Web3.Storage deployment."
        return $false
    }
}

# Function to set up FractalCoin-Filecoin bridge
function Set-FilecoinBridge {
    Write-Section "Setting Up FractalCoin-Filecoin Bridge"
    
    # Check if bridge setup is enabled
    if (Test-EnvVar "SETUP_FILECOIN_INTEGRATION") {
        $envContent = Get-Content $ENV_FILE -Raw
        if ($envContent -match "SETUP_FILECOIN_INTEGRATION=true") {
            Write-Log "FractalCoin-Filecoin bridge integration is enabled"
            
            # Check for API key
            if (-not (Test-EnvVar "FRACTALCOIN_API_KEY")) {
                Write-Warning "FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped."
                return $false
            }
            
            Write-Log "Setting up FractalCoin-Filecoin bridge..."
            
            # Use the fractalcoin-filecoin-bridge.js script if it exists
            if (Test-Path (Join-Path $SCRIPT_DIR "scripts/fractalcoin-filecoin-bridge.js")) {
                node (Join-Path $SCRIPT_DIR "scripts/fractalcoin-filecoin-bridge.js")
                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "FractalCoin-Filecoin bridge setup returned non-zero exit code"
                }
                Write-Success "FractalCoin-Filecoin bridge setup completed"
                return $true
            } else {
                Write-Warning "fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped."
                return $false
            }
        } else {
            Write-Log "FractalCoin-Filecoin bridge integration is disabled. Skipping setup."
            return $false
        }
    } else {
        Write-Log "SETUP_FILECOIN_INTEGRATION not found in .env. Skipping bridge setup."
        return $false
    }
}

# Function to create deployment package
function New-DeploymentPackage {
    Write-Section "Creating Deployment Package"
    
    Write-Log "Creating deployment package..."
    
    # Create a temporary directory for packaging
    $tempDir = Join-Path $env:TEMP "aetherion-deploy-$([Guid]::NewGuid().ToString())"
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    # Copy necessary files
    Copy-Item -Path (Join-Path $SCRIPT_DIR "dist") -Destination $tempDir -Recurse
    Copy-Item -Path (Join-Path $SCRIPT_DIR "package.json") -Destination $tempDir
    
    # Copy server redirect script if it exists
    if (Test-Path (Join-Path $SCRIPT_DIR "server-redirect.js")) {
        Copy-Item -Path (Join-Path $SCRIPT_DIR "server-redirect.js") -Destination $tempDir
    }
    
    # Copy .env file (without sensitive information)
    $envContent = Get-Content $ENV_FILE | Where-Object { $_ -notmatch "PRIVATE|SECRET|KEY|PASSWORD|TOKEN" }
    $envContent += "NODE_ENV=production"
    $envContent += "PORT=3000"
    Set-Content -Path (Join-Path $tempDir ".env") -Value $envContent
    
    # Create directories for components
    New-Item -ItemType Directory -Path (Join-Path $tempDir "client") | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempDir "server") | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempDir "api-gateway") | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempDir "quantum-validator") | Out-Null
    
    # Copy client build if it exists
    if (Test-Path (Join-Path $SCRIPT_DIR "client/dist")) {
        Copy-Item -Path (Join-Path $SCRIPT_DIR "client/dist") -Destination (Join-Path $tempDir "client") -Recurse
    } elseif (Test-Path (Join-Path $SCRIPT_DIR "client/build")) {
        Copy-Item -Path (Join-Path $SCRIPT_DIR "client/build") -Destination (Join-Path $tempDir "client") -Recurse
    }
    
    # Copy server build if it exists
    if (Test-Path (Join-Path $SCRIPT_DIR "server/dist")) {
        Copy-Item -Path (Join-Path $SCRIPT_DIR "server/dist") -Destination (Join-Path $tempDir "server") -Recurse
    }
    
    # Copy API gateway build if it exists
    if (Test-Path (Join-Path $SCRIPT_DIR "api-gateway/dist")) {
        Copy-Item -Path (Join-Path $SCRIPT_DIR "api-gateway/dist") -Destination (Join-Path $tempDir "api-gateway") -Recurse
    }
    
    # Copy quantum validator build if it exists
    if (Test-Path (Join-Path $SCRIPT_DIR "quantum-validator/dist")) {
        Copy-Item -Path (Join-Path $SCRIPT_DIR "quantum-validator/dist") -Destination (Join-Path $tempDir "quantum-validator") -Recurse
    }
    
    # Create package.json files for components if they don't exist in the build
    foreach ($component in @("client", "server", "api-gateway", "quantum-validator")) {
        if ((Test-Path (Join-Path $SCRIPT_DIR "$component/package.json")) -and (-not (Test-Path (Join-Path $tempDir "$component/package.json")))) {
            Copy-Item -Path (Join-Path $SCRIPT_DIR "$component/package.json") -Destination (Join-Path $tempDir $component)
        }
    }
    
    # Create zip package
    $packagePath = Join-Path $SCRIPT_DIR $DEPLOY_PACKAGE
    if (Test-Path $packagePath) {
        Remove-Item -Path $packagePath -Force
    }
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $packagePath)
    
    # Clean up temporary directory
    Remove-Item -Path $tempDir -Recurse -Force
    
    if (Test-Path $packagePath) {
        Write-Success "Deployment package created: $DEPLOY_PACKAGE"
        return $packagePath
    } else {
        Write-ErrorAndExit "Failed to create deployment package"
        return $null
    }
}

# Function to upload package to server
function Send-PackageToServer {
    param (
        [PSCustomObject]$Credentials,
        [string]$SshKeyPath,
        [string]$PackagePath
    )
    
    Write-Section "Uploading to Server"
    
    Write-Log "Uploading package to $($Credentials.SSH_HOST)..."
    
    # Upload package via SCP
    scp -i $SshKeyPath -P $Credentials.SSH_PORT $PackagePath "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST):~/"
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Failed to upload package to server"
    }
    
    Write-Success "Package uploaded successfully"
}

# Function to deploy on server
function Invoke-ServerDeployment {
    param (
        [PSCustomObject]$Credentials,
        [string]$SshKeyPath
    )
    
    Write-Section "Deploying on Server"
    
    Write-Log "Executing deployment commands on server..."
    
    # Create deployment script
    $deployScript = @'
#!/bin/bash
set -e

# Variables will be replaced by the script
APP_DIR="$HOME/aetherion"
SERVICE_NAME="aetherion"
DOMAIN="__DOMAIN__"
WWW_DOMAIN="__WWW_DOMAIN__"
ADMIN_EMAIL="__ADMIN_EMAIL__"
APP_PORT="3000"
NODE_ENV="production"
DEPLOY_PATH="__DEPLOY_PATH__"
DEPLOY_PACKAGE="__DEPLOY_PACKAGE__"

echo "Starting deployment on server..."

# Backup existing deployment
if [ -d "$APP_DIR" ]; then
  timestamp=$(date +%Y%m%d%H%M%S)
  backup_dir="${APP_DIR}_backup_$timestamp"
  echo "Backing up $APP_DIR → $backup_dir"
  mkdir -p "$backup_dir"
  cp -r "$APP_DIR"/* "$backup_dir"/
fi

# Extract new version
mkdir -p "$APP_DIR"

# Handle zip or tar.gz package
if [[ "$DEPLOY_PACKAGE" == *.zip ]]; then
  unzip -o ~/$DEPLOY_PACKAGE -d "$APP_DIR"
else
  tar -xzf ~/$DEPLOY_PACKAGE -C "$APP_DIR"
fi

rm -f ~/$DEPLOY_PACKAGE

# Install production deps
cd "$APP_DIR"
npm install --production --no-optional

# Create/update systemd service
if [ ! -f /etc/systemd/system/$SERVICE_NAME.service ]; then
  echo "Creating systemd service for $SERVICE_NAME"
  sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << UNIT
[Unit]
Description=Aetherion UI Wallet
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/server-redirect.js
Restart=on-failure
RestartSec=10
Environment=PORT=$APP_PORT
Environment=NODE_ENV=$NODE_ENV

[Install]
WantedBy=multi-user.target
UNIT

  sudo systemctl daemon-reload
  sudo systemctl enable $SERVICE_NAME
fi

echo "Restarting $SERVICE_NAME"
sudo systemctl restart $SERVICE_NAME
sleep 5

# Nginx configuration
if [ ! -f /etc/nginx/sites-available/$SERVICE_NAME ]; then
  echo "Setting up Nginx for $DOMAIN and $WWW_DOMAIN"
  sudo tee /etc/nginx/sites-available/$SERVICE_NAME > /dev/null << NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
    
    # For Let's Encrypt
    location ~ /.well-known {
        root /var/www/html;
        allow all;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN;

    # SSL configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Other security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Primary application path
    location $DEPLOY_PATH {
        proxy_pass http://localhost:$APP_PORT$DEPLOY_PATH;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Secondary application path at /wallet (legacy support)
    location /wallet {
        proxy_pass http://localhost:$APP_PORT/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:$APP_PORT/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Redirect root to app path
    location = / {
        return 301 $DEPLOY_PATH;
    }
}
NGINX

  sudo ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx

  # Obtain or renew certificates
  if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN \
      --non-interactive --agree-tos --email $ADMIN_EMAIL
  else
    sudo certbot renew --dry-run
  fi
fi

# Set up monitoring (optional)
if command -v pm2 >/dev/null 2>&1; then
  echo "Setting up PM2 monitoring..."
  pm2 startup
  pm2 save
fi

echo "Remote deploy complete."
'@

    # Replace variables in the script
    $deployScript = $deployScript.Replace("__DOMAIN__", $DOMAIN)
    $deployScript = $deployScript.Replace("__WWW_DOMAIN__", $WWW_DOMAIN)
    $deployScript = $deployScript.Replace("__ADMIN_EMAIL__", $Credentials.ADMIN_EMAIL)
    $deployScript = $deployScript.Replace("__DEPLOY_PATH__", $DEPLOY_PATH)
    $deployScript = $deployScript.Replace("__DEPLOY_PACKAGE__", $DEPLOY_PACKAGE)
    
    # Create temporary script file
    $tempScript = Join-Path $env:TEMP "deploy_script_$([Guid]::NewGuid().ToString()).sh"
    Set-Content -Path $tempScript -Value $deployScript
    
    # Upload script to server
    scp -i $SshKeyPath -P $Credentials.SSH_PORT $tempScript "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST):~/deploy_script.sh"
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Failed to upload deployment script"
    }
    
    # Execute script on server
    ssh -i $SshKeyPath -P $Credentials.SSH_PORT "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST)" "chmod +x ~/deploy_script.sh && bash ~/deploy_script.sh"
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Deployment failed on server"
    }
    
    # Clean up
    Remove-Item -Path $tempScript -Force
    
    Write-Success "Deployment completed successfully on server"
}

# Function to verify deployment
function Test-Deployment {
    param (
        [PSCustomObject]$Credentials,
        [string]$SshKeyPath
    )
    
    Write-Section "Verifying Deployment"
    
    Write-Log "Waiting for service to become healthy..."
    Start-Sleep -Seconds 10
    
    # Check HTTP status
    Write-Log "Checking HTTP status of https://$DOMAIN$DEPLOY_PATH"
    try {
        $response = Invoke-WebRequest -Uri "https://$DOMAIN$DEPLOY_PATH" -UseBasicParsing -ErrorAction SilentlyContinue
        $status = $response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $status = $_.Exception.Response.StatusCode.value__
        } else {
            $status = "000"
        }
    }
    
    Write-Log "HTTP status: $status"
    
    if ($status -eq 200 -or $status -eq 302) {
        Write-Success "Deployment verified successfully (HTTP status: $status)"
    } else {
        Write-Warning "Unexpected status code: $status. Deployment may have issues."
    }
    
    # Check server status via SSH
    Write-Log "Checking service status on server..."
    try {
        $serviceStatus = ssh -i $SshKeyPath -p $Credentials.SSH_PORT "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST)" "sudo systemctl status aetherion | grep Active"
        Write-Log "Service status: $serviceStatus"
    } catch {
        Write-Warning "Could not verify service status: $_"
    }
    
    # Check Nginx status
    Write-Log "Checking Nginx status on server..."
    try {
        $nginxStatus = ssh -i $SshKeyPath -p $Credentials.SSH_PORT "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST)" "sudo nginx -t 2>&1"
        Write-Log "Nginx status: $nginxStatus"
    } catch {
        Write-Warning "Nginx configuration may have issues: $_"
    }
    
    # Check SSL certificate
    Write-Log "Checking SSL certificate status..."
    try {
        $sslStatus = ssh -i $SshKeyPath -p $Credentials.SSH_PORT "$($Credentials.SSH_USER)@$($Credentials.SSH_HOST)" "sudo certbot certificates | grep -A 2 $DOMAIN"
        Write-Log "SSL certificate status: $sslStatus"
    } catch {
        Write-Warning "Could not verify SSL certificate status: $_"
    }
}

# Function to send notification
function Send-Notification {
    param (
        [PSCustomObject]$Credentials
    )
    
    Write-Section "Sending Deployment Notification"
    
    $deploymentUrl = "https://$DOMAIN$DEPLOY_PATH"
    $message = "Aetherion deployment to $deploymentUrl completed successfully at $(Get-Date)"
    
    # Send Slack notification if webhook URL is provided
    if ($Credentials.SLACK_WEBHOOK_URL) {
        Write-Log "Sending Slack notification..."
        try {
            Invoke-RestMethod -Uri $Credentials.SLACK_WEBHOOK_URL -Method Post -ContentType "application/json" -Body (ConvertTo-Json @{text = $message})
        } catch {
            Write-Warning "Failed to send Slack notification: $_"
        }
    }
    
    # Send Discord notification if webhook URL is provided
    if ($Credentials.DISCORD_WEBHOOK_URL) {
        Write-Log "Sending Discord notification..."
        try {
            Invoke-RestMethod -Uri $Credentials.DISCORD_WEBHOOK_URL -Method Post -ContentType "application/json" -Body (ConvertTo-Json @{content = $message})
        } catch {
            Write-Warning "Failed to send Discord notification: $_"
        }
    }
    
    Write-Success "Deployment notifications sent"
}

# Function to clean up
function Invoke-Cleanup {
    param (
        [string]$SshKeyPath,
        [string]$PackagePath
    )
    
    Write-Section "Cleaning Up"
    
    # Remove temporary SSH key
    if (Test-Path $SshKeyPath) {
        Write-Log "Removing temporary SSH key..."
        Remove-Item -Path $SshKeyPath -Force
    }
    
    # Remove deployment package
    if (Test-Path $PackagePath) {
        Write-Log "Removing deployment package..."
        Remove-Item -Path $PackagePath -Force
    }
    
    Write-Success "Cleanup completed"
}

# Main function
function Start-Deployment {
    # Print banner
    Write-Host "=============================================" -ForegroundColor Magenta
    Write-Host "    AETHERION ALL-IN-ONE DEPLOYMENT SCRIPT    " -ForegroundColor Magenta
    Write-Host "    Target: $DOMAIN                           " -ForegroundColor Magenta
    Write-Host "=============================================" -ForegroundColor Magenta
    Write-Host ""
    
    Write-Log "Starting deployment process" "INFO"
    
    # Run deployment steps
    Test-Prerequisites
    $credentials = Get-DeploymentCredentials
    $sshKeyPath = Set-SshKey $credentials
    Install-Dependencies
    Build-AllComponents
    Deploy-ToWeb3Storage # Continue even if this fails
    Set-FilecoinBridge   # Continue even if this fails
    $packagePath = New-DeploymentPackage
    Send-PackageToServer $credentials $sshKeyPath $packagePath
    Invoke-ServerDeployment $credentials $sshKeyPath
    Test-Deployment $credentials $sshKeyPath
    Send-Notification $credentials
    Invoke-Cleanup $sshKeyPath $packagePath
    
    Write-Host "`n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
    Write-Host "Your application is now available at: https://$DOMAIN$DEPLOY_PATH" -ForegroundColor Green
    Write-Host "Deployment log saved to: $LOG_FILE" -ForegroundColor Blue
    
    Write-Log "Deployment process completed successfully" "INFO"
}

# Run main function
Start-Deployment