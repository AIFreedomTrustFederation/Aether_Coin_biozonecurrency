import { Link, useLocation } from 'wouter';
import { X, Home, Coins, ArrowRightLeft, BarChart2, Image, Shield, Settings, FileText, GitMerge } from 'lucide-react';
import FractalNavigation from './FractalNavigation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [location] = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Coins, label: 'Assets', path: '/assets' },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions' },
    { icon: BarChart2, label: 'DeFi', path: '/defi' },
    { icon: Image, label: 'NFTs', path: '/nfts' },
    { icon: Shield, label: 'Smart Contracts', path: '/contracts' },
    { icon: GitMerge, label: 'Fractal Explorer', path: '/fractal-explorer' },
    { icon: FileText, label: 'White Paper', path: '/whitepaper' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div 
      className={`fixed inset-0 bg-background transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ zIndex: 9999999 }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Aetherion UI Wallet
          </h1>
          <button 
            className="text-foreground"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <div key={item.path}>
              <Link href={item.path}>
                <div 
                  className={`nav-item cursor-pointer flex items-center px-4 py-3 transition-all duration-200 hover:bg-primary/10 hover:border-l-3 hover:border-primary ${
                    isActive(item.path) 
                      ? 'active text-foreground bg-primary/20 border-l-3 border-primary' 
                      : 'text-muted-foreground hover:text-foreground border-l-3 border-transparent'
                  }`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
              </Link>
            </div>
          ))}
        </nav>
        
        {/* AI Bot Status for Mobile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="relative w-3 h-3 mr-3">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
            </div>
            <div className="text-sm">
              <div className="text-foreground">AI Bot Status</div>
              <div className="text-xs text-muted-foreground">Active - Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
