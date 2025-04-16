/**
 * Bot Simulation Utilities
 * 
 * Helper functions for the Aetherion bot simulation system
 */

/**
 * Get a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random element from an array
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random wallet address
 */
export function generateRandomWalletAddress(): string {
  return `atc${(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 40)}`;
}

/**
 * Get a random date between start and end
 */
export function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Format number with commas as thousands separator
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'ATC'): string {
  return `${formatNumber(amount)} ${currency}`;
}

/**
 * Get a random boolean with a specified probability
 */
export function getRandomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a random transaction hash
 */
export function generateTransactionHash(): string {
  const characters = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hash;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}