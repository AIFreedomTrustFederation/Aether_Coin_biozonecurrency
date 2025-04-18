# install-pre-commit-hook.ps1
# PowerShell script to install the pre-commit hook for Windows

# Check if .git directory exists
if (-not (Test-Path ".git")) {
    Write-Host "Error: .git directory not found. Make sure you're in the root of the Git repository." -ForegroundColor Red
    exit 1
}

# Create hooks directory if it doesn't exist
if (-not (Test-Path ".git\hooks")) {
    New-Item -ItemType Directory -Path ".git\hooks" | Out-Null
    Write-Host "Created .git\hooks directory" -ForegroundColor Green
}

# Create pre-commit.bat file
$preCommitBatContent = @"
@echo off
node scripts/pre-commit-hook.js %*
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
"@

Set-Content -Path ".git\hooks\pre-commit.bat" -Value $preCommitBatContent
Write-Host "Created .git\hooks\pre-commit.bat" -ForegroundColor Green

# Create pre-commit file (for Git Bash users)
$preCommitContent = @"
#!/bin/sh
node scripts/pre-commit-hook.js
"@

Set-Content -Path ".git\hooks\pre-commit" -Value $preCommitContent
Write-Host "Created .git\hooks\pre-commit" -ForegroundColor Green

# Make the script executable (this won't have an effect on Windows, but helps if using Git Bash)
try {
    # This will only work in Git Bash or WSL
    bash -c "chmod +x .git/hooks/pre-commit" 2>$null
} catch {
    # Ignore errors if bash is not available
}

Write-Host ""
Write-Host "Pre-commit hook installed successfully!" -ForegroundColor Green
Write-Host "This hook will prevent committing files with potential API keys." -ForegroundColor Green
Write-Host ""
Write-Host "To bypass the hook in special cases, use: git commit --no-verify" -ForegroundColor Yellow
Write-Host "But please be VERY careful when bypassing this check!" -ForegroundColor Yellow