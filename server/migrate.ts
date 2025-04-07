/**
 * Database Migration Script
 * 
 * This script is used to apply new database schema changes.
 * It uses the Drizzle ORM to push schema changes.
 */

import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, pgClient } from './db';
import * as schema from '../shared/schema';

/**
 * Run migrations
 */
async function main() {
  console.log('Starting database migration...');
  
  try {
    // Apply migrations
    await migrate(db, { migrationsFolder: 'drizzle' });
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pgClient.end();
  }
}

main();