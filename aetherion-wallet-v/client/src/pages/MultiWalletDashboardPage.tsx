import React, { useState } from 'react';
import { useMultiWallet, WalletInfo } from '@/context/MultiWalletContext';
import { WalletType } from '@/lib/wallet-connectors';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertTriangle, 
  Plus, 
  Wallet, 
  Zap, 
  RefreshCw, 
  Star,
  History,
  ChevronRight,
  Send,
  ArrowDownUp,
  Shield,
  BarChart4,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_NETWORKS } from '@/lib/wallet-connectors';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock transaction data for demonstration
const mockTransactions = [
  { 
    id: '1', 
    type: 'send', 
    amount: '0.05', 
    asset: 'ETH', 
    status: 'completed', 
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    to: '0x1234...5678',
    hash: '0xabcd1234...'
  },
  { 
    id: '2', 
    type: 'receive', 
    amount: '100', 
    asset: 'USDC', 
    status: 'completed', 
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    from: '0x8765...4321',
    hash: '0xefgh5678...'
  },
  { 
    id: '3', 
    type: 'swap', 
    amount: '0.1', 
    asset: 'ETH', 
    toAmount: '180', 
    toAsset: 'USDC', 
    status: 'completed', 
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    hash: '0xijkl9012...'
  },
];

const MultiWalletDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const { 
    wallets, 
    primaryWallet, 
    setPrimaryWallet,
    availableWallets, 
    isConnecting, 
    connect, 
    disconnect,
    disconnectAll,
    switchChain,
    refreshBalance,
    refreshAllBalances
  } = useMultiWallet();
  
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(primaryWallet?.id || null);
  const [selectedWalletDetails, setSelectedWalletDetails] = useState<WalletInfo | null>(primaryWallet);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address || address.includes('Connecting') || address.includes('Pending')) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Get wallet icon
  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'MetaMask':
        return <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="MetaMask" className="h-6 w-6" />;
      case 'Coinbase':
        return <img src="https://avatars.githubusercontent.com/u/1885080" alt="Coinbase" className="h-6 w-6 rounded-full" />;
      case 'Binance':
        return <img src="https://public.bnbstatic.com/static/images/common/favicon.ico" alt="Binance" className="h-6 w-6" />;
      case 'WalletConnect':
        return <img src="https://avatars.githubusercontent.com/u/37784886" alt="WalletConnect" className="h-6 w-6 rounded-full" />;
      case '1inch':
        return <img src="https://avatars.githubusercontent.com/u/43341799" alt="1inch" className="h-6 w-6 rounded-full" />;
      case 'Trust':
        return <img src="https://avatars.githubusercontent.com/u/32179889" alt="Trust Wallet" className="h-6 w-6 rounded-full" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };
  
  // Handle wallet connection
  const handleConnect = async (walletType: WalletType) => {
    setError(null);
    try {
      const result = await connect(walletType);
      
      if (result && 'status' in result && result.status === 'error') {
        setError(`Failed to connect: ${result.error}`);
        return;
      }
      
      setConnectDialogOpen(false);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected ${walletType}`,
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Connection failed. Please try again.');
    }
  };
  
  // Get network details for a wallet
  const getNetworkDetails = (chainId: number) => {
    const network = SUPPORTED_NETWORKS[chainId];
    if (network) {
      return {
        name: network.name,
        symbol: network.symbol
      };
    }
    return {
      name: 'Unknown Network',
      symbol: 'ETH'
    };
  };
  
  // Handle making a wallet primary
  const handleSetPrimary = (walletId: string) => {
    setPrimaryWallet(walletId);
    toast({
      title: "Primary Wallet Set",
      description: "Your primary wallet has been updated",
    });
  };
  
  // Handle disconnecting a wallet
  const handleDisconnect = async (walletId: string, walletName: string) => {
    await disconnect(walletId);
    if (selectedWallet === walletId) {
      setSelectedWallet(wallets.length > 1 ? (wallets[0].id !== walletId ? wallets[0].id : wallets[1].id) : null);
      setSelectedWalletDetails(wallets.length > 1 ? (wallets[0].id !== walletId ? wallets[0] : wallets[1]) : null);
    }
    toast({
      title: "Wallet Disconnected",
      description: `${walletName} has been disconnected`,
    });
  };
  
  // Handle disconnecting all wallets
  const handleDisconnectAll = async () => {
    await disconnectAll();
    setSelectedWallet(null);
    setSelectedWalletDetails(null);
  };
  
  // Refresh all wallet balances
  const handleRefreshAll = async () => {
    await refreshAllBalances();
    toast({
      title: "Balances Updated",
      description: "Refreshed all wallet balances",
    });
  };

  // Handle wallet selection
  const handleWalletSelect = (wallet: WalletInfo) => {
    setSelectedWallet(wallet.id);
    setSelectedWalletDetails(wallet);
    setSelectedTab('overview');
  };
  
  // Transaction component
  const TransactionItem = ({ transaction }: { transaction: any }) => {
    const getTransactionIcon = (type: string) => {
      switch (type) {
        case 'send': return <Send className="h-4 w-4 text-orange-500" />;
        case 'receive': return <ArrowDownUp className="h-4 w-4 text-green-500" />;
        case 'swap': return <ArrowDownUp className="h-4 w-4 text-blue-500" />;
        default: return <History className="h-4 w-4" />;
      }
    };
    
    const getTransactionTitle = (tx: any) => {
      switch (tx.type) {
        case 'send': return `Sent ${tx.amount} ${tx.asset}`;
        case 'receive': return `Received ${tx.amount} ${tx.asset}`;
        case 'swap': return `Swapped ${tx.amount} ${tx.asset} for ${tx.toAmount} ${tx.toAsset}`;
        default: return 'Transaction';
      }
    };
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };
    
    return (
      <div className="flex items-center justify-between py-3 border-b last:border-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            {getTransactionIcon(transaction.type)}
          </div>
          <div>
            <h4 className="font-medium text-sm">{getTransactionTitle(transaction)}</h4>
            <p className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <a 
            href={`https://etherscan.io/tx/${transaction.hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span className="text-xs">View</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    );
  };
  
  // Wallet option component for connection dialog
  const WalletOption = ({ type, name, onClick, disabled }: {
    type: WalletType;
    name: string;
    onClick: (type: WalletType) => void;
    disabled?: boolean;
  }) => (
    <Card 
      className={`cursor-pointer hover:border-primary transition-all duration-200 ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && onClick(type)}
    >
      <CardContent className="flex items-center p-4 gap-3">
        <div className="text-3xl text-primary">{getWalletIcon(type)}</div>
        <div>
          <h3 className="font-medium">{name}</h3>
          {disabled && <p className="text-sm text-muted-foreground">Not detected</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Render content when no wallets are connected
  const renderEmptyState = () => (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
      <div className="bg-primary/10 p-6 rounded-full mb-4">
        <Wallet className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No Wallets Connected</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Connect your cryptocurrency wallets to manage your digital assets and 
        interact with the Aetherion ecosystem.
      </p>
      <Button onClick={() => setConnectDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Connect a Wallet
      </Button>
    </div>
  );

  // Render wallets sidebar
  const renderWalletsSidebar = () => (
    <div className="w-full md:w-64 lg:w-72 border-r">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">My Wallets</h2>
          <Button variant="outline" size="sm" onClick={() => setConnectDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="w-full" onClick={handleRefreshAll}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" variant="secondary" className="w-full" onClick={handleDisconnectAll}>
            Disconnect All
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
        {wallets.map(wallet => {
          const networkDetails = getNetworkDetails(wallet.chainId);
          const isSelected = selectedWallet === wallet.id;
          const isPrimaryWallet = primaryWallet?.id === wallet.id;
          
          return (
            <div 
              key={wallet.id}
              className={`border-b p-4 cursor-pointer hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-secondary/30' : ''}`}
              onClick={() => handleWalletSelect(wallet)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getWalletIcon(wallet.walletType)}
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatAddress(wallet.address)}
                    </div>
                  </div>
                </div>
                <div>
                  {isPrimaryWallet && (
                    <Badge variant="outline" className="text-xs bg-primary/10">Primary</Badge>
                  )}
                </div>
              </div>
              <div className="mb-1">
                <div className="text-sm font-semibold">
                  {parseFloat(wallet.balance).toFixed(4)} {wallet.nativeToken}
                </div>
                <div className="text-xs text-muted-foreground">
                  {networkDetails.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render wallet detail view
  const renderWalletDetail = () => {
    if (!selectedWalletDetails) return null;
    
    const wallet = selectedWalletDetails;
    const networkDetails = getNetworkDetails(wallet.chainId);
    const isPending = wallet.status === 'pending';
    
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {getWalletIcon(wallet.walletType)}
              <h2 className="text-xl font-bold">{wallet.name}</h2>
              {primaryWallet?.id !== wallet.id ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs gap-1 ml-2"
                  onClick={() => handleSetPrimary(wallet.id)}
                >
                  <Star className="h-3 w-3 text-yellow-500" />
                  Set as Primary
                </Button>
              ) : (
                <Badge variant="outline" className="ml-2 text-xs bg-primary/10">Primary Wallet</Badge>
              )}
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDisconnect(wallet.id, wallet.name)}
            >
              Disconnect
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Address</div>
              <div className="flex items-center gap-2">
                <code className="bg-secondary/30 px-2 py-1 rounded text-sm font-mono">
                  {wallet.address}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => {
                  navigator.clipboard.writeText(wallet.address);
                  toast({ description: "Address copied to clipboard" });
                }}>
                  <span className="sr-only">Copy address</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0" asChild>
                  <a 
                    href={`https://etherscan.io/address/${wallet.address}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">View on Explorer</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Network</div>
              <div className="font-medium">{networkDetails.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Balance</div>
              <div className="font-medium flex items-center gap-2">
                {parseFloat(wallet.balance).toFixed(4)} {wallet.nativeToken}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 p-1"
                  onClick={() => refreshBalance(wallet.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="border-b">
            <div className="px-4">
              <TabsList className="mb-0 mt-0 h-12">
                <TabsTrigger value="overview" className="flex gap-1 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none">
                  <BarChart4 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex gap-1 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none">
                  <History className="h-4 w-4" />
                  <span>Activity</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex gap-1 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="overview" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button className="justify-start gap-2" variant="outline">
                    <Send className="h-4 w-4" /> Send
                  </Button>
                  <Button className="justify-start gap-2" variant="outline">
                    <ArrowDownUp className="h-4 w-4" /> Swap
                  </Button>
                  <Button className="justify-start gap-2" variant="outline">
                    <Shield className="h-4 w-4" /> Backup
                  </Button>
                  <Button className="justify-start gap-2" variant="outline">
                    <Zap className="h-4 w-4" /> Bridge
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Security Score</span>
                    <span className="font-medium">85/100</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="mt-4">
                    <Button variant="link" className="p-0 h-auto text-sm flex items-center gap-1">
                      View security recommendations <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {mockTransactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  <div className="divide-y">
                    {mockTransactions.slice(0, 3).map(tx => (
                      <TransactionItem key={tx.id} transaction={tx} />
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setSelectedTab('activity')}
                >
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all transactions associated with this wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockTransactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-full bg-primary/10">
                                {tx.type === 'send' && <Send className="h-4 w-4 text-orange-500" />}
                                {tx.type === 'receive' && <ArrowDownUp className="h-4 w-4 text-green-500" />}
                                {tx.type === 'swap' && <ArrowDownUp className="h-4 w-4 text-blue-500" />}
                              </div>
                              <span className="capitalize">{tx.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {tx.type === 'send' && `To: ${tx.to}`}
                            {tx.type === 'receive' && `From: ${tx.from}`}
                            {tx.type === 'swap' && `${tx.amount} ${tx.asset} → ${tx.toAmount} ${tx.toAsset}`}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{tx.amount} {tx.asset}</div>
                          </TableCell>
                          <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={tx.status === 'completed' ? 'outline' : 'secondary'}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={`https://etherscan.io/tx/${tx.hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <span className="text-xs">View</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="p-4">
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertTitle>Wallet Security</AlertTitle>
              <AlertDescription>
                Review and enhance the security settings for your connected wallet.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-700 dark:text-green-300 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Hardware Wallet</h3>
                        <p className="text-sm text-muted-foreground">
                          Your wallet is connected through a hardware security device, providing enhanced protection.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full text-yellow-700 dark:text-yellow-300 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Backup Recovery Phrase</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure your recovery phrase is backed up securely offline and not stored digitally.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-sm mt-1">Learn how</Button>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full text-yellow-700 dark:text-yellow-300 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Enable Address Whitelist</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure a whitelist of trusted addresses to enhance transaction security.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-sm mt-1">Configure now</Button>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-700 dark:text-green-300 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Transaction Signing</h3>
                        <p className="text-sm text-muted-foreground">
                          Always review transaction details carefully before signing.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
          {wallets.length > 0 && (
            <Button onClick={() => setConnectDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Wallet
            </Button>
          )}
        </div>
        
        {wallets.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {renderWalletsSidebar()}
              {renderWalletDetail()}
            </div>
          </div>
        )}
      </div>
      
      {/* Wallet connection dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
            <DialogDescription>
              Select your preferred wallet to connect to the Aetherion platform
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            {isConnecting ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Connecting to wallet...</p>
              </div>
            ) : (
              <>
                <WalletOption 
                  type="MetaMask"
                  name="MetaMask"
                  onClick={handleConnect}
                  disabled={!availableWallets.includes('MetaMask')}
                />
                
                <WalletOption 
                  type="Coinbase"
                  name="Coinbase Wallet"
                  onClick={handleConnect}
                  disabled={!availableWallets.includes('Coinbase')}
                />
                
                <WalletOption 
                  type="Binance"
                  name="Binance Wallet"
                  onClick={handleConnect}
                  disabled={!availableWallets.includes('Binance')}
                />
                
                <WalletOption 
                  type="WalletConnect"
                  name="WalletConnect"
                  onClick={handleConnect}
                />
                
                <WalletOption 
                  type="Trust"
                  name="Trust Wallet"
                  onClick={handleConnect}
                />
                
                <WalletOption 
                  type="1inch"
                  name="1inch Wallet"
                  onClick={handleConnect}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiWalletDashboardPage;