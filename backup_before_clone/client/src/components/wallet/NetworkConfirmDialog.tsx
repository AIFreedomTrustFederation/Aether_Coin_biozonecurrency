import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkName: string;
  networkSymbol: string;
  chainId: string;
  onConfirm: () => void;
  onCancel: () => void;
  explorerUrl: string;
}

const NetworkConfirmDialog: React.FC<NetworkConfirmDialogProps> = ({
  open,
  onOpenChange,
  networkName,
  networkSymbol,
  chainId,
  onConfirm,
  onCancel,
  explorerUrl
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle>Connect to {networkName}?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action will add the {networkName} ({networkSymbol}) blockchain to your wallet.
            You'll be able to send and receive {networkSymbol} tokens once connected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-2 gap-2 my-4 text-sm">
          <div className="p-3 rounded-md bg-muted/30">
            <div className="font-medium mb-1">Network</div>
            <div className="truncate">{networkName}</div>
          </div>
          <div className="p-3 rounded-md bg-muted/30">
            <div className="font-medium mb-1">Token Symbol</div>
            <div>{networkSymbol}</div>
          </div>
          <div className="p-3 rounded-md bg-muted/30">
            <div className="font-medium mb-1">Chain ID</div>
            <div className="font-mono text-xs">{chainId}</div>
          </div>
          <div className="p-3 rounded-md bg-muted/30">
            <div className="font-medium mb-1">Block Explorer</div>
            <Button 
              variant="link" 
              className="p-0 h-6" 
              onClick={(e) => {
                e.preventDefault();
                window.open(explorerUrl, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="text-xs">View Explorer</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 text-sm flex items-start mb-4">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            Connecting to this network is safe and can be removed from your wallet at any time.
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Connect to {networkName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkConfirmDialog;