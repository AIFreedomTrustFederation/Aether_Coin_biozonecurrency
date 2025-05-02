# AI Freedom Trust Brand Showcase - Local Environment

## Issues with Replit Development

If you've encountered frustrations with the Replit development environment, you're not alone. The platform has some significant limitations:

1. **Port Restrictions**: Replit enforces strict port configurations that can interfere with custom server setups
2. **Workflow Control**: Limited control over how servers start and communicate
3. **Environment Customization**: Difficult to customize the development environment fully
4. **Proxying Limitations**: Challenges with proxying between different services

## Project Structure

- `server-local.js` - Simplified Express API server for local development
- `client/` - React frontend application
- `start-local.js` - Concurrent starter for both servers
- `routes-simple.js` - API routes definition

## Getting Started Locally

### Prerequisites
- Node.js v16+
- npm 7+

### Step 1: Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Start the Development Servers
You have two options:

#### Option A: Run servers separately (recommended for debugging)
In one terminal:
```bash
node server-local.js
```

In another terminal:
```bash
cd client
npm run dev
```

#### Option B: Run everything concurrently
```bash
node start-local.js
```

### Step 3: Access the Application
- API Server: http://localhost:5000
- React Application: http://localhost:5173
- API Endpoints:
  - http://localhost:5000/api/brands
  - http://localhost:5000/api/brands/:slug

## Troubleshooting Local Builds

### "Could not resolve entry module 'index.html'" Error
This occurs when Vite can't find the entry point. Make sure:

1. You have a proper `client/index.html` with a `<div id="root"></div>` element
2. You're running the React app from the client directory
3. Your `client/vite.config.js` is correctly configured

### API Connectivity Issues
If your React app can't connect to the API:

1. Check that the API server is running
2. Verify the proxy settings in `client/vite.config.js`
3. Make sure CORS is enabled in the server

## Building for Production

```bash
# Build the React app
cd client
npm run build
cd ..

# Serve the built app
node server-local.js
```

## Deployment Options

After building locally, you have several deployment options that offer more flexibility than Replit:

1. **GitHub Pages** - For static frontend only
2. **Vercel** - For React frontend with serverless API functions
3. **Netlify** - Similar to Vercel with easy configuration
4. **Railway** - For full-stack apps with both frontend and API
5. **DigitalOcean App Platform** - Simple deployment of full-stack Node.js apps
6. **Traditional Hosting** - Deploy to your own server or VPS

## Need Help?

If you need assistance with setting up your local environment or deploying to a different platform, feel free to reach out for support.