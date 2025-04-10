import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/progressBars.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
