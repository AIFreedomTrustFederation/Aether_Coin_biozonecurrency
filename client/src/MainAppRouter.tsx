import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { SecurityProvider } from "./components/app-shell/SecurityProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRegistry } from "./registry/AppRegistry";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

/**
 * Main App Router
 * 
 * Sets up the routing for the Enumerator-like architecture,
 * allowing navigation between micro-apps.
 */
const MainAppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SecurityProvider>
            <BrowserRouter>
              <Routes>
                {/* Redirect root to the default app */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* App Shell handles all registered apps */}
                <Route path="/:appId/*" element={<AppShell />} />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </SecurityProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default MainAppRouter;