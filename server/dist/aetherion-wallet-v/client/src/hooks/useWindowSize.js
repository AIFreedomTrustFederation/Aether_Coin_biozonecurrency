"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWindowSize = useWindowSize;
const react_1 = require("react");
/**
 * Custom hook to track window dimensions
 * Used for responsive components like confetti that need to cover the full viewport
 */
function useWindowSize() {
    // Initialize with default values for SSR
    const [windowSize, setWindowSize] = (0, react_1.useState)({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });
    (0, react_1.useEffect)(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            return;
        }
        // Function to update the state
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        // Set initial window size
        handleResize();
        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
        // Clean up
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowSize;
}
