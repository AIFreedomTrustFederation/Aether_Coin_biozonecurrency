import React, { useState, useEffect, Suspense } from 'react';
import { useRoute, useLocation } from 'wouter';
import { AppRegistry, AppConfig } from '../../registry/AppRegistry';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LayoutGrid, Settings, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * App Shell
 * 
 * Main container component that hosts micro-apps and provides
 * navigation, settings, and shared UI elements.
 */
export const AppShell: React.FC = () => {
  const [matched, params] = useRoute<{ appId: string }>('/:appId');
  const appId = matched && params ? params.appId : '';
  const [, setLocation] = useLocation();
  const [currentApp, setCurrentApp] = useState<AppConfig | undefined>();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get all available apps
  const apps = AppRegistry.getAllApps();
  
  // Effect to update current app when appId changes
  useEffect(() => {
    if (appId) {
      const app = AppRegistry.getApp(appId);
      if (app) {
        setCurrentApp(app);
        document.title = `Aetherion | ${app.name}`;
      } else {
        // Redirect to dashboard if app not found
        setLocation('/dashboard');
      }
    }
  }, [appId, setLocation]);
  
  // Handle app navigation
  const navigateToApp = (targetAppId: string) => {
    if (targetAppId !== appId) {
      setIsLoading(true);
      // Small delay to show loading state
      setTimeout(() => {
        setLocation(`/${targetAppId}`);
        setIsLoading(false);
      }, 300);
    }
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        apps={apps} 
        currentAppId={appId || ''} 
        onAppSelect={navigateToApp} 
        isOpen={isSidebarOpen}
      />
      
      {/* Main Content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        {/* Top Navigation */}
        <Topbar 
          appName={currentApp?.name || 'Aetherion'} 
          onMenuClick={toggleSidebar} 
        />
        
        {/* App Container */}
        <main className="flex-1 overflow-y-auto bg-muted/20 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
            </div>
          ) : currentApp ? (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
              </div>
            }>
              <div className="h-full">
                <currentApp.component />
              </div>
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <LayoutGrid className="h-16 w-16 mb-4" />
              <h2 className="text-2xl font-bold mb-2">App Not Found</h2>
              <p>The requested application could not be found.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};