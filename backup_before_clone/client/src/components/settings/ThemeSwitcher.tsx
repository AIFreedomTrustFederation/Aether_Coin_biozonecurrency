import React from 'react';
import { Theme, useThemeStore } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Laptop, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThemeSwitcherProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'outline',
  size = 'icon',
  showLabel = false,
}) => {
  const { theme, availableThemes, setTheme } = useThemeStore();
  const { toast } = useToast();
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme.name}`,
      duration: 2000,
    });
  };
  
  const getThemeIcon = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Laptop className="h-4 w-4" />;
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          {size !== 'icon' && showLabel ? (
            <>
              {getThemeIcon(theme.mode)}
              <span>{theme.name}</span>
            </>
          ) : (
            <Palette className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableThemes.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => handleThemeChange(item)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: item.primary }}
            />
            <span>{item.name}</span>
            {item.id === theme.id && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings" className="w-full cursor-pointer">
            Customize Theme
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;