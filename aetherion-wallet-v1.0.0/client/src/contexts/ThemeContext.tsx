import React, { createContext, useContext, useEffect } from 'react';
import { Theme, useThemeStore } from '@/lib/theme';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme, availableThemes } = useThemeStore();

  // Apply theme whenever it changes
  useEffect(() => {
    // Remove previous theme classes
    document.documentElement.classList.remove('light', 'dark');
    
    // Add new theme class
    if (theme.mode === 'system') {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
      
      // Listen for changes in system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      document.documentElement.classList.add(theme.mode);
    }
    
    // Set CSS variables for the theme
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-hover', adjustColor(theme.primary, -20));
    document.documentElement.style.setProperty('--primary-foreground', getContrastColor(theme.primary));
    document.documentElement.style.setProperty('--border-radius', `${theme.radius}rem`);
    
    // Set RGB variant of primary color for neon effects
    const rgbColor = hexToRgb(theme.primary);
    if (rgbColor) {
      document.documentElement.style.setProperty('--primary-color-rgb', `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`);
    }
    
    // Set theme in localStorage for persistence
    localStorage.setItem('aetherion-theme-mode', theme.mode);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  // Remove # if present
  let hex = color.startsWith('#') ? color.slice(1) : color;
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper function to get contrasting text color (black or white)
function getContrastColor(hexcolor: string): string {
  // Remove # if present
  hexcolor = hexcolor.startsWith('#') ? hexcolor.slice(1) : hexcolor;
  
  // Convert to RGB
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  
  // Calculate brightness using the formula for relative luminance
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return black for bright colors, white for dark colors
  return brightness > 128 ? '#000000' : '#ffffff';
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Check if it's a valid hex color
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  // Convert to RGB values
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}