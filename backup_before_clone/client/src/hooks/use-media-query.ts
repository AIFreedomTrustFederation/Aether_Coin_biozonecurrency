import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using media queries
 * @param query The media query to check
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      
      // Set initial value
      setMatches(mediaQuery.matches);

      // Create event listener function
      const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
      
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