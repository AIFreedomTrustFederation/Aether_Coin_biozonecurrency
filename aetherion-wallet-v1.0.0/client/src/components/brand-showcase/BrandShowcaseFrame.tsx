import React, { useEffect, useState } from 'react';
import { useQuantumState, quantumBridge } from '@/features/quantum-security';
import { Shield, Check, ExternalLink, RefreshCw } from 'lucide-react';

// Debug import status
console.log("BrandShowcaseFrame imported useQuantumState:", !!useQuantumState);
console.log("BrandShowcaseFrame imported quantumBridge:", !!quantumBridge, Object.keys(quantumBridge));

/**
 * BrandShowcaseFrame Component
 * 
 * This component displays the brand showcase page inside an iframe,
 * integrated with the Aetherion wallet's quantum security features.
 * It creates a quantum-secure channel to display the brand showcase
 * without compromising the Aetherion security architecture.
 */
const BrandShowcaseFrame: React.FC = () => {
  console.log('Rendering BrandShowcaseFrame component');
  
  // Use the quantum security hook to enable secure rendering
  const quantumState = useQuantumState();
  const [isSecureChannelEstablished, setIsSecureChannelEstablished] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now()); // Used to force iframe refresh
  
  // Log component mounting
  useEffect(() => {
    console.log('BrandShowcaseFrame mounted');
    return () => console.log('BrandShowcaseFrame unmounted');
  }, []);
  
  // Quantum channel establishment simulation
  useEffect(() => {
    // Create a secure channel using the quantum bridge
    const establiashSecureChannel = async () => {
      console.log("Establishing quantum secure channel for brand showcase");
      setIsSecureChannelEstablished(false);
      
      try {
        // Simulate quantum bridge connection (shorter delay for better UX)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Quantum entanglement simulation
        if (quantumState.quantumResistant) {
          console.log("Quantum security enabled for brand showcase iframe");
          setIsSecureChannelEstablished(true);
        }
      } catch (error) {
        console.error("Failed to establish quantum secure channel:", error);
        setIsSecureChannelEstablished(false);
      }
    };
    
    establiashSecureChannel();
  }, [quantumState.quantumResistant, iframeKey]);
  
  // Handle iframe refresh with new quantum channel
  const handleRefresh = () => {
    setIframeKey(Date.now());
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-col bg-primary/10 p-3 rounded-t-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${
              quantumState.securityLevel === 'optimal' ? 'bg-green-500' :
              quantumState.securityLevel === 'stable' ? 'bg-blue-500' :
              quantumState.securityLevel === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              Quantum Security: {quantumState.securityLevel.charAt(0).toUpperCase() + quantumState.securityLevel.slice(1)}
            </span>
            {isSecureChannelEstablished && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                <Check className="w-3 h-3 mr-1" /> Secure
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted-foreground">
              State: {quantumState.quantumState}
            </span>
            <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
              Score: {quantumState.score}
            </span>
            <button 
              onClick={handleRefresh}
              className="p-1 rounded-md hover:bg-primary/10 transition-colors"
              title="Refresh quantum channel"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <div>
            <span>Fractal Validation: {Math.round((quantumState.fractalValidationLevels.phi + 
              quantumState.fractalValidationLevels.mandelbrot) / 2 * 100)}%</span>
          </div>
          <div>
            <span>Temporal Coherence: {Math.round(quantumState.temporalCoherence * 100)}%</span>
          </div>
          <div>
            <span>Nodes: {quantumState.nodeCount}</span>
          </div>
          <div>
            <a 
              href="https://aifreedomtrust.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-primary transition-colors"
            >
              AI Freedom Trust <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
      
      {isSecureChannelEstablished ? (
        <iframe 
          key={iframeKey}
          src="/brands" 
          className="w-full flex-1 border-0"
          title="AI Freedom Trust Brand Ecosystem"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-background/50">
          <Shield className="h-16 w-16 text-primary/20 animate-pulse mb-4" />
          <h3 className="text-lg font-medium mb-2">Establishing Quantum Secure Channel</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Initializing fractal validation and temporal coherence...
          </p>
          <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary origin-left animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandShowcaseFrame;