import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, pgClient } from "./db";

/**
 * This script runs database migrations using Drizzle ORM.
 * It will apply all the migrations in the migrations folder.
 * 
 * Run with: npx tsx server/migrate.ts
 */

async function main() {
  console.log("Starting database migration...");
  
  try {
    // Run the migrations
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pgClient.end();
  }
}

main();