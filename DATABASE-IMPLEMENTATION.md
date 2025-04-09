# AetherCoin/FractalCoin Database Implementation

This document provides details about the database implementation for the AetherCoin/FractalCoin application.

## Database Design

The application uses PostgreSQL as the database with Drizzle ORM for database access and management.

### Schema Structure

The schema is organized in a modular way to manage circular dependencies:

1. **Core Schema** - `shared/schema.ts`: Contains the primary tables and types
2. **Schema Proxy** - `shared/schema-proxy.ts`: Resolves circular dependencies by re-exporting tables and types
3. **Feature-specific Schemas** - Specialty schemas are created for different features:
   - Wallet schema
   - Smart Contract schema 
   - AI Monitoring schema
   - Temple Node schema
   - CID/IPFS storage schema

### Key Tables

The application's primary tables include:

- `users`: Authentication and user information
- `wallets`: User wallets and blockchain addresses
- `transactions`: Blockchain transaction records
- `smartContracts`: Smart contract deployments and code
- `aiMonitoringLogs`: AI system monitoring and logging
- `cidEntries`: IPFS/Filecoin Content IDs for decentralized storage
- `paymentMethods`: User payment method information
- `payments`: Payment records for fiat/crypto payments
- `templeNodes`: Temple Architecture node configuration and management

## Database Access Layer

The storage interface provides a unified way to interact with the database.

### IStorage Interface

The `IStorage` interface (`server/storage.ts`) defines the contract for database operations:

```typescript
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Transaction methods
  getWalletsByUserId(userId: number): Promise<any[]>;
  getRecentTransactions(userId: number, limit: number): Promise<any[]>;
  getTransactionsByWalletId(walletId: number): Promise<any[]>;
  createTransaction(data: any): Promise<any>;
  
  // Smart Contract methods
  getSmartContractsByUserId(userId: number): Promise<any[]>;
  createSmartContract(data: any): Promise<any>;
  updateSmartContractStatus(id: number, status: string): Promise<any>;
  
  // Additional methods...
}
```

### Database Implementation

The database implementation (`server/fixed-storage.ts` or `server/database-storage.ts`) provides concrete implementations for each method in the interface.

## Connection Management

- **Connection Configuration**: Set in `server/db.ts` with options for connection pooling and timeouts
- **Environment Variables**: Uses `DATABASE_URL` for connection string

## Migrations

Database migrations are managed using Drizzle Kit:

1. Schema changes are made to schema files
2. Migrations are generated with `npx drizzle-kit generate`
3. Migrations are applied with `npm run db:push` or directly with `npx tsx server/migrate.ts`

## Schema Proxies for Circular Dependencies

To resolve circular dependency issues, schema-proxy.ts provides a unified import point:

```typescript
/**
 * Schema Proxy
 * 
 * This file helps resolve circular dependencies between schema files
 * by re-exporting and proxying their types and tables.
 * 
 * When importing from schema files, use this proxy instead of direct imports
 * to avoid circular dependency issues.
 */

// Re-export everything from the main schema file
export * from './schema';

// Define proxy references to schema tables with forward declarations
export const wallets = { userId: null, id: null } as any;
export const transactions = { walletId: null, id: null, timestamp: null } as any;
export const smartContracts = { userId: null, id: null } as any;
export const aiMonitoringLogs = { userId: null, id: null, timestamp: null } as any;
// Additional proxies...
```

## Best Practices

1. Always use the schema-proxy to import tables to avoid circular dependencies
2. Implement graceful error handling in all database operations
3. Use the storage interface instead of direct database access
4. Validate input data before database operations
5. Use migrations for all schema changes instead of manual SQL
6. Implement proper indexes for performance optimization
7. Encrypt sensitive data fields
8. Implement proper timeouts and connection limits

## FractalCoin-Specific Features

The FractalCoin/AetherCoin implementation includes specialized storage functionality based on the Fractal Recursive Quantum Security (FRQS) architecture:

1. **Recursive Authentication**: Multi-level security in the storage layer
2. **Temple Node Architecture**: Three-tiered structure with specialized node types
3. **Priesthood Cryptography**: Role-based access control in the database layer
4. **Sacred Utility Modules (SUMs)**: Specialized functionality modules
5. **Divine Patterns**: Mathematical patterns based on golden ratio and sacred geometry