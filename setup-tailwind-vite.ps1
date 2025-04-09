# Ensure Node.js is installed
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Navigate to the project directory
Set-Location -Path "c:\Users\AI Freedom Trust\OneDrive\AI Freedom Trust\.venv\Aether_Coin_biozonecurrency\Aether_Coin_biozonecurrency"

# Install Tailwind CSS, Vite, and dependencies
Write-Host "Installing Tailwind CSS, Vite, and dependencies..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/vite vite @vitejs/plugin-react

# Initialize Tailwind CSS configuration
Write-Host "Initializing Tailwind CSS configuration..."
if (-not (Test-Path "./tailwind.config.js")) {
    npx tailwindcss init
} else {
    Write-Host "Tailwind configuration file already exists. Skipping initialization." -ForegroundColor Yellow
}

# Create PostCSS configuration file
Write-Host "Creating PostCSS configuration file..."
$postcssConfigPath = "./postcss.config.js"
if (-not (Test-Path $postcssConfigPath)) {
    @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@ | Out-File -Encoding UTF8 $postcssConfigPath
} else {
    Write-Host "PostCSS configuration file already exists. Skipping creation." -ForegroundColor Yellow
}

# Ensure Tailwind CSS directives are in the CSS file
Write-Host "Ensuring Tailwind CSS directives are in the CSS file..."
$cssFilePath = "./client/src/index.css"
if (Test-Path $cssFilePath) {
    $cssContent = Get-Content $cssFilePath -Raw
    if ($cssContent -notmatch "@tailwind base;") {
        $cssDirectives = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import custom styles after Tailwind */
@import './styles/neon.css';
"@
        Add-Content -Path $cssFilePath -Value $cssDirectives
        Write-Host "Added Tailwind directives to index.css."
    } else {
        Write-Host "Tailwind directives already exist in index.css. Skipping." -ForegroundColor Yellow
    }
} else {
    Write-Host "CSS file not found at $cssFilePath. Please ensure the file exists." -ForegroundColor Red
}

# Add Vite scripts to package.json
Write-Host "Adding Vite scripts to package.json..."
$packageJsonPath = "./package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    if (-not $packageJson.scripts) {
        $packageJson.scripts = @{}
    }
    if (-not $packageJson.scripts["dev"]) {
        $packageJson.scripts["dev"] = "vite"
    }
    if (-not $packageJson.scripts["build"]) {
        $packageJson.scripts["build"] = "vite build"
    }
    if (-not $packageJson.scripts["serve"]) {
        $packageJson.scripts["serve"] = "vite preview"
    }
    $packageJson | ConvertTo-Json -Depth 10 -Compress | Set-Content $packageJsonPath -Encoding UTF8
    Write-Host "Added Vite scripts to package.json."
} else {
    Write-Host "package.json not found. Please ensure it exists in the project root." -ForegroundColor Red
}

# Create Vite configuration file
Write-Host "Creating Vite configuration file..."
$viteConfigPath = "./vite.config.js"
if (-not (Test-Path $viteConfigPath)) {
    @"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
"@ | Out-File -Encoding UTF8 $viteConfigPath
    Write-Host "Created Vite configuration file."
} else {
    Write-Host "Vite configuration file already exists. Skipping creation." -ForegroundColor Yellow
}

# Create the output directory if it doesn't exist
Write-Host "Ensuring output directory exists..."
$outputDir = "./client/dist"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory at $outputDir."
} else {
    Write-Host "Output directory already exists. Skipping." -ForegroundColor Yellow
}

Write-Host "Setup complete. Run 'npm run dev' to start your development server." -ForegroundColor Green