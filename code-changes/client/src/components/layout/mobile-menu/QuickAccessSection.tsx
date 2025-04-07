import { FC } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Search, Home as HomeIcon, Wallet as WalletIcon, LineChart as ChartIcon, BookText as BookIcon } from 'lucide-react';

interface QuickAccessSectionProps {
  onClose: () => void;
}

/**
 * Quick access section for the mobile menu
 * Provides shortcuts to the most frequently used pages
 */
const QuickAccessSection: FC<QuickAccessSectionProps> = ({ onClose }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-primary">Quick Access</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Dashboard */}
        <Link href="/">
          <a 
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-primary/5 transition-colors" 
            onClick={onClose}
          >
            <HomeIcon className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Dashboard</span>
          </a>
        </Link>
        
        {/* Wallet */}
        <Link href="/wallet">
          <a 
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-primary/5 transition-colors" 
            onClick={onClose}
          >
            <WalletIcon className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Wallet</span>
          </a>
        </Link>
        
        {/* Analytics */}
        <Link href="/analytics">
          <a 
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-primary/5 transition-colors" 
            onClick={onClose}
          >
            <ChartIcon className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Analytics</span>
          </a>
        </Link>
        
        {/* Docs */}
        <Link href="/docs">
          <a 
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-primary/5 transition-colors" 
            onClick={onClose}
          >
            <BookIcon className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Documentation</span>
          </a>
        </Link>
      </div>
      
      {/* Search Bar */}
      <div className="mt-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search Aetherion..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};

export default QuickAccessSection;