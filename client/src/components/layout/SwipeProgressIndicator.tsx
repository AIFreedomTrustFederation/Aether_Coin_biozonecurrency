import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SwipeDirection } from '@/hooks/use-gesture';
import { cn } from '@/lib/utils';

interface SwipeProgressIndicatorProps {
  isTransitioning: boolean;
  progress: number;
  direction: SwipeDirection;
  className?: string;
}

const SwipeProgressIndicator: React.FC<SwipeProgressIndicatorProps> = ({
  isTransitioning,
  progress,
  direction,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Add a subtle pulse effect to the indicator
  useEffect(() => {
    if (!isTransitioning || !progressRef.current) return;
    
    // Add a pulse animation class
    progressRef.current.classList.add('pulse-animation');
    
    // Clean up
    return () => {
      if (progressRef.current) {
        progressRef.current.classList.remove('pulse-animation');
      }
    };
  }, [isTransitioning]);

  if (!isTransitioning) return null;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute top-0 left-0 w-full h-1 bg-gray-800 z-50 overflow-hidden",
        className
      )}
    >
      {/* Main progress bar */}
      <motion.div 
        ref={progressRef}
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ 
          width: `${progress * 100}%`,
          x: [0, 2, -2, 0], // Subtle wiggle to indicate activity
        }}
        transition={{ 
          width: { duration: 0.1 },
          x: { repeat: Infinity, duration: 0.5 }
        }}
        style={{ transformOrigin: direction === 'left' ? 'left' : 'right' }}
      />
      
      {/* Shine effect - only shown for larger swipes */}
      {progress > 0.3 && (
        <motion.div
          className="absolute top-0 h-full w-10 bg-white/30 skew-x-20"
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            repeatDelay: 0.5
          }}
        />
      )}
      
      {/* Pulse indicators at critical thresholds */}
      {progress > 0.5 && (
        <motion.div
          className="absolute top-0 h-full w-full bg-primary/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1,
          }}
        />
      )}
    </div>
  );
};

export default SwipeProgressIndicator;