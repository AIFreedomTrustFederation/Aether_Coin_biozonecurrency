/**
 * Wallet Types
 * 
 * This file contains wallet-related type definitions for the application
 */

/**
 * Wallet connection status
 */
export enum WalletConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}