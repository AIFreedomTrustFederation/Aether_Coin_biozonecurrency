import React from 'react';
import { AppConfig } from '../../registry/AppRegistry';
import { 
  LayoutDashboard, 
  Wallet, 
  Server, 
  BarChart3, 
  Cpu, 
  Settings,
  ChevronLeft,
  LogOut,
  HelpCircle,
  Shield,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface SidebarProps {
  apps: AppConfig[];
  currentAppId: string;
  onAppSelect: (appId: string) => void;
  isOpen: boolean;
}

/**
 * Sidebar navigation component
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  apps, 
  currentAppId, 
  onAppSelect,
  isOpen
}) => {
  const { theme, setTheme } = useTheme();
  
  // Map icon strings to actual icons
  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (iconName) {
      case 'layout-dashboard':
        return <LayoutDashboard {...iconProps} />;
      case 'wallet':
        return <Wallet {...iconProps} />;
      case 'server':
        return <Server {...iconProps} />;
      case 'bar-chart-3':
        return <BarChart3 {...iconProps} />;
      case 'cpu':
        return <Cpu {...iconProps} />;
      case 'settings':
        return <Settings {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      default:
        return <HelpCircle {...iconProps} />;
    }
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-10 flex flex-col bg-card border-r shadow-sm transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-0 md:w-16"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {isOpen && (
          <div className="font-bold text-lg text-forest-600">Aetherion</div>
        )}
        <Button variant="ghost" size="icon" className="ml-auto" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* App Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {apps.map((app) => (
            <li key={app.id}>
              <button
                onClick={() => onAppSelect(app.id)}
                className={cn(
                  "flex items-center w-full py-2 px-3 rounded-md text-sm",
                  "transition-colors duration-200 ease-in-out",
                  "hover:bg-muted/60",
                  currentAppId === app.id 
                    ? "bg-muted text-forest-600 font-medium" 
                    : "text-foreground",
                  !isOpen && "justify-center"
                )}
              >
                {getIcon(app.icon)}
                {isOpen && <span className="ml-3">{app.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Bottom Actions */}
      <div className="p-2 border-t">
        <ul className="space-y-1">
          <li>
            <button
              className={cn(
                "flex items-center w-full py-2 px-3 rounded-md text-sm",
                "transition-colors duration-200 ease-in-out",
                "hover:bg-muted/60 text-foreground",
                !isOpen && "justify-center"
              )}
            >
              <Shield className="h-5 w-5" />
              {isOpen && <span className="ml-3">Security</span>}
            </button>
          </li>
          <li>
            <button
              className={cn(
                "flex items-center w-full py-2 px-3 rounded-md text-sm",
                "transition-colors duration-200 ease-in-out",
                "hover:bg-muted/60 text-foreground",
                !isOpen && "justify-center"
              )}
            >
              <Settings className="h-5 w-5" />
              {isOpen && <span className="ml-3">Settings</span>}
            </button>
          </li>
          <li>
            <button
              className={cn(
                "flex items-center w-full py-2 px-3 rounded-md text-sm",
                "transition-colors duration-200 ease-in-out",
                "hover:bg-muted/60 text-red-500",
                !isOpen && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="ml-3">Disconnect</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};