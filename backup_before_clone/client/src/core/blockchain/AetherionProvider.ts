/**
 * Aetherion Native Provider
 * 
 * A custom implementation for Aetherion blockchain connectivity that doesn't rely on
 * window.ethereum. This provider serves as a direct connection to the Aetherion
 * blockchain network.
 */

import { EventEmitter } from 'events';
import aetherCoinService from '../biozoe/AetherCoinService';
import { Blockchain } from './Blockchain';
import { Transaction, Block } from './types';

// Declare window.aetherion interface 
declare global {
  interface Window {
    aetherion?: AetherionProvider;
  }
}

/**
 * Native Aetherion provider class
 * Acts as a bridge between the application and the Aetherion blockchain
 */
export class AetherionProvider extends EventEmitter {
  private accounts: string[] = [];
  private chainId: string = '0xa37'; // Aetherion mainnet Chain ID (hex)
  private connected: boolean = false;
  private blockchain: Blockchain;
  private isAetherion: boolean = true;
  private ready: boolean = false;
  private networkVersion: string = '2637';
  
  constructor() {
    super();
    this.setMaxListeners(50);
    
    // Initialize blockchain
    this.blockchain = new Blockchain();
    
    // Initialize with empty state
    this.init();
  }
  
  /**
   * Initialize the provider
   */
  private async init(): Promise<void> {
    try {
      // Check local storage for previously connected accounts
      const savedAccounts = localStorage.getItem('aetherion_accounts');
      if (savedAccounts) {
        this.accounts = JSON.parse(savedAccounts);
      }
      
      this.ready = true;
      this.emit('ready');
      
      // Setup blockchain event listeners
      this.setupBlockchainListeners();
    } catch (error) {
      console.error('Error initializing Aetherion provider:', error);
    }
  }
  
  /**
   * Set up blockchain event listeners
   */
  private setupBlockchainListeners(): void {
    // Listen for new blocks
    this.blockchain.on('blockAdded', (block: Block) => {
      this.emit('block', block);
    });
    
    // Listen for pending transactions
    this.blockchain.on('transactionAdded', (transaction: Transaction) => {
      this.emit('pendingTransaction', transaction);
    });
    
    // Listen for chain changes
    this.blockchain.on('chainChanged', (chainId: string) => {
      this.chainId = chainId;
      this.emit('chainChanged', chainId);
    });
  }
  
  /**
   * Handle RPC requests similar to Ethereum providers but customized for Aetherion
   * @param options Request parameters
   * @returns Promise resolving to request result
   */
  public async request(options: { method: string; params?: any[] }): Promise<any> {
    const { method, params = [] } = options;
    
    // Wait until provider is ready
    if (!this.ready) {
      await new Promise<void>(resolve => {
        this.once('ready', () => resolve());
      });
    }
    
    switch (method) {
      case 'atc_requestAccounts':
      case 'eth_requestAccounts': // For compatibility
        return this.handleRequestAccounts();
        
      case 'atc_accounts':
      case 'eth_accounts': // For compatibility
        return this.accounts;
        
      case 'atc_chainId':
      case 'eth_chainId': // For compatibility
        return this.chainId;
        
      case 'net_version':
        return this.networkVersion;
        
      case 'atc_getBalance':
      case 'eth_getBalance': // For compatibility
        return this.handleGetBalance(params[0], params[1]);
        
      case 'atc_sendTransaction':
      case 'eth_sendTransaction': // For compatibility
        return this.handleSendTransaction(params[0]);
        
      case 'wallet_addAetherionChain':
      case 'wallet_addEthereumChain': // For compatibility
        return this.handleAddChain(params[0]);
        
      case 'wallet_switchAetherionChain':
      case 'wallet_switchEthereumChain': // For compatibility
        return this.handleSwitchChain(params[0]);
        
      default:
        throw new Error(`Method ${method} not supported by Aetherion provider`);
    }
  }
  
