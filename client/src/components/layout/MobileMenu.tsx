import { lazy, Suspense, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  X, Home, Coins, ArrowRightLeft, Shield, Settings, FileText, GitMerge, 
  CreditCard, Bell, Database, Globe, ChevronRight, TestTube, UserCircle2, 
  Blocks, Zap, Info, Cpu, Bot, Lightbulb, Smartphone, Layout, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading components for better performance
const CategorySection = lazy(() => import('./mobile-menu/CategorySection'));
const QuickAccessSection = lazy(() => import('./mobile-menu/QuickAccessSection'));

// Types for NavItem (also used in the main component)
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  category?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [location, setLocation] = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // All navigation items with icons
  const navItems = [
    { icon: Layout, label: 'Dashboard', path: '/dashboard', category: 'Main' },
    { icon: Wallet, label: 'Wallet', path: '/wallet', category: 'Main' },
    { icon: CreditCard, label: 'Payment', path: '/payment', category: 'Finance' },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions', category: 'Finance' },
    { icon: Database, label: 'Domain Hosting', path: '/domain-hosting', category: 'Domains' },
    { icon: Globe, label: 'Domain Wizard', path: '/domain-hosting-wizard', category: 'Domains' },
    { icon: ChevronRight, label: 'Bridge', path: '/bridge', category: 'Blockchain' },
    { icon: TestTube, label: 'Bridge Test', path: '/bridge-test', category: 'Developer' },
    { icon: Shield, label: 'Escrow', path: '/escrow', category: 'Finance' },
    { icon: UserCircle2, label: 'Trust Portal', path: '/trust/portal', category: 'Security' },
    { icon: Shield, label: 'AI Freedom Trust', path: '/ai-freedom-trust/login', category: 'Security' },
    { icon: Database, label: 'Blockchain Explorer', path: '/blockchain-explorer', category: 'Blockchain' },
    { icon: Blocks, label: 'Blockchain Dashboard', path: '/blockchain-dashboard', category: 'Blockchain' },
    { icon: Zap, label: 'Singularity', path: '/singularity', category: 'Advanced' },
    { icon: Coins, label: 'AetherCoin', path: '/aethercoin', category: 'Finance' },
    { icon: Coins, label: 'ICO', path: '/ico', category: 'Finance' },
    { icon: FileText, label: 'Whitepaper', path: '/whitepaper', category: 'Resources' },
    { icon: Info, label: 'About', path: '/about', category: 'Resources' },
    { icon: Cpu, label: 'Fractal Explorer', path: '/fractal-explorer', category: 'Advanced' },
    { icon: Database, label: 'Blockchain Visualizer', path: '/blockchain-visualizer', category: 'Blockchain' },
    { icon: Bot, label: 'Mysterion AI', path: '/ai-assistant', category: 'AI' },
    { icon: Lightbulb, label: 'AI Assistant Demo', path: '/ai-assistant-onboarding', category: 'AI' },
    { icon: Smartphone, label: 'Mobile Features', path: '/mobile-feature', category: 'Settings' },
    { icon: Shield, label: 'Security', path: '/security', category: 'Security' },
    { icon: Settings, label: 'Settings', path: '/settings', category: 'Settings' },
    { icon: TestTube, label: 'Test Mode', path: '/test', category: 'Developer' },
  ];

  // Filter items based on search query
  const filteredItems = searchQuery 
    ? navItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;

  // Get all unique categories from filtered items
  const categoriesSet = new Set(filteredItems.map(item => item.category || ''));
  const categories = Array.from(categoriesSet);
  
  // Get common items for quick access - priority menu items
  const quickAccessItems = navItems.filter(item => 
    ['Dashboard', 'Wallet', 'Transactions', 'Payment', 'Settings'].includes(item.label)
  );

  // Function to filter items by category
  const getItemsByCategory = (category: string) => {
    return filteredItems.filter(item => item.category === category);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location === '/') return true;
    if (path === location) return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // If menu is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm lg:hidden z-50 flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold">Aetherion UI Wallet</h1>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-accent/30 text-foreground border border-border rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Show search results or normal navigation */}
        {searchQuery ? (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Search Results</h3>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div 
                    key={item.path}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-md cursor-pointer",
                      isActive(item.path) 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-accent/50 text-foreground'
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Quick Access Section - Lazy Loaded */}
            <Suspense fallback={
              <div className="py-4 border-b border-border">
                <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Quick Access</h3>
                <div className="px-4 flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            }>
              <QuickAccessSection 
                items={quickAccessItems}
                isActive={isActive}
                onSelect={handleNavigation}
              />
            </Suspense>
            
            {/* Category-based Navigation - Lazy Loaded */}
            <nav className="flex-1 overflow-y-auto py-2">
              <Suspense fallback={
                <div className="px-4 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </div>
                      {i % 2 === 0 && (
                        <div className="ml-4 pl-2 border-l border-border space-y-2">
                          {Array(3).fill(0).map((_, j) => (
                            <div key={j} className="flex items-center space-x-2">
                              <Skeleton className="h-5 w-5 rounded" />
                              <Skeleton className="h-4 w-28 rounded" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              }>
                {categories.map((category) => (
                  <CategorySection 
                    key={category}
                    category={category}
                    items={getItemsByCategory(category)}
                    isExpanded={expandedCategory === category}
                    isActive={isActive}
                    onToggle={() => toggleCategory(category)}
                    onSelect={handleNavigation}
                  />
                ))}
              </Suspense>
            </nav>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
