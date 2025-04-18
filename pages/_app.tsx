import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

// WebSocket client initialization (will be moved from the Vite project)
import webSocketClient from '../src/core/mysterion/websocket-client';

// Application wrapper component
function AetherionApp({ Component, pageProps }: AppProps) {
  // Initialize WebSocket connection on app startup
  useEffect(() => {
    // Connect to WebSocket server
    webSocketClient.connect().catch(error => {
      console.error('Failed to connect to WebSocket server:', error);
    });
    
    // Clean up on unmount
    return () => {
      webSocketClient.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Aetherion - Quantum-Resistant Blockchain Ecosystem" />
        <meta name="keywords" content="Aetherion, Blockchain, Quantum-Resistant, FractalCoin, AIcoin" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' wss: ws:; img-src 'self' data:; style-src 'self' 'unsafe-inline';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        
        <title>Aetherion Ecosystem</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Render the current page */}
      <Component {...pageProps} />
    </>
  );
}

export default AetherionApp;