import React, { createContext, useContext, useState, useEffect } from 'react';

interface LiveModeContextType {
  isLiveMode: boolean;
  toggleLiveMode: () => void;
}

const LiveModeContext = createContext<LiveModeContextType>({
  isLiveMode: false,
  toggleLiveMode: () => {},
});

export const useLiveMode = () => useContext(LiveModeContext);

interface LiveModeProviderProps {
  children: React.ReactNode;
}

export const LiveModeProvider: React.FC<LiveModeProviderProps> = ({ children }) => {
  // Get the stored mode from localStorage, defaulting to false (test mode)
  const [isLiveMode, setIsLiveMode] = useState<boolean>(() => {
    try {
      const storedMode = localStorage.getItem('aetherion-live-mode');
      return storedMode ? JSON.parse(storedMode) : false;
    } catch (e) {
      console.error('Error reading live mode from localStorage:', e);
      return false;
    }
  });

  // Update localStorage when mode changes
  useEffect(() => {
    try {
      localStorage.setItem('aetherion-live-mode', JSON.stringify(isLiveMode));
    } catch (e) {
      console.error('Error saving live mode to localStorage:', e);
    }
  }, [isLiveMode]);

  const toggleLiveMode = () => {
    setIsLiveMode((prev) => !prev);
  };

  return (
    <LiveModeContext.Provider value={{ isLiveMode, toggleLiveMode }}>
      {children}
    </LiveModeContext.Provider>
  );
};