/**
 * WalletConnector.ts
 * 
 * Provides integration with various Web3 wallets and traditional banking
 * through Plaid. This service stores connection data in the fractal storage
 * system for quantum-resistant security.
 */

import { fractalStorage, WalletConnectionInfo as FractalWalletInfo } from '../fractal-storage/FractalStorage';
import { plaidConnector } from '../plaid/PlaidConnector';

export type WalletType = 'bitcoin' | 'ethereum' | 'coinbase' | 'plaid';

/**
 * Information stored about a wallet connection
 */
export interface WalletConnectionInfo {
  type: WalletType;
  address?: string;
  publicKey?: string;
  accountId?: string;
  providerInfo?: Record<string, any>;
  timestamp: number;
}

/**
 * Connected wallet representation for the application
 */
export interface ConnectedWallet {
  id: string;
  type: WalletType;
  address?: string;
  name: string;
  balance?: string;
  connected: boolean;
  provider?: any;
  accountId?: string; // For Plaid bank accounts
}

/**
 * WalletConnector service that handles integration with various
 * cryptocurrency wallets and traditional banking through Plaid
 */
export class WalletConnector {
  private connections: Map<string, ConnectedWallet> = new Map();
  private initialized: boolean = false;
  private masterPassword: string | null = null;

  private walletConnectedListeners: ((wallet: ConnectedWallet) => void)[] = [];
  private walletDisconnectedListeners: ((walletId: string) => void)[] = [];

  /**
   * Initialize the wallet connector with a master password for secure storage
   * @param masterPassword Master password for encryption
   */
  public initialize(masterPassword: string): void {
    if (!masterPassword) {
      throw new Error('Master password is required');
    }
    
    this.masterPassword = masterPassword;
    this.initialized = true;
    
    // Initialize the fractal storage
    fractalStorage.initialize(masterPassword);
    
    // Initialize Plaid connector
    plaidConnector.initialize();
    
    // Load any existing connections from storage
    const existingConnections = fractalStorage.exportAllConnections();
    existingConnections.forEach(connection => {
      const { type, address, publicKey, accountId, timestamp } = connection;
      
      // Create a wallet object for each connection
      const wallet: ConnectedWallet = {
        id: address || accountId || `wallet-${Date.now()}`,
        type,
        address,
        name: this.getDefaultWalletName(type, address),
        connected: true,
        accountId,
      };
      
      this.connections.set(wallet.id, wallet);
    });
    
    console.log('Wallet connector initialized with quantum-secure storage');
  }

