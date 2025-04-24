import React from "react";
import { Switch, Route, Redirect } from "wouter";
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
 * Enumerator App
 * 
 * This is the entry point for the modular architecture with micro-frontends.
 * It sets up routing for different micro-apps registered in the AppRegistry.
 */
const EnumeratorApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SecurityProvider>
            <Switch>
              {/* Redirect root to the default app */}
              <Route path="/">
                <Redirect to="/enumerator/dashboard" />
              </Route>
              
              {/* App Shell handles all registered apps */}
              <Route path="/:appId/*">
                <AppShell />
              </Route>
              
              {/* Catch-all route for 404 */}
              <Route path="*">
                <Redirect to="/enumerator/dashboard" />
              </Route>
            </Switch>
          </SecurityProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default EnumeratorApp;