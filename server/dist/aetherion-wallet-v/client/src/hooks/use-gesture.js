"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGesture = void 0;
const react_1 = require("react");
const useGesture = (ref, handlers = {}, options = {}) => {
    const { threshold = 50, velocityThreshold = 0.3, preventDefaultTouchmoveEvent = false, preventDefaultTouchStartEvent = false, } = options;
    const [state, setState] = (0, react_1.useState)({
        direction: null,
        distance: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        isSwipeActive: false,
        progress: 0
    });
    (0, react_1.useEffect)(() => {
        const el = ref.current;
        if (!el)
            return;
        let startX;
        let startY;
        let startTime;
        let isSwiping = false;
        const handleTouchStart = (e) => {
            if (preventDefaultTouchStartEvent) {
                e.preventDefault();
            }
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            isSwiping = true;
            const initialState = {
                direction: null,
                distance: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                isSwipeActive: true,
                progress: 0
            };
            setState(initialState);
            handlers.onSwipeStart?.(initialState);
        };
        const handleTouchMove = (e) => {
            if (!isSwiping)
                return;
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
            let direction = null;
            let progressValue = 0;
            if (absX > absY) {
                // Horizontal swipe
                direction = deltaX > 0 ? 'right' : 'left';
                progressValue = Math.min(Math.abs(deltaX) / threshold, 1);
            }
            else {
                // Vertical swipe
                direction = deltaY > 0 ? 'down' : 'up';
                progressValue = Math.min(Math.abs(deltaY) / threshold, 1);
            }
            const currentState = {
                direction,
                distance: { x: deltaX, y: deltaY },
                velocity: { x: velocityX, y: velocityY },
                isSwipeActive: true,
                progress: progressValue
            };
            setState(currentState);
            handlers.onSwipeMove?.(currentState);
        };
        const handleTouchEnd = (e) => {
            if (!isSwiping)
                return;
            isSwiping = false;
            const endTime = Date.now();
            const timeElapsed = endTime - startTime;
            const velocityX = Math.abs(state.distance.x) / timeElapsed;
            const velocityY = Math.abs(state.distance.y) / timeElapsed;
            const finalState = {
                ...state,
                velocity: { x: velocityX, y: velocityY },
                isSwipeActive: false
            };
            // Check if it was a valid swipe based on distance threshold and velocity
            const isValidSwipe = (Math.abs(state.distance.x) >= threshold || Math.abs(state.distance.y) >= threshold) &&
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
exports.useGesture = useGesture;
