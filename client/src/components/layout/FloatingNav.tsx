import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  Home,
  Wallet,
  BarChart3,
  Scroll,
  FileCode2,
  FolderKanban,
  Settings,
  CreditCard,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FloatingNavProps {
  routes: {
    path: string;
    label: string;
  }[];
  className?: string;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ routes, className }) => {
  const [location] = useLocation();
  
  // Get icon for route
  const getRouteIcon = (path: string) => {
    switch (path) {
      case '/':
        return <Home className="w-5 h-5" />;
      case '/assets':
        return <Wallet className="w-5 h-5" />;
      case '/transactions':
        return <BarChart3 className="w-5 h-5" />;
      case '/contracts':
        return <FileCode2 className="w-5 h-5" />;
      case '/fractal-explorer':
        return <FolderKanban className="w-5 h-5" />;
      case '/whitepaper':
        return <Scroll className="w-5 h-5" />;
      case '/settings':
        return <Settings className="w-5 h-5" />;
      case '/payments':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <ArrowUpDown className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-[9999]", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            aria-label="Navigation menu"
          >
            <Menu className="h-6 w-6 text-primary-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={16} className="w-56">
          {routes.map((route) => (
            <DropdownMenuItem 
              key={route.path} 
              asChild
              className={cn(
                "cursor-pointer py-3 px-4",
                location === route.path && "bg-primary/10 text-primary font-medium"
              )}
            >
              <Link href={route.path} className="flex items-center gap-3 w-full">
                {getRouteIcon(route.path)}
                <span>{route.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FloatingNav;
