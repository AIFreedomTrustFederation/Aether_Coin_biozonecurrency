import { z } from 'zod';

/**
 * Common validation schemas for API endpoints
 */

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Transaction schemas
export const transactionSchema = z.object({
  walletId: z.number().int().positive(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: 'Amount must be a valid number',
  }),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  description: z.string().optional(),
  isLayer2: z.boolean().optional(),
  layer2Type: z.string().optional(),
  layer2Data: z.string().optional(),
});

// Wallet schemas
export const walletSchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1, 'Wallet name is required'),
  type: z.enum(['ETH', 'BTC', 'SING', 'USDC', 'OTHER']),
  address: z.string().min(1, 'Wallet address is required'),
  privateKey: z.string().optional(),
  seedPhrase: z.string().optional(),
});

// API key schemas
export const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().datetime().optional(),
});

// Payment schemas
export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'SING', 'ETH', 'BTC']),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

// Smart contract schemas
export const smartContractSchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1, 'Contract name is required'),
  address: z.string().min(1, 'Contract address is required'),
  abi: z.string().min(1, 'Contract ABI is required'),
  network: z.string().min(1, 'Network is required'),
  description: z.string().optional(),
});

// Domain hosting schemas
export const domainHostingSchema = z.object({
  userId: z.number().int().positive(),
  domainName: z.string().min(1, 'Domain name is required'),
  ipfsHash: z.string().optional(),
  useCustomDns: z.boolean(),
  dnsRecords: z.array(
    z.object({
      type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT']),
      name: z.string(),
      value: z.string(),
      ttl: z.number().int().positive().optional(),
    })
  ).optional(),
});

// IPFS storage schemas
export const ipfsStorageSchema = z.object({
  userId: z.number().int().positive(),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1, 'MIME type is required'),
  description: z.string().optional(),
});

// Notification schemas
export const notificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z.enum(['EMAIL', 'SMS', 'PUSH', 'MATRIX']),
  message: z.string().min(1, 'Message is required'),
  htmlMessage: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

// Search parameters schema
export const searchParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  filters: z.record(z.string()).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'ID must be a valid number',
  }),
});

// UUID parameter schema
export const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format'),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before or equal to end date',
  path: ['startDate'],
});

// Email schema
export const emailSchema = z.object({
  to: z.string().email('Invalid recipient email'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  isHtml: z.boolean().optional().default(false),
});

// File upload schema
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.string().refine((val) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    return allowedTypes.includes(val);
  }, {
    message: 'Unsupported file type',
  }),
});