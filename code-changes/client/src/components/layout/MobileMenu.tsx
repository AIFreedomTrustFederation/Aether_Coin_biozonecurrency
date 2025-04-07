import { FC, Suspense, lazy, useState } from 'react';
import { X, Menu, Loader2 } from 'lucide-react';

// Lazy load components for better performance
const QuickAccessSection = lazy(() => import('./mobile-menu/QuickAccessSection'));
const CategorySection = lazy(() => import('./mobile-menu/CategorySection'));

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile menu component with lazy-loaded sections
 * Displays when the hamburger menu is clicked on mobile devices
 */
const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  // Wallet section navigation items
  const walletItems = [
    { label: 'My Wallet', href: '/wallet' },
    { label: 'Send Tokens', href: '/wallet/send' },
    { label: 'Receive Tokens', href: '/wallet/receive' },
    { label: 'Transaction History', href: '/wallet/history' },
    { label: 'Staking Rewards', href: '/wallet/staking' },
  ];
  
  // Network section navigation items
  const networkItems = [
    { label: 'Network Status', href: '/network/status' },
    { label: 'Validators', href: '/network/validators' },
    { label: 'Governance', href: '/network/governance' },
    { label: 'Bridge', href: '/network/bridge' },
  ];
  
  // Resources section navigation items
  const resourcesItems = [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'Community', href: '/community' },
    { label: 'Support', href: '/support' },
  ];

  // Loading fallback component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-24 bg-gray-300 rounded"></div>
        <div className="h-24 bg-gray-300 rounded"></div>
        <div className="h-24 bg-gray-300 rounded"></div>
        <div className="h-24 bg-gray-300 rounded"></div>
      </div>
      <div className="h-10 bg-gray-300 rounded mb-6"></div>
      <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-12 bg-gray-300 rounded"></div>
        <div className="h-12 bg-gray-300 rounded"></div>
        <div className="h-12 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Menu content with lazy loading */}
        <div className="space-y-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <QuickAccessSection onClose={onClose} />
            
            <CategorySection 
              title="Wallet" 
              items={walletItems} 
              onClose={onClose} 
            />
            
            <CategorySection 
              title="Network" 
              items={networkItems} 
              onClose={onClose} 
            />
            
            <CategorySection 
              title="Resources" 
              items={resourcesItems} 
              onClose={onClose} 
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export const MobileMenuTrigger: FC<{onClick: () => void}> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-muted transition-colors md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
};

export default MobileMenu;