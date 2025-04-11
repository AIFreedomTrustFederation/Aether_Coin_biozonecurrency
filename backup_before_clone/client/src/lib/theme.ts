import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'system';
  primary: string;
  radius: number;
}

interface ThemeState {
  theme: Theme;
  availableThemes: Theme[];
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme) => void;
  removeCustomTheme: (themeId: string) => void;
}

// Default themes
const defaultThemes: Theme[] = [
  { 
    id: 'quantum', 
    name: 'Quantum Dark', 
    mode: 'dark', 
    primary: '#6366f1', // Indigo
    radius: 0.5 
  },
  { 
    id: 'fractal', 
    name: 'Fractal Light', 
    mode: 'light', 
    primary: '#10b981', // Emerald
    radius: 0.75 
  },
  { 
    id: 'singularity', 
    name: 'Singularity System', 
    mode: 'system', 
    primary: '#f43f5e', // Rose
    radius: 0.25 
  },
  { 
    id: 'midnight', 
    name: 'Midnight Protocol', 
    mode: 'dark', 
    primary: '#8b5cf6', // Violet
    radius: 0 
  },
  { 
    id: 'neural', 
    name: 'Neural Network', 
    mode: 'system', 
    primary: '#06b6d4', // Cyan
    radius: 1 
  },
  // Neon Themes
  { 
    id: 'neon-cyan', 
    name: 'Neon Cyan', 
    mode: 'dark', 
    primary: '#00ffff', // Electric Cyan
    radius: 0.5 
  },
  { 
    id: 'neon-green', 
    name: 'Neon Green', 
    mode: 'dark', 
    primary: '#00ff88', // Electric Green
    radius: 0.5 
  },
  { 
    id: 'neon-pink', 
    name: 'Neon Pink', 
    mode: 'dark', 
    primary: '#ff00ff', // Electric Magenta
    radius: 0.5 
  },
  { 
    id: 'neon-blue', 
    name: 'Neon Blue', 
    mode: 'dark', 
    primary: '#00aaff', // Electric Blue
    radius: 0.5 
  },
  { 
    id: 'neon-orange', 
    name: 'Neon Orange', 
    mode: 'dark', 
    primary: '#ff9900', // Electric Orange
    radius: 0.5 
  }
];

// Create store with persistence
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: defaultThemes[0],
      availableThemes: defaultThemes,
      setTheme: (theme) => set({ theme }),
      addCustomTheme: (theme) => set((state) => ({
        availableThemes: [...state.availableThemes, theme]
      })),
      removeCustomTheme: (themeId) => set((state) => ({
        availableThemes: state.availableThemes.filter(
          // Only filter out custom themes, not default ones
          (theme) => theme.id === themeId 
            ? !defaultThemes.some(defaultTheme => defaultTheme.id === theme.id)
            : true
        )
      }))
    }),
    {
      name: 'aetherion-theme-storage'
    }
  )
);

// Helper function to apply theme to document
export const applyTheme = (theme: Theme) => {
  // Update CSS variables
  document.documentElement.style.setProperty('--theme-primary', theme.primary);
  document.documentElement.style.setProperty('--primary-color', theme.primary); // Support both naming conventions
  document.documentElement.style.setProperty('--theme-radius', `${theme.radius * 0.5}rem`);
  
  // Update data-theme attribute
  if (theme.mode === 'system') {
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', systemPreference);
    document.documentElement.classList.toggle('dark', systemPreference === 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', theme.mode);
    document.documentElement.classList.toggle('dark', theme.mode === 'dark');
  }
  
  // For neon themes, dynamically load additional styles
  if (theme.id.startsWith('neon-')) {
    // Set RGB variant of primary color for neon effects
    const rgb = hexToRgb(theme.primary);
    if (rgb) {
      document.documentElement.style.setProperty(
        '--primary-color-rgb', 
        `${rgb.r}, ${rgb.g}, ${rgb.b}`
      );
    }
    
    // Lazy load advanced neon styles
    import('../lib/lazyThemeLoader')
      .then(module => {
        const { loadThemeStyles } = module;
        // Load advanced effects
        loadThemeStyles('neon-advanced');
        
        // Load animations after a delay to prioritize critical content
        setTimeout(() => {
          loadThemeStyles('neon-animations');
        }, 2000);
      })
      .catch(err => console.error('Failed to load theme modules:', err));
  }
};

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

// Add listener for system preference changes
export const initializeThemeListener = () => {
  const { theme } = useThemeStore.getState();
  
  // Apply initial theme
  applyTheme(theme);
  
  // Initialize the theme loader for progressive loading
  import('./lazyThemeLoader')
    .then(module => module.initializeThemeLoader())
    .catch(err => console.warn('Theme loader initialization failed:', err));
  
  // Listen for theme changes in the store
  useThemeStore.subscribe((state) => {
    applyTheme(state.theme);
  });
  
  // Listen for system preference changes
  const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  
  systemThemeMedia.addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme.mode === 'system') {
      applyTheme(theme);
    }
  });
};