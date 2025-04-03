import { Link, useLocation } from 'wouter';
import { X, Home, Coins, ArrowRightLeft, Shield, Settings, FileText, GitMerge, CreditCard, Bell } from 'lucide-react';
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
    { icon: FileText, label: 'White Paper', path: '/whitepaper' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path: string) => {
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
