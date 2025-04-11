/**
 * crypto-shim.ts
 * 
 * A lightweight browser-compatible implementation of common crypto functions
 * This provides some Node.js-like crypto utility functions using Web Crypto API
 */

/**
 * Generate random bytes using the browser's crypto API
 * @param size Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export function randomBytes(size: number): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(size));
}

/**
 * Calculate SHA-256 hash of data
 * @param data Data to hash (string or Uint8Array)
 * @returns Promise resolving to Uint8Array containing the hash
 */
export async function sha256(data: string | Uint8Array): Promise<Uint8Array> {
  let buffer: ArrayBuffer;
  
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(data);
  } else {
    buffer = data.buffer;
  }
  
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hashBuffer);
}

/**
 * Synchronous version of SHA-256 (for compatibility)
 * Note: This is a fallback that will warn and use the async version in a blocking way
 * Use the async version (above) whenever possible
 */
function sha256Sync(data: string | Uint8Array): Uint8Array {
  console.warn('Using synchronous SHA-256 is not recommended. Use the async version instead.');
  
  // Create a temporary array to hold the result
  const result = new Uint8Array(32); // SHA-256 is 32 bytes
  
  // We'll resolve the promise by setting its result to our array
  let isResolved = false;
  
  sha256(data).then(hash => {
    result.set(hash);
    isResolved = true;
  });
  
  // Busy wait until the promise resolves
  // THIS IS BAD PRACTICE and only included for compatibility!
  const start = Date.now();
  while (!isResolved) {
    if (Date.now() - start > 5000) {
      throw new Error('SHA-256 calculation timed out');
    }
  }
  
  return result;
}

/**
 * Convert a buffer to a hex string
 * @param buffer Buffer to convert
 * @returns Hex string
 */
function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  randomBytes,
  sha256
};