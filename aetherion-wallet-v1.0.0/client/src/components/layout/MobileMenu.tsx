import { Link, useLocation } from 'wouter';
import { X, Home, Coins, ArrowRightLeft, Shield, Settings, FileText, GitMerge, CreditCard, Bell, Globe } from 'lucide-react';
import { appRoutes } from '@/lib/routes';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [location, setLocation] = useLocation();
  
  // Convert app routes to nav items with icons
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Coins, label: 'Assets', path: '/assets' },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions' },
    { icon: Shield, label: 'Contracts', path: '/contracts' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: GitMerge, label: 'Fractal Explorer', path: '/fractal-explorer' },
    { icon: Globe, label: 'Brand Showcase', path: '/brands-showcase' },
    { icon: FileText, label: 'White Paper', path: '/whitepaper' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    // Regular navigation for all pages, including brand showcase
    // which now uses our integrated BrandShowcaseFrame component
    setLocation(path);
    onClose();
  };

  // If menu is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background lg:hidden z-50">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold">Aetherion UI Wallet</h1>
          <button 
            className="text-foreground"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Regular Vertical Menu */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <div 
              key={item.path}
              className={`block px-4 py-3 mb-1 cursor-pointer ${
                isActive(item.path) 
                  ? 'text-foreground bg-primary/10 border-l-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 border-l-2 border-transparent'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </div>
            </div>
          ))}
        </nav>
        
        {/* Horizontal Scrollable Menu for Categories */}
        <div className="border-t border-border py-3">
          <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Quick Access</h3>
          <div className="relative mx-4">
            {/* Shadow indicators for scroll */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            
            <div className="scroll-x scrollbar-hide pb-2 -mx-2 px-2">
              <div className="flex space-x-3 min-w-max">
                {navItems.map((item) => (
                  <div
                    key={`scroll-${item.path}`}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer whitespace-nowrap scroll-item ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification Status */}
        <div className="p-4 border-t border-border">
          <div 
            className="block p-2 cursor-pointer"
            onClick={() => handleNavigation('/settings')}
          >
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-sm">Settings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
