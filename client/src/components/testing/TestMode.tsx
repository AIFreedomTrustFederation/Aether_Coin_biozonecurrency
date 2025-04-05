/**
 * TestMode.tsx
 * 
 * A simple UI for testing the KYC onboarding, wallet connections,
 * and fractal storage functionality without going through the full onboarding flow.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Wallet, CreditCard, Check, AlertCircle, Bot, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { walletConnector, WalletType, ConnectedWallet } from '../../core/wallet/WalletConnector';
import { plaidConnector, KycVerification } from '../../core/plaid/PlaidConnector';
import { fractalStorage } from '../../core/fractal-storage/FractalStorage';
import { aiAgentManager, AIAgentProfile } from '../../core/ai-agent/AIAgentManager';
import AIAgentCustomization from '../ai-agent/AIAgentCustomization';

export default function TestMode() {
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [initialized, setInitialized] = useState<boolean>(false);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [kycVerification, setKycVerification] = useState<KycVerification | undefined>(undefined);
  const [fractalCoinBalance, setFractalCoinBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storageStats, setStorageStats] = useState<Record<string, any>>({});
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('ethereum');
  const [logs, setLogs] = useState<string[]>([]);
  const [aiAgent, setAiAgent] = useState<AIAgentProfile | undefined>(undefined);
  const { toast } = useToast();

  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Initialize the connectors
  const initialize = () => {
    if (!masterPassword) {
      toast({
        title: 'Error',
        description: 'Please enter a master password',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Initialize fractal storage
      fractalStorage.initialize(masterPassword);
      addLog('Fractal storage initialized with quantum-resistant encryption');

      // Initialize wallet connector
      walletConnector.initialize(masterPassword);
      addLog('Wallet connector initialized');

      // Initialize Plaid connector
      plaidConnector.initialize();
      addLog('Plaid connector initialized');

      // Set up wallet connected listener
      walletConnector.onWalletConnected(wallet => {
        setConnectedWallets(prev => [...prev.filter(w => w.id !== wallet.id), wallet]);
        addLog(`Wallet connected: ${wallet.name}`);
        updateStats();
      });

      // Set up wallet disconnected listener
      walletConnector.onWalletDisconnected(walletId => {
        setConnectedWallets(prev => prev.filter(w => w.id !== walletId));
        addLog(`Wallet disconnected: ${walletId}`);
        updateStats();
      });

      // Get initial stats
      updateStats();

      setInitialized(true);
      toast({
        title: 'Initialized',
        description: 'All systems initialized successfully'
      });
    } catch (error) {
      console.error('Initialization error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Initialization Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update storage stats
  const updateStats = () => {
    if (initialized) {
      setFractalCoinBalance(walletConnector.getFractalCoinBalance());
      setConnectedWallets(walletConnector.getConnectedWallets());
      setStorageStats(walletConnector.getStorageMetrics());
    }
  };

  // Create KYC verification
  const createKycVerification = async () => {
    if (!initialized) {
      toast({
        title: 'Error',
        description: 'Please initialize the system first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create KYC verification
      const userId = `user-${Date.now()}`;
      const verificationId = await plaidConnector.initiateKycVerification(userId, 'basic');
      addLog(`KYC verification initiated: ${verificationId}`);

      // Submit KYC information
      const verification = await plaidConnector.submitKycInformation(verificationId, {
        fullName: 'Test User',
        address: '123 Test St, Test City, Test Country, 12345',
        dateOfBirth: '1990-01-01',
        socialSecurityNumber: '123-45-6789'
      });

      setKycVerification(verification);
      addLog(`KYC verification status: ${verification.status}`);

      toast({
        title: 'KYC Verification',
        description: `Verification status: ${verification.status}`
      });
    } catch (error) {
      console.error('KYC verification error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'KYC Verification Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create AI Agent from KYC
  const createAiAgent = async () => {
    if (!initialized) {
      toast({
        title: 'Error',
        description: 'Please initialize the system first',
        variant: 'destructive'
      });
      return;
    }
    
    if (!kycVerification) {
      toast({
        title: 'Error',
        description: 'Please complete KYC verification first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Initialize AI Agent Manager if needed
      if (!aiAgentManager.isInitialized()) {
        aiAgentManager.initialize();
        addLog('AI Agent Manager initialized');
      }
      
      // Create agent from KYC verification
      const userId = kycVerification.userId;
      const agent = await aiAgentManager.createAgentFromKyc(
        userId,
        kycVerification.verificationId,
        'Aetherion Assistant'
      );
      
      setAiAgent(agent);
      addLog(`AI Agent created: ${agent.name} (Tier: ${agent.tier})`);
      
      toast({
        title: 'AI Agent Created',
        description: `${agent.name} is now ready to assist you`
      });
    } catch (error) {
      console.error('AI Agent creation error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Agent Creation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle AI Agent updates
  const handleAgentUpdated = (updatedAgent: AIAgentProfile) => {
    setAiAgent(updatedAgent);
    addLog(`AI Agent updated: ${updatedAgent.name} (Tier: ${updatedAgent.tier})`);
    toast({
      title: 'AI Agent Updated',
      description: `${updatedAgent.name} has been updated successfully`
    });
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!initialized) {
      toast({
        title: 'Error',
        description: 'Please initialize the system first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      let wallet: ConnectedWallet;

      // Connect selected wallet type
      switch (selectedWalletType) {
        case 'ethereum':
          wallet = await walletConnector.connectEthereumWallet();
          break;
        case 'bitcoin':
          wallet = await walletConnector.connectBitcoinWallet();
          break;
        case 'coinbase':
          wallet = await walletConnector.connectCoinbaseWallet();
          break;
        case 'plaid':
          wallet = await walletConnector.connectPlaidBankAccount();
          break;
        default:
          throw new Error('Invalid wallet type');
      }

      addLog(`Connected ${selectedWalletType} wallet: ${wallet.name}`);
      
      // Manually update UI state after connection
      setConnectedWallets(walletConnector.getConnectedWallets());
      setFractalCoinBalance(walletConnector.getFractalCoinBalance());
      setStorageStats(walletConnector.getStorageMetrics());
      
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected ${wallet.name}`
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = (walletId: string) => {
    if (!initialized) return;
    
    try {
      walletConnector.disconnectWallet(walletId);
      addLog(`Disconnected wallet: ${walletId}`);
      
      // Manually update UI state after disconnection
      setConnectedWallets(walletConnector.getConnectedWallets());
      setFractalCoinBalance(walletConnector.getFractalCoinBalance());
      setStorageStats(walletConnector.getStorageMetrics());
      
      toast({
        title: 'Wallet Disconnected',
        description: 'Wallet has been disconnected'
      });
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Disconnection Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Aetherion Test Mode</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 mx-auto max-w-2xl">
          Test the quantum-resistant storage, wallet connections, and KYC verification functionality
        </p>
      </div>

      <Tabs defaultValue="initialization" className="space-y-6">
        <TabsList className="grid grid-cols-5 gap-1">
          <TabsTrigger value="initialization" className="px-1 sm:px-3 text-xs sm:text-sm">Initialization</TabsTrigger>
          <TabsTrigger value="wallets" className="px-1 sm:px-3 text-xs sm:text-sm">Wallets</TabsTrigger>
          <TabsTrigger value="kyc" className="px-1 sm:px-3 text-xs sm:text-sm">KYC</TabsTrigger>
          <TabsTrigger value="storage" className="px-1 sm:px-3 text-xs sm:text-sm">Storage</TabsTrigger>
          <TabsTrigger value="ai_agents" className="px-1 sm:px-3 text-xs sm:text-sm">AI Agents</TabsTrigger>
        </TabsList>

        {/* Initialization Tab */}
        <TabsContent value="initialization">
          <Card>
            <CardHeader>
              <CardTitle>System Initialization</CardTitle>
              <CardDescription>
                Initialize the quantum-resistant storage system with a master password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="master-password">Master Password</Label>
                <Input
                  id="master-password"
                  type="password"
                  placeholder="Enter a secure master password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  disabled={initialized || isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  This password will be used to secure your wallet connections with quantum-resistant encryption
                </p>
              </div>

              <Button 
                onClick={initialize} 
                disabled={initialized || isLoading || !masterPassword}
                className="w-full"
              >
                {isLoading ? 'Initializing...' : initialized ? 'Initialized' : 'Initialize'}
              </Button>

              {initialized && (
                <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      System initialized successfully
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Management</CardTitle>
              <CardDescription>
                Connect and manage cryptocurrency wallets and bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connected wallets */}
              <div>
                <h3 className="text-lg font-medium mb-2">Connected Wallets</h3>
                {connectedWallets.length === 0 ? (
                  <div className="p-4 border rounded-md bg-muted/10 text-center">
                    <p className="text-muted-foreground">No wallets connected yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectedWallets.map(wallet => (
                      <div key={wallet.id} className="p-4 border rounded-md flex justify-between items-center">
                        <div>
                          <div className="font-medium">{wallet.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {wallet.type === 'plaid' ? 'Bank Account' : wallet.address?.substring(0, 10) + '...'}
                            {wallet.balance && ` • Balance: ${wallet.balance}`}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => disconnectWallet(wallet.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Connect new wallet */}
              <div>
                <h3 className="text-lg font-medium mb-4">Connect New Wallet</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedWalletType === 'ethereum' ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                      onClick={() => setSelectedWalletType('ethereum')}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Wallet className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Ethereum</span>
                      </div>
                    </div>
                    
                    <div
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedWalletType === 'bitcoin' ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                      onClick={() => setSelectedWalletType('bitcoin')}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Wallet className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Bitcoin</span>
                      </div>
                    </div>
                    
                    <div
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedWalletType === 'coinbase' ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                      onClick={() => setSelectedWalletType('coinbase')}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Wallet className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Coinbase</span>
                      </div>
                    </div>
                    
                    <div
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedWalletType === 'plaid' ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                      onClick={() => setSelectedWalletType('plaid')}
                    >
                      <div className="flex flex-col items-center text-center">
                        <CreditCard className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Bank</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={connectWallet}
                    disabled={!initialized || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </div>
              </div>

              {fractalCoinBalance > 0 && (
                <div className="p-4 border rounded-md bg-primary/5">
                  <h4 className="font-medium mb-1 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    FractalCoin Rewards
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You've earned {fractalCoinBalance.toFixed(2)} FractalCoins for your quantum-secured storage contributions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>
                Test the Know Your Customer verification process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={createKycVerification}
                disabled={!initialized || isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Create Test KYC Verification'}
              </Button>

              {kycVerification && (
                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-medium">Verification Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        kycVerification.identityVerified ? 'bg-green-500' : 'bg-amber-500'
                      } text-white`}>
                        {kycVerification.identityVerified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">Identity Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          {kycVerification.identityVerified ? 'Verified' : 'Pending verification'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        kycVerification.addressVerified ? 'bg-green-500' : 'bg-amber-500'
                      } text-white`}>
                        {kycVerification.addressVerified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">Address Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          {kycVerification.addressVerified ? 'Verified' : 'Pending verification'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        kycVerification.documentVerified ? 'bg-green-500' : 'bg-amber-500'
                      } text-white`}>
                        {kycVerification.documentVerified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">Document Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          {kycVerification.documentVerified ? 'Verified' : 'Pending verification'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md bg-muted/10">
                    <h4 className="font-medium mb-1">KYC Level</h4>
                    <p className="text-sm text-muted-foreground">
                      Verification level: <span className="font-medium">{kycVerification.kycLevel}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verification ID: <span className="font-medium">{kycVerification.verificationId}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Status: <span className="font-medium">{kycVerification.status}</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Stats Tab */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Quantum-Resistant Storage</CardTitle>
              <CardDescription>
                View statistics about the fractal storage system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(storageStats).length === 0 ? (
                <div className="p-4 border rounded-md bg-muted/10 text-center">
                  <p className="text-muted-foreground">No storage stats available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium mb-1">Total Nodes</h4>
                      <p className="text-2xl font-bold">{storageStats.totalNodes || 0}</p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium mb-1">FractalCoin Balance</h4>
                      <p className="text-2xl font-bold">{fractalCoinBalance.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Wallet Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Ethereum Wallets</span>
                        <span className="font-medium">{storageStats.ethereumWallets || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bitcoin Wallets</span>
                        <span className="font-medium">{storageStats.bitcoinWallets || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coinbase Wallets</span>
                        <span className="font-medium">{storageStats.coinbaseWallets || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Plaid Connections</span>
                        <span className="font-medium">{storageStats.plaidConnections || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Quantum Security</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Storage Points</span>
                          <span className="font-medium">{storageStats.storagePoints || 0}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Quantum Complexity</span>
                          <span className="font-medium">{(storageStats.quantumComplexity || 0).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${storageStats.quantumComplexity || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-1">Last Update</h4>
                    <p className="text-sm text-muted-foreground">
                      {storageStats.lastUpdate ? new Date(storageStats.lastUpdate).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={updateStats}
                disabled={!initialized}
                variant="outline"
                className="w-full"
              >
                Refresh Stats
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="ai_agents">
          <Card>
            <CardHeader>
              <CardTitle>Quantum AI Agent Network</CardTitle>
              <CardDescription>
                Create and interact with your personalized quantum AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!aiAgent ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-primary/5">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-medium">Create Your AI Agent</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete KYC verification to receive your personalized quantum AI agent
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={createAiAgent}
                    disabled={!initialized || isLoading || !kycVerification}
                    className="w-full"
                  >
                    {isLoading ? 'Creating Agent...' : 'Create Your Quantum AI Agent'}
                  </Button>
                  
                  {!kycVerification && (
                    <div className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md text-sm">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-500">KYC Required</p>
                          <p className="text-amber-700 dark:text-amber-400">
                            You need to complete KYC verification before creating an AI agent.
                            Go to the KYC tab to complete verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 border rounded-md bg-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                      <div 
                        className="w-full h-full rounded-full" 
                        style={{ 
                          background: `radial-gradient(circle at center, ${aiAgent.appearance.avatarColor}, transparent 70%)`,
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: aiAgent.appearance.avatarColor }}
                      >
                        {aiAgent.name.substring(0, 1)}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold">{aiAgent.name}</h3>
                        <div className="flex items-center mt-1">
                          <div className="px-2 py-0.5 bg-primary/10 rounded text-xs font-medium uppercase tracking-wide">
                            {aiAgent.tier.replace('_', ' ')}
                          </div>
                          <div className="ml-2 flex items-center text-muted-foreground">
                            <Zap className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">{aiAgent.autonomyLevel}% Autonomy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-2 font-medium capitalize">{aiAgent.status}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(aiAgent.created).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reputation:</span>
                        <span className="ml-2 font-medium">{aiAgent.reputationScore}/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Active:</span>
                        <span className="ml-2 font-medium">
                          {new Date(aiAgent.lastInteraction).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Capabilities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {aiAgent.capabilities.map((capability, index) => (
                        <div key={index} className="p-2 border rounded-md text-sm flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Agent Customization</h3>
                    <AIAgentCustomization 
                      userId={aiAgent.userId}
                      agentId={aiAgent.id}
                      onAgentUpdated={handleAgentUpdated}
                    />
                  </div>
                  
                  <div className="p-4 border rounded-md bg-muted/10">
                    <h4 className="font-medium mb-2">Quantum Binding Info</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-32">Binding Hash:</span>
                        <span className="font-mono text-xs">{aiAgent.quantumBindingHash.substring(0, 20)}...</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-32">Model Weights:</span>
                        <span>{aiAgent.modelWeightRefs.length} shards</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-32">KYC Reference:</span>
                        <span className="font-mono text-xs">{aiAgent.kycVerificationId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Logs */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            View system events and error messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 rounded-md p-4 h-60 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground">No logs available</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap break-all">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLogs([])}
            disabled={logs.length === 0}
          >
            Clear Logs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}