import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { SwipeDirection } from '@/hooks/use-gesture';

interface GestureContextProps {
  isTransitioning: boolean;
  transitionDirection: SwipeDirection;
  swipeProgress: number;
  lastSwipeDirection: SwipeDirection;
  gestureEnabled: boolean;
  startTransition: (direction: SwipeDirection) => void;
  completeTransition: () => void;
  cancelTransition: () => void;
  updateSwipeProgress: (progress: number) => void;
  setLastSwipeDirection: (direction: SwipeDirection) => void;
  enableGestures: () => void;
  disableGestures: () => void;
}

const GestureContext = createContext<GestureContextProps | undefined>(undefined);

export const useGestureContext = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestureContext must be used within a GestureProvider');
  }
  return context;
};

interface GestureProviderProps {
  children: ReactNode;
}

export const GestureProvider: React.FC<GestureProviderProps> = ({ children }) => {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<SwipeDirection>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<SwipeDirection>(null);
  const [gestureEnabled, setGestureEnabled] = useState(true);

  const startTransition = useCallback((direction: SwipeDirection) => {
    setIsTransitioning(true);
    setTransitionDirection(direction);
  }, []);

  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionDirection(null);
    setSwipeProgress(0);
  }, []);

  const cancelTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionDirection(null);
    setSwipeProgress(0);
  }, []);

  const updateSwipeProgress = useCallback((progress: number) => {
    setSwipeProgress(progress);
  }, []);

  const enableGestures = useCallback(() => {
    setGestureEnabled(true);
  }, []);

  const disableGestures = useCallback(() => {
    setGestureEnabled(false);
  }, []);

  // Reset transition state when location changes
  React.useEffect(() => {
    completeTransition();
  }, [location, completeTransition]);

  const value = {
    isTransitioning,
    transitionDirection,
    swipeProgress,
    lastSwipeDirection,
    gestureEnabled,
    startTransition,
    completeTransition,
    cancelTransition,
    updateSwipeProgress,
    setLastSwipeDirection,
    enableGestures,
    disableGestures,
  };

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
};