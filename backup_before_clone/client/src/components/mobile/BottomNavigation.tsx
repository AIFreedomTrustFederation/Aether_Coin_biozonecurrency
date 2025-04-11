import React from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Home, 
  Wallet, 
  Settings, 
  BarChart3, 
  Palette,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveModeIndicator } from '@/components/ui/LiveModeIndicator';
import { Button } from '@/components/ui/button';
import ThemeSwitcher from '@/components/settings/ThemeSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Bottom navigation items - keep limited to 4-5 primary actions
const bottomNavItems = [
  { path: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { path: '/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
  { path: '/transactions', label: 'Activity', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  { path: '/theme', label: 'Theme', icon: <Palette className="h-5 w-5" /> },
];

interface BottomNavigationProps {
  location?: string;
}

export function BottomNavigation({ location: propLocation }: BottomNavigationProps) {
  const [locationFromHook] = useLocation();
  const location = propLocation || locationFromHook;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-evenly px-2">
        {bottomNavItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-16 w-16 rounded-none",
                location === item.path 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BottomNavigation;