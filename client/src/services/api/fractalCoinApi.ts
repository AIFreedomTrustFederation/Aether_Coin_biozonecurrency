
import ApiClient from './apiClient';

// Define types for Fractalcoin API responses
export interface CoinData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: string;
  from?: string;
  to?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface WalletInfo {
  address: string;
  balance: number;
  stakingRewards?: number;
}

class FractalCoinApi {
  private apiClient: ApiClient;
  
  constructor(baseURL: string, apiKey?: string) {
    this.apiClient = new ApiClient(baseURL);
    
    // Set API key if provided
    if (apiKey) {
      this.apiClient.setAuthToken(apiKey);
    }
  }
  
  // Get current coin data
  async getCoinData(): Promise<CoinData> {
    const response = await this.apiClient.client.get('/coin/data');
    return response.data;
  }
  
  // Get user wallet information
  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    const response = await this.apiClient.client.get(`/wallet/${walletAddress}`);
    return response.data;
  }
  
  // Get transaction history
  async getTransactions(walletAddress: string, limit = 10): Promise<Transaction[]> {
    const response = await this.apiClient.client.get(`/transactions/${walletAddress}`, {
      params: { limit }
    });
    return response.data;
  }
  
  // Send transaction
  async sendTransaction(fromAddress: string, toAddress: string, amount: number): Promise<Transaction> {
    const response = await this.apiClient.client.post('/transactions', {
      fromAddress,
      toAddress,
      amount
    });
    return response.data;
  }
  
  // Get staking information
  async getStakingInfo(walletAddress: string): Promise<any> {
    const response = await this.apiClient.client.get(`/staking/${walletAddress}`);
    return response.data;
  }
}

export default FractalCoinApi;
