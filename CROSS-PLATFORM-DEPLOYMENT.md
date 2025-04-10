# Aetherion Cross-Platform Deployment Guide

This guide provides instructions for deploying Aetherion Wallet across different platforms using Docker, ensuring consistent behavior and automated enhancements.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)
- Git (for cloning the repository)

## Quick Start

The fastest way to get Aetherion running on any platform is with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency.git
cd Aether_Coin_biozonecurrency

# Copy example environment file
cp .env.example .env

# Edit the .env file with your configuration
# Especially set the database connection and any API keys

# Build and start the containers
docker-compose up -d
```

This will start the following services:
- Aetherion Web App (on port 5000)
- API Gateway (on port 3001)
- PostgreSQL Database (on port 5432)
- Redis (on port 6379)

## Manual Running Without Docker

If you prefer to run the application without Docker:

```bash
# Install dependencies
npm install

# Make the start script executable
chmod +x start-with-improvements.sh

# Run the application with automated improvements
./start-with-improvements.sh
```

## Environment Variables

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/aetherion` |
| `JWT_SECRET` | Secret for JWT token generation | Random string (in production, set this explicitly) |
| `SESSION_SECRET` | Secret for session cookies | Random string (in production, set this explicitly) |
| `GITHUB_TOKEN` | GitHub token for repository syncing | None |
| `FRACTALCOIN_API_KEY` | API key for FractalCoin integration | None (simulation mode) |

## Platform-Specific Notes

### Windows

When running Docker on Windows, ensure WSL2 (Windows Subsystem for Linux 2) is installed for better performance.

```powershell
# For PowerShell users
$env:COMPOSE_CONVERT_WINDOWS_PATHS=1
docker-compose up -d
```

### macOS

For Apple Silicon (M1/M2/M3) Macs, the Docker images are multi-architecture and should work automatically.

### Linux

On Linux, you might need to adjust file permissions:

```bash
# Ensure database directory has correct permissions
mkdir -p ./data/postgres
chmod -R 777 ./data/postgres
```

## Data Persistence

All data is stored in Docker volumes:
- PostgreSQL data: `postgres-data` volume
- Redis data: `redis-data` volume
- Application logs: `./logs` directory
- Application data: `./data` directory

## Scaling Considerations

For production deployments, consider:

1. Using a managed PostgreSQL service instead of the containerized version
2. Setting up a load balancer in front of multiple app instances
3. Implementing a proper CI/CD pipeline with GitHub Actions
4. Using a container orchestration system like Kubernetes for larger deployments

## Automated Improvements

The application includes several automated improvement processes that run on startup:

1. **Error handling enhancements**: Checks and improves error handling across routes
2. **Authentication improvements**: Validates JWT implementation 
3. **Blockchain interaction optimizations**: Ensures gas estimation and transaction batching
4. **Type safety checks**: Verifies TypeScript type coverage
5. **Mysterion AI integration**: Enhances AI monitoring capabilities

These improvements run automatically when starting with Docker or using `./start-with-improvements.sh`.

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

```bash
# Check if PostgreSQL container is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres
```

### API Gateway Issues

If the API Gateway isn't working:

```bash
# Check API Gateway logs
docker-compose logs api-gateway
```

### Application Logs

View application logs:

```bash
# View all logs
docker-compose logs

# View only application logs
docker-compose logs aetherion-app
```

## Security Considerations

For production deployments:
- Change all default passwords
- Use a reverse proxy with HTTPS
- Configure proper firewall rules
- Use Docker secrets or a dedicated secrets management solution
- Implement proper backup strategies

## Updates and Upgrades

To update the application:

```bash
# Pull the latest code
git pull

# Rebuild and restart containers
docker-compose down
docker-compose build
docker-compose up -d
```