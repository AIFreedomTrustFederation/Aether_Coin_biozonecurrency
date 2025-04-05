import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';
import { useLiveMode } from '../../contexts/LiveModeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LiveModeIndicatorProps {
  className?: string;
  variant?: 'badge' | 'button' | 'text';
  showToggle?: boolean;
}

export function LiveModeIndicator({ 
  className = '', 
  variant = 'badge',
  showToggle = false
}: LiveModeIndicatorProps) {
  const { isLiveMode, toggleLiveMode } = useLiveMode();

  // Button variant
  if (variant === 'button') {
    return (
      <Button
        variant={isLiveMode ? "default" : "outline"}
        size="sm"
        className={`gap-2 ${className}`}
        onClick={showToggle ? toggleLiveMode : undefined}
      >
        {isLiveMode ? (
          <>
            <Zap className="h-4 w-4" />
            <span>Live Mode</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>Test Mode</span>
          </>
        )}
      </Button>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <Badge 
        variant={isLiveMode ? "default" : "outline"} 
        className={`gap-1 cursor-${showToggle ? 'pointer' : 'default'} ${className}`}
        onClick={showToggle ? toggleLiveMode : undefined}
      >
        {isLiveMode ? (
          <>
            <Zap className="h-3 w-3" />
            <span>Live</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>Test</span>
          </>
        )}
      </Badge>
    );
  }

  // Text variant
  return (
    <div 
      className={`flex items-center gap-1 text-sm ${className} cursor-${showToggle ? 'pointer' : 'default'}`}
      onClick={showToggle ? toggleLiveMode : undefined}
    >
      {isLiveMode ? (
        <>
          <Zap className="h-4 w-4 text-green-500" />
          <span className="text-green-500 font-medium">Live Mode</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-amber-500 font-medium">Test Mode</span>
        </>
      )}
    </div>
  );
}