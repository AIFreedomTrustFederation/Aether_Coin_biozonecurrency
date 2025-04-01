import { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

const Header = ({ toggleMobileMenu }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border flex items-center justify-between p-4 relative" style={{ zIndex: 9999999 }}>
      <div className="flex items-center lg:hidden">
        <button 
          className="text-primary hover:text-primary/80 mr-3 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          style={{ position: 'relative', zIndex: 9999999 }}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold font-heading bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Aetherion
        </h1>
      </div>
      
      <div className="flex-1 mx-4 lg:block hidden">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search wallets, transactions, or tokens..."
            className="w-full pl-10 bg-background"
          />
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="relative mr-4">
          <button className="text-muted-foreground hover:text-foreground">
            <Bell className="w-6 h-6" />
          </button>
          <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
        </div>
        <Avatar className="h-8 w-8 bg-gradient-to-r from-primary to-blue-500 cursor-pointer">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
