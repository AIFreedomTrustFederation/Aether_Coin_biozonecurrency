import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/progressBars.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// TypeScript declarations for global window properties
declare global {
  interface Window {
    AETHERION_FULL_SYSTEM: boolean;
    AETHERION_SECURITY_LEVEL: string;
    APP_MODE: string;
  }
}

// Import mode configuration
import './mode';

// Import debug utility
import { initLoadDebug } from './loadDebug';

// Set global flags for the application mode
// This enables the full Aetherion Wallet instead of just the CodeStar Platform
(window as any).AETHERION_FULL_SYSTEM = true;
(window as any).AETHERION_SECURITY_LEVEL = 'optimal';
(window as any).APP_MODE = 'full';
console.log('Aetherion Full System Mode: Enabled [main.tsx]');

// Initialize debug logging
initLoadDebug();
console.log('Aetherion Full System Mode enabled explicitly in main.tsx');

// Import the Aetherion provider to initialize window.aetherion
import './core/blockchain/AetherionProvider';

// Initialize theme system
import { initializeThemeListener } from './lib/theme';
initializeThemeListener();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
