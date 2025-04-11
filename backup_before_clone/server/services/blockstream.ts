import axios from 'axios';

const BASE_URL = 'https://blockstream.info/api';

/**
 * Blockstream API Service for Bitcoin blockchain data
 * Documentation: https://github.com/Blockstream/esplora/blob/master/API.md
 * 
 * Open source Bitcoin explorer API with no API key required
 */
export const BlockstreamService = {
  /**
   * Get address information and transaction history
   * @param address Bitcoin address
   * @returns Address information and transaction history
   */
  async getAddressInfo(address: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/address/${address}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching address info for ${address}:`, error);
      throw error;
    }
  },

  /**
   * Get address transactions
   * @param address Bitcoin address
   * @returns List of transactions
   */
  async getAddressTxs(address: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/address/${address}/txs`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for address ${address}:`, error);
      throw error;
    }
  },

  /**
   * Get transaction details
   * @param txid Transaction ID
   * @returns Transaction details
   */
  async getTransaction(txid: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/tx/${txid}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${txid}:`, error);
      throw error;
    }
  },

  /**
   * Get current Bitcoin blockchain information
   * @returns Current blockchain tip information
   */
  async getBlockchainInfo(): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/blocks/tip/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blockchain info:', error);
      throw error;
    }
  },

  /**
   * Get current Bitcoin mempool information
   * @returns Current mempool statistics
   */
  async getMempoolInfo(): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/mempool`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mempool info:', error);
      throw error;
    }
  },

  /**
   * Get fee estimates for different confirmation targets
   * @returns Fee estimates in satoshis per vbyte
   */
  async getFeeEstimates(): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/fee-estimates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee estimates:', error);
      throw error;
    }
  },

  /**
   * Get block information by height or hash
   * @param blockId Block height or hash
   * @returns Block details
   */
  async getBlock(blockId: string | number): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/block/${blockId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching block ${blockId}:`, error);
      throw error;
    }
  }
};

export default BlockstreamService;