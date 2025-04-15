import React from "react";
import { AppRegistry } from "../../registry/AppRegistry";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  currentAppId: string;
  collapsed: boolean;
  onAppSelect: (appId: string) => void;
}

/**
 * App Sidebar Component
 * 
 * The sidebar navigation that displays available apps
 * grouped by category for easy access.
 */
const AppSidebar: React.FC<AppSidebarProps> = ({
  currentAppId,
  collapsed,
  onAppSelect
}) => {
  // Get apps grouped by category
  const mainApps = AppRegistry.getAppsByCategory('main');
  const toolApps = AppRegistry.getAppsByCategory('tools');
  const systemApps = AppRegistry.getAppsByCategory('system');
  
  return (
    <div 
      className={cn(
        "app-sidebar border-r bg-background transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-6">
          {/* Main Apps */}
          <div className="space-y-1">
            {!collapsed && <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">Applications</h3>}
            {mainApps.map(app => (
              <AppNavItem
                key={app.id}
                app={app}
                isActive={app.id === currentAppId}
                collapsed={collapsed}
                onClick={() => onAppSelect(app.id)}
              />
            ))}
          </div>
          
          {/* Tool Apps */}
          {toolApps.length > 0 && (
            <div className="space-y-1">
              {!collapsed && <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">Tools</h3>}
              {toolApps.map(app => (
                <AppNavItem
                  key={app.id}
                  app={app}
                  isActive={app.id === currentAppId}
                  collapsed={collapsed}
                  onClick={() => onAppSelect(app.id)}
                />
              ))}
            </div>
          )}
          
          {/* System Apps */}
          {systemApps.length > 0 && (
            <div className="space-y-1">
              {!collapsed && <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">System</h3>}
              {systemApps.map(app => (
                <AppNavItem
                  key={app.id}
                  app={app}
                  isActive={app.id === currentAppId}
                  collapsed={collapsed}
                  onClick={() => onAppSelect(app.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for individual sidebar nav items
interface AppNavItemProps {
  app: {
    id: string;
    name: string;
    icon: React.ElementType;
  };
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const AppNavItem: React.FC<AppNavItemProps> = ({
  app,
  isActive,
  collapsed,
  onClick
}) => {
  const IconComponent = app.icon;
  
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start",
        isActive ? "bg-forest-100 hover:bg-forest-100 text-forest-900 dark:bg-forest-900/30 dark:hover:bg-forest-900/30 dark:text-forest-50" : "",
        collapsed ? "px-3" : "px-3"
      )}
      onClick={onClick}
    >
      <IconComponent className={cn(
        "h-5 w-5",
        isActive ? "text-forest-700 dark:text-forest-400" : "text-muted-foreground"
      )} />
      {!collapsed && <span className="ml-3">{app.name}</span>}
    </Button>
  );
};

export default AppSidebar;