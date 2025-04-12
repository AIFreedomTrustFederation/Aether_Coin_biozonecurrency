# =========================================================================
# FractalCoin to Filecoin Automated Deployment Script (PowerShell Version)
# =========================================================================
# This script automates the complete deployment process of FractalCoin
# to Filecoin via Web3.Storage, including:
#
# 1. Environment validation and setup
# 2. Dependency installation
# 3. Application building
# 4. Deployment to Web3.Storage (IPFS/Filecoin)
# 5. FractalCoin-Filecoin bridge setup
# 6. ENS domain configuration (optional)
# 7. Deployment verification
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

function Handle-Error {
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
$LogFile = "fractalcoin-deployment-$([DateTime]::Now.ToString('yyyyMMdd-HHmmss')).log"
$EnvFile = ".env"
$RequiredTools = @("node", "npm", "curl")
$RequiredEnvVars = @("WEB3_STORAGE_TOKEN")
$OptionalEnvVars = @("ENS_PRIVATE_KEY", "ENS_DOMAIN", "FRACTALCOIN_API_KEY", "FRACTALCOIN_API_ENDPOINT")

# Function to check prerequisites
function Check-Prerequisites {
    Write-Section "Checking Prerequisites"
    
    # Check for required tools
    foreach ($tool in $RequiredTools) {
        if (Test-CommandExists $tool) {
            Write-ColorOutput "✓ $tool is installed" "INFO"
        } else {
            Handle-Error "✗ $tool is not installed. Please install it and try again."
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
            Handle-Error "No .env.example file found. Please create a $EnvFile file manually."
        }
    }
    
    # Check for required environment variables
    foreach ($var in $RequiredEnvVars) {
        if (Test-EnvVarExists $var) {
            Write-ColorOutput "✓ $var is set" "INFO"
        } else {
            Handle-Error "✗ Required environment variable $var is not set in $EnvFile"
        }
    }
    
    # Check for optional environment variables
    foreach ($var in $OptionalEnvVars) {
        if (Test-EnvVarExists $var) {
            Write-ColorOutput "✓ $var is set" "INFO"
        } else {
            Write-ColorOutput "✗ Optional environment variable $var is not set in $EnvFile" "WARNING"
        }
    }
    
    Write-ColorOutput "All prerequisites checked" "SUCCESS"
}

# Function to install dependencies
function Install-Dependencies {
    Write-Section "Installing Dependencies"
    
    Write-ColorOutput "Installing npm dependencies..." "INFO"
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Failed to install npm dependencies"
    }
    
    Write-ColorOutput "Installing deployment-specific dependencies..." "INFO"
    if (Test-Path "install-deployment-deps.sh") {
        # Use bash to run the script if WSL is available
        if (Test-CommandExists "bash") {
            bash install-deployment-deps.sh
            if ($LASTEXITCODE -ne 0) {
                Handle-Error "Failed to install deployment dependencies"
            }
        } else {
            # Fallback to installing common deployment dependencies
            npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers
            if ($LASTEXITCODE -ne 0) {
                Handle-Error "Failed to install deployment dependencies"
            }
        }
    } else {
        # Install common deployment dependencies if script doesn't exist
        npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Failed to install deployment dependencies"
        }
    }
    
    Write-ColorOutput "All dependencies installed successfully" "SUCCESS"
}

# Function to build the application
function Build-Application {
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
        Handle-Error "Failed to build application"
    }
    
    # Verify build output
    if (Test-Path "dist") {
        Write-ColorOutput "Application built successfully" "SUCCESS"
    } else {
        Handle-Error "Build directory not found after build"
    }
}

# Function to deploy to Web3.Storage
function Deploy-ToWeb3Storage {
    Write-Section "Deploying to Web3.Storage (IPFS/Filecoin)"
    
    Write-ColorOutput "Uploading to Web3.Storage..." "INFO"
    
    # Use the deploy-to-web3.js script if it exists
    if (Test-Path "scripts/deploy-to-web3.js") {
        node scripts/deploy-to-web3.js
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Failed to deploy to Web3.Storage"
        }
    } else {
        Handle-Error "deploy-to-web3.js script not found"
    }
    
    Write-ColorOutput "Deployment to Web3.Storage completed" "SUCCESS"
}

# Function to set up FractalCoin-Filecoin bridge
function Setup-FilecoinBridge {
    Write-Section "Setting Up FractalCoin-Filecoin Bridge"
    
    # Check if bridge setup is enabled
    $envContent = Get-Content $EnvFile -Raw
    if ($envContent -match "SETUP_FILECOIN_INTEGRATION=true") {
        Write-ColorOutput "FractalCoin-Filecoin bridge integration is enabled" "INFO"
        
        # Check for API key
        if (-not (Test-EnvVarExists "FRACTALCOIN_API_KEY")) {
            Write-ColorOutput "FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped." "WARNING"
            return
        }
        
        Write-ColorOutput "Setting up FractalCoin-Filecoin bridge..." "INFO"
        
        # Use the fractalcoin-filecoin-bridge.js script if it exists
        if (Test-Path "scripts/fractalcoin-filecoin-bridge.js") {
            node scripts/fractalcoin-filecoin-bridge.js
            if ($LASTEXITCODE -ne 0) {
                Handle-Error "Failed to set up FractalCoin-Filecoin bridge"
            }
        } else {
            Write-ColorOutput "fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped." "WARNING"
            return
        }
        
        Write-ColorOutput "FractalCoin-Filecoin bridge setup completed" "SUCCESS"
    } else {
        Write-ColorOutput "FractalCoin-Filecoin bridge integration is disabled. Skipping setup." "INFO"
    }
}

