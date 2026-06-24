# Secure String Comparison Utilities

This module provides functions for performing secure string comparisons that are resistant to timing attacks.

## What is a Timing Attack?

A timing attack is a side-channel attack where an attacker measures the time it takes for operations to complete, and uses that information to gain insights about secret values.

In standard string comparison (a === b), the comparison stops as soon as a difference is found. For example, comparing "apple" with "apricot" would stop at the 3rd character. This creates a measurable timing difference that attackers can exploit.

For security-critical comparisons like API keys, tokens, or passwords, this timing difference can leak information. An attacker could:

1. Try different first characters and measure which one takes longer
2. Once the first character is found, move to the second, and so on
3. Eventually reconstruct the entire secret without brute-forcing

## How Secure Comparison Works

Constant-time comparison ensures the same operations are performed regardless of where differences occur, making timing attacks ineffective. Our implementation:

1. Converts strings to buffers
2. Ensures equal-length comparison by padding if necessary
3. Uses crypto.timingSafeEqual for constant-time comparison
4. Always performs the full comparison regardless of differences

## Available Functions

### `secureCompare(a: string, b: string): boolean`

Performs a constant-time string comparison to prevent timing attacks.

```typescript
import { secureCompare } from '../utils/secureCompare';

// Use for comparing API keys, tokens, passwords, etc.
if (secureCompare(userProvidedApiKey, storedApiKey)) {
  // Grant access
}
```

### `secureHexCompare(a: string, b: string): boolean`

Performs a constant-time comparison of hex strings. Validates that inputs are valid hex strings before comparison.

```typescript
import { secureHexCompare } from '../utils/secureCompare';

// Use for comparing hashes, hex-encoded tokens, etc.
if (secureHexCompare(userProvidedHash, storedHash)) {
  // Grant access
}
```

### `secureBase64Compare(a: string, b: string): boolean`

Performs a constant-time comparison of base64 strings. Validates that inputs are valid base64 strings before comparison.

```typescript
import { secureBase64Compare } from '../utils/secureCompare';

// Use for comparing base64-encoded tokens, signatures, etc.
if (secureBase64Compare(userProvidedToken, storedToken)) {
  // Grant access
}
```

### `secureHashCompare(a: string, b: string, algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256'): boolean`

Performs a constant-time comparison of two hashes. Validates that inputs are valid hashes of the expected algorithm before comparison.

```typescript
import { secureHashCompare } from '../utils/secureCompare';

// Use for comparing specific hash types
if (secureHashCompare(userProvidedHash, storedHash, 'sha256')) {
  // Grant access
}
```

## When to Use Secure Comparison

Use secure comparison functions whenever comparing security-critical values:

- API keys
- Authentication tokens
- Password hashes
- HMAC signatures
- CSRF tokens
- Session IDs
- Any secret value where a timing attack could be a concern

## Testing

To run the tests and see a demonstration of timing attacks:

```bash
node server/scripts/testSecureCompare.js
```

This will compile and run the tests, showing how standard string comparison is vulnerable to timing attacks, while secure comparison is resistant.

## Best Practices

1. **Always use secure comparison for security-critical values**
2. **Never use standard comparison (===) for secrets**
3. **Validate input formats before comparison when possible**
4. **Use the most specific comparison function for your data type**
5. **Remember that secure comparison is only one part of a secure system**

## References

- [OWASP Timing Attacks](https://owasp.org/www-community/attacks/Timing_attack)
- [Node.js crypto.timingSafeEqual](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b)
- [Constant-time comparison algorithm](https://en.wikipedia.org/wiki/Timing_attack#Countermeasures)