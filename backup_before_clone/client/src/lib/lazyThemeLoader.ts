/**
 * Utility for lazily loading theme styles and effects
 */

// Track loaded themes to avoid duplicate loading
const loadedThemes: Record<string, boolean> = {};

/**
 * Dynamically load theme CSS
 * @param themeName The name/identifier of the theme to load
 * @returns Promise that resolves when the theme is loaded
 */
export const loadThemeStyles = async (themeName: string): Promise<void> => {
  // If already loaded, don't reload
  if (loadedThemes[themeName]) {
    return;
  }
  
  try {
    // We'll use different approaches based on theme type
    switch(themeName) {
      case 'neon-base':
        // Base neon effects (loaded by default now)
        loadedThemes[themeName] = true;
        break;
        
      case 'neon-advanced':
        // Advanced neon effects (glows, animations, etc.)
        await import('../styles/neon-advanced.css');
        loadedThemes[themeName] = true;
        break;
        
      case 'neon-animations':
        // Heavy animations for neon effects
        await import('../styles/neon-animations.css');
        loadedThemes[themeName] = true;
        break;
        
      default:
        console.warn(`Unknown theme: ${themeName}`);
    }
  } catch (error) {
    console.error(`Failed to load theme: ${themeName}`, error);
  }
};

/**
 * Get necessary theme chunks based on the selected theme
 * @param themeId The theme ID from the theme context
 * @returns Array of theme chunk names to load
 */
export const getThemeChunks = (themeId: string): string[] => {
  // Different themes require different chunks
  if (themeId.startsWith('neon-')) {
    return ['neon-base', 'neon-advanced'];
  }
  
  // Default theme needs only basic styling
  return ['neon-base'];
};

/**
 * Initialize essential theme parts immediately,
 * defer loading of non-critical theme components
 */
export const initializeThemeLoader = (): void => {
  // Register theme loaded observer
  if ('requestIdleCallback' in window) {
    // Load advanced theme features when browser is idle
    window.requestIdleCallback(() => {
      loadThemeStyles('neon-advanced');
    });
    
    // After everything else is loaded, consider animations
    window.addEventListener('load', () => {
      window.requestIdleCallback(() => {
        loadThemeStyles('neon-animations');
      }, { timeout: 2000 }); // 2 second timeout as fallback
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      loadThemeStyles('neon-advanced');
      
      // After a longer delay, load animations
      setTimeout(() => {
        loadThemeStyles('neon-animations');
      }, 2000);
    }, 1000);
  }
};