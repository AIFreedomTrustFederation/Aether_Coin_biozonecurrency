import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Security utility functions for the application
 */

// Generate a secure random token
export const generateSecureToken = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash a password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Verify a password against a hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate a secure API key
export const generateApiKey = (): string => {
  // Format: prefix_randomBytes
  const prefix = 'atc';
  const randomPart = crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
  return `${prefix}_${randomPart}`;
};

// Generate a secure session ID
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Encrypt sensitive data
export const encryptData = (data: string, encryptionKey: string): string => {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(encryptionKey).digest('base64').substring(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt sensitive data
export const decryptData = (encryptedData: string, encryptionKey: string): string => {
  const [ivHex, encryptedText] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.createHash('sha256').update(encryptionKey).digest('base64').substring(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  // Basic sanitization - replace HTML special chars
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Generate a secure password reset token with expiration
export const generatePasswordResetToken = (): { token: string, expires: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token valid for 1 hour
  
  return { token, expires };
};

// Validate password strength
export const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  return strongPasswordRegex.test(password);
};

// Generate a nonce for use with CSP
export const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('base64');
};

// Validate a JWT token structure (not verifying signature)
export const isValidJwtFormat = (token: string): boolean => {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(token);
};

// Generate a secure random password
export const generateSecurePassword = (length = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  
  // Define character sets for each type
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  // Ensure at least one of each required character type
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += specialChars[crypto.randomInt(0, specialChars.length)];
  
  // Fill the rest with random chars
  for (let i = password.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Constant time string comparison (to prevent timing attacks)
export const secureCompare = (a: string, b: string): boolean => {
  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b.padEnd(a.length).slice(0, a.length), 'utf8')
  );
};