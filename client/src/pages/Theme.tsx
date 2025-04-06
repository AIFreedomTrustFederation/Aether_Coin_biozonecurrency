import React from 'react';
import { Palette, Sun, Moon, Laptop } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeStore, Theme } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';

/**
 * Theme selection page - optimized for mobile
 */
export default function ThemePage() {
  const { theme, setTheme, availableThemes } = useThemeStore();
  const { toast } = useToast();
  
  const modes = [
    { id: 'light', name: 'Light', icon: <Sun className="h-6 w-6" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="h-6 w-6" /> },
    { id: 'system', name: 'System', icon: <Laptop className="h-6 w-6" /> },
  ];

  // Function to handle theme selection
  const handleThemeSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme.name}`,
      duration: 2000,
    });
  };
  
  // Create theme filters by mode
  const lightThemes = availableThemes.filter(t => t.mode === 'light');
  const darkThemes = availableThemes.filter(t => t.mode === 'dark');
  const systemThemes = availableThemes.filter(t => t.mode === 'system');

  return (
    <div className="container py-6 pb-24">
      <header className="mb-6">
        <div className="flex items-center">
          <Palette className="mr-2 h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Theme Settings</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Customize the appearance of your wallet
        </p>
      </header>

      <div className="space-y-8">
        {/* Active Theme */}
        <Card className="bg-opacity-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
            <CardDescription>Your currently selected theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div 
                className="h-12 w-12 rounded-full" 
                style={{ backgroundColor: theme.primary }}
              ></div>
              <div>
                <h3 className="font-medium">{theme.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{theme.mode} Mode</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Light Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="h-5 w-5 mr-2" />
              Light Themes
            </CardTitle>
            <CardDescription>Bright and clean visual styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lightThemes.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleThemeSelect(item)}
                  variant={theme.id === item.id ? "default" : "outline"}
                  className={cn(
                    "h-20 justify-start px-4",
                    theme.id === item.id && "border-primary"
                  )}
                >
                  <div 
                    className="h-8 w-8 rounded-full mr-3" 
                    style={{ backgroundColor: item.primary }}
                  ></div>
                  <span>{item.name}</span>
                  {item.id === theme.id && (
                    <span className="ml-auto text-xs">Active</span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dark Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="h-5 w-5 mr-2" />
              Dark Themes
            </CardTitle>
            <CardDescription>Sleek and sophisticated nighttime aesthetics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {darkThemes.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleThemeSelect(item)}
                  variant={theme.id === item.id ? "default" : "outline"}
                  className={cn(
                    "h-20 justify-start px-4",
                    theme.id === item.id && "border-primary"
                  )}
                >
                  <div 
                    className="h-8 w-8 rounded-full mr-3" 
                    style={{ backgroundColor: item.primary }}
                  ></div>
                  <span>{item.name}</span>
                  {item.id === theme.id && (
                    <span className="ml-auto text-xs">Active</span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Laptop className="h-5 w-5 mr-2" />
              System Themes
            </CardTitle>
            <CardDescription>Automatically adjust based on your device settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemThemes.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleThemeSelect(item)}
                  variant={theme.id === item.id ? "default" : "outline"}
                  className={cn(
                    "h-20 justify-start px-4",
                    theme.id === item.id && "border-primary"
                  )}
                >
                  <div 
                    className="h-8 w-8 rounded-full mr-3" 
                    style={{ backgroundColor: item.primary }}
                  ></div>
                  <span>{item.name}</span>
                  {item.id === theme.id && (
                    <span className="ml-auto text-xs">Active</span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}