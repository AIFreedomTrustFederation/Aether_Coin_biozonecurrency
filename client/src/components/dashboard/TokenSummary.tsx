import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Coins, ExternalLink } from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Sample token data (in a real app, this would come from an API)
const tokenData = [
  {
    id: 1,
    name: 'AetherCoin',
    symbol: 'ATC',
    price: 2.75,
    change24h: 5.23,
    marketCap: 87500000,
    supply: 31818182,
    yourBalance: 500,
    color: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    textColor: 'text-purple-600',
  },
  {
    id: 2,
    name: 'FractalCoin',
    symbol: 'FRAC',
    price: 0.85,
    change24h: -1.21,
    marketCap: 42500000,
    supply: 50000000,
    yourBalance: 1200,
    color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    textColor: 'text-emerald-600',
  },
  {
    id: 3,
    name: 'Mysterion',
    symbol: 'MYAI',
    price: 3.42,
    change24h: 12.58,
    marketCap: 68400000,
    supply: 20000000,
    yourBalance: 75,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    textColor: 'text-blue-600',
  }
];

const TokenSummary: React.FC = () => {
  // Simulate loading state for demo - in a real app, this would be a real API call
  const { data: tokens, isLoading } = useQuery<typeof tokenData>({
    queryKey: ['/api/tokens'],
    queryFn: () => new Promise(resolve => setTimeout(() => resolve(tokenData), 1000)),
    initialData: tokenData,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-2 mt-1" />
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-32 mt-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Coins className="h-5 w-5 mr-2 text-primary" />
          Ecosystem Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          {tokens?.map((token) => (
            <div key={token.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${token.color} flex items-center justify-center text-white text-xs font-bold mr-2`}>
                  {token.symbol.substring(0, 2)}
                </div>
                <div>
                  <div className="font-medium">{token.name}</div>
                  <div className="text-xs text-muted-foreground">{token.symbol}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">{formatCurrency(token.price)}</div>
                <div className={`text-xs flex items-center justify-end ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Link href="/aethercoin">
          <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
            <span>View Token Network</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TokenSummary;