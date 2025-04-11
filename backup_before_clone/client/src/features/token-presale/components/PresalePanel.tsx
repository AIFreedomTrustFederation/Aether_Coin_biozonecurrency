/**
 * Token Presale Panel Component
 * 
 * This component provides a user interface for participating in token presales
 * with quantum-secure transaction processing.
 */

import React, { useState, useEffect } from 'react';
import { Coins, Shield, Clock, Wallet, ArrowRight, Check, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useAetherionIntegration, TokenType, PresaleParticipationResult } from '../../integration';

interface PresalePanelProps {
  walletAddress: string;
}

export const PresalePanel: React.FC<PresalePanelProps> = ({
  walletAddress
}) => {
  const { tokens, quantum } = useAetherionIntegration();
  
  const [selectedToken, setSelectedToken] = useState<TokenType>('ATC');
  const [amount, setAmount] = useState<string>('0.5');
  const [useQuantumSecurity, setUseQuantumSecurity] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [participationResult, setParticipationResult] = useState<PresaleParticipationResult | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  
  // Check eligibility when token changes
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const result = await tokens.checkPresaleEligibility(walletAddress, selectedToken);
        setEligibilityResult(result);
        
        // Also get token info
        const info = await tokens.getInfo(selectedToken);
        setTokenInfo(info);
      } catch (error) {
        console.error('Error checking eligibility:', error);
      }
    };
    
    checkEligibility();
  }, [walletAddress, selectedToken, tokens]);
  
  // Participate in presale
  const participateInPresale = async () => {
    if (!eligibilityResult?.eligible) return;
    
    try {
      setIsLoading(true);
      
      // Call the token service to participate
      const result = await tokens.joinPresale(
        walletAddress,
        selectedToken,
        amount
      );
      
      setParticipationResult(result);
    } catch (error) {
      console.error('Error participating in presale:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format a date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      return 'Ended';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Generate presale progress stats
  const getPresaleStats = () => {
    // This would be fetched from the blockchain in a real implementation
    const stats = {
      totalRaised: '145.72 ETH',
      participants: 1238,
      availableTokens: '35%',
      price: eligibilityResult?.tokensPerEth || '1000',
      minContribution: eligibilityResult?.minContribution || '0.1',
      maxContribution: eligibilityResult?.maxContribution || '5',
      progress: 65, // percentage
      myContribution: '0.00',
      myTokens: '0',
      timeRemaining: eligibilityResult?.presaleEnds 
        ? formatRelativeTime(eligibilityResult.presaleEnds)
        : '0m',
      endsAt: eligibilityResult?.presaleEnds
        ? formatDate(eligibilityResult.presaleEnds)
        : 'Unknown'
    };
    
    return stats;
  };
  
  const presaleStats = getPresaleStats();
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Coins className="mr-2 h-6 w-6 text-primary" />
          Token Presale
        </h1>
        
        <Badge className="bg-primary">LIVE</Badge>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {tokenInfo?.name || selectedToken} Presale
              </CardTitle>
              <CardDescription>
                {tokenInfo?.description || 'Participate in the token presale with quantum-secure transactions'}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm font-medium">{presaleStats.timeRemaining}</span>
              </div>
              <span className="text-xs text-muted-foreground">Ends: {presaleStats.endsAt}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Presale Progress</span>
                <span className="text-sm font-medium">{presaleStats.progress}%</span>
              </div>
              <Progress value={presaleStats.progress} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {presaleStats.totalRaised} raised
                </span>
                <span className="text-xs text-muted-foreground">
                  {presaleStats.participants} participants
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="token">Token</Label>
                <select
                  id="token"
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as TokenType)}
                >
                  <option value="ATC">AetherCoin (ATC)</option>
                  <option value="SING">Singularity (SING)</option>
                  <option value="ICON">IconToken (ICON)</option>
                  <option value="FTC">FractalCoin (FTC)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={eligibilityResult?.minContribution || 0.1}
                  max={eligibilityResult?.maxContribution || 5}
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Price per token</span>
                <span className="text-sm font-medium">1 ETH = {presaleStats.price} {selectedToken}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">You will receive</span>
                <span className="text-sm font-medium">
                  {amount ? (Number(amount) * Number(presaleStats.price)).toLocaleString() : '0'} {selectedToken}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Min contribution</span>
                <span className="text-sm font-medium">{presaleStats.minContribution} ETH</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Max contribution</span>
                <span className="text-sm font-medium">{presaleStats.maxContribution} ETH</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="quantum-security"
                checked={useQuantumSecurity}
                onCheckedChange={setUseQuantumSecurity}
              />
              <Label htmlFor="quantum-security" className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-primary" />
                Quantum-secure transaction
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!eligibilityResult?.eligible ? (
            <Alert className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Not Eligible</AlertTitle>
              <AlertDescription>
                {eligibilityResult?.reason || "You are not eligible to participate in this presale."}
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              className="w-full"
              onClick={participateInPresale}
              disabled={isLoading || !eligibilityResult?.eligible}
            >
              {isLoading ? "Processing..." : "Participate in Presale"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {participationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {participationResult.success ? (
                <Check className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              )}
              Presale Participation {participationResult.success ? "Successful" : "Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participationResult.success ? (
              <div className="space-y-4">
                <div className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Hash</span>
                    <span className="text-sm font-mono text-xs">{participationResult.transactionHash}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Purchased Amount</span>
                    <span className="text-sm font-medium">
                      {participationResult.purchasedAmount} {selectedToken}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Value</span>
                    <span className="text-sm font-medium">
                      ${participationResult.usdValue} USD
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Claim available from</span>
                    <span className="text-sm font-medium">
                      {participationResult.claimTime ? formatDate(participationResult.claimTime) : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {participationResult.vestingInfo && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Vesting Schedule</AlertTitle>
                    <AlertDescription>
                      Your tokens will vest over {participationResult.vestingInfo.periods} periods, 
                      with the first release on {formatDate(participationResult.vestingInfo.firstRelease * 1000)}.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Transaction Failed</AlertTitle>
                <AlertDescription>
                  {participationResult.error || "An unknown error occurred while processing your transaction."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setParticipationResult(null)}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Quantum Security Information
        </h2>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Quantum Security Status</span>
                </div>
                
                <Badge variant={quantum.quantumResistant ? "default" : "outline"}>
                  {quantum.quantumResistant ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Security Score</span>
                  <span>{quantum.score}/100</span>
                </div>
                <Progress value={quantum.score} className="h-1" />
              </div>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  All presale transactions are secured with quantum-resistant cryptography and 
                  validated through our fractal consensus mechanism.
                </p>
                <p>
                  The Eternal Now timestream convergence is at {Math.round(quantum.convergenceIntensity * 100)}%,
                  providing temporal protection against frontrunning attacks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};