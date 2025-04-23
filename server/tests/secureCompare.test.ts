/**
 * Tests for Secure String Comparison Utilities
 * 
 * This file contains tests that demonstrate how secure string comparison
 * protects against timing attacks, and verifies the correctness of the
 * secure comparison functions.
 */

import { 
  secureCompare, 
  secureHexCompare, 
  secureBase64Compare,
  secureHashCompare,
  demonstrateTimingAttack
} from '../utils/secureCompare';

/**
 * Basic test function to run all tests
 */
function runTests() {
  console.log('Running Secure Compare Tests...\n');
  
  testBasicComparison();
  testHexComparison();
  testBase64Comparison();
  testHashComparison();
  testTimingAttack();
  
  console.log('\nAll tests completed.');
}

/**
 * Test basic string comparison functionality
 */
function testBasicComparison() {
  console.log('Testing Basic String Comparison:');
  
  // Test equal strings
  const equal1 = secureCompare('hello', 'hello');
  console.log(`Equal strings: ${equal1 ? 'PASS' : 'FAIL'}`);
  
  // Test unequal strings
  const equal2 = secureCompare('hello', 'world');
  console.log(`Unequal strings: ${!equal2 ? 'PASS' : 'FAIL'}`);
  
  // Test strings with different lengths
  const equal3 = secureCompare('hello', 'hello world');
  console.log(`Different lengths: ${!equal3 ? 'PASS' : 'FAIL'}`);
  
  // Test with null/undefined
  const equal4 = secureCompare('hello', null as any);
  console.log(`Null input: ${!equal4 ? 'PASS' : 'FAIL'}`);
  
  // Test empty strings
  const equal5 = secureCompare('', '');
  console.log(`Empty strings: ${equal5 ? 'PASS' : 'FAIL'}`);
  
  console.log('');
}

/**
 * Test hex string comparison
 */
function testHexComparison() {
  console.log('Testing Hex String Comparison:');
  
  // Test valid equal hex strings
  const equal1 = secureHexCompare('1a2b3c', '1a2b3c');
  console.log(`Equal hex strings: ${equal1 ? 'PASS' : 'FAIL'}`);
  
  // Test valid unequal hex strings
  const equal2 = secureHexCompare('1a2b3c', '4d5e6f');
  console.log(`Unequal hex strings: ${!equal2 ? 'PASS' : 'FAIL'}`);
  
  // Test invalid hex strings
  const equal3 = secureHexCompare('1a2b3c', '1a2b3g'); // 'g' is not a valid hex character
  console.log(`Invalid hex string: ${!equal3 ? 'PASS' : 'FAIL'}`);
  
  console.log('');
}

/**
 * Test base64 string comparison
 */
function testBase64Comparison() {
  console.log('Testing Base64 String Comparison:');
  
  // Test valid equal base64 strings
  const equal1 = secureBase64Compare('SGVsbG8gV29ybGQ=', 'SGVsbG8gV29ybGQ=');
  console.log(`Equal base64 strings: ${equal1 ? 'PASS' : 'FAIL'}`);
  
  // Test valid unequal base64 strings
  const equal2 = secureBase64Compare('SGVsbG8gV29ybGQ=', 'SGVsbG8gQWV0aGVy');
  console.log(`Unequal base64 strings: ${!equal2 ? 'PASS' : 'FAIL'}`);
  
  // Test URL-safe base64
  const equal3 = secureBase64Compare('SGVsbG8_V29ybGQ-', 'SGVsbG8_V29ybGQ-');
  console.log(`URL-safe base64: ${equal3 ? 'PASS' : 'FAIL'}`);
  
  // Test invalid base64
  const equal4 = secureBase64Compare('SGVsbG8gV29ybGQ=', 'SGVsbG8gV29ybGQ$');
  console.log(`Invalid base64: ${!equal4 ? 'PASS' : 'FAIL'}`);
  
  console.log('');
}

/**
 * Test hash comparison
 */
function testHashComparison() {
  console.log('Testing Hash Comparison:');
  
  // SHA-256 test (64 hex chars)
  const sha256a = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
  const sha256b = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
  const sha256c = 'a320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76';
  
  console.log(`Equal SHA-256: ${secureHashCompare(sha256a, sha256b) ? 'PASS' : 'FAIL'}`);
  console.log(`Unequal SHA-256: ${!secureHashCompare(sha256a, sha256c) ? 'PASS' : 'FAIL'}`);
  
  // MD5 test (32 hex chars)
  const md5a = '5f4dcc3b5aa765d61d8327deb882cf99';
  const md5b = '5f4dcc3b5aa765d61d8327deb882cf99';
  
  console.log(`Equal MD5: ${secureHashCompare(md5a, md5b, 'md5') ? 'PASS' : 'FAIL'}`);
  console.log(`Wrong algorithm: ${!secureHashCompare(md5a, md5b) ? 'PASS' : 'FAIL'}`);
  
  console.log('');
}

/**
 * Demonstrate timing attack vulnerability
 */
function testTimingAttack() {
  console.log('Demonstrating Timing Attack Vulnerability:');
  
  // Secret API key or token
  const secret = 'a1b2c3d4e5f6g7h8i9j0';
  
  // Test with completely different string
  const result1 = demonstrateTimingAttack(secret, 'z9y8x7w6v5u4t3s2r1q0');
  console.log(`\nCompletely different string:`);
  console.log(`Equal: ${result1.equal}`);
  console.log(`Naive comparison time: ${result1.timeNaive.toFixed(6)} ms`);
  console.log(`Secure comparison time: ${result1.timeSecure.toFixed(6)} ms`);
  console.log(`Vulnerable: ${result1.vulnerable ? 'YES' : 'NO'}`);
  
  // Test with string that matches first few characters (simulating a timing attack in progress)
  const result2 = demonstrateTimingAttack(secret, 'a1b2c3d4e5WRONG');
  console.log(`\nPartially matching string (first 10 chars match):`);
  console.log(`Equal: ${result2.equal}`);
  console.log(`Naive comparison time: ${result2.timeNaive.toFixed(6)} ms`);
  console.log(`Secure comparison time: ${result2.timeSecure.toFixed(6)} ms`);
  console.log(`Vulnerable: ${result2.vulnerable ? 'YES' : 'NO'}`);
  
  // Test with equal strings
  const result3 = demonstrateTimingAttack(secret, secret);
  console.log(`\nExact match:`);
  console.log(`Equal: ${result3.equal}`);
  console.log(`Naive comparison time: ${result3.timeNaive.toFixed(6)} ms`);
  console.log(`Secure comparison time: ${result3.timeSecure.toFixed(6)} ms`);
  console.log(`Vulnerable: ${result3.vulnerable ? 'YES' : 'NO'}`);
  
  console.log('\nNote: Timing differences may vary between runs and environments.');
  console.log('In a real attack, an attacker would perform thousands of measurements to detect patterns.');
}

// Run all tests
runTests();