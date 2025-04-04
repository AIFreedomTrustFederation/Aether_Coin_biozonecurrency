import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AlertCircle, Clock, DollarSign, Coins, Calculator } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { NetworkInfo, SUPPORTED_NETWORKS } from '@/lib/wallet-connectors';

const ICOParticipation: React.FC = () => {
  const { wallet, icoDetails, purchase, switchChain } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [calculatedTokens, setCalculatedTokens] = useState<string>('0');
  const [paymentToken, setPaymentToken] = useState<string>('native');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate tokens based on USD amount
  const calculateTokens = (usdAmount: string) => {
    if (!usdAmount || isNaN(parseFloat(usdAmount))) {
      return '0';
    }
    
    const tokenPrice = parseFloat(icoDetails.tokenPrice);
    const tokens = parseFloat(usdAmount) / tokenPrice;
    return tokens.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setCalculatedTokens(calculateTokens(value));
  };
  
  // Handle purchase
  const handlePurchase = async () => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const minContribution = parseFloat(icoDetails.minContribution);
    const maxContribution = parseFloat(icoDetails.maxContribution);
    
    if (parseFloat(amount) < minContribution) {
      setError(`Minimum contribution is $${minContribution}`);
      return;
    }
    
    if (parseFloat(amount) > maxContribution) {
      setError(`Maximum contribution is $${maxContribution}`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setTxHash(null);
    
    try {
      // Ethereum mainnet is used for the ICO
      if (wallet.chainId !== 1) {
        const switched = await switchChain(1);
        if (!switched) {
          throw new Error('Failed to switch to Ethereum network');
        }
      }
      
      const result = await purchase(amount, paymentToken);
      
      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setAmount('');
        setCalculatedTokens('0');
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while processing your purchase');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get token options for the current network
  const getTokenOptions = () => {
    if (!wallet) return [];
    
    const network = SUPPORTED_NETWORKS[wallet.chainId];
    if (!network) return [];
    
    // For now, only allow native token, but we could expand this later
    return [
      { value: 'native', label: `${network.symbol} (Native Token)` }
    ];
  };
  
  // Format currency
  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })}`;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  // Calculate time remaining in the ICO
  const getTimeRemaining = () => {
    const now = new Date();
    
    if (now < icoDetails.startDate) {
      const diffTime = Math.abs(icoDetails.startDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    if (now > icoDetails.endDate) {
      return 'Ended';
    }
    
    const diffTime = Math.abs(icoDetails.endDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Singularity Coin ICO</span>
          <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
            {icoDetails.status.toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription>
          {icoDetails.symbol} - A quantum-resistant Layer 1 blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(icoDetails.raisedAmount)} raised</span>
            <span>Goal: {formatCurrency(icoDetails.hardCap)}</span>
          </div>
          <Progress value={icoDetails.progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{parseFloat(icoDetails.tokensSold).toLocaleString()} tokens sold</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getTimeRemaining()}</span>
            </span>
          </div>
        </div>
        
        <Separator />
        
        {/* ICO details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Token Price</p>
            <p className="font-medium">{formatCurrency(icoDetails.tokenPrice)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium">{formatDate(icoDetails.startDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Min. Contribution</p>
            <p className="font-medium">{formatCurrency(icoDetails.minContribution)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max. Contribution</p>
            <p className="font-medium">{formatCurrency(icoDetails.maxContribution)}</p>
          </div>
        </div>
        
        <Separator />
        
        {/* Purchase form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Invest (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                className="pl-10"
                value={amount}
                onChange={handleAmountChange}
                min={icoDetails.minContribution}
                max={icoDetails.maxContribution}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-token">Payment Method</Label>
            <Select 
              value={paymentToken} 
              onValueChange={setPaymentToken}
              disabled={!wallet}
            >
              <SelectTrigger id="payment-token">
                <SelectValue placeholder="Select payment token" />
              </SelectTrigger>
              <SelectContent>
                {getTokenOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-3 bg-muted rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <span>You will receive:</span>
            </div>
            <div className="font-medium flex items-center gap-1">
              <span>{calculatedTokens}</span>
              <span className="text-muted-foreground">{icoDetails.symbol}</span>
            </div>
          </div>
        </div>
        
        {/* Success/Error messages */}
        {txHash && (
          <Alert className="bg-green-50 border-green-200">
            <Coins className="h-4 w-4 text-green-600" />
            <AlertTitle>Purchase Successful!</AlertTitle>
            <AlertDescription>
              Your transaction has been submitted. Transaction hash: 
              <code className="block mt-1 p-2 bg-green-100 rounded text-xs break-all">
                {txHash}
              </code>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!wallet || isSubmitting || icoDetails.status !== 'active'}
          onClick={handlePurchase}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">↻</span>
              Processing...
            </>
          ) : !wallet ? (
            'Connect Wallet to Participate'
          ) : icoDetails.status === 'upcoming' ? (
            'ICO Not Started Yet'
          ) : icoDetails.status === 'completed' ? (
            'ICO Completed'
          ) : (
            'Purchase Tokens'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ICOParticipation;