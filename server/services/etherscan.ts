import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Default free API key (with rate limits)
// For production use, should use an environment variable
const API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
const BASE_URL = 'https://api.etherscan.io/api';

/**
 * Etherscan API Service
 * Documentation: https://docs.etherscan.io/
 * 
 * Requires a free API key with generous rate limits
 */
export const EtherscanService = {
  /**
   * Get current Ethereum gas price
   * @returns Current gas price in Gwei
   */
  async getGasPrice(): Promise<any> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
          apikey: API_KEY,
        },
      });
      
      if (response.data.status === '1') {
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch gas price');
      }
    } catch (error) {
      console.error('Error fetching gas price from Etherscan:', error);
      throw error;
    }
  },

  /**
   * Get Ethereum account balance
   * @param address Ethereum address
   * @returns Account balance in Wei
   */
  async getBalance(address: string): Promise<any> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          module: 'account',
          action: 'balance',
          address,
          tag: 'latest',
          apikey: API_KEY,
        },
      });
      
      if (response.data.status === '1') {
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error(`Error fetching balance for address ${address}:`, error);
      throw error;
    }
  },

  /**
   * Get list of transactions for an address
   * @param address Ethereum address
   * @param startBlock Starting block number (optional)
   * @param endBlock Ending block number (optional)
   * @param page Page number (optional)
   * @param offset Max records to return (optional)
   * @param sort Sorting preference (optional, 'asc' or 'desc')
   * @returns List of transactions
   */
  async getTransactions(
    address: string,
    startBlock: number = 0,
    endBlock: number = 99999999,
    page: number = 1,
    offset: number = 10,
    sort: 'asc' | 'desc' = 'desc'
  ): Promise<any> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: startBlock,
          endblock: endBlock,
          page,
          offset,
          sort,
          apikey: API_KEY,
        },
      });
      
      if (response.data.status === '1') {
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error(`Error fetching transactions for address ${address}:`, error);
      throw error;
    }
  },

  /**
   * Get ERC-20 token transactions for an address
   * @param address Ethereum address
   * @param contractAddress Token contract address (optional)
   * @param page Page number (optional)
   * @param offset Max records to return (optional)
   * @param sort Sorting preference (optional, 'asc' or 'desc')
   * @returns List of token transactions
   */
  async getTokenTransactions(
    address: string,
    contractAddress: string = '',
    page: number = 1,
    offset: number = 10,
    sort: 'asc' | 'desc' = 'desc'
  ): Promise<any> {
    try {
      const params: any = {
        module: 'account',
        action: 'tokentx',
        address,
        page,
        offset,
        sort,
        apikey: API_KEY,
      };

      if (contractAddress) {
        params.contractaddress = contractAddress;
      }

      const response = await axios.get(BASE_URL, { params });
      
      if (response.data.status === '1') {
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch token transactions');
      }
    } catch (error) {
      console.error(`Error fetching token transactions for address ${address}:`, error);
      throw error;
    }
  },

  /**
   * Get Ethereum block by number
   * @param blockNumber Block number
   * @returns Block information
   */
  async getBlock(blockNumber: number): Promise<any> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          module: 'proxy',
          action: 'eth_getBlockByNumber',
          tag: `0x${blockNumber.toString(16)}`,
          boolean: true,
          apikey: API_KEY,
        },
      });
      
      if (response.data.result) {
        return response.data.result;
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch block');
      }
    } catch (error) {
      console.error(`Error fetching block ${blockNumber}:`, error);
      throw error;
    }
  }
};

export default EtherscanService;