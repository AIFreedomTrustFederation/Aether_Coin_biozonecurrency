import React, { useRef, useState, useEffect, PropsWithChildren } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Touchable } from '@/components/ui/touchable';
import { useGestureContext } from '@/contexts/gesture-context';
import { useGestureNavigation } from '@/hooks/use-gesture-navigation';
import SwipeProgressIndicator from './SwipeProgressIndicator';

// Define the animation variants for page transitions
const pageVariants = {
  // Coming from the right (for previous page)
  enterFromRight: {
    x: '100%',
    opacity: 0,
  },
  // Coming from the left (for next page)
  enterFromLeft: {
    x: '-100%',
    opacity: 0,
  },
  // Center position (current view)
  center: {
    x: 0,
    opacity: 1,
  },
  // Exiting to the left (when going to next page)
  exitToLeft: {
    x: '-100%',
    opacity: 0,
  },
  // Exiting to the right (when going to previous page)
  exitToRight: {
    x: '100%',
    opacity: 0,
  },
};

// Transition configuration for smooth animations
const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

interface GestureNavigationProps extends PropsWithChildren {
  className?: string;
  routes: {
    path: string;
    label: string;
  }[];
}

const GestureNavigation: React.FC<GestureNavigationProps> = ({
  children,
  className,
  routes,
}) => {
  const [location] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the gesture context
  const {
    isTransitioning,
    transitionDirection,
    swipeProgress,
  } = useGestureContext();

  // Use our custom gesture navigation hook
  const {
    currentIndex,
    navigateTo,
    canNavigateNext,
    canNavigatePrev,
    navigateNext,
    navigatePrev
  } = useGestureNavigation(routes, containerRef);

  // Calculate the initial animation state based on navigation direction
  const getInitialAnimationState = () => {
    return transitionDirection === 'right' ? 'enterFromLeft' : 'enterFromRight';
  };

  // Calculate the exit animation state based on navigation direction
  const getExitAnimationState = () => {
    return transitionDirection === 'right' ? 'exitToRight' : 'exitToLeft';
  };

  return (
    <div
      ref={containerRef}
      className={cn('gesture-navigation-container relative h-full w-full bg-background', className)}
    >
      {/* Page content */}
      <div className="w-full h-full bg-background">
        {children}
      </div>
      
      {/* Enhanced swipe progress indicator */}
      <SwipeProgressIndicator
        isTransitioning={isTransitioning}
        progress={swipeProgress}
        direction={transitionDirection}
      />

      {/* Navigation dots/indicator - simplified */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {routes.map((route, index) => (
          <button
            key={route.path}
            className={cn(
              "rounded-full h-2 transition-all duration-300 p-0",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-gray-500 hover:bg-gray-400 w-2"
            )}
            onClick={() => navigateTo(index)}
            aria-label={`Go to ${route.label}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GestureNavigation;