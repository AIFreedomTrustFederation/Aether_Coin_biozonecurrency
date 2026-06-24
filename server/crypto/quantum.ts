import crypto from 'crypto';

export function encryptData(data: string): string {
  const cipher = crypto.createCipher('aes-256-ctr', 'encryption-key');
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptData(encryptedData: string): string {
  const decipher = crypto.createDecipher('aes-256-ctr', 'encryption-key');
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}