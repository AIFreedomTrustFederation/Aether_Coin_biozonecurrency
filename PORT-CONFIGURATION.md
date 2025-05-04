# Aetherion Ecosystem Port Configuration

This document provides a comprehensive overview of all ports used in the Aetherion Ecosystem. It is crucial to maintain this documentation to prevent port conflicts in the future.

## Main Service Ports

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| Main Ecosystem Server | 5000 | Primary proxy server that routes traffic to various applications | http://localhost:5000/ |
| Brand Showcase Vite | 5173 | Vite development server for the Brand Showcase application | http://localhost:5173/ |
| Aetherion Wallet Server | 5174 | Express server for the Aetherion Wallet application | http://localhost:5174/ |
| Third Application | 5175 | Static Express server for the third application | http://localhost:5175/ |
| Aetherion Wallet Vite | 5176 | Vite development server for the Aetherion Wallet application | http://localhost:5176/ |

## Accessing Applications

### Main Entry Points (via Proxy Server on Port 5000)

- **Combined Landing Page**: http://localhost:5000/
- **Brand Showcase**: http://localhost:5000/brands
- **Aetherion Wallet**: http://localhost:5000/wallet
- **Third Application**: http://localhost:5000/app3
- **Status Check Page**: http://localhost:5000/status
- **WebSocket Server**: ws://localhost:5000/ws
- **API Health Endpoint**: http://localhost:5000/api/health

### Direct Access (Without Proxy)

- **Brand Showcase Vite Direct**: http://localhost:5173/
- **Aetherion Wallet Server Direct**: http://localhost:5174/
- **Third Application Direct**: http://localhost:5175/
- **Aetherion Wallet Vite Direct**: http://localhost:5176/

## Replit Access

When deployed on Replit, all services can be accessed through the Replit URL with the same paths:

- **Main Replit URL**: https://workspace.aifreedomtrust.repl.co
- **Brand Showcase on Replit**: https://workspace.aifreedomtrust.repl.co/brands
- **Aetherion Wallet on Replit**: https://workspace.aifreedomtrust.repl.co/wallet
- **Third Application on Replit**: https://workspace.aifreedomtrust.repl.co/app3
- **Status Check Page on Replit**: https://workspace.aifreedomtrust.repl.co/status
- **API Health Endpoint on Replit**: https://workspace.aifreedomtrust.repl.co/api/health

## Important Notes

1. The main server on port 5000 acts as a reverse proxy, forwarding requests to the appropriate application servers.
2. WebSocket connections are available at ws://localhost:5000/ws (or wss:// on secure connections).
3. Each application maintains its own server to ensure separation of concerns and prevent conflicts.
4. The Aetherion Wallet application uses both a primary Express server (5174) and a Vite development server (5176).
5. When adding new services, always check this document to avoid port conflicts.

## Development Workflows

- **Starting All Services**: Use `npm run dev` which executes the combined-server.js script.
- **Monitoring Service Status**: Visit http://localhost:5000/status for a real-time status overview.
- **API Testing**: All APIs are accessible through the main server with appropriate prefixes.

## Troubleshooting Common Issues

- If a port conflict occurs, check this document and update the conflicting service to use an available port.
- Remember to update both the server configuration and any client-side references to the port.
- When services fail to start, check the logs for specific error messages related to port binding.