"use strict";
/**
 * Temporal Entanglement
 *
 * Provides time-based security mechanisms for blockchain interactions.
 * The temporal entanglement concept binds actions to specific time windows,
 * adding an additional layer of security beyond spatial signatures.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTANGLEMENT_DURATIONS = exports.EntanglementType = void 0;
exports.createNetworkConnectionEntanglement = createNetworkConnectionEntanglement;
exports.createPaymentApprovalEntanglement = createPaymentApprovalEntanglement;
exports.createRewardClaimEntanglement = createRewardClaimEntanglement;
exports.createWalletAuthEntanglement = createWalletAuthEntanglement;
exports.createContractExecutionEntanglement = createContractExecutionEntanglement;
exports.getEntanglementTimeRemaining = getEntanglementTimeRemaining;
exports.formatRemainingTime = formatRemainingTime;
exports.storeEntanglement = storeEntanglement;
exports.retrieveEntanglement = retrieveEntanglement;
exports.ensureValidEntanglement = ensureValidEntanglement;
const quantumBridge_1 = require("./quantumBridge");
/**
 * Types of temporal entanglement
 */
var EntanglementType;
(function (EntanglementType) {
    EntanglementType["NETWORK_CONNECTION"] = "network-connection";
    EntanglementType["PAYMENT_APPROVAL"] = "payment-approval";
    EntanglementType["REWARD_CLAIM"] = "reward-claim";
    EntanglementType["WALLET_AUTH"] = "wallet-auth";
    EntanglementType["CONTRACT_EXECUTION"] = "contract-execution";
})(EntanglementType || (exports.EntanglementType = EntanglementType = {}));
/**
 * Temporal window durations in milliseconds
 */
exports.ENTANGLEMENT_DURATIONS = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 4 * 60 * 60 * 1000, // 4 hours
    DAY: 24 * 60 * 60 * 1000, // 24 hours
    WEEK: 7 * 24 * 60 * 60 * 1000 // 1 week
};
/**
 * Create a temporal entanglement for network connection
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
async function createNetworkConnectionEntanglement(address) {
    return await (0, quantumBridge_1.createTemporalEntanglement)(address, EntanglementType.NETWORK_CONNECTION, exports.ENTANGLEMENT_DURATIONS.DAY);
}
/**
 * Create a temporal entanglement for payment approval
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
async function createPaymentApprovalEntanglement(address) {
    return await (0, quantumBridge_1.createTemporalEntanglement)(address, EntanglementType.PAYMENT_APPROVAL, exports.ENTANGLEMENT_DURATIONS.MEDIUM);
}
/**
 * Create a temporal entanglement for reward claim
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
async function createRewardClaimEntanglement(address) {
    return await (0, quantumBridge_1.createTemporalEntanglement)(address, EntanglementType.REWARD_CLAIM, exports.ENTANGLEMENT_DURATIONS.SHORT);
}
/**
 * Create a temporal entanglement for wallet authentication
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
async function createWalletAuthEntanglement(address) {
    return await (0, quantumBridge_1.createTemporalEntanglement)(address, EntanglementType.WALLET_AUTH, exports.ENTANGLEMENT_DURATIONS.MEDIUM);
}
/**
 * Create a temporal entanglement for contract execution
 * @param address User's wallet address
 * @returns Promise resolving to entanglement record
 */
async function createContractExecutionEntanglement(address) {
    return await (0, quantumBridge_1.createTemporalEntanglement)(address, EntanglementType.CONTRACT_EXECUTION, exports.ENTANGLEMENT_DURATIONS.SHORT);
}
/**
 * Gets the remaining valid time for an entanglement record
 * @param record The entanglement record
 * @returns Time remaining in milliseconds, or 0 if expired
 */
function getEntanglementTimeRemaining(record) {
    const now = Date.now();
    return Math.max(0, record.expiresAt - now);
}
/**
 * Format remaining time as a human-readable string
 * @param milliseconds Time in milliseconds
 * @returns Formatted time string
 */
function formatRemainingTime(milliseconds) {
    if (milliseconds <= 0) {
        return 'Expired';
    }
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
/**
 * Store an entanglement record locally
 * @param record Entanglement record to store
 * @param key Optional storage key
 */
function storeEntanglement(record, key) {
    const storageKey = key || `entanglement-${record.purpose}-${record.address}`;
    localStorage.setItem(storageKey, JSON.stringify(record));
}
/**
 * Retrieve an entanglement record from local storage
 * @param purpose Entanglement purpose
 * @param address User address
 * @param key Optional storage key
 * @returns Entanglement record or null if not found
 */
function retrieveEntanglement(purpose, address, key) {
    const storageKey = key || `entanglement-${purpose}-${address}`;
    const storedRecord = localStorage.getItem(storageKey);
    if (!storedRecord) {
        return null;
    }
    try {
        const record = JSON.parse(storedRecord);
        return record;
    }
    catch (error) {
        console.error('Error parsing stored entanglement record:', error);
        return null;
    }
}
/**
 * Verify and get an entanglement record, either from storage or creating a new one
 * @param purpose Entanglement purpose
 * @param address User address
 * @param duration Validity duration
 * @returns Promise resolving to valid entanglement record
 */
async function ensureValidEntanglement(purpose, address, duration) {
    // Try to get from storage
    const storedRecord = retrieveEntanglement(purpose, address);
    // Check if valid and not expired
    if (storedRecord && await (0, quantumBridge_1.verifyTemporalEntanglement)(storedRecord)) {
        return storedRecord;
    }
    // Create new entanglement
    const newRecord = await (0, quantumBridge_1.createTemporalEntanglement)(address, purpose, duration);
    // Store for future use
    storeEntanglement(newRecord);
    return newRecord;
}
