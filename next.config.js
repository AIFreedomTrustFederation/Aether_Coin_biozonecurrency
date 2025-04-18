/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for improved error handling
  reactStrictMode: true,
  
  // Optimize images with Next.js Image component
  images: {
    domains: ['localhost'],
  },
  
  // Configure environment variables that should be available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  
  // Configure server-side security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Prevent pages from being embedded in iframes
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enable strict content security policy
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' wss: ws:; img-src 'self' data:; style-src 'self' 'unsafe-inline';"
          },
          // Disable caching for API routes
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  
  // Configure server configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // Configure WebSocket server in development mode
  webpack: (config, { isServer, dev }) => {
    // Optimize in production build
    if (!dev) {
      config.optimization.minimize = true;
    }
    
    return config;
  },
};

module.exports = nextConfig;