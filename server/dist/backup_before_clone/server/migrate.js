"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const migrator_1 = require("drizzle-orm/postgres-js/migrator");
const db_1 = require("./db");
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
        await (0, migrator_1.migrate)(db_1.db, { migrationsFolder: "./migrations" });
        console.log("Migration completed successfully");
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
    finally {
        // Close the database connection
        await db_1.pgClient.end();
    }
}
main();
