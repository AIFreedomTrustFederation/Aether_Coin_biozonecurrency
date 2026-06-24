# Define the project directory
$projectDir = "c:\Users\AI Freedom Trust\OneDrive\AI Freedom Trust\.venv\Aether_Coin_biozonecurrency\Aether_Coin_biozonecurrency"

Write-Host "Fixing string formatting in financial-wellness-service.ts..."

$financialWellnessPath = Join-Path $projectDir "server\services\financial-wellness-service.ts"

if (Test-Path $financialWellnessPath) {
    (Get-Content $financialWellnessPath) `
        -replace '"You`"re losing significant funds to excessive gas fees."', '"You''re losing significant funds to excessive gas fees."' `
        -replace '"Optimizing gas usage could save you substantial amounts."', '"Optimizing gas usage could save you substantial amounts."' `
        -replace '"Moderate gas savings possible with these changes."', '"Moderate gas savings possible with these changes."' `
        -replace '"Minor gas optimizations available."', '"Minor gas optimizations available."' |
        Set-Content $financialWellnessPath

    Write-Host "Fixed string formatting in financial-wellness-service.ts."
} else {
    Write-Host "financial-wellness-service.ts file not found. Skipping string formatting fix." -ForegroundColor Yellow
}


# Re-run TypeScript compiler to check for errors
Write-Host "Re-running TypeScript compiler to check for errors..."
Set-Location -Path $projectDir
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript compilation successful. No errors found." -ForegroundColor Green
} else {
    Write-Host "TypeScript compilation failed. Check the errors above." -ForegroundColor Red
}
