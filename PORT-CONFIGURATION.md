# Aetherion Ecosystem Port Configuration

This document outlines the port configuration for the Aetherion Ecosystem, including the Brand Showcase, Aetherion Wallet, and other applications.

## Default Port Configuration

The following ports are used by default:

| Service | Default Port | Description |
|---------|--------------|-------------|
| Main Ecosystem Server | 5000 | The main proxy server that routes requests to individual applications |
| Brand Showcase Vite | 5173 | Vite development server for the Brand Showcase |
| Aetherion Wallet API | 5174 | API server for the Aetherion Wallet |
| Third Application | 5175 | Server for the third application in the ecosystem |
| Aetherion Wallet Vite | 5176 | Vite development server for the Aetherion Wallet |

## Automatic Port Conflict Resolution

The combined server now includes automatic port conflict resolution. If the default port (5000) is already in use, the system will automatically try the next available port (5001, 5002, etc.).

This feature ensures that the server can start even if there are other services using the default ports. The console will display the actual port that was selected.

## Accessing the Applications

You can access the applications through the main server:

- Main Page: `http://localhost:<port>/`
- Brand Showcase: `http://localhost:<port>/brands`
- Aetherion Wallet: `http://localhost:<port>/wallet`
- Third Application: `http://localhost:<port>/app3`
- Status Check: `http://localhost:<port>/status`
- API Health: `http://localhost:<port>/api/health`
- WebSocket Server: `ws://localhost:<port>/ws`

Where `<port>` is the actual port the server is running on (shown in console output).

## Replit Environment

In the Replit environment, the applications are available at:

- Main URL: `https://<repl-slug>.<repl-owner>.repl.co/`
- Brand Showcase: `https://<repl-slug>.<repl-owner>.repl.co/brands`
- Aetherion Wallet: `https://<repl-slug>.<repl-owner>.repl.co/wallet`
- Third Application: `https://<repl-slug>.<repl-owner>.repl.co/app3`

## Configuration File

The port configuration is centralized in the `config.js` file. If you need to change the port configuration, modify this file rather than hardcoding port numbers in individual files.

```javascript
// Example from config.js
const config = {
  mainServer: {
    port: 5000,
    basePath: '/',
    name: 'Aetherion Ecosystem Server'
  },
  // Other configurations...
};
```