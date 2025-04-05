/**
 * WalletConnector.ts
 * 
 * Module for connecting to different types of cryptocurrency wallets and bank accounts
 * Provides a unified interface for wallet management
 */

import { EventEmitter } from 'events';
import CryptoJS from 'crypto-js';

// Define wallet types
export type WalletType = 'ethereum' | 'bitcoin' | 'coinbase' | 'plaid';

// Interface for a connected wallet
export interface ConnectedWallet {
  id: string;
  type: WalletType;
  name: string;
  address?: string;
  balance?: string;
  metadata?: Record<string, any>;
}

// Mock data for demonstration purposes in test mode
const MOCK_WALLETS: Record<WalletType, Partial<ConnectedWallet>> = {
  ethereum: {
    type: 'ethereum',
    name: 'Ethereum Wallet',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  },
  bitcoin: {
    type: 'bitcoin',
    name: 'Bitcoin Wallet',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  },
  coinbase: {
    type: 'coinbase',
    name: 'Coinbase Wallet',
    address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
  },
  plaid: {
    type: 'plaid',
    name: 'Bank Account',
    metadata: {
      accountNumber: 'XXXX1234',
      bankName: 'Virtual Bank'
    }
  }
};

// Balances for mock wallets
const MOCK_BALANCES: Record<WalletType, string> = {
  ethereum: '1.245 ETH',
  bitcoin: '0.0351 BTC',
  coinbase: '2,400 USDC',
  plaid: '$4,532.78'
};

class WalletConnector extends EventEmitter {
  private initialized: boolean = false;
  private encryptionKey: string = '';
  private connectedWallets: ConnectedWallet[] = [];
  private fractalCoinBalance: number = 0;
  private storageMetrics: Record<string, any> = {};

  constructor() {
    super();
    // Set max listeners to avoid memory leak warnings
    this.setMaxListeners(20);
  }

  /**
   * Initialize the wallet connector with an encryption key
   * @param encryptionKey - Master password for securing wallet data
   */
  public initialize(encryptionKey: string): void {
    if (this.initialized) return;
    
    // Set encryption key (hash it for security)
    this.encryptionKey = CryptoJS.SHA256(encryptionKey).toString(CryptoJS.enc.Hex);
    
    // Initialize storage metrics for test mode
    this.storageMetrics = {
      totalNodes: 0,
      ethereumWallets: 0,
      bitcoinWallets: 0,
      coinbaseWallets: 0,
      plaidConnections: 0,
      storagePoints: 0,
      quantumComplexity: 0,
      lastUpdate: new Date().toISOString()
    };
    
    // Start with some initial FractalCoin balance
    this.fractalCoinBalance = 25.0;
    
    this.initialized = true;
  }

