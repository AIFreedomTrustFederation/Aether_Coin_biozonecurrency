# run-ai-evaluation.ps1
# PowerShell script to run AI evaluations on Windows

param (
    [Parameter(Mandatory=$false)]
    [string]$Provider = "both",
    
    [Parameter(Mandatory=$false)]
    [string]$BraintrustApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$MistralApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host "Usage: .\scripts\run-ai-evaluation.ps1 [-Provider <provider>] [-BraintrustApiKey <key>] [-MistralApiKey <key>] [-Help]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Provider <provider>      Provider to use: 'braintrust', 'mistral', or 'both' (default: both)"
    Write-Host "  -BraintrustApiKey <key>   Braintrust API key (optional, will use .env if not provided)"
    Write-Host "  -MistralApiKey <key>      Mistral API key (optional, will use .env if not provided)"
    Write-Host "  -Help                     Show this help message"
    exit 0
}

# Check if .env file exists and load API keys if not provided
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    
    if (-not $BraintrustApiKey) {
        foreach ($line in $envContent) {
            if ($line -match "BRAINTRUST_API_KEY=(.+)") {
                $BraintrustApiKey = $matches[1]
                Write-Host "Using Braintrust API key from .env file"
                break
            }
        }
    }
    
    if (-not $MistralApiKey) {
        foreach ($line in $envContent) {
            if ($line -match "MISTRAL_API_KEY=(.+)") {
                $MistralApiKey = $matches[1]
                Write-Host "Using Mistral API key from .env file"
                break
            }
        }
    }
}

# Set environment variables based on provider
if ($Provider -eq "braintrust" -or $Provider -eq "both") {
    if (-not $BraintrustApiKey) {
        Write-Host "Warning: No Braintrust API key provided. Braintrust evaluations may fail." -ForegroundColor Yellow
    } else {
        # Mask the key for display
        $maskedKey = $BraintrustApiKey.Substring(0, 3) + "****" + $BraintrustApiKey.Substring($BraintrustApiKey.Length - 3)
        $env:BRAINTRUST_API_KEY = $BraintrustApiKey
        Write-Host "Braintrust API key set: $maskedKey" -ForegroundColor Green
        
        # Clear the variable from memory after setting the environment variable
        $BraintrustApiKey = $null
    }
}

if ($Provider -eq "mistral" -or $Provider -eq "both") {
    if (-not $MistralApiKey) {
        Write-Host "Warning: No Mistral API key provided. Mistral evaluations may fail." -ForegroundColor Yellow
    } else {
        # Mask the key for display
        $maskedKey = $MistralApiKey.Substring(0, 3) + "****" + $MistralApiKey.Substring($MistralApiKey.Length - 3)
        $env:MISTRAL_API_KEY = $MistralApiKey
        Write-Host "Mistral API key set: $maskedKey" -ForegroundColor Green
        
        # Clear the variable from memory after setting the environment variable
        $MistralApiKey = $null
    }
}

# Run the evaluation
Write-Host "Running AI evaluation with provider: $Provider" -ForegroundColor Green
node scripts/run-ai-evaluation.js

# Check if evaluation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Evaluation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Evaluation failed with exit code $LASTEXITCODE" -ForegroundColor Red
}