  /**
   * Connect to an Ethereum wallet (Metamask, etc.)
   * @returns Connected wallet information
   */
  public async connectEthereumWallet(): Promise<ConnectedWallet> {
    this.ensureInitialized();

    try {
      // In a real implementation, this would connect to Metamask or another Web3 provider
      console.log('Connecting to Ethereum wallet...');
      
      // Mock a successful connection
      const mockAddress = `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      const wallet: ConnectedWallet = {
        id: mockAddress,
        type: 'ethereum',
        address: mockAddress,
        name: this.getDefaultWalletName('ethereum', mockAddress),
        balance: '1.245',
        connected: true,
      };
      
      // Store the connection securely in fractal storage
      const connectionInfo: WalletConnectionInfo = {
        type: 'ethereum',
        address: mockAddress,
        timestamp: Date.now(),
        providerInfo: {
          chainId: '1',
          networkName: 'Ethereum Mainnet',
        },
      };
      
      fractalStorage.storeWalletConnection(connectionInfo as FractalWalletInfo);
      
      // Add to connections map
      this.connections.set(wallet.id, wallet);
      
      // Notify listeners
      this.notifyWalletConnected(wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting to Ethereum wallet:', error);
      throw new Error('Failed to connect Ethereum wallet');
    }
  }

  /**
   * Connect to a Coinbase wallet
   * @returns Connected wallet information
   */
  public async connectCoinbaseWallet(): Promise<ConnectedWallet> {
    this.ensureInitialized();

    try {
      // In a real implementation, this would connect to Coinbase wallet
      console.log('Connecting to Coinbase wallet...');
      
      // Mock a successful connection
      const mockAddress = `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      const wallet: ConnectedWallet = {
        id: mockAddress,
        type: 'coinbase',
        address: mockAddress,
        name: this.getDefaultWalletName('coinbase', mockAddress),
        balance: '2.78',
        connected: true,
      };
      
      // Store the connection securely in fractal storage
      const connectionInfo: WalletConnectionInfo = {
        type: 'coinbase',
        address: mockAddress,
        timestamp: Date.now(),
        providerInfo: {
          chainId: '1',
          networkName: 'Ethereum Mainnet',
          walletProvider: 'Coinbase',
        },
      };
      
      fractalStorage.storeWalletConnection(connectionInfo as FractalWalletInfo);
      
      // Add to connections map
      this.connections.set(wallet.id, wallet);
      
      // Notify listeners
      this.notifyWalletConnected(wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting to Coinbase wallet:', error);
      throw new Error('Failed to connect Coinbase wallet');
    }
  }

  /**
   * Connect to a Bitcoin wallet
   * @returns Connected wallet information
   */
  public async connectBitcoinWallet(): Promise<ConnectedWallet> {
    this.ensureInitialized();

    try {
      // In a real implementation, this would connect to a Bitcoin wallet
      console.log('Connecting to Bitcoin wallet...');
      
      // Mock a successful connection
      const mockAddress = `bc1${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      const wallet: ConnectedWallet = {
        id: mockAddress,
        type: 'bitcoin',
        address: mockAddress,
        name: this.getDefaultWalletName('bitcoin', mockAddress),
        balance: '0.0324',
        connected: true,
      };
      
      // Store the connection securely in fractal storage
      const connectionInfo: WalletConnectionInfo = {
        type: 'bitcoin',
        address: mockAddress,
        timestamp: Date.now(),
        providerInfo: {
          network: 'mainnet',
          walletType: 'segwit',
        },
      };
      
      fractalStorage.storeWalletConnection(connectionInfo as FractalWalletInfo);
      
      // Add to connections map
      this.connections.set(wallet.id, wallet);
      
      // Notify listeners
      this.notifyWalletConnected(wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting to Bitcoin wallet:', error);
      throw new Error('Failed to connect Bitcoin wallet');
    }
  }

  /**
   * Connect a bank account via Plaid
   * @returns Connected wallet information representing the bank account
   */
  public async connectPlaidBankAccount(): Promise<ConnectedWallet> {
    this.ensureInitialized();

    try {
      // Use PlaidConnector to establish a connection
      console.log('Connecting bank account via Plaid...');
      
      // Create a Link token (in a real app, this would come from the backend)
      const userId = `user-${Math.random().toString(36).substring(2, 10)}`;
      const linkToken = await plaidConnector.createLinkToken(userId);
      
      // Open Plaid Link (in a real app, this would open a UI component)
      const { publicToken, accountId } = await plaidConnector.openPlaidLink(linkToken);
      
      // Exchange the public token for an access token
      const walletId = await plaidConnector.exchangePublicToken({ publicToken, accountId });
      
      // Get account info
      const bankAccount = await plaidConnector.getBankAccountInfo(walletId);
      
      // Create a wallet object for the bank account
      const wallet: ConnectedWallet = {
        id: walletId,
        type: 'plaid',
        name: `${bankAccount.bankName} - ${bankAccount.name}`,
        balance: bankAccount.balance.available.toString(),
        connected: true,
        accountId: accountId,
      };
      
      // Store the connection securely in fractal storage
      const connectionInfo: WalletConnectionInfo = {
        type: 'plaid',
        accountId: accountId,
        timestamp: Date.now(),
        providerInfo: {
          bankName: bankAccount.bankName,
          accountType: bankAccount.type,
          accountSubtype: bankAccount.subtype,
          mask: bankAccount.mask,
        },
      };
      
      fractalStorage.storeWalletConnection(connectionInfo as FractalWalletInfo);
      
      // Add to connections map
      this.connections.set(wallet.id, wallet);
      
      // Notify listeners
      this.notifyWalletConnected(wallet);
      
      return wallet;
    } catch (error) {
      console.error('Error connecting bank account via Plaid:', error);
      throw new Error('Failed to connect bank account');
    }
  }

  /**
   * Disconnect a wallet
   * @param walletId ID of the wallet to disconnect
   */
  public disconnectWallet(walletId: string): void {
    this.ensureInitialized();
    
    const wallet = this.connections.get(walletId);
    if (wallet) {
      this.connections.delete(walletId);
      this.notifyWalletDisconnected(walletId);
      console.log(`Wallet ${walletId} disconnected`);
    }
  }

  /**
   * Get all connected wallets
   * @returns List of all connected wallets
   */
  public getConnectedWallets(): ConnectedWallet[] {
    this.ensureInitialized();
    return Array.from(this.connections.values());
  }

  /**
   * Get a connected wallet by ID
   * @param walletId ID of the wallet to retrieve
   * @returns Connected wallet or undefined if not found
   */
  public getWallet(walletId: string): ConnectedWallet | undefined {
    this.ensureInitialized();
    return this.connections.get(walletId);
  }

  /**
   * Add a wallet connected event listener
   * @param listener Function to call when a wallet is connected
   */
  public onWalletConnected(listener: (wallet: ConnectedWallet) => void): void {
    this.walletConnectedListeners.push(listener);
  }

  /**
   * Add a wallet disconnected event listener
   * @param listener Function to call when a wallet is disconnected
   */
  public onWalletDisconnected(listener: (walletId: string) => void): void {
    this.walletDisconnectedListeners.push(listener);
  }

  /**
   * Get the current reward balance for FractalCoin
   * @returns Current reward balance
   */
  public getFractalCoinBalance(): number {
    this.ensureInitialized();
    return fractalStorage.getRewardBalance();
  }

  /**
   * Export all wallet connections for backup
   * @returns Array of all wallet connections
   */
  public exportWalletConnections(): WalletConnectionInfo[] {
    this.ensureInitialized();
    return fractalStorage.exportAllConnections() as WalletConnectionInfo[];
  }

  /**
   * Get storage metrics for the quantum-secure storage system
   * @returns Storage statistics
   */
  public getStorageMetrics(): Record<string, any> {
    this.ensureInitialized();
    return fractalStorage.getStorageStats();
  }

  /**
   * Ensure that the wallet connector is initialized
   * @throws Error if not initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Wallet connector not initialized');
    }
  }

  /**
   * Notify wallet connected listeners
   * @param wallet Connected wallet
   */
  private notifyWalletConnected(wallet: ConnectedWallet): void {
    this.walletConnectedListeners.forEach(listener => {
      try {
        listener(wallet);
      } catch (error) {
        console.error('Error in wallet connected listener:', error);
      }
    });
  }

  /**
   * Notify wallet disconnected listeners
   * @param walletId ID of the disconnected wallet
   */
  private notifyWalletDisconnected(walletId: string): void {
    this.walletDisconnectedListeners.forEach(listener => {
      try {
        listener(walletId);
      } catch (error) {
        console.error('Error in wallet disconnected listener:', error);
      }
    });
  }

  /**
   * Get a default wallet name based on type and address
   * @param type Wallet type
   * @param address Wallet address
   * @returns Default wallet name
   */
  private getDefaultWalletName(type: WalletType, address?: string): string {
    switch (type) {
      case 'ethereum':
        return `Ethereum Wallet ${address ? address.substring(0, 6) : ''}`;
      case 'bitcoin':
        return `Bitcoin Wallet ${address ? address.substring(0, 6) : ''}`;
      case 'coinbase':
        return `Coinbase Wallet ${address ? address.substring(0, 6) : ''}`;
      case 'plaid':
        return 'Bank Account';
      default:
        return `Wallet ${address ? address.substring(0, 6) : ''}`;
    }
  }
}

// Export a singleton instance
export const walletConnector = new WalletConnector();