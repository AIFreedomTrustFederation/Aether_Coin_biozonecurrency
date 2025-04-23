# Scroll Keeper - Platform-Agnostic Knowledge Management

Scroll Keeper is a universal WebSocket-powered conversation extraction and knowledge management system, designed to be completely platform-agnostic and compatible with any hosting environment, including FractalCoin nodes and AICoin AetherCore services.

## Key Features

- **Platform Independence**: Run anywhere - cloud, on-premises, specialized blockchain nodes
- **WebSocket Communication**: Real-time updates and notifications
- **Conversation Extraction**: Extract knowledge from ChatGPT conversations
- **Vector Search**: Semantic search through extracted knowledge
- **Modular Architecture**: Easily integrate with other systems
- **Multiple Deployment Options**: Container, bare-metal, or service integration

## Deployment Options

### 1. Standard Deployment

For traditional hosting environments:

```bash
# Clone the repository
git clone https://github.com/yourusername/scroll-keeper.git
cd scroll-keeper

# Install dependencies
npm install

# Configure environment
cp .env.platform-agnostic .env
# Edit .env with your configuration

# Start the server
npm start
```

### 2. Docker Deployment

For containerized deployments:

```bash
# Build and run using Docker Compose
docker-compose up -d
```

### 3. FractalCoin Node Integration

For FractalCoin blockchain nodes:

```bash
# Create optimized deployment package
node deployment-platform-agnostic.js --target=fractalcoin --env=production

# See FRACTALCOIN-DEPLOYMENT-GUIDE.md for detailed instructions
```

### 4. AICoin AetherCore Integration

For AICoin AetherCore services:

```bash
# Create AetherCore optimized deployment package
node deployment-platform-agnostic.js --target=aicoin --env=production

# See AETHERIUM-INTEGRATION-GUIDE.md for detailed instructions
```

## Configuration

The application is configured through environment variables, which can be set in a `.env` file or through your deployment platform:

```
PORT=5000
NODE_ENV=production
WEBSOCKET_PATH=/ws
API_PATH=/api
HUGGINGFACE_API_KEY=your_key_here
```

See `.env.platform-agnostic` for a complete list of configuration options.

## Architecture

The system follows a modular, platform-agnostic architecture:

```
┌───────────────────┐     ┌─────────────────┐
│                   │     │                 │
│  Web Interface    │────►│  RESTful API    │
│                   │     │                 │
└───────────────────┘     └─────────────────┘
         ▲                        │
         │                        ▼
         │                ┌─────────────────┐
┌────────┴──────────┐    │                 │
│                   │    │  Storage Layer  │
│  WebSocket Server │    │                 │
│                   │    └─────────────────┘
└───────────────────┘            │
         ▲                       ▼
         │               ┌─────────────────┐
┌────────┴──────────┐   │                 │
│                   │   │ Vector Database │
│  Extraction       │   │                 │
│  Service          │   └─────────────────┘
│                   │
└───────────────────┘
```

## Universal WebSocket Implementation

The WebSocket implementation is designed to work across any environment:

```javascript
// Client-side (platform-agnostic)
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host || 'localhost:5000';
const wsUrl = `${protocol}//${host}/ws`;
const socket = new WebSocket(wsUrl);

// Server-side (platform-agnostic)
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Bind to all network interfaces for maximum compatibility
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Integration with External Systems

### FractalCoin Integration

See `FRACTALCOIN-DEPLOYMENT-GUIDE.md` for detailed integration instructions with FractalCoin nodes.

### AICoin AetherCore Integration

See `AETHERIUM-INTEGRATION-GUIDE.md` for detailed integration with AICoin AetherCore services.

## Security Considerations

- API keys are managed through environment variables
- All connections can be secured with TLS/SSL
- Container deployment uses non-root user
- CORS settings can be customized for your environment

## Performance Optimizations

The application includes various optimization options that can be enabled or disabled based on your specific environment:

```
ENABLE_MEMORY_OPTIMIZATION=true
ENABLE_VECTOR_CLUSTERING=true
ENABLE_PARALLEL_PROCESSING=true
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.