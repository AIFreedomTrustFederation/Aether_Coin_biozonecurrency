# Ensure Node.js is installed
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Navigate to the project directory
Set-Location -Path "c:\Users\AI Freedom Trust\OneDrive\AI Freedom Trust\.venv\Aether_Coin_biozonecurrency\Aether_Coin_biozonecurrency"

# Check Tailwind CSS, PostCSS, and Vite dependencies
Write-Host "Checking dependencies..."
$dependencies = @("tailwindcss", "postcss", "autoprefixer", "@tailwindcss/vite", "vite", "@vitejs/plugin-react")
$missingDependencies = @()
foreach ($dependency in $dependencies) {
    $dependencyCheck = npm list $dependency -g 2>&1 | Select-String $dependency
    if (-not $dependencyCheck) {
        $missingDependencies += $dependency
    }
}
if ($missingDependencies.Count -gt 0) {
    Write-Host "Missing dependencies: $($missingDependencies -join ', ')" -ForegroundColor Yellow
    Write-Host "Installing missing dependencies..."
    npm install -D $missingDependencies
} else {
    Write-Host "All dependencies are installed." -ForegroundColor Green
}

# Check Tailwind CSS configuration
Write-Host "Checking Tailwind CSS configuration..."
$tailwindConfigPath = "./tailwind.config.js"
if (-not (Test-Path $tailwindConfigPath)) {
    Write-Host "Tailwind configuration file is missing. Creating it..." -ForegroundColor Yellow
    npx tailwindcss init
} else {
    Write-Host "Tailwind configuration file exists." -ForegroundColor Green
}

# Check PostCSS configuration
Write-Host "Checking PostCSS configuration..."
$postcssConfigPath = "./postcss.config.js"
$expectedPostCSSConfig = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@
if (-not (Test-Path $postcssConfigPath)) {
    Write-Host "PostCSS configuration file is missing. Creating it..." -ForegroundColor Yellow
    $expectedPostCSSConfig | Out-File -Encoding UTF8 $postcssConfigPath
} else {
    $currentPostCSSConfig = Get-Content $postcssConfigPath -Raw
    if ($currentPostCSSConfig -ne $expectedPostCSSConfig) {
        Write-Host "PostCSS configuration file differs from the expected configuration. Updating it..." -ForegroundColor Yellow
        $expectedPostCSSConfig | Out-File -Encoding UTF8 $postcssConfigPath
    } else {
        Write-Host "PostCSS configuration file is correct." -ForegroundColor Green
    }
}

# Check Tailwind CSS directives in index.css
Write-Host "Checking Tailwind CSS directives in index.css..."
$cssFilePath = "./client/src/index.css"
$expectedCSSDirectives = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import custom styles after Tailwind */
@import './styles/neon.css';
"@
if (Test-Path $cssFilePath) {
    $currentCSSContent = Get-Content $cssFilePath -Raw
    if ($currentCSSContent -notmatch "@tailwind base;") {
        Write-Host "Tailwind CSS directives are missing in index.css. Adding them..." -ForegroundColor Yellow
        Add-Content -Path $cssFilePath -Value $expectedCSSDirectives
    } else {
        Write-Host "Tailwind CSS directives are present in index.css." -ForegroundColor Green
    }
} else {
    Write-Host "CSS file not found at $cssFilePath. Creating it with Tailwind directives..." -ForegroundColor Yellow
    $expectedCSSDirectives | Out-File -Encoding UTF8 $cssFilePath
}

# Check Vite configuration
Write-Host "Checking Vite configuration..."
$viteConfigPath = "./vite.config.js"
$expectedViteConfig = @"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
"@
if (-not (Test-Path $viteConfigPath)) {
    Write-Host "Vite configuration file is missing. Creating it..." -ForegroundColor Yellow
    $expectedViteConfig | Out-File -Encoding UTF8 $viteConfigPath
} else {
    $currentViteConfig = Get-Content $viteConfigPath -Raw
    if ($currentViteConfig -ne $expectedViteConfig) {
        Write-Host "Vite configuration file differs from the expected configuration. Updating it..." -ForegroundColor Yellow
        $expectedViteConfig | Out-File -Encoding UTF8 $viteConfigPath
    } else {
        Write-Host "Vite configuration file is correct." -ForegroundColor Green
    }
}

# Check package.json for Vite scripts
Write-Host "Checking package.json for Vite scripts..."
$packageJsonPath = "./package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    if (-not $packageJson.scripts) {
        $packageJson.scripts = @{}
    }
    if (-not $packageJson.scripts.dev) {
        $packageJson.scripts.dev = "vite"
    }
    if (-not $packageJson.scripts.build) {
        $packageJson.scripts.build = "vite build"
    }
    if (-not $packageJson.scripts.serve) {
        $packageJson.scripts.serve = "vite preview"
    }
    $packageJson | ConvertTo-Json -Depth 10 -Compress | Set-Content $packageJsonPath -Encoding UTF8
    Write-Host "Updated Vite scripts in package.json." -ForegroundColor Yellow
} else {
    Write-Host "package.json not found. Please ensure it exists in the project root." -ForegroundColor Red
}

Write-Host "Configuration check complete. Your project is ready!" -ForegroundColor Green