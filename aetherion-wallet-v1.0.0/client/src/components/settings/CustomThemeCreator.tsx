import React, { useState } from 'react';
import { Theme, useThemeStore } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';

const CustomThemeCreator: React.FC = () => {
  const { availableThemes, addCustomTheme, setTheme } = useThemeStore();
  const { toast } = useToast();
  
  const [themeForm, setThemeForm] = useState<{
    name: string;
    mode: 'light' | 'dark' | 'system';
    primary: string;
    radius: number;
  }>({
    name: 'My Custom Theme',
    mode: 'system',
    primary: '#6366f1',
    radius: 0.5
  });
  
  const generateThemeId = (name: string): string => {
    const baseId = name.toLowerCase().replace(/\s+/g, '-');
    // Check if theme ID already exists
    const existingIds = availableThemes.map(theme => theme.id);
    if (!existingIds.includes(baseId)) return baseId;
    
    // If ID exists, append a number
    let counter = 1;
    while (existingIds.includes(`${baseId}-${counter}`)) {
      counter++;
    }
    return `${baseId}-${counter}`;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setThemeForm({
      ...themeForm,
      [name]: value
    });
  };
  
  const handleModeChange = (value: 'light' | 'dark' | 'system') => {
    setThemeForm({
      ...themeForm,
      mode: value
    });
  };
  
  const handleRadiusChange = (value: number[]) => {
    setThemeForm({
      ...themeForm,
      radius: value[0]
    });
  };
  
  const createTheme = () => {
    if (!themeForm.name.trim()) {
      toast({
        title: "Theme name required",
        description: "Please provide a name for your custom theme.",
        variant: "destructive"
      });
      return;
    }
    
    const newTheme: Theme = {
      id: generateThemeId(themeForm.name),
      name: themeForm.name,
      mode: themeForm.mode,
      primary: themeForm.primary,
      radius: themeForm.radius
    };
    
    addCustomTheme(newTheme);
    setTheme(newTheme);
    
    toast({
      title: "Theme Created",
      description: `Your custom theme "${newTheme.name}" has been created and applied.`
    });
    
    // Reset form with slightly different values for next creation
    setThemeForm({
      name: 'My Custom Theme',
      mode: 'system',
      primary: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      radius: Math.random()
    });
  };
  
  // Preview colors for the theme creator
  const presetColors = [
    '#6366f1', // Indigo - Quantum
    '#10b981', // Emerald - Fractal
    '#f43f5e', // Rose - Singularity
    '#8b5cf6', // Violet - Midnight
    '#06b6d4', // Cyan - Neural
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#8a2be2', // BlueViolet
    '#2563eb', // Blue
  ];
  
  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Create Custom Theme</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Theme Name</Label>
          <Input
            id="name"
            name="name"
            value={themeForm.name}
            onChange={handleInputChange}
            placeholder="Enter a name for your theme"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Color Mode</Label>
          <RadioGroup 
            value={themeForm.mode} 
            onValueChange={handleModeChange as (value: string) => void}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="primary">Primary Color</Label>
          <div className="flex items-center gap-2">
            <div 
              className="h-9 w-9 rounded-md border"
              style={{ backgroundColor: themeForm.primary }}
            ></div>
            <Input
              id="primary"
              name="primary"
              type="text"
              value={themeForm.primary}
              onChange={handleInputChange}
              className="font-mono"
            />
            <Input
              type="color"
              name="primary"
              value={themeForm.primary}
              onChange={handleInputChange}
              className="w-12 h-9 p-0 overflow-hidden"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => setThemeForm({ ...themeForm, primary: color })}
                className="h-6 w-6 rounded-md border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="radius">Border Radius</Label>
            <span className="text-sm text-muted-foreground">{Math.round(themeForm.radius * 100) / 100}</span>
          </div>
          <Slider
            id="radius"
            value={[themeForm.radius]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={handleRadiusChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Square</span>
            <span>Rounded</span>
          </div>
        </div>
        
        <div className="pt-2">
          <Label>Preview</Label>
          <div 
            className="mt-2 p-4 border rounded flex flex-col items-center space-y-3"
            style={{ 
              backgroundColor: themeForm.mode === 'dark' ? '#1e293b' : '#f8fafc',
              color: themeForm.mode === 'dark' ? '#f8fafc' : '#1e293b',
              borderColor: themeForm.mode === 'dark' ? '#334155' : '#e2e8f0',
              borderRadius: `${themeForm.radius * 0.5}rem`
            }}
          >
            <div
              className="p-3 text-white"
              style={{ 
                backgroundColor: themeForm.primary,
                borderRadius: `${themeForm.radius * 0.5 * 0.75}rem`
              }}
            >
              Primary Button
            </div>
            <div className="text-sm font-medium">Theme Preview</div>
            <div
              className="h-3 w-3/4 mt-2"
              style={{ 
                backgroundColor: themeForm.primary,
                opacity: 0.2,
                borderRadius: `${themeForm.radius * 0.5 * 0.5}rem`
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <Button onClick={createTheme} className="w-full">
        Create and Apply Theme
      </Button>
    </div>
  );
};

export default CustomThemeCreator;