/**
 * Formatters utility functions for consistent display of data
 * across components in the AI Assistant module.
 */

/**
 * Format a blockchain address with ellipsis
 * @param address The address to format
 * @param prefixLength Number of characters to show at the start
 * @param suffixLength Number of characters to show at the end
 * @returns The formatted address
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);
  
  return `${prefix}...${suffix}`;
}

/**
 * Format a date to a human-readable string
 * @param date The date to format
 * @param includeTime Whether to include the time
 * @param isRelative Whether to use relative time (e.g., "2 days ago")
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | string,
  includeTime: boolean = true,
  isRelative: boolean = false
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isRelative) {
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
  
  return formatter.format(dateObj);
}

/**
 * Format a duration in milliseconds to human-readable format
 * @param durationMs Duration in milliseconds
 * @param showSeconds Whether to show seconds
 * @returns The formatted duration string
 */
export function formatDuration(
  durationMs: number,
  showSeconds: boolean = true
): string {
  if (!durationMs) return '0s';
  
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (showSeconds && seconds > 0) parts.push(`${seconds}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Format a token amount with appropriate decimal places
 * @param amount The token amount as a string
 * @param decimals Number of decimal places to show
 * @param symbol The token symbol
 * @returns The formatted token amount with symbol
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 6,
  symbol: string = ''
): string {
  if (amount === undefined || amount === null) return '';
  
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(amountNum)) return '';
  
  // Format the number with the specified decimal places
  const formattedAmount = amountNum.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
  
  // Append the symbol if provided
  return symbol ? `${formattedAmount} ${symbol}` : formattedAmount;
}

/**
 * Format a percentage value
 * @param value The percentage value (0-100)
 * @param decimals Number of decimal places
 * @param includeSymbol Whether to include the % symbol
 * @returns The formatted percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  includeSymbol: boolean = true
): string {
  if (isNaN(value)) return '';
  
  const formatted = value.toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format a currency amount
 * @param amount The amount to format
 * @param currency The currency code (e.g., 'USD')
 * @param decimals Number of decimal places
 * @returns The formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  if (isNaN(amount)) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}