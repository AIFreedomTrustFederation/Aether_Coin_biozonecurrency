import React, { Suspense, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRegistry, AppDefinition } from "../../registry/AppRegistry";
import { Loader2 } from "lucide-react";
import AppSelector from "./AppSelector";
import AppNavbar from "./AppNavbar";
import AppSidebar from "./AppSidebar";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ZeroTrustProvider } from "../../contexts/ZeroTrustContext";
import { eventBus } from "../../registry/EventBus";

/**
 * App Shell Component
 * 
 * The main container that manages and displays micro-apps in the Enumerator environment.
 * It handles app selection, navigation, shared state, and security context.
 */
const AppShell: React.FC = () => {
  // Routing
  const location = useLocation();
  const navigate = useNavigate();
  
  // Responsive layout
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  
  // State
  const [currentAppId, setCurrentAppId] = useState<string>("dashboard");
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile || isTablet);
  
  // Parse app ID from URL
  useEffect(() => {
    const path = location.pathname.slice(1); // Remove leading slash
    const appId = path || "dashboard"; // Default to dashboard if path is empty
    
    if (AppRegistry.hasApp(appId)) {
      setCurrentAppId(appId);
    }
  }, [location]);
  
  // Handle app changes
  const handleAppChange = (appId: string) => {
    if (AppRegistry.hasApp(appId)) {
      setCurrentAppId(appId);
      navigate(`/${appId}`);
      setShowAppSelector(false);
      
      // Publish app change event for other components to react
      eventBus.publish("app:changed", appId);
    }
  };
  
  // Get current app
  const currentApp = AppRegistry.getApp(currentAppId) || AppRegistry.getApp("dashboard")!;
  
  // Render different layouts based on screen size
  const renderContent = () => {
    const AppComponent = currentApp.component;
    
    return (
      <div className="app-content flex-1 overflow-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
          </div>
        }>
          <AppComponent />
        </Suspense>
      </div>
    );
  };
  
  return (
    <ZeroTrustProvider>
      <div className="app-shell flex flex-col h-screen">
        <AppNavbar 
          currentApp={currentApp}
          onToggleAppSelector={() => setShowAppSelector(!showAppSelector)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="app-body flex flex-1 overflow-hidden">
          {!isMobile && (
            <AppSidebar 
              currentAppId={currentAppId}
              collapsed={sidebarCollapsed}
              onAppSelect={handleAppChange}
            />
          )}
          
          {renderContent()}
        </div>
        
        {showAppSelector && (
          <AppSelector 
            apps={AppRegistry.getAvailableApps()}
            currentAppId={currentAppId}
            onAppSelect={handleAppChange}
            onClose={() => setShowAppSelector(false)}
          />
        )}
      </div>
    </ZeroTrustProvider>
  );
};

export default AppShell;