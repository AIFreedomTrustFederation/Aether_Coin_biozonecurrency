import { useState, useEffect, RefObject } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface GestureOptions {
  threshold?: number;  // Minimum distance in pixels to be considered a swipe
  velocityThreshold?: number;  // Minimum velocity to be considered a swipe
  preventDefaultTouchmoveEvent?: boolean;
  preventDefaultTouchStartEvent?: boolean;
}

interface GestureState {
  direction: SwipeDirection;
  distance: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
  isSwipeActive: boolean;
  progress: number; // 0 to 1 value indicating the progress of the swipe
}

interface GestureHandlers {
  onSwipeStart?: (state: GestureState) => void;
  onSwipeMove?: (state: GestureState) => void;
  onSwipeEnd?: (state: GestureState) => void;
  onSwipeLeft?: (state: GestureState) => void;
  onSwipeRight?: (state: GestureState) => void;
  onSwipeUp?: (state: GestureState) => void;
  onSwipeDown?: (state: GestureState) => void;
}

export const useGesture = (
  ref: RefObject<HTMLElement>,
  handlers: GestureHandlers = {},
  options: GestureOptions = {}
) => {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventDefaultTouchmoveEvent = false,
    preventDefaultTouchStartEvent = false,
  } = options;

  const [state, setState] = useState<GestureState>({
    direction: null,
    distance: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    isSwipeActive: false,
    progress: 0
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX: number;
    let startY: number;
    let startTime: number;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (preventDefaultTouchStartEvent) {
        e.preventDefault();
      }

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isSwiping = true;

      const initialState: GestureState = {
        direction: null,
        distance: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        isSwipeActive: true,
        progress: 0
      };

      setState(initialState);
      handlers.onSwipeStart?.(initialState);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;

      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const deltaX = x - startX;
      const deltaY = y - startY;
      const timeElapsed = Date.now() - startTime;

      const velocityX = Math.abs(deltaX) / timeElapsed;
      const velocityY = Math.abs(deltaY) / timeElapsed;

      // Determine the primary direction of the swipe
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      let direction: SwipeDirection = null;
      let progressValue = 0;

      if (absX > absY) {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left';
        progressValue = Math.min(Math.abs(deltaX) / threshold, 1);
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up';
        progressValue = Math.min(Math.abs(deltaY) / threshold, 1);
      }

      const currentState: GestureState = {
        direction,
        distance: { x: deltaX, y: deltaY },
        velocity: { x: velocityX, y: velocityY },
        isSwipeActive: true,
        progress: progressValue
      };

      setState(currentState);
      handlers.onSwipeMove?.(currentState);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping) return;
      isSwiping = false;

      const endTime = Date.now();
      const timeElapsed = endTime - startTime;
      const velocityX = Math.abs(state.distance.x) / timeElapsed;
      const velocityY = Math.abs(state.distance.y) / timeElapsed;

      const finalState: GestureState = {
        ...state,
        velocity: { x: velocityX, y: velocityY },
        isSwipeActive: false
      };

      // Check if it was a valid swipe based on distance threshold and velocity
      const isValidSwipe = 
        (Math.abs(state.distance.x) >= threshold || Math.abs(state.distance.y) >= threshold) &&
        (velocityX >= velocityThreshold || velocityY >= velocityThreshold);

      if (isValidSwipe && state.direction) {
        // Call the specific direction handler
        switch (state.direction) {
          case 'left':
            handlers.onSwipeLeft?.(finalState);
            break;
          case 'right':
            handlers.onSwipeRight?.(finalState);
            break;
          case 'up':
            handlers.onSwipeUp?.(finalState);
            break;
          case 'down':
            handlers.onSwipeDown?.(finalState);
            break;
        }
      }

      setState({
        ...finalState,
        progress: isValidSwipe ? 1 : 0,
      });
      handlers.onSwipeEnd?.(finalState);
    };

    const handleTouchCancel = () => {
      isSwiping = false;
      
      setState({
        ...state,
        isSwipeActive: false,
        progress: 0
      });
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultTouchStartEvent });
    el.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchCancel);

    // Cleanup
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [
    ref, 
    handlers.onSwipeStart, 
    handlers.onSwipeMove, 
    handlers.onSwipeEnd, 
    handlers.onSwipeLeft, 
    handlers.onSwipeRight, 
    handlers.onSwipeUp, 
    handlers.onSwipeDown, 
    threshold,
    velocityThreshold,
    preventDefaultTouchmoveEvent,
    preventDefaultTouchStartEvent
  ]);

  return state;
};