/**
 * Secure String Comparison Utilities
 * 
 * This module provides functions for performing secure string comparisons
 * that are resistant to timing attacks.
 * 
 * TIMING ATTACKS EXPLAINED:
 * 
 * A timing attack is a side-channel attack where an attacker measures the time
 * it takes for operations to complete, and uses that information to gain insights
 * about secret values.
 * 
 * In standard string comparison (a === b), the comparison stops as soon as a difference
 * is found. For example, comparing "apple" with "apricot" would stop at the 3rd character.
 * This creates a measurable timing difference that attackers can exploit.
 * 
 * For security-critical comparisons like API keys, tokens, or passwords, this timing
 * difference can leak information. An attacker could:
 * 
 * 1. Try different first characters and measure which one takes longer
 * 2. Once the first character is found, move to the second, and so on
 * 3. Eventually reconstruct the entire secret without brute-forcing
 * 
 * Constant-time comparison ensures the same operations are performed regardless
 * of where differences occur, making timing attacks ineffective.
 */

import * as crypto from 'crypto';

/**
 * Performs a constant-time string comparison to prevent timing attacks
 * 
 * This function:
 * 1. Converts strings to buffers
 * 2. Ensures equal-length comparison by padding if necessary
 * 3. Uses crypto.timingSafeEqual for constant-time comparison
 * 4. Always performs the full comparison regardless of differences
 * 
 * @param a First string to compare
 * @param b Second string to compare
 * @returns Boolean indicating if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    // If either input is null or undefined, return false
    if (a === null || a === undefined || b === null || b === undefined) {
      return false;
    }
    
    // Record if lengths match (this will be part of our final equality check)
    // We still perform the full comparison even if lengths don't match
    const lengthsMatch = a.length === b.length;
    
    // Convert strings to buffers for constant-time comparison
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');
    
    // If buffers are different lengths, pad the shorter one
    // This ensures we can use timingSafeEqual which requires equal-length buffers
    if (bufferA.length !== bufferB.length) {
      const maxLength = Math.max(bufferA.length, bufferB.length);
      const paddedA = Buffer.alloc(maxLength, 0);
      const paddedB = Buffer.alloc(maxLength, 0);
      
      // Copy original buffers into padded buffers
      bufferA.copy(paddedA);
      bufferB.copy(paddedB);
      
      // Perform constant-time comparison on padded buffers
      // Only return true if both the comparison passes AND the original lengths matched
      return lengthsMatch && crypto.timingSafeEqual(paddedA, paddedB);
    }
    
    // If buffers are already the same length, use timingSafeEqual directly
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch (error) {
    console.error('Error in secure string comparison:', error);
    return false;
  }
}

/**
 * Performs a constant-time comparison of hex strings
 * 
 * This is particularly useful for comparing hashes, tokens, or other
 * hex-encoded values where timing attacks are a concern.
 * 
 * @param a First hex string to compare
 * @param b Second hex string to compare
 * @returns Boolean indicating if hex strings are equal
 */
export function secureHexCompare(a: string, b: string): boolean {
  try {
    // Validate hex format
    const hexRegex = /^[0-9a-fA-F]*$/;
    if (!hexRegex.test(a) || !hexRegex.test(b)) {
      return false;
    }
    
    // Use the general secure comparison
    return secureCompare(a, b);
  } catch (error) {
    console.error('Error in secure hex comparison:', error);
    return false;
  }
}

/**
 * Performs a constant-time comparison of base64 strings
 * 
 * This is useful for comparing base64-encoded tokens, signatures, or other
 * security-critical values.
 * 
 * @param a First base64 string to compare
 * @param b Second base64 string to compare
 * @returns Boolean indicating if base64 strings are equal
 */
export function secureBase64Compare(a: string, b: string): boolean {
  try {
    // Validate base64 format (including URL-safe variants)
    const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
    if (!base64Regex.test(a) || !base64Regex.test(b)) {
      return false;
    }
    
    // Use the general secure comparison
    return secureCompare(a, b);
  } catch (error) {
    console.error('Error in secure base64 comparison:', error);
    return false;
  }
}

/**
 * Performs a constant-time comparison of two hashes
 * 
 * This function first validates that both inputs are valid hashes of the
 * expected algorithm before performing the comparison.
 * 
 * @param a First hash to compare
 * @param b Second hash to compare
 * @param algorithm Hash algorithm (default: 'sha256')
 * @returns Boolean indicating if hashes are equal
 */
export function secureHashCompare(
  a: string, 
  b: string, 
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256'
): boolean {
  try {
    // Define expected lengths for different hash algorithms
    const expectedLengths: Record<string, number> = {
      'md5': 32,
      'sha1': 40,
      'sha256': 64,
      'sha512': 128
    };
    
    // Check if lengths match expected hash length
    const expectedLength = expectedLengths[algorithm];
    if (a.length !== expectedLength || b.length !== expectedLength) {
      return false;
    }
    
    // Validate hex format
    const hexRegex = /^[0-9a-fA-F]*$/;
    if (!hexRegex.test(a) || !hexRegex.test(b)) {
      return false;
    }
    
    // Use the general secure comparison
    return secureCompare(a, b);
  } catch (error) {
    console.error('Error in secure hash comparison:', error);
    return false;
  }
}

/**
 * Demonstrates the vulnerability of standard string comparison to timing attacks
 * 
 * This function is for educational purposes only and should NOT be used in production.
 * It shows how standard string comparison leaks timing information.
 * 
 * @param secret The secret string to compare against
 * @param guess The attacker's guess
 * @returns Object containing comparison result and timing information
 */
export function demonstrateTimingAttack(secret: string, guess: string): { 
  equal: boolean, 
  timeNaive: number,
  timeSecure: number,
  vulnerable: boolean
} {
  // Standard comparison (vulnerable to timing attacks)
  const startNaive = process.hrtime.bigint();
  let equalNaive = true;
  
  // This comparison will exit early when it finds a mismatch
  for (let i = 0; i < secret.length; i++) {
    if (i >= guess.length || secret[i] !== guess[i]) {
      equalNaive = false;
      break;
    }
  }
  
  const endNaive = process.hrtime.bigint();
  const timeNaive = Number(endNaive - startNaive) / 1_000_000; // Convert to milliseconds
  
  // Secure comparison (resistant to timing attacks)
  const startSecure = process.hrtime.bigint();
  const equalSecure = secureCompare(secret, guess);
  const endSecure = process.hrtime.bigint();
  const timeSecure = Number(endSecure - startSecure) / 1_000_000; // Convert to milliseconds
  
  // Determine if the timing difference is significant
  // In a real attack, this would be measured over many samples
  const vulnerable = Math.abs(timeNaive - timeSecure) > 0.01;
  
  return {
    equal: equalSecure,
    timeNaive,
    timeSecure,
    vulnerable
  };
}