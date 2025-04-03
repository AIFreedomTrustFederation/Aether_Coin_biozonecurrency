/**
 * String and number formatting utilities for consistent display
 */

/**
 * Format a blockchain address for display (truncate middle)
 * 
 * @param address The full address to format
 * @param startChars Number of starting characters to show
 * @param endChars Number of ending characters to show
 * @returns Formatted address string
 */
export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return 'Unknown';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format token amount with appropriate decimal places and symbol
 * 
 * @param amount The token amount as string
 * @param decimals Number of decimal places to display
 * @param symbol Optional token symbol to append
 * @returns Formatted token amount string
 */
export const formatTokenAmount = (amount: string, decimals = 4, symbol?: string): string => {
  if (!amount) return '0';
  
  let formattedAmount: string;
  
  try {
    // Parse amount as number and format with fixed decimals
    const numAmount = parseFloat(amount);
    formattedAmount = numAmount.toFixed(decimals);
    
    // Remove trailing zeros
    formattedAmount = formattedAmount.replace(/\.?0+$/, '');
    
    // Add commas for thousands
    formattedAmount = formatLargeNumber(formattedAmount);
    
    // Add symbol if provided
    if (symbol) {
      formattedAmount = `${formattedAmount} ${symbol}`;
    }
  } catch (error) {
    console.error('Error formatting token amount:', error);
    formattedAmount = amount;
  }
  
  return formattedAmount;
};

/**
 * Format a date for display
 * 
 * @param date Date object or string
 * @param includeTime Whether to include time
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, includeTime = true): string => {
  if (!date) return 'Unknown';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    if (includeTime) {
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Format a duration in milliseconds to a human-readable string
 * 
 * @param ms Duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format a large number with commas
 * 
 * @param value Number or string to format
 * @returns Formatted number string with commas
 */
export const formatLargeNumber = (value: number | string): string => {
  if (value === null || value === undefined) return '0';
  
  // Convert to string if it's a number
  const strValue = typeof value === 'number' ? value.toString() : value;
  
  // Split into integer and decimal parts
  const parts = strValue.split('.');
  
  // Add commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Join back with decimal part if exists
  return parts.length > 1 ? parts.join('.') : parts[0];
};

/**
 * Format currency value with symbol
 * 
 * @param value Currency value
 * @param currency Currency code (USD, EUR, etc.)
 * @param decimals Number of decimal places
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string, currency = 'USD', decimals = 2): string => {
  if (value === null || value === undefined) return '$0.00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${numValue.toFixed(decimals)}`;
  }
};

/**
 * Format percentage value
 * 
 * @param value Percentage value (0-100 or 0-1)
 * @param decimals Number of decimal places
 * @param includeSymbol Whether to include % symbol
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | string, decimals = 2, includeSymbol = true): string => {
  if (value === null || value === undefined) return '0%';
  
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // If value is a decimal (0-1), convert to percentage (0-100)
  if (numValue > 0 && numValue < 1) {
    numValue *= 100;
  }
  
  try {
    const formatted = numValue.toFixed(decimals);
    return includeSymbol ? `${formatted}%` : formatted;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return includeSymbol ? `${numValue}%` : `${numValue}`;
  }
};

/**
 * Convert wei to gwei
 * 
 * @param wei Wei value as string or number
 * @returns Gwei value
 */
export const convertWeiToGwei = (wei: string | number): number => {
  const weiValue = typeof wei === 'string' ? parseFloat(wei) : wei;
  return weiValue / 1e9; // 1 Gwei = 10^9 Wei
};