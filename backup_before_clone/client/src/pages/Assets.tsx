import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWallets } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileMenu from '@/components/layout/MobileMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Layers,
  BarChart3,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  ChevronRight,
  AlertTriangle,
  Clock,
  Shield
} from 'lucide-react';
import { formatCurrency, formatCrypto, shortenAddress, getWalletIcon } from '@/lib/utils';

const Assets = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const { data: wallets, isLoading, error } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: fetchWallets
  });
  
  // Calculate total portfolio value
  const totalPortfolioValue = wallets?.reduce((sum, wallet) => sum + wallet.dollarValue, 0) || 0;
  
  // Get unique chains for filtering
  const chains = wallets 
    ? Array.from(new Set(wallets.map(wallet => wallet.chain)))
    : [];
  
  // Filter wallets by selected chain
  const filteredWallets = selectedChain
    ? wallets?.filter(wallet => wallet.chain === selectedChain)
    : wallets;

  // Handler to copy address to clipboard
  const copyAddressToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    // Could add a toast notification here
  };
  
  // Render wallet cards
  const renderWalletCards = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-6 w-36 mt-4" />
            <Skeleton className="h-5 w-48 mt-2" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (error) {
      return (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>Failed to load wallets: {(error as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (!filteredWallets?.length) {
      return (
        <Card className="mb-4">
          <CardContent className="p-5 flex flex-col items-center justify-center py-10">
            <Wallet className="w-12 h-12 text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground text-center">No wallets found for {selectedChain || 'selected filters'}</p>
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Add New Wallet
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <AnimatePresence>
        {filteredWallets?.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="mb-4 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-background rounded-full p-2 mr-3">
                      <img 
                        src={getWalletIcon(wallet.chain)} 
                        alt={wallet.chain} 
                        className="w-10 h-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgMUg1QzMuOSAxIDMgMS45IDMgM1YyMUMzIDIyLjEgMy45IDIzIDUgMjNIMTlDMjAuMSAyMyAyMSAyMi4xIDIxIDIxVjNDMjEgMS45IDIwLjEgMSAxOSAxWk0xOCAxMEg2VjhIMThWMTBaTTEyIDExVjE0SDZWMTFIMTJaTTYgMThWMTVIMThWMThINloiIGZpbGw9IiM2QTVBQ0QiLz48L3N2Zz4=';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{wallet.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-mono">{shortenAddress(wallet.address)}</span>
                        <button 
                          onClick={() => copyAddressToClipboard(wallet.address)}
                          className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      wallet.percentChange >= 0 
                        ? 'text-green-500 bg-green-500/10' 
                        : 'text-red-500 bg-red-500/10'
                    }`}
                  >
                    {wallet.percentChange >= 0 ? (
                      <ArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(wallet.percentChange).toFixed(2)}%
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <div className="text-2xl font-semibold">
                    {formatCrypto(wallet.balance, wallet.symbol)}
                  </div>
                  <div className="text-muted-foreground">
                    {formatCurrency(wallet.dollarValue)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-2">
                    <Badge variant="secondary" className="flex items-center">
                      <Layers className="w-3 h-3 mr-1" />
                      {wallet.chain}
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="text-primary">
                    Manage <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        {/* Assets Page */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Asset Management</h2>
            <p className="text-muted-foreground">
              Manage your quantum-resistant wallets and digital assets across multiple blockchains
            </p>
          </div>
          
          {/* Portfolio Summary */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-muted-foreground text-sm mb-1">Total Portfolio Value</h3>
                  <div className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button>
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Add New Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Blockchain Filter Tabs */}
          <Tabs 
            defaultValue="all" 
            value={selectedChain || 'all'} 
            onValueChange={(value) => setSelectedChain(value === 'all' ? null : value)} 
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">My Wallets</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add Wallet
              </Button>
            </div>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Chains</TabsTrigger>
              {chains.slice(0, 3).map(chain => (
                <TabsTrigger key={chain} value={chain}>
                  {chain.charAt(0).toUpperCase() + chain.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedChain || 'all'} className="space-y-4">
              {renderWalletCards()}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Assets;