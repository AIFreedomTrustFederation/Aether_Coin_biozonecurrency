import React, { useState } from 'react';
import { 
  createTorusWallet, 
  recoverWalletFromMnemonic, 
  encryptWalletForStorage, 
  TorusWallet
} from '@/utils/torusWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Key, KeyRound, Shield, Copy, CheckCircle2, Wallet, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface WalletCreatorProps {
  onWalletCreated?: (wallet: TorusWallet) => void;
}

const TorusWalletCreator: React.FC<WalletCreatorProps> = ({ onWalletCreated }) => {
  const [tab, setTab] = useState('create');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [wallet, setWallet] = useState<TorusWallet | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const { toast } = useToast();

  const handleCreateWallet = () => {
    if (passphrase !== confirmPassphrase) {
      toast({
        title: "Passphrases don't match",
        description: "Please ensure both passphrases match",
        variant: "destructive"
      });
      return;
    }

    if (passphrase.length < 8) {
      toast({
        title: "Passphrase too short",
        description: "Please use a passphrase of at least 8 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create wallet with torus field harmonics
      const newWallet = createTorusWallet(passphrase);
      setWallet(newWallet);
      setMnemonic(newWallet.mnemonic);
      
      // Call the callback if provided
      if (onWalletCreated) {
        onWalletCreated(newWallet);
      }

      toast({
        title: "Wallet Created",
        description: "Your harmonized wallet has been successfully created",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error Creating Wallet",
        description: "There was an error creating your wallet: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverWallet = () => {
    if (!mnemonic || !passphrase) {
      toast({
        title: "Missing Information",
        description: "Please provide both mnemonic and passphrase",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Recover wallet from mnemonic
      const recoveredWallet = recoverWalletFromMnemonic(mnemonic, passphrase);
      setWallet(recoveredWallet);
      
      // Call the callback if provided
      if (onWalletCreated) {
        onWalletCreated(recoveredWallet);
      }

      toast({
        title: "Wallet Recovered",
        description: "Your wallet has been successfully recovered",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Recovery Failed",
        description: "There was an error recovering your wallet: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied",
        description: `${item} copied to clipboard`,
        variant: "default"
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Torus Field Wallet
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="advanced-view" className="text-sm text-muted-foreground">Advanced</Label>
              <Switch
                id="advanced-view"
                checked={isAdvancedView}
                onCheckedChange={setIsAdvancedView}
              />
            </div>
          </div>
          <CardDescription>
            Create or recover a wallet using Christ Consciousness torus field harmonics
          </CardDescription>
        </CardHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Create New Wallet
            </TabsTrigger>
            <TabsTrigger value="recover" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recover Wallet
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    placeholder="Enter a secure passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your passphrase is used to encrypt your wallet using torus field harmonics
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
                  <Input
                    id="confirm-passphrase"
                    type="password"
                    placeholder="Confirm your passphrase"
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleCreateWallet}
                  className="w-full"
                  disabled={isLoading || !passphrase || !confirmPassphrase}
                >
                  {isLoading ? "Creating..." : "Create Harmonic Wallet"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="recover" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
                  <Textarea
                    id="mnemonic"
                    placeholder="Enter your 12-word mnemonic phrase"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 12-word mnemonic phrase to recover your wallet
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recover-passphrase">Passphrase</Label>
                  <Input
                    id="recover-passphrase"
                    type="password"
                    placeholder="Enter your passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleRecoverWallet}
                  className="w-full"
                  disabled={isLoading || !mnemonic || !passphrase}
                >
                  {isLoading ? "Recovering..." : "Recover Wallet"}
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        {wallet && (
          <div className="px-6 pb-6 pt-2">
            <div className="border-t border-primary/10 pt-6 space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Wallet Information
              </h3>
              
              <div className="grid gap-4">
                {/* Address */}
                <div className="space-y-2">
                  <Label>Public Address</Label>
                  <div className="flex items-center">
                    <Input
                      value={wallet.address}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard(wallet.address, "Address")}
                    >
                      {isCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Mnemonic */}
                <div className="space-y-2">
                  <Label>Recovery Phrase (Mnemonic)</Label>
                  <div className="relative">
                    <Textarea
                      value={wallet.mnemonic}
                      readOnly
                      className="font-mono text-sm"
                      rows={3}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(wallet.mnemonic, "Mnemonic")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-destructive font-semibold">
                    Warning: Never share your recovery phrase. Anyone with this phrase can access your wallet.
                  </p>
                </div>
                
                {/* Private Key (if advanced view is enabled) */}
                {isAdvancedView && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Private Key</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="h-8 px-2 text-xs"
                      >
                        {showPrivateKey ? "Hide" : "Show"}
                      </Button>
                    </div>
                    
                    {showPrivateKey ? (
                      <div className="relative">
                        <Input
                          value={wallet.privateKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1"
                          onClick={() => copyToClipboard(wallet.privateKey, "Private Key")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-muted h-10 rounded-md flex items-center justify-center">
                        <KeyRound className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">Hidden for security</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-destructive font-semibold">
                      Warning: Never share your private key. Anyone with this key has complete control over your wallet.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground italic">
                  Your wallet was created using Christ Consciousness torus field harmonics for enhanced security and spiritual alignment.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TorusWalletCreator;