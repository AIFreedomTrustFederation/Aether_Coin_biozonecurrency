import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, ChevronRight, Eye, Copy, RefreshCw,
  Zap, Wallet, Send, Download, CreditCard, QrCode, History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/context/WalletContext";
import WalletConnector from "../components/wallet/WalletConnector";

const WalletPage = () => {
  const { toast } = useToast();
  const { wallet, refreshBalance: refreshWalletBalance, isConnecting } = useWallet();
  const [loading, setLoading] = useState(false);

  // Mock transaction data - In a real app this would come from API
  const recentTransactions = [
    {
      id: 1,
      type: "received",
      currency: "ETH",
      amount: "0.45",
      date: "April 3, 2025",
    },
    {
      id: 2,
      type: "sent",
      currency: "USDC",
      amount: "250.00",
      date: "April 2, 2025",
    },
    {
      id: 3,
      type: "staked",
      currency: "SING",
      amount: "500",
      date: "April 1, 2025",
    },
  ];

  const copyToClipboard = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleRefreshBalance = async () => {
    if (wallet) {
      try {
        setLoading(true);
        await refreshWalletBalance();
        toast({
          title: "Balance Updated",
          description: "Your wallet balance has been refreshed",
        });
      } catch (error) {
        console.error("Error refreshing balance:", error);
        toast({
          title: "Failed to refresh",
          description: "There was an error updating your balance. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>

      {!wallet ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your balance and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnector />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-7">
            {/* Main wallet info */}
            <Card className="md:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Wallet Overview</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleRefreshBalance}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Connected: {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Unknown'}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Current Balance</p>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold">
                        {loading ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          wallet?.balance ? `${wallet.balance} ${wallet.nativeToken}` : "0.0000 ETH"
                        )}
                      </p>
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center text-green-500 text-sm mt-2">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      <span>+12.5% this month</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="flex gap-1">
                      <Send className="h-4 w-4" />
                      <span>Send</span>
                    </Button>
                    <Button variant="outline" className="flex gap-1">
                      <Download className="h-4 w-4" />
                      <span>Receive</span>
                    </Button>
                    <Button variant="default" className="flex gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>Buy</span>
                    </Button>
                    <Button variant="secondary" className="flex gap-1">
                      <Zap className="h-4 w-4" />
                      <span>Swap</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet security status */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-24 w-24 flex items-center justify-center rounded-full bg-muted mb-2">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full transform rotate-90">
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        strokeDasharray="283" 
                        strokeDashoffset="28.3"
                        className="text-green-500" 
                      />
                    </svg>
                  </div>
                  <span className="relative text-xl font-bold">90%</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Your wallet is well-protected with quantum security</p>
                <Button variant="link" className="mt-4" size="sm">
                  View Details <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for assets, transactions, etc. */}
          <Tabs defaultValue="assets" className="mt-6">
            <TabsList className="w-full flex justify-start border-b rounded-none mb-6 bg-transparent">
              <TabsTrigger value="assets" className="flex gap-2 items-center">
                <Wallet className="h-4 w-4" />
                <span>Assets</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex gap-2 items-center">
                <History className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="nfts" className="flex gap-2 items-center">
                <QrCode className="h-4 w-4" />
                <span>NFTs</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>Manage your cryptocurrency assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">Ethereum</p>
                          <p className="text-sm text-muted-foreground">ETH</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{wallet?.balance || "0.0000"} ETH</p>
                        <p className="text-sm text-muted-foreground">$2,586.42</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                          <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">Singularity Coin</p>
                          <p className="text-sm text-muted-foreground">SING</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">1,500 SING</p>
                        <p className="text-sm text-muted-foreground">$969.00</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                          <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">USD Coin</p>
                          <p className="text-sm text-muted-foreground">USDC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">750.00 USDC</p>
                        <p className="text-sm text-muted-foreground">$750.00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Add Custom Asset
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {recentTransactions.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-full
                            ${tx.type === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                              tx.type === 'sent' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}
                          `}>
                            {tx.type === 'received' ? <ChevronRight className="h-4 w-4 rotate-180" /> : 
                             tx.type === 'sent' ? <ChevronRight className="h-4 w-4" /> : 
                             <Eye className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type} {tx.currency}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <p className={`font-medium ${
                          tx.type === 'received' ? 'text-green-600 dark:text-green-400' : 
                          tx.type === 'sent' ? 'text-red-600 dark:text-red-400' : ''
                        }`}>
                          {tx.type === 'received' ? '+' : tx.type === 'sent' ? '-' : ''}{tx.amount} {tx.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="nfts" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>NFT Collection</CardTitle>
                  <CardDescription>Your digital collectibles</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="text-center max-w-md">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any NFTs in your wallet yet. Explore marketplaces to find unique digital collectibles.
                    </p>
                    <Button>
                      Explore NFT Marketplaces
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default WalletPage;