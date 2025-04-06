import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
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
          <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Aetherion will:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Display your wallet address and balance</li>
              <li>Request approval for transactions</li>
              <li>Never access your private keys</li>
              <li>Never initiate transactions without approval</li>
            </ul>
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
          >
            Allow Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionPrompt;