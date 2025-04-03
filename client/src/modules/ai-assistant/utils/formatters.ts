import { FormatAddressOptions, FormatDateOptions, FormatTokenAmountOptions } from '../types';

/**
 * Format a blockchain address to a user-friendly format
 * @param address The full address to format
 * @param startChars Number of starting characters to display (default: 6)
 * @param endChars Number of ending characters to display (default: 4)
 * @param separator Separator string between start and end (default: '...')
 * @returns Formatted address string
 */
export function formatAddress(
  address: string | null | undefined, 
  startChars: number = 6, 
  endChars: number = 4,
  separator: string = '...'
): string {
  if (!address) return 'N/A';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}${separator}${address.substring(address.length - endChars)}`;
}

/**
 * Format a date to a user-friendly format
 * @param date Date to format
 * @param includeTime Whether to include time component (default: false)
 * @param includeSeconds Whether to include seconds in time (default: false)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  includeTime: boolean = false,
  includeSeconds: boolean = false
): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'object' ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  // Format date part
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  let result = `${year}-${month}-${day}`;
  
  // Add time if requested
  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    result += ` ${hours}:${minutes}`;
    
    if (includeSeconds) {
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      result += `:${seconds}`;
    }
  }
  
  return result;
}

/**
 * Format a token amount with appropriate decimal places
 * @param amount Amount to format
 * @param tokenSymbol Symbol of the token (default: '')
 * @param minimumFractionDigits Minimum fraction digits (default: 2)
 * @param maximumFractionDigits Maximum fraction digits (default: 6)
 * @returns Formatted token amount string
 */
export function formatTokenAmount(
  amount: string | number | null | undefined,
  tokenSymbol: string = '',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 6
): string {
  if (amount === null || amount === undefined || amount === '') {
    return tokenSymbol ? `0 ${tokenSymbol}` : '0';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return tokenSymbol ? `0 ${tokenSymbol}` : '0';
  }
  
  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  });
  
  return tokenSymbol ? `${formattedAmount} ${tokenSymbol}` : formattedAmount;
}

/**
 * Format a relative time (e.g., "5 minutes ago")
 * @param date Date to format relative to now
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const timeDate = typeof date === 'object' ? date : new Date(date);
  
  if (isNaN(timeDate.getTime())) {
    return 'Invalid Date';
  }
  
  const diffMs = now.getTime() - timeDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return diffSecs <= 5 ? 'just now' : `${diffSecs}s ago`;
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return formatDate(date);
  }
}

/**
 * Format a gas fee with appropriate units
 * @param fee Fee amount in native units
 * @param showUnits Whether to show units (default: true)
 * @returns Formatted gas fee
 */
export function formatGasFee(
  fee: string | number | null | undefined,
  showUnits: boolean = true
): string {
  if (fee === null || fee === undefined || fee === '') {
    return showUnits ? '0 Gwei' : '0';
  }
  
  const numFee = typeof fee === 'string' ? parseFloat(fee) : fee;
  
  if (isNaN(numFee)) {
    return showUnits ? '0 Gwei' : '0';
  }
  
  // Format based on size
  if (numFee < 0.001) {
    const formatted = (numFee * 1000000).toFixed(2);
    return showUnits ? `${formatted} wei` : formatted;
  } else if (numFee < 1) {
    const formatted = (numFee * 1000).toFixed(2);
    return showUnits ? `${formatted} mGwei` : formatted;
  } else {
    const formatted = numFee.toFixed(2);
    return showUnits ? `${formatted} Gwei` : formatted;
  }
}

/**
 * Format percentage values
 * @param value Percentage value (0-100 or 0-1)
 * @param normalize Whether to normalize value to 0-100 range
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | string | null | undefined,
  normalize: boolean = false
): string {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }
  
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }
  
  // Normalize if needed (convert decimal to percentage)
  if (normalize && numValue <= 1) {
    numValue = numValue * 100;
  }
  
  // Ensure value is in range 0-100
  numValue = Math.max(0, Math.min(100, numValue));
  
  // Format based on value
  if (numValue === 0) {
    return '0%';
  } else if (numValue < 0.01) {
    return '<0.01%';
  } else if (numValue > 99.99 && numValue < 100) {
    return '>99.99%';
  } else {
    return `${numValue.toFixed(2)}%`;
  }
}