# Aetherion Brand Integration System

This document provides a comprehensive overview of the Aetherion Brand Integration System, which allows multiple applications to run simultaneously and be accessible through a single server.

## System Architecture

The Aetherion Brand Integration System consists of the following components:

1. **Main Ecosystem Server** - A central proxy server that routes traffic to the appropriate application servers.
2. **Brand Showcase Application** - A Vite-based React application for showcasing various brands.
3. **Aetherion Wallet** - The full Aetherion Wallet application, not just the CodeStar Platform component.
4. **Third Application** - A placeholder for future applications or services.

## Key Features

- **Centralized Configuration** - All port numbers and paths are managed through the `config.js` file.
- **Multi-Application Support** - Multiple applications run simultaneously on different ports.
- **Proxy Routing** - Requests are automatically routed to the appropriate application based on path.
- **WebSocket Support** - Real-time communication through a WebSocket server on the main proxy.
- **API Health Endpoints** - Monitoring endpoints for checking the status of all services.
- **Responsive Design** - All applications are built with responsive design principles.

## Port Configuration

For a detailed overview of all ports and their configurations, please refer to the `PORT-CONFIGURATION.md` file.

## Application Access

All applications can be accessed through the main server:

- **Main Landing Page**: http://localhost:5000/
- **Brand Showcase**: http://localhost:5000/brands
- **Aetherion Wallet**: http://localhost:5000/wallet
- **Third Application**: http://localhost:5000/app3
- **Status Check Page**: http://localhost:5000/status
- **WebSocket Server**: ws://localhost:5000/ws
- **API Health Endpoint**: http://localhost:5000/api/health

## Development Guidelines

When working on this project, please follow these guidelines:

1. **Port Management** - Always use the central `config.js` file when working with ports to prevent conflicts.
2. **Service Discovery** - Use the status endpoints to check if services are running correctly.
3. **Dependency Management** - Ensure all dependencies are properly documented and installed.
4. **Replit Integration** - The application is designed to work seamlessly on Replit.

## Fixing the Full Aetherion Wallet Mode

We've implemented several important fixes to ensure the full Aetherion Wallet application is loaded instead of just the CodeStar Platform component:

1. **Application Mode Flag** - Added `AETHERION_FULL_SYSTEM` flag in `main.tsx` to enable the full wallet.
2. **Dependency Resolution** - Created missing `@shared/schema` file to resolve dependency issues.
3. **Path Configuration** - Updated Vite configuration to correctly resolve all import paths.
4. **Security Level** - Set optimal security level for the wallet application.

## Troubleshooting

If you encounter issues with the application, here are some common troubleshooting steps:

1. **Port Conflicts** - Check if any other application is using the same ports defined in `config.js`.
2. **Missing Dependencies** - Ensure all dependencies are installed using `npm install`.
3. **Proxy Issues** - Verify that the proxy settings in the main server are correctly configured.
4. **WebSocket Connections** - Check if WebSocket connections are being properly established.

## Environment Variables

The following environment variables can be set to customize the application:

- `PORT` - The port for the main server (default: 5000)
- `NODE_ENV` - The environment mode (development, production, or test)
- `DATABASE_URL` - The URL for connecting to the PostgreSQL database

## Future Improvements

1. **Enhanced Authentication** - Implement a unified authentication system across all applications.
2. **Improved Monitoring** - Add more detailed monitoring and logging capabilities.
3. **Automated Deployment** - Create automated deployment scripts for easy updates.
4. **Load Balancing** - Implement load balancing for high-traffic scenarios.

## Contribution Guidelines

When contributing to this project, please:

1. Use the centralized configuration system for any port or path changes.
2. Document all changes thoroughly in code comments and update relevant documentation.
3. Test all changes across all applications to ensure compatibility.
4. Follow the established code style and patterns.