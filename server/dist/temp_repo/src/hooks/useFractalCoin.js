"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSendTransaction = exports.useTransactions = exports.useWalletInfo = exports.useCoinData = void 0;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const fractalCoinApi_1 = __importDefault(require("../services/api/fractalCoinApi"));
// Create a singleton instance of the FractalCoin API
const fractalCoinApi = new fractalCoinApi_1.default('https://api.fractalcoin.io');
// Hook to fetch and manage coin data
const useCoinData = () => {
    return (0, react_query_1.useQuery)({
        queryKey: ['coinData'],
        queryFn: () => fractalCoinApi.getCoinData(),
        refetchInterval: 60000, // Refetch every minute
    });
};
exports.useCoinData = useCoinData;
// Hook to fetch and manage wallet information
const useWalletInfo = (walletAddress) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['walletInfo', walletAddress],
        queryFn: () => fractalCoinApi.getWalletInfo(walletAddress),
        enabled: !!walletAddress,
    });
};
exports.useWalletInfo = useWalletInfo;
// Hook to fetch and manage transactions
const useTransactions = (walletAddress, limit = 10) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['transactions', walletAddress, limit],
        queryFn: () => fractalCoinApi.getTransactions(walletAddress, limit),
        enabled: !!walletAddress,
    });
};
exports.useTransactions = useTransactions;
// Hook to handle sending a transaction
const useSendTransaction = () => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [result, setResult] = (0, react_1.useState)(null);
    const sendTransaction = async (fromAddress, toAddress, amount) => {
        setIsLoading(true);
        setError(null);
        try {
            const transaction = await fractalCoinApi.sendTransaction(fromAddress, toAddress, amount);
            setResult(transaction);
            return transaction;
        }
        catch (err) {
            setError(err);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    return { sendTransaction, isLoading, error, result };
};
exports.useSendTransaction = useSendTransaction;
