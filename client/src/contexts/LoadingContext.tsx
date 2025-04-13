import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuantumLoader } from "@/components/ui/quantum-loader";

type LoadingContextType = {
  /** Start a loading state with a specific key and optional message */
  startLoading: (key: string, message?: string) => void;
  /** End a specific loading state by key */
  endLoading: (key: string) => void;
  /** Check if a specific key is currently loading */
  isLoading: (key: string) => boolean;
  /** Get the current loading message, if any */
  getMessage: (key: string) => string | undefined;
  /** Get all currently active loading keys */
  getActiveLoadingKeys: () => string[];
};

const LoadingContext = createContext<LoadingContextType | null>(null);

type LoadingItem = {
  key: string;
  message?: string;
};

type LoadingProviderProps = {
  children: ReactNode;
  /** Whether to show fullscreen loading overlays */
  enableFullscreenOverlay?: boolean;
  /** The variant of the quantum loader to use */
  loaderVariant?: "forest" | "water" | "dual" | "cosmos";
};

/**
 * Provider component for managing loading states throughout the application
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  enableFullscreenOverlay = true,
  loaderVariant = "dual",
}) => {
  const [loadingItems, setLoadingItems] = useState<LoadingItem[]>([]);
  
  // Start loading with the given key
  const startLoading = (key: string, message?: string) => {
    // Don't add duplicates
    if (loadingItems.some(item => item.key === key)) {
      return;
    }
    setLoadingItems(prev => [...prev, { key, message }]);
  };
  
  // End loading with the given key
  const endLoading = (key: string) => {
    setLoadingItems(prev => prev.filter(item => item.key !== key));
  };
  
  // Check if a specific key is loading
  const isLoading = (key: string): boolean => {
    return loadingItems.some(item => item.key === key);
  };
  
  // Get message for a specific loading key
  const getMessage = (key: string): string | undefined => {
    return loadingItems.find(item => item.key === key)?.message;
  };
  
  // Get all active loading keys
  const getActiveLoadingKeys = (): string[] => {
    return loadingItems.map(item => item.key);
  };
  
  // Create the context value
  const contextValue: LoadingContextType = {
    startLoading,
    endLoading,
    isLoading,
    getMessage,
    getActiveLoadingKeys,
  };
  
  // Determine if any keys are currently loading
  const hasActiveLoading = loadingItems.length > 0;
  
  // Get the most recent loading message to display
  const currentMessage = loadingItems.length > 0 
    ? loadingItems[loadingItems.length - 1].message 
    : undefined;
  
  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Fullscreen loading overlay */}
      {enableFullscreenOverlay && (
        <AnimatePresence>
          {hasActiveLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="text-center">
                <QuantumLoader 
                  size="lg" 
                  variant={loaderVariant} 
                  showLabel={!!currentMessage} 
                  labelText={currentMessage || "Loading"} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </LoadingContext.Provider>
  );
};

/**
 * Hook for using the loading context
 */
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export default LoadingProvider;