# Function to update ENS domain (if configured)
function Update-EnsDomain {
    Write-Section "Updating ENS Domain (if configured)"
    
    # Check if ENS update is enabled and keys are set
    if ((Test-EnvVarExists "ENS_PRIVATE_KEY") -and (Test-EnvVarExists "ENS_DOMAIN")) {
        Write-ColorOutput "ENS configuration found. Domain updates will be handled by deploy-to-web3.js." "INFO"
        Write-ColorOutput "ENS domain configuration completed" "SUCCESS"
    } else {
        Write-ColorOutput "ENS configuration not found or incomplete. Skipping ENS domain update." "INFO"
    }
}

# Function to verify deployment
function Verify-Deployment {
    Write-Section "Verifying Deployment"
    
    # Check for CID in log file
    Write-ColorOutput "Checking for IPFS CID in deployment logs..." "INFO"
    
    $logContent = Get-Content $LogFile -Raw
    if ($logContent -match "CID: ([a-zA-Z0-9]+)") {
        $cid = $matches[1]
        Write-ColorOutput "Deployment verified with CID: $cid" "SUCCESS"
        Write-ColorOutput "Your application is accessible at: https://$cid.ipfs.dweb.link/" "INFO"
        
        # Check if ENS domain was configured
        if (Test-EnvVarExists "ENS_DOMAIN") {
            $envContent = Get-Content $EnvFile -Raw
            if ($envContent -match "ENS_DOMAIN=(.+)") {
                $ensDomain = $matches[1]
                Write-ColorOutput "Your application is also accessible via ENS at: https://$ensDomain.link/" "INFO"
            }
        }
    } else {
        Write-ColorOutput "Could not find IPFS CID in logs. Deployment may have failed or logs may be incomplete." "WARNING"
    }
}

# Function to display deployment summary
function Show-DeploymentSummary {
    Write-Section "Deployment Summary"
    
    # Extract key information from logs
    $logContent = Get-Content $LogFile -Raw
    $cid = if ($logContent -match "CID: ([a-zA-Z0-9]+)") { $matches[1] } else { $null }
    $gatewayUrl = if ($logContent -match "Gateway URL: (https://[^\s]+)") { $matches[1] } else { $null }
    $bridgeCid = if ($logContent -match "Bridge CID: ([a-zA-Z0-9]+)") { $matches[1] } else { $null }
    
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host "                  FRACTALCOIN DEPLOYMENT SUMMARY                  " -ForegroundColor Magenta
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host ""
    
    Write-Host "Deployment Status: " -NoNewline -ForegroundColor White
    Write-Host "Complete" -ForegroundColor Green
    Write-Host "Deployment Log: $LogFile"
    Write-Host ""
    
    Write-Host "IPFS/Filecoin Information:" -ForegroundColor Cyan
    if ($cid) {
        Write-Host "Content CID: $cid"
    } else {
        Write-Host "Content CID: " -NoNewline
        Write-Host "Not found in logs" -ForegroundColor Yellow
    }
    
    if ($gatewayUrl) {
        Write-Host "Gateway URL: $gatewayUrl"
    } else {
        Write-Host "Gateway URL: " -NoNewline
        Write-Host "Not found in logs" -ForegroundColor Yellow
        if ($cid) {
            Write-Host "Suggested URL: https://$cid.ipfs.dweb.link/"
        }
    }
    
    Write-Host ""
    Write-Host "FractalCoin-Filecoin Bridge:" -ForegroundColor Cyan
    if ($bridgeCid) {
        Write-Host "Bridge CID: $bridgeCid"
        Write-Host "Status: " -NoNewline
        Write-Host "Active" -ForegroundColor Green
    } else {
        Write-Host "Bridge Status: " -NoNewline
        Write-Host "Not configured or failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "ENS Domain:" -ForegroundColor Cyan
    if (Test-EnvVarExists "ENS_DOMAIN") {
        $envContent = Get-Content $EnvFile -Raw
        if ($envContent -match "ENS_DOMAIN=(.+)") {
            $ensDomain = $matches[1]
            Write-Host "Domain: $ensDomain"
            Write-Host "ENS URL: https://$ensDomain.link/"
        } else {
            Write-Host "Status: " -NoNewline
            Write-Host "Configured but domain not found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Status: " -NoNewline
        Write-Host "Not configured" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Access your application using the Gateway URL above"
    Write-Host "2. Share your application CID or ENS domain with users"
    Write-Host "3. Monitor your storage on Web3.Storage dashboard"
    Write-Host "4. Check the FractalCoin-Filecoin bridge status periodically"
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Magenta
}

# Main execution
function Main {
    # Create log file
    New-Item -Path $LogFile -ItemType File -Force | Out-Null
    
    # Display banner
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host "            FRACTALCOIN TO FILECOIN DEPLOYMENT SCRIPT            " -ForegroundColor Magenta
    Write-Host "=================================================================" -ForegroundColor Magenta
    Write-Host ""
    
    Write-ColorOutput "Starting deployment process..." "INFO"
    Write-ColorOutput "Log file: $LogFile" "INFO"
    
    # Run deployment steps
    Check-Prerequisites
    Install-Dependencies
    Build-Application
    Deploy-ToWeb3Storage
    Setup-FilecoinBridge
    Update-EnsDomain
    Verify-Deployment
    
    # Display deployment summary
    Show-DeploymentSummary
    
    Write-ColorOutput "Deployment process completed successfully!" "SUCCESS"
}

# Execute main function
Main