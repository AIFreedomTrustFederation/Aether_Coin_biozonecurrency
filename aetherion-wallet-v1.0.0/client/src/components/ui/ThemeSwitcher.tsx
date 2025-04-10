import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SunMoon, Palette, Moon, Sun, Monitor, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/lib/theme';
// We'll lazily import the theme loader when needed
import { loadThemeStyles } from '@/lib/lazyThemeLoader';

type ThemeOption = 'light' | 'dark' | 'system';
type ColorScheme = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'cyan' | 'pink';
type Variant = 'vibrant' | 'professional' | 'tint' | 'neon';

interface ThemeConfig {
  appearance: ThemeOption;
  primaryColor: ColorScheme;
  variant: Variant;
  radius: number;
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeConfig>({
    appearance: 'system',
    primaryColor: 'purple',
    variant: 'vibrant',
    radius: 0.5
  });

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('aetherion-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme(parsedTheme);
        applyTheme(parsedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // Apply theme to document and save to localStorage
  const applyTheme = (newTheme: ThemeConfig) => {
    // Update data attributes on HTML element
    const htmlElement = document.documentElement;
    
    // Set appearance (light/dark/system)
    if (newTheme.appearance === 'system') {
      htmlElement.removeAttribute('data-theme-appearance');
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlElement.classList.toggle('dark', prefersDark);
    } else {
      htmlElement.setAttribute('data-theme-appearance', newTheme.appearance);
      htmlElement.classList.toggle('dark', newTheme.appearance === 'dark');
    }
    
    // Set primary color
    htmlElement.setAttribute('data-theme-color', newTheme.primaryColor);
    htmlElement.style.setProperty('--primary-color', convertNamedColorToHex(newTheme.primaryColor));
    
    // Set variant
    htmlElement.setAttribute('data-theme-variant', newTheme.variant);
    
    // If neon variant is selected, load the special neon styles
    if (newTheme.variant === 'neon') {
      // Ensure dark mode is enabled for neon themes
      htmlElement.classList.add('dark');
      // Load the advanced neon styles
      loadThemeStyles('neon-advanced');
      
      // Delayed loading of animations for better performance
      setTimeout(() => {
        loadThemeStyles('neon-animations');
      }, 1000);
    }
    
    // Set border radius
    htmlElement.style.setProperty('--radius', `${newTheme.radius}rem`);
    
    // Save to localStorage
    localStorage.setItem('aetherion-theme', JSON.stringify(newTheme));
    
    // Update theme.json dynamically if needed
    updateThemeJson(newTheme);
  };
  
  // Helper to convert color name to hex
  const convertNamedColorToHex = (colorName: ColorScheme): string => {
    const colorMap: Record<ColorScheme, string> = {
      purple: '#8b5cf6',
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f97316',
      red: '#ef4444',
      cyan: '#00ffff',
      pink: '#ff00ff'
    };
    
    return colorMap[colorName] || '#3b82f6';
  };

  // Function to update theme.json file (in a real app, this would be an API call)
  const updateThemeJson = (newTheme: ThemeConfig) => {
    // In a real app, this would be an API call to update theme.json
    // For now, we'll just log it
    console.log('Theme updated:', newTheme);
  };

  // Handle theme changes
  const handleThemeChange = (key: keyof ThemeConfig, value: any) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("relative", className)}
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Appearance</h4>
          <RadioGroup 
            defaultValue={theme.appearance} 
            onValueChange={(value) => handleThemeChange('appearance', value as ThemeOption)}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center gap-1">
              <Label 
                htmlFor="light" 
                className="cursor-pointer p-2 bg-background border rounded-md flex items-center justify-center w-12 h-12"
              >
                <Sun className="h-5 w-5" />
              </Label>
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <span className="text-xs">Light</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <Label 
                htmlFor="dark" 
                className="cursor-pointer p-2 bg-background border rounded-md flex items-center justify-center w-12 h-12"
              >
                <Moon className="h-5 w-5" />
              </Label>
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <span className="text-xs">Dark</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <Label 
                htmlFor="system" 
                className="cursor-pointer p-2 bg-background border rounded-md flex items-center justify-center w-12 h-12"
              >
                <Monitor className="h-5 w-5" />
              </Label>
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <span className="text-xs">System</span>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Color</h4>
            <RadioGroup 
              defaultValue={theme.primaryColor} 
              onValueChange={(value) => handleThemeChange('primaryColor', value as ColorScheme)}
              className="flex flex-wrap gap-2"
            >
              <div className="flex items-center">
                <RadioGroupItem value="purple" id="purple" className="sr-only" />
                <Label 
                  htmlFor="purple" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-purple-500"
                />
              </div>
              
              <div className="flex items-center">
                <RadioGroupItem value="blue" id="blue" className="sr-only" />
                <Label 
                  htmlFor="blue" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <RadioGroupItem value="green" id="green" className="sr-only" />
                <Label 
                  htmlFor="green" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-green-500"
                />
              </div>
              
              <div className="flex items-center">
                <RadioGroupItem value="orange" id="orange" className="sr-only" />
                <Label 
                  htmlFor="orange" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-orange-500"
                />
              </div>
              
              <div className="flex items-center">
                <RadioGroupItem value="red" id="red" className="sr-only" />
                <Label 
                  htmlFor="red" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-red-500"
                />
              </div>

              <div className="flex items-center">
                <RadioGroupItem value="cyan" id="cyan" className="sr-only" />
                <Label 
                  htmlFor="cyan" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-cyan-400 neon-glow"
                />
              </div>
              
              <div className="flex items-center">
                <RadioGroupItem value="pink" id="pink" className="sr-only" />
                <Label 
                  htmlFor="pink" 
                  className="cursor-pointer w-6 h-6 rounded-full bg-pink-500 neon-glow"
                />
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Style</h4>
            <RadioGroup 
              defaultValue={theme.variant} 
              onValueChange={(value) => handleThemeChange('variant', value as Variant)}
              className="grid grid-cols-4 gap-2"
            >
              <div className="flex flex-col items-center gap-1">
                <RadioGroupItem value="vibrant" id="vibrant" className="sr-only" />
                <Label 
                  htmlFor="vibrant" 
                  className="cursor-pointer w-full p-2 bg-background border rounded-md text-center"
                >
                  Vibrant
                </Label>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <RadioGroupItem value="professional" id="professional" className="sr-only" />
                <Label 
                  htmlFor="professional" 
                  className="cursor-pointer w-full p-2 bg-background border rounded-md text-center"
                >
                  Pro
                </Label>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <RadioGroupItem value="tint" id="tint" className="sr-only" />
                <Label 
                  htmlFor="tint" 
                  className="cursor-pointer w-full p-2 bg-background border rounded-md text-center"
                >
                  Tint
                </Label>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <RadioGroupItem value="neon" id="neon" className="sr-only" />
                <Label 
                  htmlFor="neon" 
                  className="cursor-pointer w-full p-2 bg-background border border-primary rounded-md text-center flex justify-center items-center gap-1 font-medium text-primary"
                >
                  <Zap className="h-3 w-3" /> Neon
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">Border Radius</h4>
              <span className="text-xs text-muted-foreground">{theme.radius}rem</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={theme.radius} 
              onChange={(e) => handleThemeChange('radius', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Square</span>
              <span>Rounded</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}