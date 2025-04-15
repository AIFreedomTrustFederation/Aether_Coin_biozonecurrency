import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Menu, ChevronDown, Settings, LogOut, Shield, User } from 'lucide-react';

interface TopbarProps {
  appName: string;
  onMenuClick: () => void;
}

/**
 * Top navigation bar component
 */
export const Topbar: React.FC<TopbarProps> = ({ appName, onMenuClick }) => {
  return (
    <header className="h-16 border-b bg-card flex items-center px-4 sticky top-0 z-30">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      
      <h1 className="text-lg font-semibold ml-2 md:ml-0">{appName}</h1>
      
      {/* Right Side Actions */}
      <div className="ml-auto flex items-center space-x-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-forest-500"></span>
        </Button>
        
        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-1 pr-2 flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-forest-100 text-forest-800">AT</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block mr-1">Account</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="h-4 w-4 mr-2" /> Security
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};