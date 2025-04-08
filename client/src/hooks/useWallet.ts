import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Wallet {
  id: number;
  name: string;
  address: string;
  balance: string;
  currency: string;
  network: string;
  userId: number;
  lastSynced?: Date;
  status: string;
  type: string;
  isDefault: boolean;
}

export function useWallet() {
  const queryClient = useQueryClient();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  // Get user wallets
  const {
    data: wallets = [],
    isLoading: isLoadingWallets,
    error: walletsError,
  } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: () => apiRequest({ method: 'GET' })
  });

  // Create a new wallet
  const createWalletMutation = useMutation({
    mutationFn: (data: { name: string; currency: string; network: string; type: string }) => 
      apiRequest({
        url: '/api/wallets',
        method: 'POST',
        data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    }
  });

  // Set default wallet
  const setDefaultWalletMutation = useMutation({
    mutationFn: (walletId: number) => 
      apiRequest({
        url: `/api/wallets/${walletId}/default`,
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    }
  });

  // Effect to select default wallet when wallets are loaded
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWallet) {
      // Find default wallet or use the first one
      const defaultWallet = wallets.find(wallet => wallet.isDefault) || wallets[0];
      setSelectedWallet(defaultWallet);
    }
  }, [wallets, selectedWallet]);

  return {
    wallets,
    isLoadingWallets,
    walletsError,
    selectedWallet,
    setSelectedWallet,
    createWallet: createWalletMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    setDefaultWallet: setDefaultWalletMutation.mutate,
    isSettingDefaultWallet: setDefaultWalletMutation.isPending
  };
}