/**
 * Utility functions for formatting data in the AI Assistant module
 */

/**
 * Formats a blockchain address for display, showing the first and last few characters
 * @param address The full blockchain address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Formatted address string with ellipsis
 */
export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Formats a date into a human-readable string
 * @param date Date to format
 * @param includeTime Whether to include the time in the formatted string
 * @returns Formatted date string
 */
export const formatDate = (date: Date, includeTime = true): string => {
  if (!date) return '';
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  const options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  };
  
  if (isToday) {
    return includeTime ? `Today, ${date.toLocaleTimeString(undefined, options)}` : 'Today';
  } else if (isYesterday) {
    return includeTime ? `Yesterday, ${date.toLocaleTimeString(undefined, options)}` : 'Yesterday';
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    };
    
    if (includeTime) {
      return `${date.toLocaleDateString(undefined, dateOptions)}, ${date.toLocaleTimeString(undefined, options)}`;
    } else {
      return date.toLocaleDateString(undefined, dateOptions);
    }
  }
};

/**
 * Formats a token amount with appropriate decimal places and symbol
 * @param amount The token amount as a string
 * @param decimals Number of decimal places to show
 * @param symbol The token symbol
 * @returns Formatted token amount with symbol
 */
export const formatTokenAmount = (amount: string, decimals = 4, symbol = ''): string => {
  if (!amount) return symbol ? `0 ${symbol}` : '0';
  
  // Parse the string amount to a number
  let num: number;
  try {
    num = parseFloat(amount);
    
    // Handle extremely small numbers that might be in scientific notation
    if (num < 0.000001 && num > 0) {
      return symbol ? `<0.000001 ${symbol}` : '<0.000001';
    }
    
    const formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return symbol ? `${formatted} ${symbol}` : formatted;
  } catch (e) {
    return amount;
  }
};

/**
 * Formats a percentage value
 * @param value The percentage value
 * @param decimals Number of decimal places to show
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncates a string to a maximum length and adds ellipsis if needed
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength = 100): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes Size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};