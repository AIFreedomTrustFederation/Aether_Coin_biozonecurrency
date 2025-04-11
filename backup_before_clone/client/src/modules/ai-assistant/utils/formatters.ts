/**
 * Utility functions for formatting and displaying data
 */

/**
 * Format a timestamp in a human-readable way
 * 
 * @param date The date or timestamp to format
 * @returns A human-readable string representation
 */
export function formatTimestamp(date: Date | string): string {
  const timestamp = typeof date === 'string' ? new Date(date) : date;
  
  // Use relative time for recent dates
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  // Use formatted date for older timestamps
  return timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== timestamp.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format a cryptocurrency amount
 * 
 * @param amount The amount as a string or number
 * @param symbol Optional cryptocurrency symbol
 * @param showSymbol Whether to include the symbol in the output
 * @returns Formatted cryptocurrency amount
 */
export function formatCryptoAmount(amount: string | number, symbol?: string, showSymbol = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  // Format with appropriate precision based on amount
  let formatted: string;
  if (numAmount === 0) {
    formatted = '0';
  } else if (numAmount < 0.001) {
    formatted = numAmount.toExponential(4);
  } else if (numAmount < 1) {
    formatted = numAmount.toFixed(4);
  } else if (numAmount < 1000) {
    formatted = numAmount.toFixed(2);
  } else {
    formatted = numAmount.toLocaleString(undefined, { 
      maximumFractionDigits: 2 
    });
  }
  
  // Add symbol if available and requested
  return showSymbol && symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format a fiat currency amount
 * 
 * @param amount The amount as a string or number
 * @param currency The currency code (USD, EUR, etc.)
 * @returns Formatted currency amount
 */
export function formatFiatAmount(amount: string | number, currency: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '$0.00';
  }
  
  try {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(numAmount);
  } catch (error) {
    // Fallback if Intl is not supported
    return `$${numAmount.toFixed(2)}`;
  }
}

/**
 * Truncate a string to a maximum length with ellipsis
 * 
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) {
    return str;
  }
  
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Format a blockchain address for display
 * Shortens the address by showing first and last few characters
 * 
 * @param address The blockchain address to format
 * @param prefixLength Number of prefix characters to show
 * @param suffixLength Number of suffix characters to show
 * @returns Formatted address with ellipsis
 */
export function formatAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
  if (!address || address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  
  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);
  
  return `${prefix}...${suffix}`;
}

/**
 * Format a time duration in hours to a human-readable format
 * 
 * @param hours Number of hours to format
 * @returns Human-readable time remaining string
 */
export function formatTimeRemaining(hours: number): string {
  if (hours <= 0) {
    return 'Available now';
  }
  
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} remaining`;
  }
  
  if (hours < 24) {
    const roundedHours = Math.ceil(hours);
    return `${roundedHours} hour${roundedHours === 1 ? '' : 's'} remaining`;
  }
  
  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} remaining`;
}