import { useQuery } from '@tanstack/react-query';
import { fetchWallets } from '@/lib/api';
import { formatCurrency, formatCrypto } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PortfolioSummary = () => {
  const { data: wallets, isLoading, error } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: fetchWallets
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2 mt-1" />
              <Skeleton className="h-8 w-36 mb-2" />
              <Skeleton className="h-4 w-32 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive mb-6">
        Error loading wallet data: {(error as Error).message}
      </div>
    );
  }

  // Calculate total balance
  const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.dollarValue, 0) || 0;
  
  // Calculate overall percentage change (weighted average)
  const totalValue = wallets?.reduce((sum, wallet) => sum + wallet.dollarValue, 0) || 0;
  const weightedPercentChange = wallets?.reduce(
    (sum, wallet) => sum + (wallet.percentChange * wallet.dollarValue / totalValue), 
    0
  ) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Balance Card */}
      <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm mb-1">Total Balance</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</div>
          <div className="flex items-center mt-2">
            <span className={`text-sm flex items-center ${weightedPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {weightedPercentChange >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {weightedPercentChange >= 0 ? '+' : ''}{weightedPercentChange.toFixed(2)}%
            </span>
            <span className="text-muted-foreground text-xs ml-2">Last 24h</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Wallet Cards */}
      {wallets?.slice(0, 3).map((wallet) => (
        <Card key={wallet.id} className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4">
            <div className="flex items-center mb-1">
              <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold ${
                wallet.symbol === 'BTC' ? 'bg-yellow-500' : 
                wallet.symbol === 'ETH' ? 'bg-indigo-500' : 
                wallet.symbol === 'SOL' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                {wallet.symbol === 'BTC' ? '₿' : 
                 wallet.symbol === 'ETH' ? 'Ξ' : 
                 wallet.symbol.charAt(0)}
              </div>
              <div className="text-muted-foreground text-sm">{wallet.chain.charAt(0).toUpperCase() + wallet.chain.slice(1)}</div>
            </div>
            <div className="text-xl font-bold text-foreground">{formatCrypto(wallet.balance, wallet.symbol)}</div>
            <div className="text-muted-foreground text-sm">{formatCurrency(wallet.dollarValue)}</div>
            <div className="flex items-center mt-2">
              <span className={`text-sm flex items-center ${wallet.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {wallet.percentChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {wallet.percentChange >= 0 ? '+' : ''}{wallet.percentChange.toFixed(2)}%
              </span>
              <span className="text-muted-foreground text-xs ml-2">Last 24h</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PortfolioSummary;
