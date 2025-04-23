# Scroll Keeper Deployment Guide for FractalCoin

This guide outlines the steps to deploy Scroll Keeper on FractalCoin nodes and AICoin AetherCore services.

## FractalCoin Node Deployment

### Prerequisites
- FractalCoin node with Node.js 18+ installed
- Access to node configuration
- Network connectivity for WebSocket communication

### Deployment Steps

1. **Create Deployment Package**

```bash
node deployment-platform-agnostic.js --target=fractalcoin --env=production
```

This creates a `deploy` directory with all necessary files optimized for FractalCoin.

2. **Transfer Files to Node**

```bash
# Using secure copy or your preferred method
scp -r ./deploy user@fractalcoin-node:/path/to/scroll-keeper
```

3. **Configure Environment**

Edit the `.env` file in the deployment directory:

```
# Required configuration
HUGGINGFACE_API_KEY=your_api_key_here

# Optional configuration
PORT=5000
NODE_ENV=production
WEBSOCKET_PATH=/fractal/ws
API_PATH=/fractal/api

# FractalCoin-specific optimizations
ENABLE_MEMORY_OPTIMIZATION=true
ENABLE_PARALLEL_PROCESSING=true
ENABLE_ENCRYPTED_STORAGE=true
```

4. **Install Dependencies and Start**

```bash
cd /path/to/scroll-keeper
npm install
npm start
```

5. **Test The Deployment**

Access the application at: `http://your-fractalcoin-node:5000`

## AICoin AetherCore Integration

### Prerequisites
- Access to AICoin AetherCore service
- Appropriate permissions to deploy applications

### Deployment Steps

1. **Create Deployment Package**

```bash
node deployment-platform-agnostic.js --target=aicoin --env=production
```

2. **Transfer Files to AetherCore Service**

```bash
# Using secure copy or your preferred method
scp -r ./deploy user@aether-core-server:/path/to/scroll-keeper
```

3. **Configure Environment**

Edit the `.env` file in the deployment directory:

```
# Required configuration
HUGGINGFACE_API_KEY=your_api_key_here

# Optional configuration
PORT=5000
NODE_ENV=production
WEBSOCKET_PATH=/aether/ws
API_PATH=/aether/api

# AetherCore-specific optimizations
ENABLE_MEMORY_OPTIMIZATION=true
ENABLE_VECTOR_CLUSTERING=true
ENABLE_SHARDED_STORAGE=true
```

4. **Install Dependencies and Start**

```bash
cd /path/to/scroll-keeper
npm install
npm start
```

5. **Test The Deployment**

Access the application at: `http://your-aether-core-server:5000`

## Advanced Configuration

### Persistent Storage

For production deployments, consider using persistent storage:

```
# Add to .env
STORAGE_TYPE=persistent
STORAGE_PATH=/path/to/persistent/storage
```

### Custom WebSocket Paths

To customize WebSocket paths for specific network configurations:

```
# Add to .env
WEBSOCKET_PATH=/custom/path/ws
```

### Memory Optimizations

For nodes with limited resources:

```
# Add to .env
MEMORY_LIMIT_MB=512
OPTIMIZE_FOR_LOW_MEMORY=true
```

## Security Considerations

1. **API Key Management**
   - Store API keys securely
   - Consider using environment variables rather than .env file
   - Rotate keys periodically

2. **Network Security**
   - Configure firewalls to only allow necessary traffic
   - Use TLS/SSL for all connections
   - Consider IP restrictions for admin functions

3. **Authentication**
   - Implement token-based authentication for API access
   - Use proper session management for web interface

## Troubleshooting

### WebSocket Connection Issues

If experiencing WebSocket connectivity problems:

1. Check network firewall rules allow WebSocket traffic
2. Verify the correct WebSocket path is configured
3. Ensure the server is binding to the correct network interface

### Performance Optimization

For high-load environments:

1. Increase `NODE_ENV=production` for optimized performance
2. Consider implementing a load balancer for multiple instances
3. Optimize memory usage with `ENABLE_MEMORY_OPTIMIZATION=true`

## Support

For assistance with FractalCoin deployments, contact the FractalCoin support team.