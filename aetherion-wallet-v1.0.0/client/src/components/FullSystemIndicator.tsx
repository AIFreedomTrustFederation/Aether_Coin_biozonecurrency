import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * FullSystemIndicator - Visual indicator that shows the current mode
 * When the full system is enabled, shows a green shield icon
 * When only CodeStar Platform is running, shows a warning icon
 */
export const FullSystemIndicator: React.FC = () => {
  const [isFullSystem, setIsFullSystem] = useState<boolean>(false);
  const [securityLevel, setSecurityLevel] = useState<string>('standard');

  useEffect(() => {
    // Check if the application is running in full system mode
    if (typeof window !== 'undefined') {
      setIsFullSystem(Boolean(window.AETHERION_FULL_SYSTEM));
      setSecurityLevel(window.AETHERION_SECURITY_LEVEL || 'standard');
      
      // Add event listener for system mode changes
      const handleSystemModeChange = () => {
        setIsFullSystem(Boolean(window.AETHERION_FULL_SYSTEM));
        setSecurityLevel(window.AETHERION_SECURITY_LEVEL || 'standard');
      };
      
      window.addEventListener('aetherion:fullSystemEnabled', handleSystemModeChange);
      
      return () => {
        window.removeEventListener('aetherion:fullSystemEnabled', handleSystemModeChange);
      };
    }
  }, []);

  // Force the full system mode if not already enabled
  const enableFullSystem = () => {
    if (!isFullSystem && typeof window !== 'undefined') {
      window.AETHERION_FULL_SYSTEM = true;
      window.AETHERION_SECURITY_LEVEL = 'optimal';
      window.APP_MODE = 'full';
      
      // Dispatch event to notify other components
      const event = new CustomEvent('aetherion:fullSystemEnabled');
      window.dispatchEvent(event);
      
      // Update local state
      setIsFullSystem(true);
      setSecurityLevel('optimal');
      
      // Reload the page to ensure all components are updated
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 ${!isFullSystem ? 'text-yellow-500' : 'text-green-500'}`}
            onClick={!isFullSystem ? enableFullSystem : undefined}
            data-aetherion-wallet="true"
          >
            {isFullSystem ? (
              <Shield className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="hidden md:inline text-xs">
              {isFullSystem ? 'Full System' : 'Partial Mode'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">
              {isFullSystem 
                ? 'Aetherion Full System Enabled' 
                : 'Warning: Only CodeStar Platform Mode'}
            </p>
            <p className="text-xs mt-1">
              {isFullSystem 
                ? `Security Level: ${securityLevel}` 
                : 'Click to enable full system mode'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FullSystemIndicator;