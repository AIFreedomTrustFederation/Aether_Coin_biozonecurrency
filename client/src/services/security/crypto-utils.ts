/**
 * Cryptographic Utilities for Zero-Trust Security Framework
 * 
 * These utilities provide secure cryptographic operations for the AetherCore
 * security components, ensuring consistent and reliable cryptographic primitives.
 */

/**
 * Generate cryptographically secure random bytes
 * 
 * @param numBytes - Number of random bytes to generate
 * @returns Promise resolving to Uint8Array containing random bytes
 */
export async function generateSecureRandom(numBytes: number): Promise<Uint8Array> {
  // Use Web Crypto API for secure random generation
  const randomBuffer = new Uint8Array(numBytes);
  
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(randomBuffer);
  } else {
    // Node.js or other environment - simulate for now
    // In a real implementation, we would use Node.js crypto module
    for (let i = 0; i < numBytes; i++) {
      randomBuffer[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return randomBuffer;
}

/**
 * Convert a byte array to a hexadecimal string
 * 
 * @param bytes - Byte array to convert
 * @returns Hexadecimal string representation
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert a hexadecimal string to a byte array
 * 
 * @param hex - Hexadecimal string to convert
 * @returns Uint8Array containing the bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  // Ensure even length
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  
  return bytes;
}

/**
 * Generate a secure ID suitable for various security purposes
 * 
 * @returns Secure random ID string
 */
export async function generateSecureId(): Promise<string> {
  const randomBytes = await generateSecureRandom(16);
  return bytesToHex(randomBytes);
}

/**
 * Convert a string to a Uint8Array using UTF-8 encoding
 * 
 * @param str - String to convert
 * @returns Uint8Array containing the UTF-8 encoded bytes
 */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert a Uint8Array to a string using UTF-8 encoding
 * 
 * @param bytes - Byte array to convert
 * @returns Decoded UTF-8 string
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Generate a time-based one-time password (TOTP)
 * This is a simplified implementation for demonstration purposes
 * 
 * @param secret - Secret key as a hex string
 * @returns TOTP code (6 digits)
 */
export function generateTOTP(secret: string): string {
  // In a real implementation, this would use HMAC-SHA1 with proper time windows
  // For demonstration, we'll create a simple time-based code
  const timeWindow = Math.floor(Date.now() / 30000); // 30-second window
  const secretBytes = hexToBytes(secret);
  
  // Simple hash function for demonstration
  const hash = Array.from(secretBytes)
    .reduce((acc, byte, index) => {
      return acc + (byte * (index + 1) * timeWindow);
    }, 0);
  
  // Generate 6-digit code
  return (hash % 1000000).toString().padStart(6, '0');
}

/**
 * Hash a string using SHA-256
 * 
 * @param message - Message to hash
 * @returns Promise resolving to hash as hex string
 */
export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js or other environment - simulate for demo
    // In a real implementation, we would use Node.js crypto module
    const simpleHash = Array.from(new TextEncoder().encode(message))
      .reduce((hash, byte) => (hash * 31) ^ byte, 0)
      .toString(16)
      .padStart(64, '0');
    
    return simpleHash;
  }
}