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
      className={cn('gesture-navigation-container relative overflow-hidden', className)}
    >
      {/* Enhanced swipe progress indicator */}
      <SwipeProgressIndicator
        isTransitioning={isTransitioning}
        progress={swipeProgress}
        direction={transitionDirection}
      />

      {/* Navigation dots/indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-40">
        {routes.map((route, index) => (
          <Touchable
            key={route.path}
            className={cn(
              "rounded-full h-2 transition-all duration-300 p-0 flex items-center justify-center",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-gray-500 hover:bg-gray-400 w-2"
            )}
            onClick={() => navigateTo(index)}
            aria-label={`Go to ${route.label}`}
            scale={0.9} // Subtle scale for better feedback
          />
        ))}
      </div>

      {/* Edge navigation buttons - only shown during transitions */}
      {isTransitioning && (
        <>
          {/* Previous page button */}
          {canNavigatePrev && (
            <motion.div 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.8, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Touchable
                className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"
                onClick={navigatePrev}
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Touchable>
            </motion.div>
          )}
          
          {/* Next page button */}
          {canNavigateNext && (
            <motion.div 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.8, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Touchable
                className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"
                onClick={navigateNext}
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Touchable>
            </motion.div>
          )}
        </>
      )}

      {/* Page content with animations */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={location}
          className="w-full h-full"
          initial={getInitialAnimationState()}
          animate="center"
          exit={getExitAnimationState()}
          variants={pageVariants}
          transition={pageTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GestureNavigation;