import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, ChevronRight, Eye, Copy, RefreshCw,
  Zap, Wallet, Send, Download, CreditCard, QrCode, History,
  Plus, ListFilter
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Wallet</h1>

      {!wallet ? (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-sm">
              Connect your wallet to view your balance and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnector />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-7">
            {/* Main wallet info */}
            <Card className="md:col-span-5">
              <CardHeader className="pb-2 sm:pb-6">
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <span>Wallet Overview</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 sm:h-9 sm:w-9"
                    onClick={handleRefreshBalance}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
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
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 sm:gap-6">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-1">Current Balance</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        {loading ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          wallet?.balance ? `${wallet.balance} ${wallet.nativeToken}` : "0.0000 ETH"
                        )}
                      </p>
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex items-center text-green-500 text-xs sm:text-sm mt-1 sm:mt-2">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>+12.5% this month</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 md:mt-0">
                    <Button variant="outline" size="sm" className="h-8 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Send</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Receive</span>
                    </Button>
                    <Button variant="default" size="sm" className="h-8 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Buy</span>
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Swap</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet security status */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Security Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex items-center justify-center rounded-full bg-muted mb-2">
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
                  <span className="relative text-base sm:text-lg md:text-xl font-bold">90%</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">Your wallet is well-protected with quantum security</p>
                <Button variant="link" className="mt-2 sm:mt-4 h-8" size="sm">
                  <span className="text-xs sm:text-sm">View Details</span> <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for assets, transactions, etc. */}
          <Tabs defaultValue="assets" className="mt-4 sm:mt-6">
            <TabsList className="w-full flex justify-start border-b rounded-none mb-4 sm:mb-6 bg-transparent overflow-x-auto">
              <TabsTrigger value="assets" className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Assets</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3">
                <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="nfts" className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3">
                <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>NFTs</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="mt-0">
              <Card>
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Assets</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage your cryptocurrency assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2.5 sm:p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Ethereum</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">ETH</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">{wallet?.balance || "0.0000"} ETH</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">$2,586.42</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-2.5 sm:p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Singularity Coin</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">SING</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">1,500 SING</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">$969.00</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-2.5 sm:p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">USD Coin</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">USDC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">750.00 USDC</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">$750.00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-3 sm:py-4">
                  <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-10">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Add Custom Asset
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <Card>
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your latest activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {recentTransactions.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex justify-between items-center p-2 sm:p-3 border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`
                            p-1.5 sm:p-2 rounded-full
                            ${tx.type === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                              tx.type === 'sent' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}
                          `}>
                            {tx.type === 'received' ? <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-180" /> : 
                             tx.type === 'sent' ? <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : 
                             <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base capitalize">{tx.type} {tx.currency}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <p className={`font-medium text-sm sm:text-base ${
                          tx.type === 'received' ? 'text-green-600 dark:text-green-400' : 
                          tx.type === 'sent' ? 'text-red-600 dark:text-red-400' : ''
                        }`}>
                          {tx.type === 'received' ? '+' : tx.type === 'sent' ? '-' : ''}{tx.amount} {tx.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-3 sm:py-4 flex justify-center">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10">
                    <ListFilter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="nfts" className="mt-0">
              <Card>
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">NFT Collection</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your digital collectibles</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 sm:py-10">
                  <div className="text-center max-w-md px-2 sm:px-4">
                    <QrCode className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No NFTs Found</h3>
                    <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
                      You don't have any NFTs in your wallet yet. Explore marketplaces to find unique digital collectibles.
                    </p>
                    <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
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