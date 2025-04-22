"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGestureNavigation = useGestureNavigation;
const react_1 = require("react");
const wouter_1 = require("wouter");
const use_gesture_1 = require("./use-gesture");
const gesture_context_1 = require("@/contexts/gesture-context");
function useGestureNavigation(routes, containerRef) {
    const [location, navigate] = (0, wouter_1.useLocation)();
    const { isTransitioning, gestureEnabled, startTransition, completeTransition, cancelTransition, updateSwipeProgress, setLastSwipeDirection } = (0, gesture_context_1.useGestureContext)();
    // Find current route index
    const currentIndex = routes.findIndex(route => route.path === location);
    const previousIndexRef = (0, react_1.useRef)(currentIndex);
    // Update previous index when location changes
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            previousIndexRef.current = currentIndex;
        }, 100);
        return () => clearTimeout(timer);
    }, [currentIndex]);
    // Handle navigation based on swipe direction
    const handleNavigation = (direction) => {
        if (!direction || !['left', 'right'].includes(direction))
            return false;
        let nextIndex;
        if (direction === 'left' && currentIndex < routes.length - 1) {
            // Swiping left means going to the next page (right in array order)
            nextIndex = currentIndex + 1;
        }
        else if (direction === 'right' && currentIndex > 0) {
            // Swiping right means going to the previous page (left in array order)
            nextIndex = currentIndex - 1;
        }
        else {
            return false; // Invalid navigation
        }
        if (nextIndex !== undefined && routes[nextIndex]) {
            setLastSwipeDirection(direction);
            navigate(routes[nextIndex].path);
            return true;
        }
        return false;
    };
    // Get haptic strength based on swipe progress and available directions
    const getHapticStrength = (progress, direction) => {
        // If we can't navigate in the swipe direction, return 0 (no haptic)
        if (direction === 'left' && currentIndex >= routes.length - 1)
            return 0;
        if (direction === 'right' && currentIndex <= 0)
            return 0;
        // Scale haptic feedback based on progress
        if (progress > 0.8)
            return 1;
        if (progress > 0.5)
            return 0.7;
        if (progress > 0.2)
            return 0.3;
        return 0.1;
    };
    // Setup gesture handlers
    (0, use_gesture_1.useGesture)(containerRef, {
        onSwipeStart: (state) => {
            if (!gestureEnabled)
                return;
            // Only process horizontal swipes for navigation
            if (state.direction === 'left' || state.direction === 'right') {
                startTransition(state.direction);
            }
        },
        onSwipeMove: (state) => {
            if (!gestureEnabled || !isTransitioning)
                return;
            // Only process horizontal swipes
            if (state.direction === 'left' || state.direction === 'right') {
                updateSwipeProgress(state.progress);
                // Here you could also add haptic feedback based on progress
                const hapticStrength = getHapticStrength(state.progress, state.direction);
                // Simulate haptic feedback by logging to console
                if (hapticStrength > 0.5 && state.progress > 0.5) {
                    // Only log haptic feedback at key thresholds
                    console.log(`Haptic feedback: ${hapticStrength.toFixed(2)}`);
                }
            }
        },
        onSwipeEnd: (state) => {
            if (!gestureEnabled || !isTransitioning)
                return;
            if ((state.direction === 'left' || state.direction === 'right')) {
                // Complete the gesture and navigate if progress is substantial
                if (state.progress > 0.5) {
                    const navigated = handleNavigation(state.direction);
                    if (navigated) {
                        completeTransition();
                    }
                    else {
                        cancelTransition();
                    }
                }
                else {
                    // Cancel the gesture if not enough progress
                    cancelTransition();
                }
            }
            else {
                cancelTransition();
            }
        },
    }, {
        threshold: 50,
        velocityThreshold: 0.3,
        preventDefaultTouchmoveEvent: true
    });
    return {
        currentIndex,
        previousIndex: previousIndexRef.current,
        navigateTo: (index) => {
            if (index >= 0 && index < routes.length) {
                const direction = index > currentIndex ? 'left' : 'right';
                setLastSwipeDirection(direction);
                navigate(routes[index].path);
                return true;
            }
            return false;
        },
        canNavigateNext: currentIndex < routes.length - 1,
        canNavigatePrev: currentIndex > 0,
        navigateNext: () => handleNavigation('left'),
        navigatePrev: () => handleNavigation('right'),
    };
}
