import React, { useEffect } from 'react';
import { useQuantumState } from '@/features/quantum-security';

/**
 * BrandShowcaseFrame Component
 * 
 * This component displays the brand showcase page inside an iframe,
 * integrated with the Aetherion wallet's quantum security features.
 */
const BrandShowcaseFrame: React.FC = () => {
  // Use the quantum security hook to enable secure rendering
  const quantumState = useQuantumState();

  useEffect(() => {
    // Apply quantum security to the iframe connection
    if (quantumState.quantumResistant) {
      console.log("Quantum security enabled for brand showcase iframe");
    }
  }, [quantumState.quantumResistant]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center bg-primary/10 p-2 rounded-t-md">
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
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            State: {quantumState.quantumState}
          </span>
          <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
            Score: {quantumState.score}
          </span>
        </div>
      </div>
      
      <iframe 
        src="/brands-showcase" 
        className="w-full flex-1 border-0"
        title="AI Freedom Trust Brand Ecosystem"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default BrandShowcaseFrame;