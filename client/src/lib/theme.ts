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
  
  // Update theme.json
  // In a real app, this might send an API request to update the user's preferences
  // In our simplified version, we're handling this through local storage with zustand/persist
};

// Add listener for system preference changes
export const initializeThemeListener = () => {
  const { theme } = useThemeStore.getState();
  
  // Apply initial theme
  applyTheme(theme);
  
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