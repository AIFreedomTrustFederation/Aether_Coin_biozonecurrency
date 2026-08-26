import React, { useMemo, useState } from 'react';
import { AlertTriangle, Copy, ExternalLink, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AETHER_COIN_CONFIG,
  AETHER_TESTNET_CONFIG,
  type AetherionWalletNetworkConfig,
} from '../../config/blockchain-config';

interface WalletChainParams {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const AddAetherNetwork: React.FC = () => {
  const { toast } = useToast();
  const [networkType, setNetworkType] = useState<'production' | 'testnet'>('testnet');
  const [isAdding, setIsAdding] = useState(false);

  const config: AetherionWalletNetworkConfig = useMemo(
    () => (networkType === 'production' ? AETHER_COIN_CONFIG : AETHER_TESTNET_CONFIG),
    [networkType],
  );

  const hasWeb3Wallet = typeof window !== 'undefined' && window.ethereum !== undefined;
  const canAddToWallet = Boolean(
    hasWeb3Wallet &&
    config.walletAddSupported &&
    config.rpcUrl &&
    config.blockExplorerUrl,
  );

  const getWalletParams = (): WalletChainParams => ({
    chainId: config.evmAdapterChainId,
    chainName: config.networkName,
    nativeCurrency: {
      name: networkType === 'production' ? 'AetherCoin' : 'Test AetherCoin',
      symbol: config.symbol,
      decimals: config.decimals,
    },
    rpcUrls: [config.rpcUrl],
    blockExplorerUrls: [config.blockExplorerUrl],
  });

  const addNetwork = async () => {
    if (!canAddToWallet || !window.ethereum) {
      toast({
        title: 'Wallet connection intentionally disabled',
        description: config.notice,
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [getWalletParams()],
      });
      toast({
        title: 'Network configuration added',
        description: 'Verify the endpoint operator and network status before signing any transaction.',
      });
    } catch (error: any) {
      toast({
        title: error?.code === 4001 ? 'Request rejected' : 'Unable to add network',
        description: error?.message ?? 'The wallet did not accept the network configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const copyDetails = async () => {
    const details = [
      `Status: ${config.status}`,
      `Network: ${config.networkName}`,
      `Canonical Layer 1 chain ID: ${config.canonicalChainId}`,
      `EVM adapter chain ID: ${config.evmAdapterChainId}`,
      `RPC URL: ${config.rpcUrl || '[not configured]'}`,
      `Explorer: ${config.blockExplorerUrl || '[not configured]'}`,
      `Symbol: ${config.symbol}`,
      `Notice: ${config.notice}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(details);
      toast({ title: 'Copied', description: 'Network status and configuration copied.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to access the clipboard.', variant: 'destructive' });
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-2">Aetherion Network Configuration</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Aetherion is being designed as a sovereign Layer 1. A MetaMask-compatible EVM adapter is not the
        canonical chain and remains disabled until a real endpoint is explicitly configured and verified.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="network-select">Network profile</Label>
          <Select value={networkType} onValueChange={(value) => setNetworkType(value as 'production' | 'testnet')}>
            <SelectTrigger id="network-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production design</SelectItem>
              <SelectItem value="testnet">Testnet profile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="font-medium">Status</span>
              <span>{config.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">Canonical chain ID</span>
              <span className="font-mono">{config.canonicalChainId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">EVM adapter ID</span>
              <span className="font-mono">{config.evmAdapterChainId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">RPC</span>
              <span className="font-mono break-all text-right">{config.rpcUrl || 'not configured'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">Explorer</span>
              <span className="font-mono break-all text-right">{config.blockExplorerUrl || 'not configured'}</span>
            </div>
          </CardContent>
        </Card>

        <div className="p-3 border rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p>{config.notice}</p>
            {!hasWeb3Wallet && <p className="mt-1">No compatible Web3 wallet is detected in this browser.</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={addNetwork} disabled={isAdding || !canAddToWallet}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Adding…' : 'Add configured EVM adapter'}
          </Button>
          <Button variant="outline" onClick={copyDetails}>
            <Copy className="mr-2 h-4 w-4" />
            Copy status
          </Button>
          <Button
            variant="outline"
            disabled={!config.blockExplorerUrl}
            onClick={() => config.blockExplorerUrl && window.open(config.blockExplorerUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Explorer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAetherNetwork;
