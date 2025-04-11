import React, { useState } from 'react';
import { ShieldCheck, Info, Lock, Wallet, XCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface PermissionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  walletName?: string;
}

const PermissionPrompt: React.FC<PermissionPromptProps> = ({
  isOpen,
  onClose,
  onAccept,
  walletName = 'wallet'
}) => {
  const [rememberChoice, setRememberChoice] = useState(false);
  
  const handleAccept = () => {
    if (rememberChoice) {
      // Store the user's preference in localStorage
      localStorage.setItem('walletPermissionsAccepted', 'true');
    }
    onAccept();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto bg-primary/10 p-3 rounded-full">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Connect to {walletName}</DialogTitle>
          <DialogDescription className="text-center">
            This action will request permission to connect to your wallet and access public address information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* What this connection allows */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">App Permissions</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-md">
                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">View Wallet Info</h4>
                  <p className="text-xs text-muted-foreground">
                    See your wallet address and token balances
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-md">
                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Request Transactions</h4>
                  <p className="text-xs text-muted-foreground">
                    Ask for your approval before any transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* What this connection CANNOT do */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Security Guarantees</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-3 bg-green-500/5 p-3 rounded-md border border-green-500/10">
                <div className="bg-green-500/10 p-1.5 rounded-full mt-0.5">
                  <Lock className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Private Keys Protected</h4>
                  <p className="text-xs text-muted-foreground">
                    We never access your private keys or seed phrase
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-green-500/5 p-3 rounded-md border border-green-500/10">
                <div className="bg-green-500/10 p-1.5 rounded-full mt-0.5">
                  <XCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">No Automatic Transactions</h4>
                  <p className="text-xs text-muted-foreground">
                    We never initiate transactions without your explicit approval
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-md text-sm">
            <div className="font-medium mb-1 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-primary" />
              <span>Wallet Required</span>
            </div>
            <p className="text-xs">
              You need to have a compatible wallet installed on your device. If you don't have one yet,
              you can install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-primary underline">MetaMask</a> or 
              another Web3 wallet like <a href="https://www.coinbase.com/wallet/downloads" target="_blank" rel="noopener noreferrer" className="text-primary underline">Coinbase Wallet</a>
              to continue.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberChoice}
              onCheckedChange={(checked) => setRememberChoice(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember my choice for future connections
            </label>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAccept}
            type="button"
            className="gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            Allow Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionPrompt;