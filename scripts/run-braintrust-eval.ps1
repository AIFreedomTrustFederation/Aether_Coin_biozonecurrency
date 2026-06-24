# run-braintrust-eval.ps1
# PowerShell script to run Braintrust evaluations on Windows

param (
    [Parameter(Mandatory=$false)]
    [string]$EvalFile = "tutorial.eval.ts",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host "Usage: .\scripts\run-braintrust-eval.ps1 [-EvalFile <file>] [-ApiKey <key>] [-Help]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -EvalFile <file>    Evaluation file to run (default: tutorial.eval.ts)"
    Write-Host "  -ApiKey <key>       Braintrust API key (optional, will use .env if not provided)"
    Write-Host "  -Help               Show this help message"
    exit 0
}

# Check if .env file exists and load API key if not provided
if (-not $ApiKey) {
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        foreach ($line in $envContent) {
            if ($line -match "BRAINTRUST_API_KEY=(.+)") {
                $ApiKey = $matches[1]
                Write-Host "Using API key from .env file"
                break
            }
        }
    }
}

# Check if API key is provided
if (-not $ApiKey) {
    Write-Host "Error: No API key provided. Please provide an API key using -ApiKey parameter or set it in .env file." -ForegroundColor Red
    exit 1
}

# Check if evaluation file exists
if (-not (Test-Path $EvalFile)) {
    Write-Host "Error: Evaluation file '$EvalFile' not found." -ForegroundColor Red
    exit 1
}

# Set environment variable and run evaluation
Write-Host "Running Braintrust evaluation: $EvalFile" -ForegroundColor Green
$env:BRAINTRUST_API_KEY = $ApiKey
npx braintrust eval $EvalFile

# Check if evaluation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Evaluation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Evaluation failed with exit code $LASTEXITCODE" -ForegroundColor Red
}