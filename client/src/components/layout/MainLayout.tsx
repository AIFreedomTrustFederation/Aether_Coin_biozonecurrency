import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import GestureNavigation from './GestureNavigation';
import FloatingNav from './FloatingNav';
import MobileMenu from './MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGestureContext } from '@/contexts/gesture-context';
import { cn } from '@/lib/utils';
import { Menu, Bell, Settings, Moon, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { appRoutes } from '@/lib/routes';

// Define type for notification preferences (matches the one in NotificationSettings.tsx)
interface NotificationPreference {
  id: number;
  userId: number;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  smsEnabled: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  priceAlerts: boolean;
  marketingUpdates: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const { enableGestures, disableGestures } = useGestureContext();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { toast } = useToast();

  // Query notification preferences to check if there are any pending alerts
  const { data: notificationPreferences } = useQuery<NotificationPreference>({
    queryKey: ['/api/notification-preferences'],
    retry: false
  });

  // Update page title based on current route
  useEffect(() => {
    const currentRoute = appRoutes.find(route => route.path === location);
    if (currentRoute) {
      setPageTitle(currentRoute.label);
    }
  }, [location]);

  // Determine if we should enable gestures for this page
  useEffect(() => {
    // Disable gestures on specific pages where they might interfere
    // Like the fractal explorer where we want to interact with the canvas
    if (location === '/fractal-explorer') {
      disableGestures();
    } else {
      enableGestures();
    }
  }, [location, enableGestures, disableGestures]);

  // Toggle dark/light theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`,
      description: `Switched to ${newTheme} theme.`,
    });
  };

  // Check if user needs attention for notifications
  const needsNotificationAttention = () => {
    if (!notificationPreferences) return false;
    
    // Phone not verified but number provided
    if (notificationPreferences.phoneNumber && !notificationPreferences.isPhoneVerified) {
      return true;
    }
    
    return false;
  };

  return (
    <div className={cn("main-layout h-full w-full flex flex-col bg-background", className)}>
      {/* Mobile menu - always rendered, controlled by isOpen prop */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Header with hamburger menu and notification icons */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                className="text-foreground"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Theme toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                  {needsNotificationAttention() && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  {notificationPreferences?.smsEnabled && notificationPreferences?.isPhoneVerified && (
                    <div className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">SMS Active</div>
                  )}
                </div>
                
                {needsNotificationAttention() ? (
                  <div className="p-3 border-b border-border">
                    <Link href="/settings" className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 rounded-md p-2">
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-red-500">Action Required</span>
                        <span className="text-sm text-muted-foreground">
                          {notificationPreferences?.phoneNumber && !notificationPreferences?.isPhoneVerified
                            ? "Verify your phone number to enable SMS notifications"
                            : "Configure your notification preferences"}
                        </span>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 border-b border-border">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-sm">Notification Status</h4>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className={`text-xs p-2 rounded ${notificationPreferences?.transactionAlerts ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                          Transaction Alerts {notificationPreferences?.transactionAlerts ? '✓' : '×'}
                        </div>
                        <div className={`text-xs p-2 rounded ${notificationPreferences?.securityAlerts ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                          Security Alerts {notificationPreferences?.securityAlerts ? '✓' : '×'}
                        </div>
                        <div className={`text-xs p-2 rounded ${notificationPreferences?.priceAlerts ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                          Price Alerts {notificationPreferences?.priceAlerts ? '✓' : '×'}
                        </div>
                        <div className={`text-xs p-2 rounded ${notificationPreferences?.marketingUpdates ? 'bg-purple-500/10 text-purple-500' : 'bg-muted text-muted-foreground'}`}>
                          Marketing {notificationPreferences?.marketingUpdates ? '✓' : '×'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-2">
                  <Link 
                    href="/settings" 
                    className="flex items-center justify-center w-full py-2 hover:bg-accent rounded-md transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage notification settings
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Settings shortcut */}
            <Button 
              variant="ghost" 
              size="icon"
              aria-label="Settings"
              asChild
            >
              <Link href="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area with gesture navigation */}
      <main className="flex-1 relative bg-background overflow-auto">
        {isMobile ? (
          <GestureNavigation
            routes={appRoutes}
            className="w-full h-full"
          >
            <div className="w-full h-full overflow-auto">{children}</div>
          </GestureNavigation>
        ) : (
          <div className="w-full h-full overflow-auto">{children}</div>
        )}
      </main>

      {/* Floating navigation on mobile */}
      {isMobile && <FloatingNav routes={appRoutes} />}

      {/* Footer with navigation on non-mobile */}
      {!isMobile && (
        <footer className="bg-background/80 backdrop-blur-sm border-t border-border/40 px-4 py-2">
          <nav className="flex justify-around">
            {appRoutes.slice(0, 6).map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location === route.path
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;