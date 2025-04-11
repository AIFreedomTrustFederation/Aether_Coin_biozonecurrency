import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import PersonalizableDashboard from '@/components/dashboard/PersonalizableDashboard';
import ThemeSwitcher from '@/components/settings/ThemeSwitcher';
import { useThemeStore, initializeThemeListener } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Settings, Bell, Moon, Sun, Laptop } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { theme, availableThemes, setTheme } = useThemeStore();
  
  useEffect(() => {
    // Initialize theme system
    initializeThemeListener();
  }, []);
  
  const getThemeModeIcon = () => {
    switch (theme.mode) {
      case 'dark':
        return <Moon className="h-4 w-4 mr-2" />;
      case 'light':
        return <Sun className="h-4 w-4 mr-2" />;
      case 'system':
        return <Laptop className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Dashboard | Aetherion</title>
      </Helmet>
      
      <div className="container py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Aetherion</h1>
            <p className="text-muted-foreground">
              Your quantum-secure blockchain wallet dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            
            <ThemeSwitcher />
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mb-6 bg-muted/50 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getThemeModeIcon()}
            <span>
              You're using the <strong>{theme.name}</strong> theme
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              Customize
            </Link>
          </Button>
        </div>
        
        <PersonalizableDashboard 
          currentTheme={theme}
          availableThemes={availableThemes}
          onThemeChange={setTheme}
        />
      </div>
    </>
  );
};

export default DashboardPage;