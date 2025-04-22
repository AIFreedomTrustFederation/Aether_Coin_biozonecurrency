"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMediaQuery = useMediaQuery;
const react_1 = require("react");
/**
 * Custom hook for responsive design using media queries
 * @param query The media query to check
 * @returns boolean indicating if the media query matches
 */
function useMediaQuery(query) {
    const [matches, setMatches] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Check if window is available (client-side)
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia(query);
            // Set initial value
            setMatches(mediaQuery.matches);
            // Create event listener function
            const handler = (event) => setMatches(event.matches);
            // Add event listener
            mediaQuery.addEventListener('change', handler);
            // Clean up
            return () => mediaQuery.removeEventListener('change', handler);
        }
        // Default return for SSR
        return undefined;
    }, [query]);
    return matches;
}
