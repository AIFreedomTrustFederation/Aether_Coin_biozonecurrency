"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletHealthIssueResolved = exports.createWalletHealthIssue = exports.createWalletHealthScore = exports.fetchWalletHealthIssues = exports.fetchWalletHealthScoreByWalletId = exports.fetchWalletHealthScores = exports.processPayment = exports.saveStripePaymentMethod = exports.createPaymentIntent = exports.getPaymentStatus = exports.createPayment = exports.fetchPayments = exports.deletePaymentMethod = exports.updatePaymentMethodDefault = exports.createPaymentMethod = exports.fetchPaymentMethods = exports.updateCidEntryStatus = exports.createCidEntry = exports.fetchCidEntries = exports.createAiMonitoringLog = exports.fetchAiMonitoringLogs = exports.updateContractStatus = exports.createSmartContract = exports.fetchSmartContracts = exports.createTransaction = exports.fetchTransactionsByWallet = exports.fetchRecentTransactions = exports.fetchWallets = void 0;
const queryClient_1 = require("./queryClient");
// Wallet API
const fetchWallets = async () => {
    const response = await fetch('/api/wallets', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch wallets');
    }
    const wallets = await response.json();
    // Transform to include additional display data
    return wallets.map((wallet) => {
        let dollarValue = 0;
        let percentChange = 0;
        // Sample price mapping
        if (wallet.chain === 'bitcoin') {
            dollarValue = parseFloat(wallet.balance) * 29865.43;
            percentChange = -2.14;
        }
        else if (wallet.chain === 'ethereum') {
            dollarValue = parseFloat(wallet.balance) * 2012.23;
            percentChange = 8.56;
        }
        else if (wallet.chain === 'solana') {
            dollarValue = parseFloat(wallet.balance) * 37.24;
            percentChange = 12.34;
        }
        else {
            // Default values for other chains
            dollarValue = parseFloat(wallet.balance) * 100;
            percentChange = 1.23;
        }
        return {
            ...wallet,
            dollarValue,
            percentChange,
            symbol: wallet.chain === 'bitcoin' ? 'BTC' : wallet.chain === 'ethereum' ? 'ETH' : wallet.chain === 'solana' ? 'SOL' : wallet.chain.toUpperCase(),
        };
    });
};
exports.fetchWallets = fetchWallets;
// Transaction API
const fetchRecentTransactions = async (limit = 5) => {
    const response = await fetch(`/api/transactions/recent?limit=${limit}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch recent transactions');
    }
    const transactions = await response.json();
    // Convert timestamp strings to Date objects
    return transactions.map((tx) => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
    }));
};
exports.fetchRecentTransactions = fetchRecentTransactions;
const fetchTransactionsByWallet = async (walletId) => {
    const response = await fetch(`/api/wallets/${walletId}/transactions`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch transactions for wallet ${walletId}`);
    }
    const transactions = await response.json();
    // Convert timestamp strings to Date objects
    return transactions.map((tx) => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
    }));
};
exports.fetchTransactionsByWallet = fetchTransactionsByWallet;
const createTransaction = async (transaction) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/transactions', transaction);
    const newTransaction = await response.json();
    return {
        ...newTransaction,
        timestamp: new Date(newTransaction.timestamp),
    };
};
exports.createTransaction = createTransaction;
// Smart Contract API
const fetchSmartContracts = async () => {
    const response = await fetch('/api/contracts', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch smart contracts');
    }
    const contracts = await response.json();
    // Convert date strings to Date objects
    return contracts.map((contract) => ({
        ...contract,
        lastInteraction: contract.lastInteraction ? new Date(contract.lastInteraction) : undefined,
        createdAt: new Date(contract.createdAt),
    }));
};
exports.fetchSmartContracts = fetchSmartContracts;
const createSmartContract = async (contract) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/contracts', contract);
    const newContract = await response.json();
    return {
        ...newContract,
        lastInteraction: newContract.lastInteraction ? new Date(newContract.lastInteraction) : undefined,
        createdAt: new Date(newContract.createdAt),
    };
};
exports.createSmartContract = createSmartContract;
const updateContractStatus = async (id, status) => {
    const response = await (0, queryClient_1.apiRequest)('PATCH', `/api/contracts/${id}/status`, { status });
    const updatedContract = await response.json();
    return {
        ...updatedContract,
        lastInteraction: updatedContract.lastInteraction ? new Date(updatedContract.lastInteraction) : undefined,
        createdAt: new Date(updatedContract.createdAt),
    };
};
exports.updateContractStatus = updateContractStatus;
// AI Monitoring API
const fetchAiMonitoringLogs = async (limit = 10) => {
    const response = await fetch(`/api/ai/logs?limit=${limit}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch AI monitoring logs');
    }
    const logs = await response.json();
    // Convert timestamp strings to Date objects
    return logs.map((log) => ({
        ...log,
        timestamp: new Date(log.timestamp),
    }));
};
exports.fetchAiMonitoringLogs = fetchAiMonitoringLogs;
const createAiMonitoringLog = async (log) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/ai/logs', log);
    const newLog = await response.json();
    return {
        ...newLog,
        timestamp: new Date(newLog.timestamp),
    };
};
exports.createAiMonitoringLog = createAiMonitoringLog;
// CID Management API
const fetchCidEntries = async () => {
    const response = await fetch('/api/cids', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch CID entries');
    }
    const entries = await response.json();
    // Convert date strings to Date objects
    return entries.map((entry) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
    }));
};
exports.fetchCidEntries = fetchCidEntries;
const createCidEntry = async (entry) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/cids', entry);
    const newEntry = await response.json();
    return {
        ...newEntry,
        createdAt: new Date(newEntry.createdAt),
    };
};
exports.createCidEntry = createCidEntry;
const updateCidEntryStatus = async (id, status) => {
    const response = await (0, queryClient_1.apiRequest)('PATCH', `/api/cids/${id}/status`, { status });
    const updatedEntry = await response.json();
    return {
        ...updatedEntry,
        createdAt: new Date(updatedEntry.createdAt),
    };
};
exports.updateCidEntryStatus = updateCidEntryStatus;
// Payment Methods API
const fetchPaymentMethods = async () => {
    const response = await fetch('/api/payment-methods', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
    }
    const paymentMethods = await response.json();
    // Convert date strings to Date objects
    return paymentMethods.map((method) => ({
        ...method,
        createdAt: new Date(method.createdAt),
    }));
};
exports.fetchPaymentMethods = fetchPaymentMethods;
const createPaymentMethod = async (paymentMethod) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/payment-methods', paymentMethod);
    const newPaymentMethod = await response.json();
    return {
        ...newPaymentMethod,
        createdAt: new Date(newPaymentMethod.createdAt),
    };
};
exports.createPaymentMethod = createPaymentMethod;
const updatePaymentMethodDefault = async (id, isDefault) => {
    const response = await (0, queryClient_1.apiRequest)('PATCH', `/api/payment-methods/${id}/default`, { isDefault });
    const updatedPaymentMethod = await response.json();
    return {
        ...updatedPaymentMethod,
        createdAt: new Date(updatedPaymentMethod.createdAt),
    };
};
exports.updatePaymentMethodDefault = updatePaymentMethodDefault;
const deletePaymentMethod = async (id) => {
    await (0, queryClient_1.apiRequest)('DELETE', `/api/payment-methods/${id}`);
};
exports.deletePaymentMethod = deletePaymentMethod;
// Payments API
const fetchPayments = async () => {
    const response = await fetch('/api/payments', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch payments');
    }
    const payments = await response.json();
    // Convert date strings to Date objects
    return payments.map((payment) => ({
        ...payment,
        createdAt: new Date(payment.createdAt),
        processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined,
    }));
};
exports.fetchPayments = fetchPayments;
const createPayment = async (payment) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/payments', payment);
    const newPayment = await response.json();
    return {
        ...newPayment,
        createdAt: new Date(newPayment.createdAt),
        processedAt: newPayment.processedAt ? new Date(newPayment.processedAt) : undefined,
    };
};
exports.createPayment = createPayment;
const getPaymentStatus = async (id) => {
    const response = await fetch(`/api/payments/${id}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch payment status for payment ${id}`);
    }
    const payment = await response.json();
    return {
        ...payment,
        createdAt: new Date(payment.createdAt),
        processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined,
    };
};
exports.getPaymentStatus = getPaymentStatus;
// Stripe specific APIs
const createPaymentIntent = async (amount, currency, metadata) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/payments/stripe/create-intent', {
        amount,
        currency,
        metadata
    });
    const data = await response.json();
    return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
    };
};
exports.createPaymentIntent = createPaymentIntent;
const saveStripePaymentMethod = async (stripePaymentMethodId, isDefault = false) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/payment-methods', {
        stripePaymentMethodId,
        isDefault
    });
    const newPaymentMethod = await response.json();
    return {
        ...newPaymentMethod,
        createdAt: new Date(newPaymentMethod.createdAt)
    };
};
exports.saveStripePaymentMethod = saveStripePaymentMethod;
const processPayment = async (paymentMethodId, amount, currency, description, walletId) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/payments/process', {
        paymentMethodId,
        amount,
        currency,
        description,
        walletId
    });
    const payment = await response.json();
    return {
        ...payment,
        createdAt: new Date(payment.createdAt),
        processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined
    };
};
exports.processPayment = processPayment;
// Wallet Health API
const fetchWalletHealthScores = async () => {
    const response = await fetch('/api/wallet-health/scores', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch wallet health scores');
    }
    const scores = await response.json();
    // Convert date strings to Date objects
    return scores.map((score) => ({
        ...score,
        createdAt: score.createdAt ? new Date(score.createdAt) : null,
        backgroundScanTimestamp: score.backgroundScanTimestamp ? new Date(score.backgroundScanTimestamp) : null,
    }));
};
exports.fetchWalletHealthScores = fetchWalletHealthScores;
const fetchWalletHealthScoreByWalletId = async (walletId) => {
    const response = await fetch(`/api/wallet-health/scores/wallet/${walletId}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch health score for wallet ${walletId}`);
    }
    const score = await response.json();
    return {
        ...score,
        createdAt: score.createdAt ? new Date(score.createdAt) : null,
        backgroundScanTimestamp: score.backgroundScanTimestamp ? new Date(score.backgroundScanTimestamp) : null,
    };
};
exports.fetchWalletHealthScoreByWalletId = fetchWalletHealthScoreByWalletId;
const fetchWalletHealthIssues = async (scoreId) => {
    const response = await fetch(`/api/wallet-health/issues/${scoreId}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch health issues for score ${scoreId}`);
    }
    const issues = await response.json();
    // Convert date strings to Date objects
    return issues.map((issue) => ({
        ...issue,
        createdAt: issue.createdAt ? new Date(issue.createdAt) : null,
        resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : null,
    }));
};
exports.fetchWalletHealthIssues = fetchWalletHealthIssues;
const createWalletHealthScore = async (score) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/wallet-health/scores', score);
    const newScore = await response.json();
    return {
        ...newScore,
        createdAt: newScore.createdAt ? new Date(newScore.createdAt) : null,
        backgroundScanTimestamp: newScore.backgroundScanTimestamp ? new Date(newScore.backgroundScanTimestamp) : null,
    };
};
exports.createWalletHealthScore = createWalletHealthScore;
const createWalletHealthIssue = async (issue) => {
    const response = await (0, queryClient_1.apiRequest)('POST', '/api/wallet-health/issues', issue);
    const newIssue = await response.json();
    return {
        ...newIssue,
        createdAt: newIssue.createdAt ? new Date(newIssue.createdAt) : null,
        resolvedAt: newIssue.resolvedAt ? new Date(newIssue.resolvedAt) : null,
    };
};
exports.createWalletHealthIssue = createWalletHealthIssue;
const updateWalletHealthIssueResolved = async (id, resolved) => {
    const response = await (0, queryClient_1.apiRequest)('PATCH', `/api/wallet-health/issues/${id}/resolved`, { resolved });
    const updatedIssue = await response.json();
    return {
        ...updatedIssue,
        createdAt: updatedIssue.createdAt ? new Date(updatedIssue.createdAt) : null,
        resolvedAt: updatedIssue.resolvedAt ? new Date(updatedIssue.resolvedAt) : null,
    };
};
exports.updateWalletHealthIssueResolved = updateWalletHealthIssueResolved;
