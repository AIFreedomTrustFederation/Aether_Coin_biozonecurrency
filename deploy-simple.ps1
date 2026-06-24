# SIMPLIFIED DEPLOYMENT SCRIPT FOR AETHERION SAAS APP
# Target: atc.aifreedomtrust.com
#
# This script automates the deployment process using Node.js

# Set execution policy for this process
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Print banner
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "    AETHERION SIMPLIFIED DEPLOYMENT SCRIPT    " -ForegroundColor Magenta
Write-Host "    Target: atc.aifreedomtrust.com            " -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed. Please install it and try again." -ForegroundColor Red
    exit 1
}

# Check if deploy-to-aifreedomtrust-full.js exists
$deployScript = "deploy-to-aifreedomtrust-full.js"
if (-not (Test-Path $deployScript)) {
    Write-Host "ERROR: $deployScript not found in the current directory." -ForegroundColor Red
    exit 1
}

# Run the deployment script
Write-Host "Starting deployment process using $deployScript..." -ForegroundColor Cyan
Write-Host "This may take several minutes. Please be patient." -ForegroundColor Yellow
Write-Host ""

try {
    # Run the Node.js deployment script
    node $deployScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
        Write-Host "Your application is now available at: https://atc.aifreedomtrust.com/dapp" -ForegroundColor Green
    } else {
        Write-Host "`n=== DEPLOYMENT FAILED ===" -ForegroundColor Red
        Write-Host "Please check the logs for more information." -ForegroundColor Red
    }
} catch {
    Write-Host "`n=== DEPLOYMENT FAILED ===" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Keep the window open
Write-Host "`nPress any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")