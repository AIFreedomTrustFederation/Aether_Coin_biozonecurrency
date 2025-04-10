/**
 * Network Details Card Component
 * 
 * Displays detailed information about a blockchain network with copy functionality
 * for easy addition to wallets and sharing
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, Download, Share, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NetworkDetails {
  name: string;
  chainId: number;
  chainIdHex: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  description: string;
}

interface NetworkDetailsCardProps {
  network: NetworkDetails;
  variant?: 'primary' | 'secondary' | 'outline';
}

const NetworkDetailsCard: React.FC<NetworkDetailsCardProps> = ({ 
  network, 
  variant = 'primary' 
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Copy text to clipboard with visual feedback
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    
    toast({
      title: "Copied to clipboard",
      description: `${field} has been copied to your clipboard.`,
      variant: "default"
    });
    
    setTimeout(() => setCopied(null), 2000);
  };
  
  // Copy all network details as JSON
  const copyAllDetails = () => {
    const details = {
      networkName: network.name,
      chainId: network.chainIdHex,
      nativeCurrency: {
        name: network.name,
        symbol: network.symbol,
        decimals: network.decimals
      },
      rpcUrls: [network.rpcUrl],
      blockExplorerUrls: [network.blockExplorerUrl]
    };
    
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
    
    toast({
      title: "Network details copied",
      description: "All network details have been copied as JSON.",
      variant: "default"
    });
  };
  
  // Generate a downloadable file with network details
  const downloadDetails = () => {
    const details = {
      networkName: network.name,
      chainId: network.chainIdHex,
      nativeCurrency: {
        name: network.name,
        symbol: network.symbol,
        decimals: network.decimals
      },
      rpcUrls: [network.rpcUrl],
      blockExplorerUrls: [network.blockExplorerUrl]
    };
    
    const blob = new Blob([JSON.stringify(details, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${network.name.replace(/\s+/g, '-').toLowerCase()}-details.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Details downloaded",
      description: `Network details saved as ${a.download}`,
      variant: "default"
    });
  };
  
  // Share network details (if Web Share API is available)
  const shareDetails = () => {
    if (navigator.share) {
      navigator.share({
        title: `${network.name} Network Details`,
        text: `Chain ID: ${network.chainId}\nRPC URL: ${network.rpcUrl}\nSymbol: ${network.symbol}`,
        url: window.location.href
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Network details have been shared.",
          variant: "default"
        });
      })
      .catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      copyAllDetails();
    }
  };
  
  // Determine card styles based on variant
  const getCardClasses = () => {
    switch(variant) {
      case 'primary':
        return 'border-primary/30 bg-primary/5';
      case 'secondary':
        return 'border-blue-300/30 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900/30';
      case 'outline':
        return 'border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-900/30';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };
  
  return (
    <Card className={`w-full ${getCardClasses()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{network.name}</CardTitle>
          <Badge variant="outline" className="font-mono text-xs px-2">
            Chain ID: {network.chainId}
          </Badge>
        </div>
        <CardDescription>{network.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Details Table */}
        <div className="bg-white/50 dark:bg-black/20 rounded-md p-3 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Network Details
          </div>
          
          <div className="grid grid-cols-[120px_1fr_auto] gap-y-2 text-sm">
            <div className="text-muted-foreground">Network Name:</div>
            <div className="font-medium">{network.name}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(network.name, 'Network Name')}
                  >
                    {copied === 'Network Name' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy network name</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-muted-foreground">Chain ID:</div>
            <div className="font-medium font-mono">{network.chainId} ({network.chainIdHex})</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(network.chainIdHex, 'Chain ID')}
                  >
                    {copied === 'Chain ID' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy chain ID (hex format)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-muted-foreground">Symbol:</div>
            <div className="font-medium">{network.symbol}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(network.symbol, 'Symbol')}
                  >
                    {copied === 'Symbol' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy token symbol</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-muted-foreground">Decimals:</div>
            <div className="font-medium">{network.decimals}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(network.decimals.toString(), 'Decimals')}
                  >
                    {copied === 'Decimals' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy decimals</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-muted-foreground">RPC URL:</div>
            <div className="font-medium font-mono text-xs truncate">{network.rpcUrl}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(network.rpcUrl, 'RPC URL')}
                  >
                    {copied === 'RPC URL' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy RPC URL</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-muted-foreground">Explorer:</div>
            <div className="font-medium font-mono text-xs truncate">
              <a 
                href={network.blockExplorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 text-primary"
              >
                {network.blockExplorerUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(network.blockExplorerUrl, 'Block Explorer')}
                  >
                    {copied === 'Block Explorer' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy block explorer URL</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={copyAllDetails}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All Details
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={downloadDetails}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={shareDetails}
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkDetailsCard;