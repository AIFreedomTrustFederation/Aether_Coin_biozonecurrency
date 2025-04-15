import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppDefinition } from "../../registry/AppRegistry";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppSelectorProps {
  apps: AppDefinition[];
  currentAppId: string;
  onAppSelect: (appId: string) => void;
  onClose: () => void;
}

/**
 * App Selector Component
 * 
 * Displays a grid of available applications that the user can select
 * and launch within the Aetherion ecosystem.
 */
const AppSelector: React.FC<AppSelectorProps> = ({
  apps,
  currentAppId,
  onAppSelect,
  onClose
}) => {
  // Group apps by category for better organization
  const mainApps = apps.filter(app => app.category === 'main');
  const toolApps = apps.filter(app => app.category === 'tools');
  const systemApps = apps.filter(app => app.category === 'system');
  
  // Handle app selection
  const handleSelect = (appId: string) => {
    onAppSelect(appId);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl">Aetherion App Hub</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Main Apps */}
          <div>
            <h3 className="font-medium text-lg mb-3">Core Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mainApps.map(app => (
                <AppTile 
                  key={app.id}
                  app={app}
                  isActive={app.id === currentAppId}
                  onClick={() => handleSelect(app.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Tool Apps */}
          {toolApps.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3">Tools & Utilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {toolApps.map(app => (
                  <AppTile 
                    key={app.id}
                    app={app}
                    isActive={app.id === currentAppId}
                    onClick={() => handleSelect(app.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* System Apps */}
          {systemApps.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3">System & Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemApps.map(app => (
                  <AppTile 
                    key={app.id}
                    app={app}
                    isActive={app.id === currentAppId}
                    onClick={() => handleSelect(app.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for individual app tiles
interface AppTileProps {
  app: AppDefinition;
  isActive: boolean;
  onClick: () => void;
}

const AppTile: React.FC<AppTileProps> = ({ 
  app, 
  isActive, 
  onClick 
}) => {
  const IconComponent = app.icon;
  
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
        ${isActive ? 'border-forest-500 bg-forest-50 dark:bg-forest-950/20' : 'border-border'}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${isActive ? 'bg-forest-100 dark:bg-forest-900/30' : 'bg-muted'}`}>
          <IconComponent className={`h-5 w-5 ${isActive ? 'text-forest-600' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{app.name}</h4>
            {isActive && <Badge variant="outline" className="text-xs">Active</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AppSelector;