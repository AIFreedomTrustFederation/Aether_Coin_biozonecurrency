# Aetherion Wallet Cross-Platform Deployment Guide

This guide provides comprehensive instructions for deploying Aetherion Wallet on any platform. The application can be deployed using either Docker (recommended) or standalone Node.js installation.

## Table of Contents

1. [Docker Deployment (Recommended)](#docker-deployment-recommended)
   - [Prerequisites](#docker-prerequisites)
   - [Deployment Steps](#docker-deployment-steps)
   - [Running the Application](#docker-running-the-application)
   - [Environment Variables](#docker-environment-variables)

2. [Standalone Deployment](#standalone-deployment)
   - [Prerequisites](#standalone-prerequisites)
   - [Deployment Steps](#standalone-deployment-steps)
   - [Running the Application](#standalone-running-the-application)
   - [Environment Variables](#standalone-environment-variables)

3. [Accessing the Application](#accessing-the-application)
   - [Ports & URLs](#ports--urls)
   - [Default Credentials](#default-credentials)

4. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Logs & Diagnostics](#logs--diagnostics)

---

## Docker Deployment (Recommended)

### Docker Prerequisites

- Docker Engine (20.10.x or higher)
- Docker Compose (2.x or higher)
- Git (optional, for cloning the repository)
- 2GB RAM minimum (4GB recommended)
- 10GB free disk space

### Docker Deployment Steps

1. **Download the Deployment Package**

   Either clone the repository or download the latest release package:

   ```bash
   git clone https://github.com/yourusername/aetherion-wallet.git
   cd aetherion-wallet
   ```

   Or download and extract the latest release:

   ```bash
   curl -L https://github.com/yourusername/aetherion-wallet/releases/latest/download/aetherion-wallet.zip -o aetherion-wallet.zip
   unzip aetherion-wallet.zip
   cd aetherion-wallet
   ```

2. **Configure Environment Variables**

   Create a `.env` file based on the provided example:

   ```bash
   cp .env.example .env
   # Edit .env file with your preferred text editor
   ```

   At minimum, set secure values for the following variables:
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `POSTGRES_PASSWORD`

3. **Start the Application**

   ```bash
   docker-compose up -d
   ```

   The first run will build the Docker images and may take several minutes.

### Docker Running the Application

- **View logs:**
  ```bash
  docker-compose logs -f
  ```

- **Stop the application:**
  ```bash
  docker-compose down
  ```

- **Restart the application:**
  ```bash
  docker-compose restart
  ```

- **Update to a new version:**
  ```bash
  git pull  # Or download new release
  docker-compose down
  docker-compose build
  docker-compose up -d
  ```

### Docker Environment Variables

Edit these in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@postgres:5432/aetherion` |
| `JWT_SECRET` | Secret for JWT tokens | *random value* |
| `SESSION_SECRET` | Secret for session cookies | *random value* |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `aetherion` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `GITHUB_TOKEN` | GitHub API token | *empty* |

---

## Standalone Deployment

### Standalone Prerequisites

- Node.js (v20.x or higher)
- npm (v9.x or higher)
- PostgreSQL (v15.x or higher)
- Redis (v7.x or higher)
- Git (optional, for cloning the repository)
- 2GB RAM minimum (4GB recommended)
- 10GB free disk space

### Standalone Deployment Steps

1. **Download the Deployment Package**

   Either clone the repository or download the latest release package:

   ```bash
   git clone https://github.com/yourusername/aetherion-wallet.git
   cd aetherion-wallet
   ```

   Or download and extract the latest release:

   ```bash
   curl -L https://github.com/yourusername/aetherion-wallet/releases/latest/download/aetherion-wallet.zip -o aetherion-wallet.zip
   unzip aetherion-wallet.zip
   cd aetherion-wallet
   ```

2. **Install Dependencies**

   ```bash
   npm ci --production
   ```

3. **Configure Environment Variables**

   Create a `.env` file based on the provided example:

   ```bash
   cp .env.example .env
   # Edit .env file with your preferred text editor
   ```

   Ensure the `DATABASE_URL` points to your PostgreSQL installation and `REDIS_URL` to your Redis instance.

4. **Build the Application**

   ```bash
   npm run build
   ```

5. **Initialize the Database**

   ```bash
   npm run db:push
   ```

6. **Start the Application**

   ```bash
   npm run start
   ```

   For background execution, consider using a process manager like PM2:

   ```bash
   # Install PM2 if not already installed
   npm install -g pm2
   
   # Start the application with PM2
   pm2 start npm --name "aetherion" -- run start
   
   # Ensure PM2 starts on system boot
   pm2 startup
   pm2 save
   ```

### Standalone Running the Application

- **View logs with PM2:**
  ```bash
  pm2 logs aetherion
  ```

- **Restart the application:**
  ```bash
  pm2 restart aetherion
  ```

- **Update to a new version:**
  ```bash
  git pull  # Or download new release
  npm ci --production
  npm run build
  pm2 restart aetherion
  ```

### Standalone Environment Variables

Edit these in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `5000` |
| `HOST` | Host to bind to | `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/aetherion` |
| `JWT_SECRET` | Secret for JWT tokens | *random value* |
| `SESSION_SECRET` | Secret for session cookies | *random value* |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `GITHUB_TOKEN` | GitHub API token | *empty* |

---

## Accessing the Application

### Ports & URLs

Once deployed, the application will be available at:

- **Main Application:** `http://your-server-ip:5000`
- **API Gateway:** `http://your-server-ip:3001`

If you're using a domain name with HTTPS, update your URLs accordingly.

### Default Credentials

On first start, the application will create a default admin user:

- **Username:** `admin@example.com`
- **Password:** `changeme123`

⚠️ **IMPORTANT**: Change the default password immediately after first login.

---

## Troubleshooting

### Common Issues

1. **Application fails to start**
   - Check the logs for specific error messages
   - Verify environment variables in `.env` file
   - Ensure database and Redis are running and accessible

2. **"Database connection error"**
   - Check if PostgreSQL is running
   - Verify `DATABASE_URL` environment variable
   - Ensure network connectivity between application and database

3. **"Redis connection error"**
   - Check if Redis is running
   - Verify `REDIS_URL` environment variable
   - Ensure network connectivity between application and Redis

4. **Wallet connection issues**
   - Ensure you have a browser extension wallet installed (e.g., MetaMask)
   - Check if you're on a supported network
   - Verify blockchain API connectivity

### Logs & Diagnostics

- **Docker logs:**
  ```bash
  docker-compose logs -f aetherion-app
  docker-compose logs -f postgres
  docker-compose logs -f redis
  docker-compose logs -f api-gateway
  ```

- **Standalone logs:**
  ```bash
  # If using PM2
  pm2 logs aetherion
  
  # Check application log files
  cat logs/app.log
  cat logs/error.log
  ```

- **Health checks:**
  ```bash
  # Application health check
  curl http://localhost:5000/health
  
  # API Gateway health check
  curl http://localhost:3001/health
  ```

For additional help, consult the full documentation or contact support.