
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FractalCoinApi, { CoinData, Transaction, WalletInfo } from '../services/api/fractalCoinApi';

// Create a singleton instance of the FractalCoin API
const fractalCoinApi = new FractalCoinApi('https://api.fractalcoin.io');

// Hook to fetch and manage coin data
export const useCoinData = () => {
  return useQuery({
    queryKey: ['coinData'],
    queryFn: () => fractalCoinApi.getCoinData(),
    refetchInterval: 60000, // Refetch every minute
  });
};

// Hook to fetch and manage wallet information
export const useWalletInfo = (walletAddress: string) => {
  return useQuery({
    queryKey: ['walletInfo', walletAddress],
    queryFn: () => fractalCoinApi.getWalletInfo(walletAddress),
    enabled: !!walletAddress,
  });
};

// Hook to fetch and manage transactions
export const useTransactions = (walletAddress: string, limit = 10) => {
  return useQuery({
    queryKey: ['transactions', walletAddress, limit],
    queryFn: () => fractalCoinApi.getTransactions(walletAddress, limit),
    enabled: !!walletAddress,
  });
};

// Hook to handle sending a transaction
export const useSendTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<Transaction | null>(null);

  const sendTransaction = async (fromAddress: string, toAddress: string, amount: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await fractalCoinApi.sendTransaction(fromAddress, toAddress, amount);
      setResult(transaction);
      return transaction;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendTransaction, isLoading, error, result };
};
