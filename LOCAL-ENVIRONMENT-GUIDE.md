# AI Freedom Trust Brand Showcase - Local Environment Guide

This guide will help you set up and run the AI Freedom Trust Brand Showcase in a local development environment.

## Project Structure

The project consists of two main components:
1. **API Server**: An Express.js server that provides brand data and other API endpoints
2. **React Frontend**: A Vite-powered React application for displaying the brands

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- npm 7+ installed

### Installation Steps

1. Clone the repository to your local machine
   ```
   git clone [your-repo-url] aifreedomtrust-showcase
   cd aifreedomtrust-showcase
   ```

2. Install dependencies
   ```
   npm install
   ```

### Running the Application

#### Option 1: Two-Terminal Setup (Recommended)

This approach gives you more visibility into both server and client logs.

**Terminal 1** - Start the API server:
```
node server-local.js
```

**Terminal 2** - Start the React frontend:
```
cd client
npm run dev
```

#### Option 2: Combined Server (Single Terminal)

This starts both the server and client from a single command:
```
node server-local.js
```

### Accessing the Application

- **API Landing Page**: http://localhost:5000/
- **API Test Endpoint**: http://localhost:5000/api/health
- **Brand API**: http://localhost:5000/api/brands
- **React Application**: http://localhost:5173/

## Development Notes

### Server Configuration
- The API server runs on port 5000
- The React development server runs on port 5173
- API routes are defined in `api-modules.js` which follows a modular design pattern
- Brand-specific APIs use a consistent BrandsApi class pattern

### Vite Configuration
- Vite is configured to proxy API requests from the React app to the API server
- The `client/vite.config.js` file contains the configuration for the React app
- When building for production, run `cd client && npm run build`

### WebSocket Support
- WebSocket server runs on ws://localhost:5000/ws
- Can be used for real-time features

## Troubleshooting

### "Could not resolve entry module" Error
If you encounter this error when starting the React app:

1. Make sure you're running the React app from the `client` directory
2. Check that `client/index.html` exists and is properly formatted
3. Verify your `client/vite.config.js` has the correct configuration

### API Connection Issues
If the React app can't connect to the API:

1. Ensure the API server is running on port 5000
2. Check that the proxy settings in `client/vite.config.js` are correct
3. Verify that CORS is properly configured in the server

## Migration from Replit

If you're migrating from Replit to a local environment:

1. Use `server-local.js` instead of `server.js` as your entry point
2. Make sure all path references are correct for your local file system
3. Check for any Replit-specific environment variables that might be missing

## Domain Structure

Each brand in the showcase has its own dedicated subdomain following the pattern:
- `https://[brand-slug].aifreedomtrust.com`

For example:
- Quantum Domain: https://quantumdomain.aifreedomtrust.com
- Zero Trust Framework: https://zerotrust.aifreedomtrust.com
- Fractal Network: https://fractalnetwork.aifreedomtrust.com
- AetherMesh: https://aethermesh.aifreedomtrust.com
- Fractal Vault: https://fractalvault.aifreedomtrust.com
- Quantum Guard: https://quantumguard.aifreedomtrust.com

The main showcase site is accessible at:
- https://ai.aifreedomtrust.com

## OpenAI API Integration

The application uses OpenAI's API for advanced AI-powered features:

1. **Environment Setup**: Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. **Available AI Features**:
   - Brand descriptions enhancement
   - Technology trend analysis
   - Feature recommendations
   - Product documentation generation

3. **Error Handling**:
   - The application provides informative error messages if the OpenAI API is unavailable
   - Fallback to pre-generated content when necessary, clearly labeled as such