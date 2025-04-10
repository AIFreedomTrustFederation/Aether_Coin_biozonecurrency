import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Define wallet type based on the schema
export interface Wallet {
  id: number;
  userId: number;
  address: string;
  type: string;
  name: string;
  balance: string;
  tokenSymbol: string;
  createdAt: Date | null;
  isActive: boolean;
}

/**
 * Hook to fetch all wallets for a user
 */
export function useWallets(userId: number = 1) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/wallets', userId],
    queryFn: async () => {
      const response = await fetch(`/api/wallets?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  return {
    wallets: data as Wallet[] || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook to fetch a single wallet by ID
 */
export function useWallet(walletId: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/wallets', walletId],
    queryFn: async () => {
      if (!walletId) return null;
      const response = await fetch(`/api/wallets/${walletId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet');
      }
      return response.json();
    },
    enabled: !!walletId,
  });

  return {
    wallet: data as Wallet | null,
    isLoading,
    error
  };
}