  /**
   * Connect an Ethereum wallet
   * @returns Promise that resolves to a connected wallet object
   */
  public async connectEthereumWallet(): Promise<ConnectedWallet> {
    this.checkInitialized();
    
    try {
      // In test mode, simulate connecting to an Ethereum wallet
      await this.simulateConnection(800);
      
      const walletId = `eth-${Date.now()}`;
      const wallet: ConnectedWallet = {
        id: walletId,
        ...MOCK_WALLETS.ethereum as ConnectedWallet,
        balance: MOCK_BALANCES.ethereum
      };
      
      this.connectedWallets.push(wallet);
      this.storageMetrics.ethereumWallets++;
      this.updateStorageMetrics();
      
      // Emit wallet connected event
      this.emit('walletConnected', wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting Ethereum wallet:', error);
      throw new Error('Failed to connect Ethereum wallet. ' + (error instanceof Error ? error.message : ''));
    }
  }

  /**
   * Connect a Bitcoin wallet
   * @returns Promise that resolves to a connected wallet object
   */
  public async connectBitcoinWallet(): Promise<ConnectedWallet> {
    this.checkInitialized();
    
    try {
      // In test mode, simulate connecting to a Bitcoin wallet
      await this.simulateConnection(1200);
      
      const walletId = `btc-${Date.now()}`;
      const wallet: ConnectedWallet = {
        id: walletId,
        ...MOCK_WALLETS.bitcoin as ConnectedWallet,
        balance: MOCK_BALANCES.bitcoin
      };
      
      this.connectedWallets.push(wallet);
      this.storageMetrics.bitcoinWallets++;
      this.updateStorageMetrics();
      
      // Emit wallet connected event
      this.emit('walletConnected', wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting Bitcoin wallet:', error);
      throw new Error('Failed to connect Bitcoin wallet. ' + (error instanceof Error ? error.message : ''));
    }
  }

  /**
   * Connect a Coinbase wallet
   * @returns Promise that resolves to a connected wallet object
   */
  public async connectCoinbaseWallet(): Promise<ConnectedWallet> {
    this.checkInitialized();
    
    try {
      // In test mode, simulate connecting to a Coinbase wallet
      await this.simulateConnection(1000);
      
      const walletId = `cb-${Date.now()}`;
      const wallet: ConnectedWallet = {
        id: walletId,
        ...MOCK_WALLETS.coinbase as ConnectedWallet,
        balance: MOCK_BALANCES.coinbase
      };
      
      this.connectedWallets.push(wallet);
      this.storageMetrics.coinbaseWallets++;
      this.updateStorageMetrics();
      
      // Emit wallet connected event
      this.emit('walletConnected', wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting Coinbase wallet:', error);
      throw new Error('Failed to connect Coinbase wallet. ' + (error instanceof Error ? error.message : ''));
    }
  }

  /**
   * Connect a Plaid bank account
   * @returns Promise that resolves to a connected wallet object
   */
  public async connectPlaidBankAccount(): Promise<ConnectedWallet> {
    this.checkInitialized();
    
    try {
      // In test mode, simulate connecting to a Plaid bank account
      await this.simulateConnection(1500);
      
      const walletId = `plaid-${Date.now()}`;
      const wallet: ConnectedWallet = {
        id: walletId,
        ...MOCK_WALLETS.plaid as ConnectedWallet,
        balance: MOCK_BALANCES.plaid
      };
      
      this.connectedWallets.push(wallet);
      this.storageMetrics.plaidConnections++;
      this.updateStorageMetrics();
      
      // Emit wallet connected event
      this.emit('walletConnected', wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting Plaid bank account:', error);
      throw new Error('Failed to connect Plaid bank account. ' + (error instanceof Error ? error.message : ''));
    }
  }

  /**
   * Disconnect a wallet
   * @param walletId - ID of the wallet to disconnect
   */
  public disconnectWallet(walletId: string): void {
    this.checkInitialized();
    
    const walletIndex = this.connectedWallets.findIndex(w => w.id === walletId);
    if (walletIndex === -1) {
      throw new Error(`Wallet with ID ${walletId} not found`);
    }
    
    const wallet = this.connectedWallets[walletIndex];
    
    // Update metrics
    if (wallet.type === 'ethereum') this.storageMetrics.ethereumWallets--;
    if (wallet.type === 'bitcoin') this.storageMetrics.bitcoinWallets--;
    if (wallet.type === 'coinbase') this.storageMetrics.coinbaseWallets--;
    if (wallet.type === 'plaid') this.storageMetrics.plaidConnections--;
    
    // Remove wallet from connected wallets
    this.connectedWallets.splice(walletIndex, 1);
    
    // Update storage metrics
    this.updateStorageMetrics();
    
    // Emit wallet disconnected event
    this.emit('walletDisconnected', walletId);
  }

  /**
   * Get all connected wallets
   * @returns Array of connected wallet objects
   */
  public getConnectedWallets(): ConnectedWallet[] {
    this.checkInitialized();
    return [...this.connectedWallets];
  }

  /**
   * Get FractalCoin balance
   * @returns Current FractalCoin balance
   */
  public getFractalCoinBalance(): number {
    this.checkInitialized();
    return this.fractalCoinBalance;
  }

  /**
   * Get storage metrics
   * @returns Object containing storage metrics
   */
  public getStorageMetrics(): Record<string, any> {
    this.checkInitialized();
    return { ...this.storageMetrics };
  }

  /**
   * Add wallet connected event listener
   * @param listener - Callback function that will be called when a wallet is connected
   */
  public onWalletConnected(listener: (wallet: ConnectedWallet) => void): void {
    this.on('walletConnected', listener);
  }

  /**
   * Add wallet disconnected event listener
   * @param listener - Callback function that will be called when a wallet is disconnected
   */
  public onWalletDisconnected(listener: (walletId: string) => void): void {
    this.on('walletDisconnected', listener);
  }

  /**
   * Determine if wallet connector is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Private method to check if wallet connector is initialized
   * @throws Error if not initialized
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('WalletConnector not initialized. Call initialize() first.');
    }
  }

  /**
   * Simulate a connection delay
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private simulateConnection(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Update storage metrics
   */
  private updateStorageMetrics(): void {
    const totalWallets = this.storageMetrics.ethereumWallets +
      this.storageMetrics.bitcoinWallets +
      this.storageMetrics.coinbaseWallets +
      this.storageMetrics.plaidConnections;
    
    this.storageMetrics.totalNodes = totalWallets * 3;
    this.storageMetrics.storagePoints = totalWallets * 150;
    this.storageMetrics.quantumComplexity = Math.min(totalWallets * 25, 100);
    this.storageMetrics.lastUpdate = new Date().toISOString();
    
    // Increase FractalCoin balance based on contributions
    this.fractalCoinBalance += totalWallets * 5;
  }
}

// Export singleton instance
export const walletConnector = new WalletConnector();