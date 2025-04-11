/**
 * Network Details Page
 * 
 * A dedicated page showing the AetherCoin network configurations
 * with easy copy-paste functionality for adding to wallets
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Network, HelpCircle } from 'lucide-react';
import NetworkDetailsCard from '../components/wallet/NetworkDetailsCard';
import { GOLDEN_RATIO, PI } from '../core/biozoe/FractalAlgorithms';

// Network constants using mathematical principles
const QUANTUM_BIO_CHAIN_ID = 137042; // Combining quantum physics constant (137) with Answer to Life (42)
const CHAIN_ID_HEX = `0x${QUANTUM_BIO_CHAIN_ID.toString(16)}`;

const PI_BASED_TESTNET_ID = 314159; // First 6 digits of Pi
const TESTNET_CHAIN_ID_HEX = `0x${PI_BASED_TESTNET_ID.toString(16)}`;

// Golden Ratio Chain ID (for alternative network)
const GOLDEN_RATIO_CHAIN_ID = Math.round(GOLDEN_RATIO * 100000); // 161803
const GOLDEN_RATIO_CHAIN_ID_HEX = `0x${GOLDEN_RATIO_CHAIN_ID.toString(16)}`;

// Network details
const MAINNET_DETAILS = {
  name: 'AetherCoin BioZoe Network',
  chainId: QUANTUM_BIO_CHAIN_ID,
  chainIdHex: CHAIN_ID_HEX,
  symbol: 'ATC',
  decimals: 18,
  rpcUrl: 'https://rpc.aethercoin.network',
  blockExplorerUrl: 'https://explorer.aethercoin.network',
  description: 'The primary AetherCoin network utilizing quantum entanglement and biological growth principles.'
};

const TESTNET_DETAILS = {
  name: 'AetherCoin BioZoe Testnet',
  chainId: PI_BASED_TESTNET_ID,
  chainIdHex: TESTNET_CHAIN_ID_HEX,
  symbol: 'tATC',
  decimals: 18,
  rpcUrl: 'https://testnet-rpc.aethercoin.network',
  blockExplorerUrl: 'https://testnet-explorer.aethercoin.network',
  description: 'Testing network with free tokens for development and experimentation.'
};

const GOLDEN_NETWORK_DETAILS = {
  name: 'AetherCoin Golden Network',
  chainId: GOLDEN_RATIO_CHAIN_ID,
  chainIdHex: GOLDEN_RATIO_CHAIN_ID_HEX,
  symbol: 'ATC',
  decimals: 18,
  rpcUrl: 'https://golden-rpc.aethercoin.network',
  blockExplorerUrl: 'https://golden-explorer.aethercoin.network',
  description: 'Alternative network focusing on Golden Ratio principles and harmonic growth patterns.'
};

export function NetworkDetailsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/aethercoin">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Network className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Network Details</h1>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Complete configuration details for the AetherCoin networks. Use these details to manually add the networks to your wallet.
      </p>
      
      <Tabs defaultValue="mainnet" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="mainnet">Mainnet</TabsTrigger>
          <TabsTrigger value="testnet">Testnet</TabsTrigger>
          <TabsTrigger value="golden">Golden Network</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mainnet" className="mt-0">
          <NetworkDetailsCard network={MAINNET_DETAILS} variant="primary" />
        </TabsContent>
        
        <TabsContent value="testnet" className="mt-0">
          <NetworkDetailsCard network={TESTNET_DETAILS} variant="secondary" />
        </TabsContent>
        
        <TabsContent value="golden" className="mt-0">
          <NetworkDetailsCard network={GOLDEN_NETWORK_DETAILS} variant="outline" />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>How to add AetherCoin to your wallet</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to add the AetherCoin network to your preferred wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Method 1: Using the Add to Wallet button</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Visit the <Link href="/aethercoin"><span className="text-primary underline">AetherCoin Network</span></Link> page</li>
              <li>Click the "Add to Wallet" button for your preferred network</li>
              <li>Confirm the connection request in your wallet</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Method 2: Manual configuration</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>In your wallet app, find the "Add Network" or "Custom RPC" option</li>
              <li>Copy the details from this page for your preferred network</li>
              <li>Paste each field into the corresponding field in your wallet</li>
              <li>Save or confirm the network addition</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Method 3: Download configuration</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click the "Download" button for your preferred network on this page</li>
              <li>Some wallet apps can import network configurations directly from files</li>
              <li>Check your wallet's documentation for importing network JSON files</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NetworkDetailsPage;