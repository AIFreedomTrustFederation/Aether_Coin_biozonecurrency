import React from 'react';
import WalletCreation from '../components/wallet/WalletCreation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WalletPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Management</h1>
        
        <Tabs defaultValue="create-wallet" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create-wallet">
              <span className="hidden sm:inline">Create/Import Wallet</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger value="web3-connect">
              <span className="hidden sm:inline">Web3 Connect</span>
              <span className="sm:hidden">Connect</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create-wallet">
            <WalletCreation />
          </TabsContent>
          
          <TabsContent value="web3-connect">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Web3 Connect</h2>
              <p className="text-muted-foreground mb-6">
                Connect using the test mode interface to interact with external wallets like MetaMask or Coinbase Wallet.
              </p>
              <a href="/test" className="text-primary underline">
                Go to Test Mode
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;