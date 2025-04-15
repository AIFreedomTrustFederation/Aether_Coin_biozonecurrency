import React, { useState } from "react";
import { AppDefinition } from "../../registry/AppRegistry";
import { Button } from "@/components/ui/button";
import { Menu, Grid3X3, Bell, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useZeroTrust } from "../../contexts/ZeroTrustContext";

interface AppNavbarProps {
  currentApp: AppDefinition;
  onToggleAppSelector: () => void;
  onToggleSidebar: () => void;
}

/**
 * App Navbar Component
 * 
 * The top navigation bar that displays the current app information,
 * user menu, notifications, and app selector button.
 */
const AppNavbar: React.FC<AppNavbarProps> = ({
  currentApp,
  onToggleAppSelector,
  onToggleSidebar
}) => {
  const [notifications, setNotifications] = useState<number>(3);
  const zeroTrust = useZeroTrust();
  const IconComponent = currentApp.icon;
  
  return (
    <div className="app-navbar border-b py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="bg-muted p-1.5 rounded">
              <IconComponent className="h-5 w-5 text-forest-600" />
            </div>
            <span className="font-semibold hidden sm:inline">
              {currentApp.name}
            </span>
          </div>
        </div>
        
        {/* Center section - Security Status */}
        <div className="hidden md:flex items-center gap-2">
          {zeroTrust.isInitialized ? (
            <Badge variant="outline" className="bg-forest-50 text-forest-700 border-forest-200 dark:bg-forest-950/30 dark:text-forest-400 dark:border-forest-800">
              AetherSphere Secure
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
              Initializing Security...
            </Badge>
          )}
        </div>
        
        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAppSelector}
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-forest-500"></span>
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:inline text-sm font-normal">Account</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Security Settings</DropdownMenuItem>
              <DropdownMenuItem>API Keys</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default AppNavbar;