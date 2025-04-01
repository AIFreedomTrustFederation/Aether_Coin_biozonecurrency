import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentTransactions, fetchWallets } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileMenu from '@/components/layout/MobileMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  ChevronsUpDown,
  Copy,
  ChevronRight,
  AlertTriangle,
  Zap,
  FileCode,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatCrypto, shortenAddress, timeAgo } from '@/lib/utils';

const Transactions = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Fetch transactions and wallets
  const { data: transactions, isLoading: isLoadingTransactions, error: transactionError } = useQuery({
    queryKey: ['/api/transactions/recent'],
    queryFn: () => fetchRecentTransactions(20) // Get more transactions for the dedicated page
  });
  
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: fetchWallets
  });
  
  // Filter and search transactions
  const filteredTransactions = transactions?.filter(tx => {
    // Filter by type
    if (filter !== 'all' && tx.type !== filter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        tx.txHash.toLowerCase().includes(term) ||
        (tx.fromAddress && tx.fromAddress.toLowerCase().includes(term)) ||
        (tx.toAddress && tx.toAddress.toLowerCase().includes(term)) ||
        tx.amount.toLowerCase().includes(term) ||
        tx.tokenSymbol.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
  
  // Get wallet name by wallet ID
  const getWalletName = (walletId: number) => {
    const wallet = wallets?.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Unknown Wallet';
  };
  
  // Handler to copy hash to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };
  
  // Render transaction list
  const renderTransactions = () => {
    if (isLoadingTransactions) {
      return Array(5).fill(0).map((_, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-48 mt-3" />
            <Skeleton className="h-4 w-32 mt-2" />
            <div className="flex justify-between items-center mt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (transactionError) {
      return (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>Failed to load transactions: {(transactionError as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (!filteredTransactions?.length) {
      return (
        <Card className="mb-4">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ChevronsUpDown className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchTerm 
                ? `No results match your search criteria "${searchTerm}"`
                : filter !== 'all'
                  ? `No ${filter} transactions found. Try a different filter.`
                  : 'No transactions have been recorded yet. Start by sending or receiving assets.'}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <AnimatePresence>
        {filteredTransactions?.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="mb-4 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      tx.type === 'receive' 
                        ? 'bg-green-500/10' 
                        : tx.type === 'send' 
                        ? 'bg-blue-500/10' 
                        : 'bg-purple-500/10'
                    }`}>
                      {tx.type === 'receive' ? (
                        <ArrowDownRight className="w-6 h-6 text-green-500" />
                      ) : tx.type === 'send' ? (
                        <ArrowUpRight className="w-6 h-6 text-blue-500" />
                      ) : (
                        <FileCode className="w-6 h-6 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-base">
                          {tx.type === 'receive' 
                            ? 'Received' 
                            : tx.type === 'send' 
                            ? 'Sent' 
                            : 'Contract Interaction'}
                        </h3>
                        <div className="ml-2 flex items-center">
                          {tx.aiVerified && (
                            <Badge 
                              variant="outline" 
                              className="flex items-center text-xs bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              AI Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        From {getWalletName(tx.walletId)}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{shortenAddress(tx.txHash, 8, 8)}</span>
                        <button 
                          onClick={() => copyToClipboard(tx.txHash)}
                          className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      tx.type === 'receive' 
                        ? 'text-green-500' 
                        : tx.type === 'send' 
                        ? 'text-primary' 
                        : 'text-purple-500'
                    }`}>
                      {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                      {formatCrypto(tx.amount, tx.tokenSymbol)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {timeAgo(tx.timestamp)}
                    </div>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          tx.status === 'confirmed' 
                            ? 'bg-green-500/10 text-green-500' 
                            : tx.status === 'pending' 
                            ? 'bg-yellow-500/10 text-yellow-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {tx.status === 'confirmed' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : tx.status === 'pending' ? (
                          <Clock className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Transaction details */}
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <div className="text-sm">
                    {tx.fee && (
                      <span className="text-muted-foreground">
                        Fee: {tx.fee} {tx.tokenSymbol}
                      </span>
                    )}
                    {tx.blockNumber && (
                      <span className="text-muted-foreground ml-3">
                        Block: {tx.blockNumber}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
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
        
        {/* Transactions Page */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Transaction History</h2>
            <p className="text-muted-foreground">
              Monitor cross-chain transactions with quantum-resistant verification
            </p>
          </div>
          
          {/* Transaction Controls */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by hash, address, amount..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                  <Button size="sm" className="flex items-center gap-1">
                    <Zap className="w-4 h-4 mr-1" />
                    Verify All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transaction Filters */}
          <Tabs 
            defaultValue="all" 
            value={filter} 
            onValueChange={setFilter} 
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Transaction History</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <Wallet className="w-3.5 h-3.5 mr-1" />
                {isLoadingWallets ? 'Loading wallets...' : 
                 `${wallets?.length || 0} wallet${wallets?.length !== 1 ? 's' : ''} connected`}
              </div>
            </div>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="receive">Received</TabsTrigger>
              <TabsTrigger value="send">Sent</TabsTrigger>
              <TabsTrigger value="contract_interaction">Contracts</TabsTrigger>
            </TabsList>
            
            {renderTransactions()}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Transactions;