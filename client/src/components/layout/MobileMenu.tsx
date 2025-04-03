import { Link, useLocation } from 'wouter';
import { X, Home, Coins, ArrowRightLeft, BarChart2, Shield, Settings, FileText, GitMerge, CreditCard, Bell } from 'lucide-react';
import { appRoutes } from '@/lib/routes';
import { useQuery } from '@tanstack/react-query';

// Define type for notification preferences
interface NotificationPreference {
  id: number;
  userId: number;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  smsEnabled: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  priceAlerts: boolean;
  marketingUpdates: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [location] = useLocation();
  
  // Query notification preferences to check if there are any pending alerts
  const { data: notificationPreferences } = useQuery<NotificationPreference>({
    queryKey: ['/api/notification-preferences'],
    retry: false
  });
  
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

  return (
    <div 
      className={`fixed inset-0 bg-background transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ zIndex: 2147483647 }}
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
        
        {/* Notification & AI Bot Status for Mobile */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Notification Status */}
          <Link href="/settings" onClick={onClose}>
            <div className="flex items-center hover:bg-primary/10 p-2 rounded-md cursor-pointer">
              <div className="relative w-8 h-8 flex items-center justify-center mr-3 bg-primary/10 rounded-full">
                <Bell className="w-4 h-4 text-primary" />
                {notificationPreferences?.phoneNumber && !notificationPreferences?.isPhoneVerified && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <div className="text-sm flex-1">
                <div className="text-foreground">Notifications</div>
                <div className="text-xs text-muted-foreground">
                  {!notificationPreferences?.phoneNumber 
                    ? "Not configured" 
                    : !notificationPreferences?.isPhoneVerified 
                      ? "Verification needed" 
                      : notificationPreferences?.smsEnabled 
                        ? "SMS alerts enabled" 
                        : "SMS alerts disabled"}
                </div>
              </div>
            </div>
          </Link>

          {/* AI Bot Status */}
          <div className="flex items-center p-2 rounded-md">
            <div className="relative w-8 h-8 flex items-center justify-center mr-3 bg-green-500/10 rounded-full">
              <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
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
