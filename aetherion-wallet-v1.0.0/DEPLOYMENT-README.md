# Aetherion Wallet v1.0.0 - Deployment Package

This package contains everything needed to deploy Aetherion Wallet on any platform.

## Quick Start

### Option 1: Docker Deployment (Recommended)

1. Ensure Docker and Docker Compose are installed
2. Run:
   ```
   ./run-with-docker.sh
   ```
3. Access the application at http://localhost:5000

### Option 2: Traditional Deployment

1. Ensure Node.js (v20+) and PostgreSQL are installed
2. Run:
   ```
   ./deploy-traditional.sh
   ```
3. Access the application at http://localhost:5000

## Detailed Instructions

For complete deployment documentation, see [CROSS-PLATFORM-DEPLOYMENT.md](CROSS-PLATFORM-DEPLOYMENT.md)

## GitHub Integration

To set up GitHub synchronization:

1. Run `./setup-github-sync.sh`
2. To push changes and create releases: `./sync-to-github.sh`
3. For troubleshooting, see [GITHUB-SYNC-TROUBLESHOOTING.md](GITHUB-SYNC-TROUBLESHOOTING.md)

## Package Contents

- Deployment scripts: `run-with-docker.sh`, `deploy-traditional.sh`
- GitHub tools: `setup-github-sync.sh`, `sync-to-github.sh`, `resolve-conflicts.sh`
- Docker configuration: `docker-compose.yml`, `Dockerfile`
- Source code: `client/`, `server/`, `shared/`, `api-gateway/`
- Documentation: `README.md`, `CROSS-PLATFORM-DEPLOYMENT.md`, etc.
- Configuration: `package.json`, `.env.example`, etc.

## Version Information

- Package Version: 1.0.0
- Created On: Thu 10 Apr 2025 04:53:31 PM UTC

For support or more information, see the main [README.md](README.md)
