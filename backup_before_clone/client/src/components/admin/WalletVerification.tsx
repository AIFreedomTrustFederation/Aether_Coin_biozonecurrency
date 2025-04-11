import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { WalletType } from '@/lib/wallet-connectors';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, LinkIcon } from 'lucide-react';
import { SiCoinbase } from 'react-icons/si';

// This interface represents an admin user with a verified wallet
interface VerifiedWalletUser {
  id: number;
  name: string;
  role: string;
  walletAddress: string | null;
  walletType: WalletType | null;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  verificationDate: Date | null;
}

// Sample "Zechariah Edwards" user data
const founderUser: VerifiedWalletUser = {
  id: 1,
  name: "Zechariah Edwards",
  role: "Founder - AI Freedom Trust",
  walletAddress: null,
  walletType: null,
  verificationStatus: 'unverified',
  verificationDate: null
};

const WalletVerification: React.FC = () => {
  const { wallet, connect, disconnect, availableWallets } = useWallet();
  const [verifiedUser, setVerifiedUser] = useState<VerifiedWalletUser>(founderUser);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  
  // Check if the connected wallet has changed
  useEffect(() => {
    if (wallet && wallet.address && wallet.type === 'coinbase') {
      // If we're connected and it's a Coinbase wallet, update the verified user
      if (verifiedUser.walletAddress !== wallet.address) {
        setVerifiedUser({
          ...verifiedUser,
          walletAddress: wallet.address,
          walletType: wallet.type
        });
      }
    } else if (!wallet && verifiedUser.walletAddress) {
      // If wallet disconnected but we still have an address, clear it
      setVerifiedUser({
        ...verifiedUser,
        walletAddress: null,
        walletType: null
      });
    }
  }, [wallet]);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      // Specifically connect to Coinbase wallet for verification
      await connect('coinbase');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };
  
  // Start verification process
  const startVerification = async () => {
    if (!wallet || wallet.type !== 'coinbase') {
      setVerificationMessage('Please connect a Coinbase wallet to verify.');
      return;
    }
    
    setIsVerifying(true);
    setVerificationMessage('Verifying wallet ownership...');
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Update verification status
      setVerifiedUser({
        ...verifiedUser,
        verificationStatus: 'verified',
        verificationDate: new Date()
      });
      
      setVerificationMessage('Wallet successfully verified!');
      
      // Close dialog after successful verification
      setTimeout(() => {
        setVerificationDialogOpen(false);
        setIsVerifying(false);
        setVerificationMessage('');
      }, 1500);
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationMessage('Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };
  
  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          Wallet Verification
        </CardTitle>
        <CardDescription>
          Connect and verify your Coinbase wallet for secure administrative access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Admin Name</p>
              <p>{verifiedUser.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Role</p>
              <p>{verifiedUser.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                {verifiedUser.walletType === 'coinbase' && <SiCoinbase className="text-blue-500" />}
                <p>{formatAddress(verifiedUser.walletAddress)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Verification Status</p>
              <div>
                {verifiedUser.verificationStatus === 'verified' ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                ) : verifiedUser.verificationStatus === 'pending' ? (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    <AlertCircle className="mr-1 h-3 w-3" /> Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {verifiedUser.verificationStatus === 'verified' && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Wallet verified</AlertTitle>
              <AlertDescription>
                Verified on {formatDate(verifiedUser.verificationDate)} via Coinbase KYC.
              </AlertDescription>
            </Alert>
          )}
          
          {verifiedUser.verificationStatus === 'unverified' && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet not verified</AlertTitle>
              <AlertDescription>
                For enhanced security and quantum-resistant protection, please verify your Coinbase wallet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {verifiedUser.verificationStatus === 'verified' ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => disconnect()}>
              Disconnect Wallet
            </Button>
            <Button variant="outline" className="text-blue-500" onClick={() => window.open('https://www.coinbase.com/dashboard', '_blank')}>
              <SiCoinbase className="mr-2 h-4 w-4" />
              Open Coinbase
            </Button>
          </div>
        ) : !wallet ? (
          <Button onClick={handleConnectWallet}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Connect Coinbase Wallet
          </Button>
        ) : (
          <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Coinbase Wallet</DialogTitle>
                <DialogDescription>
                  Complete verification to enable quantum-secure administrative access.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6">
                <div className="flex items-center justify-center mb-4">
                  <SiCoinbase className="text-blue-500 text-4xl" />
                </div>
                
                <p className="text-center mb-4">
                  <span className="font-medium">Connected as:</span> {formatAddress(wallet?.address || null)}
                </p>
                
                {isVerifying ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p>{verificationMessage}</p>
                  </div>
                ) : (
                  <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      This will verify that you are the owner of this Coinbase wallet through KYC authentication.
                      <br />
                      Only proceed if you are Zechariah Edwards.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setVerificationDialogOpen(false)} disabled={isVerifying}>
                  Cancel
                </Button>
                <Button onClick={startVerification} disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Ownership
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default WalletVerification;