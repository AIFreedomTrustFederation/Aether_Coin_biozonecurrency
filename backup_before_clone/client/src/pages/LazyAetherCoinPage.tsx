import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Dynamic import for faster initial load
const AetherCoinNetworkPage = lazy(() => 
  import('./AetherCoinNetworkPage').then(module => ({ 
    default: module.AetherCoinNetworkPage 
  }))
);

// Separate lazy loaded component for the visualization
const LazyMandelbrotVisualization = lazy(() => 
  import('../components/tokenomics/MandelbrotVisualization')
);

export function LazyAetherCoinPage() {
  const [isVisualizationLoaded, setVisualizationLoaded] = useState(false);
  
  // Pre-load the visualization after the page loads
  useEffect(() => {
    // Delay loading to allow page to render first
    const timer = setTimeout(() => {
      import('../components/tokenomics/MandelbrotVisualization')
        .then(() => setVisualizationLoaded(true))
        .catch((err) => console.error('Failed to preload visualization:', err));
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading AetherCoin Network...</p>
        </div>
      </div>
    }>
      <AetherCoinNetworkPage />
    </Suspense>
  );
}

export default LazyAetherCoinPage;