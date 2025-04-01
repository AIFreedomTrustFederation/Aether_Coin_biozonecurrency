import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Coins, 
  ArrowRightLeft, 
  BarChart2, 
  Image, 
  Shield, 
  Settings 
} from 'lucide-react';
import FractalNavigation from './FractalNavigation';

const Sidebar = () => {
  const [location] = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Coins, label: 'Assets', path: '/assets' },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions' },
    { icon: BarChart2, label: 'DeFi', path: '/defi' },
    { icon: Image, label: 'NFTs', path: '/nfts' },
    { icon: Shield, label: 'Smart Contracts', path: '/contracts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="hidden lg:flex flex-col w-64 border-r border-border h-full bg-sidebar">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Aetherion UI Wallet
        </h1>
      </div>
      
      {/* Fractal Tree of Life Navigation */}
      <div className="p-4 border-b border-border">
        <div className="text-sm font-medium text-sidebar-foreground/60 mb-3">Fractal Navigation</div>
        <FractalNavigation />
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={`nav-item flex items-center px-4 py-3 transition-all duration-200 hover:bg-sidebar-primary/10 hover:border-l-3 hover:border-sidebar-primary ${
              isActive(item.path) 
                ? 'active text-sidebar-foreground bg-sidebar-primary/20 border-l-3 border-sidebar-primary' 
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground border-l-3 border-transparent'
            }`}>
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      
      {/* AI Bot Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="relative w-3 h-3 mr-3">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
          </div>
          <div className="text-sm">
            <div className="text-sidebar-foreground">AI Bot Status</div>
            <div className="text-xs text-sidebar-foreground/60">Active - Monitoring</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
