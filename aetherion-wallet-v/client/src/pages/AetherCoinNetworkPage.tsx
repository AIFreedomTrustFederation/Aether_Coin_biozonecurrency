import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import AetherCoinNetworkManager from '../components/wallet/AetherCoinNetworkManager';
import MandelbrotVisualization from '../components/tokenomics/MandelbrotVisualization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';
import { blockchainService } from '../core/blockchain';
import { bioZoeService } from '../core/biozoe';
import { BioZoeLifecycleState, QuantumEntanglementType } from '../core/biozoe/types';

export function AetherCoinNetworkPage() {
  const { data: blockHeight } = useQuery({
    queryKey: ['blockHeight'],
    queryFn: () => blockchainService.getBlockHeight(),
    refetchInterval: 5000
  });

  const { data: networkState } = useQuery({
    queryKey: ['bioZoeNetworkState'],
    queryFn: () => bioZoeService.getNetworkState(),
    refetchInterval: 5000
  });

  const handleCreateSeedToken = () => {
    // Create a seed token if wallet is connected
    const walletAddress = blockchainService.getWalletAddress();
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    bioZoeService.createSeedToken({
      initialLifeState: BioZoeLifecycleState.SEED,
      initialBaseValue: 10,
      initialEntanglementType: QuantumEntanglementType.SYMBIOTIC,
      initialMutationRate: 0.05,
      initialResilience: 0.8
    }, walletAddress);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold text-center">AetherCoin BioZoeCurrency Network</h1>
        <div className="mt-4">
          <Link href="/network-details">
            <Button variant="outline" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>View All Network Details</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <AetherCoinNetworkManager />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>BioZoeCurrency Network Status</CardTitle>
            <CardDescription>
              Current statistics of the AetherCoin living currency ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Block Height</div>
                <div className="text-2xl font-bold">{blockHeight || 0}</div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Tokens</div>
                <div className="text-2xl font-bold">{networkState?.totalTokens || 0}</div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Active Tokens</div>
                <div className="text-2xl font-bold">{networkState?.activeTokens || 0}</div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Energy</div>
                <div className="text-2xl font-bold">
                  {networkState?.totalEnergy?.toFixed(2) || 0}
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">System Resilience</div>
                <div className="text-2xl font-bold">
                  {(networkState?.systemResilience || 0) * 100}%
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Golden Ratio Alignment</div>
                <div className="text-2xl font-bold">
                  {(networkState?.goldenRatioAlignment || 0) * 100}%
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleCreateSeedToken} className="w-full">
                Create Seed Token
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <MandelbrotVisualization />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lifecycle Distribution</CardTitle>
          <CardDescription>
            Current distribution of tokens across lifecycle states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-sm text-green-800 font-medium">Seed</div>
              <div className="text-xl font-bold text-green-900">
                {networkState?.lifecycleDistribution?.seed || 0}
              </div>
            </div>
            
            <div className="bg-cyan-100 p-4 rounded-lg text-center">
              <div className="text-sm text-cyan-800 font-medium">Growth</div>
              <div className="text-xl font-bold text-cyan-900">
                {networkState?.lifecycleDistribution?.growth || 0}
              </div>
            </div>
            
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <div className="text-sm text-purple-800 font-medium">Flowering</div>
              <div className="text-xl font-bold text-purple-900">
                {networkState?.lifecycleDistribution?.flowering || 0}
              </div>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-sm text-blue-800 font-medium">Legacy</div>
              <div className="text-xl font-bold text-blue-900">
                {networkState?.lifecycleDistribution?.legacy || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AetherCoinNetworkPage;