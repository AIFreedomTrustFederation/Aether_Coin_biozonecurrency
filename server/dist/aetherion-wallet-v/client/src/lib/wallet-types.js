"use strict";
/**
 * Wallet Types
 *
 * This file contains wallet-related type definitions for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletConnectionStatus = void 0;
/**
 * Wallet connection status
 */
var WalletConnectionStatus;
(function (WalletConnectionStatus) {
    WalletConnectionStatus["DISCONNECTED"] = "disconnected";
    WalletConnectionStatus["CONNECTING"] = "connecting";
    WalletConnectionStatus["CONNECTED"] = "connected";
    WalletConnectionStatus["ERROR"] = "error";
})(WalletConnectionStatus || (exports.WalletConnectionStatus = WalletConnectionStatus = {}));
