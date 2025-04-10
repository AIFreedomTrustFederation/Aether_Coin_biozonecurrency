# Aetherion Wallet v1.0.0 - Release Usage Guide

This guide explains how to download, install, and use the Aetherion Wallet release package.

## Downloading the Release Package

### Option 1: Download from GitHub Releases

1. Visit the GitHub releases page: [https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/releases](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/releases)
2. Find the v1.0.0 release
3. Download the `aetherion-wallet-v1.0.0.tar.gz` file

### Option 2: Direct Download Link

Use the following direct link to download the package:
[https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/releases/download/v1.0.0/aetherion-wallet-v1.0.0.tar.gz](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/releases/download/v1.0.0/aetherion-wallet-v1.0.0.tar.gz)

### Option 3: Using curl from Terminal

```bash
curl -L https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/releases/download/v1.0.0/aetherion-wallet-v1.0.0.tar.gz -o aetherion-wallet-v1.0.0.tar.gz
```

## Installation Methods

Aetherion Wallet supports multiple installation methods to match your preferred deployment environment.

### Method 1: Docker Deployment (Recommended)

This is the simplest method that works across all platforms with Docker installed.

1. Extract the package:
   ```bash
   tar -xzf aetherion-wallet-v1.0.0.tar.gz
   cd aetherion-wallet-v1.0.0
   ```

2. Run with Docker:
   ```bash
   ./run-with-docker.sh
   ```

3. Access the application:
   - Open your browser and navigate to [http://localhost:5000](http://localhost:5000)

### Method 2: Traditional Node.js Deployment

For users who prefer a standard Node.js installation:

1. Extract the package:
   ```bash
   tar -xzf aetherion-wallet-v1.0.0.tar.gz
   cd aetherion-wallet-v1.0.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:push
   ```

4. Start the application:
   ```bash
   npm run dev
   ```

5. Access the application:
   - Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### Method 3: Domain Deployment

For deploying to a specific domain:

1. Extract the package:
   ```bash
   tar -xzf aetherion-wallet-v1.0.0.tar.gz
   cd aetherion-wallet-v1.0.0
   ```

2. Edit the .env file and set your domain:
   ```
   DOMAIN=yourdomain.com
   ```

3. Run the domain deployment script:
   ```bash
   ./deploy-to-domain.js
   ```

4. Follow the specific instructions provided by the script for your domain setup

## Getting Started with Aetherion Wallet

### Initial Setup

1. Create a new wallet or import an existing one
2. Set up your security preferences
3. Configure notification channels

### Key Features in v1.0.0

1. **Multi-Wallet Support**
   - Connect and manage multiple blockchain wallets
   - Support for major wallet providers

2. **Transaction Management**
   - Send and receive cryptocurrencies
   - View transaction history and status

3. **Security Features**
   - Quantum-resistant security architecture
   - Real-time transaction risk assessment

4. **Messaging System**
   - End-to-end encrypted communications
   - Blockchain-anchored identities

5. **VS Code Integration**
   - Smart contract development environment
   - Live deployment capabilities

## Troubleshooting

### Common Issues

1. **Docker Connection Refused**
   - Ensure Docker is running
   - Check if port 5000 is available

2. **Database Connection Issues**
   - Verify PostgreSQL is installed and running
   - Check DATABASE_URL in .env file

3. **Failed to Start Application**
   - Verify Node.js version (v18+ required)
   - Check npm install completed successfully

### Getting Help

If you encounter any issues not covered here:

1. Check the [GitHub Issues](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/issues) for known problems
2. Join our community channels for support

## Developer Resources

For developers looking to extend or contribute to Aetherion:

1. Review the [CODE-EDITOR-README.md](./CODE-EDITOR-README.md) for development setup
2. Check [DATABASE-IMPLEMENTATION.md](./DATABASE-IMPLEMENTATION.md) for database schema details
3. See [CROSS-PLATFORM-DEPLOYMENT.md](./CROSS-PLATFORM-DEPLOYMENT.md) for additional deployment options