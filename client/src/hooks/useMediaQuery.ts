import { useState, useEffect } from "react";

/**
 * Custom hook to detect if a media query matches
 * 
 * @param query CSS media query string
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state if window is available
  // Otherwise default to false for SSR
  const getMatches = (): boolean => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  useEffect(() => {
    // Handle window resize and update match state
    function handleChange() {
      setMatches(getMatches());
    }

    // Get media match object
    const matchMedia = window.matchMedia(query);

    // Initial check
    handleChange();

    // Listen for changes
    if (matchMedia.addEventListener) {
      // Modern browsers
      matchMedia.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      matchMedia.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener("change", handleChange);
      } else {
        matchMedia.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}