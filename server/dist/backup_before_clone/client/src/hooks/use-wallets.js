"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWallets = useWallets;
exports.useWallet = useWallet;
const react_query_1 = require("@tanstack/react-query");
/**
 * Hook to fetch all wallets for a user
 */
function useWallets(userId = 1) {
    const { data, isLoading, error, refetch } = (0, react_query_1.useQuery)({
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
        wallets: data || [],
        isLoading,
        error,
        refetch
    };
}
/**
 * Hook to fetch a single wallet by ID
 */
function useWallet(walletId) {
    const { data, isLoading, error } = (0, react_query_1.useQuery)({
        queryKey: ['/api/wallets', walletId],
        queryFn: async () => {
            if (!walletId)
                return null;
            const response = await fetch(`/api/wallets/${walletId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch wallet');
            }
            return response.json();
        },
        enabled: !!walletId,
    });
    return {
        wallet: data,
        isLoading,
        error
    };
}