  /**
   * Handle request accounts
   * This is equivalent to connecting the wallet
   */
  private async handleRequestAccounts(): Promise<string[]> {
    // If already connected, return accounts
    if (this.connected && this.accounts.length > 0) {
      return this.accounts;
    }
    
    try {
      // In a real wallet, this would prompt the user for permission
      // For now, create a new account if none exists
      if (this.accounts.length === 0) {
        // Generate a new wallet address - in a real wallet, this would be different
        const newAccount = '0x' + Math.random().toString(16).substr(2, 40);
        this.accounts = [newAccount];
        
        // Save account to local storage
        localStorage.setItem('aetherion_accounts', JSON.stringify(this.accounts));
      }
      
      this.connected = true;
      this.emit('connect', { chainId: this.chainId });
      this.emit('accountsChanged', this.accounts);
      
      return this.accounts;
    } catch (error) {
      console.error('Error connecting to Aetherion:', error);
      throw new Error('User rejected the connection request');
    }
  }
  
  /**
   * Handle get balance request
   * @param address The address to check balance for
   * @param blockTag Block number or tag
   */
  private async handleGetBalance(address: string, blockTag: string = 'latest'): Promise<string> {
    try {
      // Use the AetherCoin service to get wallet
      const wallet = aetherCoinService.getWallet(address);
      if (!wallet) {
        return '0x0';
      }
      
      // Calculate total energy from wallet's energyPool
      const totalEnergy = wallet.energyPool || 0;
      
      // Convert balance to hex string (wei format)
      const balanceInWei = BigInt(Math.floor(totalEnergy * 1e18)).toString(16);
      return '0x' + balanceInWei;
    } catch (error) {
      console.error('Error getting Aetherion balance:', error);
      return '0x0';
    }
  }
  
  /**
   * Handle send transaction
   * @param transactionConfig Transaction parameters
   */
  private async handleSendTransaction(transactionConfig: any): Promise<string> {
    try {
      const { from, to, value, data } = transactionConfig;
      
      // Check if user is connected
      if (!this.connected || !this.accounts.includes(from)) {
        throw new Error('Sender account not connected');
      }
      
      // Create a transaction using the blockchain service
      const transaction: Transaction = {
        id: 'atc_' + Date.now().toString(16),
        from,
        to,
        amount: parseInt(value, 16) / 1e18,
        timestamp: Date.now(),
        signature: '',
        data: data || ''
      };
      
      // Sign and send transaction
      const txHash = await this.blockchain.addTransaction(transaction);
      
      // Emit transaction events
      this.emit('transactionHash', txHash);
      
      return txHash;
    } catch (error) {
      console.error('Error sending Aetherion transaction:', error);
      throw new Error('Transaction failed: ' + (error as Error).message);
    }
  }
  
  /**
   * Handle add chain request
   * @param chainParams Chain parameters
   */
  private async handleAddChain(chainParams: any): Promise<null> {
    try {
      const { chainId, chainName, rpcUrls } = chainParams;
      
      // Simply update chainId for demo - in a real implementation, 
      // this would verify and add the chain to available networks
      this.chainId = chainId;
      this.emit('chainChanged', chainId);
      
      return null;
    } catch (error) {
      console.error('Error adding Aetherion chain:', error);
      throw new Error('Failed to add chain');
    }
  }
  
  /**
   * Handle switch chain request
   * @param params Switch chain parameters
   */
  private async handleSwitchChain(params: any): Promise<null> {
    try {
      const { chainId } = params;
      
      // Update chain ID
      this.chainId = chainId;
      this.emit('chainChanged', chainId);
      
      return null;
    } catch (error) {
      console.error('Error switching Aetherion chain:', error);
      throw new Error('Failed to switch chain');
    }
  }
  
  /**
   * Subscribe to an event
   * @param event Event type to listen for
   * @param listener Function to call when event occurs
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }
  
  /**
   * Remove event listener
   * @param event Event type
   * @param listener Function to remove
   */
  public removeListener(event: string, listener: (...args: any[]) => void): this {
    super.removeListener(event, listener);
    return this;
  }
  
  /**
   * Enable the provider (legacy method)
   */
  public async enable(): Promise<string[]> {
    return this.handleRequestAccounts();
  }
}

// Create singleton instance
const aetherionProvider = new AetherionProvider();

// Initialize window.aetherion on load
if (typeof window !== 'undefined') {
  window.aetherion = aetherionProvider;
  
  // Log provider initialization
  console.log('Aetherion provider initialized');
}

export default aetherionProvider;