#!/bin/bash
# Create Brand Repository Script for AI Freedom Trust
# This script helps initialize a new brand repository with GitHub Pages setup

# Text formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

# Banner
echo -e "${BLUE}${BOLD}"
echo "====================================================="
echo "    Brand Repository Creation Tool"
echo "    for AI Freedom Trust Federation"
echo "====================================================="
echo -e "${RESET}"

# Prompt for brand information
read -p "Enter brand name (e.g., Quantum Domain): " BRAND_NAME
read -p "Enter brand slug (e.g., quantum-domain): " BRAND_SLUG
read -p "Enter brand description: " BRAND_DESCRIPTION
read -p "Enter primary color (hex code): " PRIMARY_COLOR
read -p "Enter secondary color (hex code): " SECONDARY_COLOR

# Create directory for the new brand
BRAND_DIR="brand-repos/${BRAND_SLUG}"
mkdir -p "${BRAND_DIR}"
mkdir -p "${BRAND_DIR}/.github/workflows"
mkdir -p "${BRAND_DIR}/public/assets"
mkdir -p "${BRAND_DIR}/docs"

# Create README.md
cat > "${BRAND_DIR}/README.md" <<EOF
# ${BRAND_NAME}

${BRAND_DESCRIPTION}

## Repository Structure

This repository contains the landing page and assets for the ${BRAND_NAME} brand, part of the AI Freedom Trust ecosystem.

## GitHub Pages Configuration

This repository is configured to use GitHub Pages with a custom subdomain:

\`\`\`
${BRAND_SLUG}.aifreedomtrust.com
\`\`\`

## Development

To work on this site:

1. Clone the repository
2. Make your changes
3. Push to GitHub
4. GitHub Actions will automatically deploy the changes

## DNS Configuration

To configure DNS for this brand:

1. Use the \`github-pages-dns-setup.sh\` script from the main repository
2. Select the option to configure ${BRAND_SLUG}.aifreedomtrust.com
3. The script will automatically set up the required DNS records

## Additional Resources

For more information, refer to the [GitHub Pages Deployment Guide](https://github.com/AIFreedomTrustFederation/AIFreedomTrustFederation.github.io/blob/main/GITHUB-PAGES-DEPLOYMENT-GUIDE.md).
EOF

# Create CNAME file
echo "${BRAND_SLUG}.aifreedomtrust.com" > "${BRAND_DIR}/CNAME"

# Create .nojekyll file
touch "${BRAND_DIR}/.nojekyll"

# Create index.html
cat > "${BRAND_DIR}/index.html" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BRAND_NAME} - AI Freedom Trust</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR});
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 50px 20px;
        }
        header {
            text-align: center;
            margin-bottom: 50px;
        }
        h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #ffffff, #f0f0f0);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.8;
            max-width: 700px;
            margin: 0 auto;
        }
        .content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 50px;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 30px;
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h2 {
            color: #ffffff;
            margin-top: 0;
        }
        .button {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 12px 25px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            background: rgba(255, 255, 255, 0.3);
        }
        footer {
            text-align: center;
            margin-top: 100px;
            padding: 20px;
            font-size: 0.9rem;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${BRAND_NAME}</h1>
            <p class="subtitle">${BRAND_DESCRIPTION}</p>
        </header>
        
        <div class="content">
            <div class="card">
                <h2>About ${BRAND_NAME}</h2>
                <p>Welcome to the official page of ${BRAND_NAME}. We are part of the AI Freedom Trust ecosystem, delivering cutting-edge technology solutions.</p>
                <p>Our platform provides innovative tools and services designed to enhance security, efficiency, and connectivity.</p>
                <a href="#about" class="button">Learn More</a>
            </div>
            
            <div class="card">
                <h2>Key Features</h2>
                <ul>
                    <li>Advanced security architecture</li>
                    <li>Decentralized infrastructure</li>
                    <li>Quantum-resistant cryptography</li>
                    <li>Seamless ecosystem integration</li>
                    <li>Enterprise-grade scalability</li>
                </ul>
                <a href="#features" class="button">Explore Features</a>
            </div>
            
            <div class="card">
                <h2>Get Started</h2>
                <p>Ready to experience the benefits of ${BRAND_NAME}? Get started today and join our growing community of users.</p>
                <p>Our documentation provides detailed guides and tutorials to help you make the most of our platform.</p>
                <a href="#start" class="button">Get Started</a>
            </div>
        </div>
        
        <footer>
            <p>&copy; 2025 AI Freedom Trust. All rights reserved.</p>
            <p>Powered by Aetherion Technologies</p>
        </footer>
    </div>
</body>
</html>
EOF

# Create GitHub Actions workflow
cat > "${BRAND_DIR}/.github/workflows/ghpages-deploy.yml" <<EOF
name: GitHub Pages Deployment

on:
  push:
    branches:
      - main  # Change this to your default branch if different
  workflow_dispatch:  # Allow manual triggers

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages  # The branch the action should deploy to
          folder: .         # The folder the action should deploy
          clean: true       # Automatically remove deleted files from the deploy branch
          
      - name: Deployment Status
        run: |
          echo "✅ Brand site deployment completed successfully!"
          echo "🌐 Your site should be available at: https://${BRAND_SLUG}.aifreedomtrust.com"
          echo "🔄 If you've set up a custom domain, please allow time for DNS propagation."
EOF

# Create an SVG logo
cat > "${BRAND_DIR}/public/assets/logo.svg" <<EOF
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="40" width="120" height="120" fill="${PRIMARY_COLOR}" rx="10" ry="10" />
  <circle cx="100" cy="100" r="40" fill="${SECONDARY_COLOR}" />
  <text x="100" y="110" font-family="Arial" font-size="20" text-anchor="middle" fill="white">${BRAND_NAME}</text>
</svg>
EOF

# Create basic documentation
cat > "${BRAND_DIR}/docs/index.md" <<EOF
# ${BRAND_NAME} Documentation

Welcome to the ${BRAND_NAME} documentation. This guide will help you get started with our platform and understand its features.

## Getting Started

To get started with ${BRAND_NAME}, follow these steps:

1. Sign up for an account
2. Configure your settings
3. Connect to the AI Freedom Trust ecosystem
4. Explore the features

## Features

${BRAND_NAME} offers the following features:

- Feature 1: Description of Feature 1
- Feature 2: Description of Feature 2
- Feature 3: Description of Feature 3

## Integration

${BRAND_NAME} integrates seamlessly with other brands in the AI Freedom Trust ecosystem:

- Integration with Brand 1
- Integration with Brand 2
- Integration with Brand 3

## Support

For support, contact us at support@aifreedomtrust.com.
EOF

echo -e "${GREEN}✓ Brand repository created successfully at ${BRAND_DIR}${RESET}"
echo -e "${YELLOW}Next steps:${RESET}"
echo -e "1. Create a new repository on GitHub named ${BRAND_SLUG}"
echo -e "2. Push the contents of ${BRAND_DIR} to the repository"
echo -e "3. Enable GitHub Pages in the repository settings"
echo -e "4. Configure DNS using github-pages-dns-setup.sh"
echo -e "5. Visit https://${BRAND_SLUG}.aifreedomtrust.com after DNS propagation"

# Ask if the user wants to create another brand repository
echo
echo -e "${BLUE}Would you like to create another brand repository?${RESET} (y/n): "
read continue_choice
  
if [[ "$continue_choice" =~ ^[Yy]$ ]]; then
  exec "$0"
else
  echo -e "${GREEN}All done! Your brand repositories are ready.${RESET}"
fi