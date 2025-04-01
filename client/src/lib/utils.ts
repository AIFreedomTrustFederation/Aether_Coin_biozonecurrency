import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numValue);
}

// Format crypto values with appropriate decimal places
export function formatCrypto(value: string | number, symbol: string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Different precision for different tokens
  let precision = 2;
  if (symbol === 'BTC') precision = 8;
  else if (symbol === 'ETH') precision = 6;
  
  return `${numValue.toFixed(precision)} ${symbol}`;
}

// Shorten wallet address for display
export function shortenAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address) return '';
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

// Generate a random CID for demo purposes
export function generateCID(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'bafy';
  
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Time ago formatter
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

// Get wallet icon for display
export function getWalletIcon(chain: string): string {
  switch (chain.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      return 'bitcoin';
    case 'ethereum':
    case 'eth':
      return 'ethereum';
    case 'solana':
    case 'sol':
      return 'solana';
    case 'polygon':
    case 'matic':
      return 'polygon';
    case 'cardano':
    case 'ada':
      return 'cardano';
    case 'binance':
    case 'bnb':
    case 'bsc':
      return 'binance';
    default:
      return 'wallet';
  }
}
