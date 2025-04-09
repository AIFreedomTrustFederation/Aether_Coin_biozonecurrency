import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema-proxy";

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Create a Postgres client with the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

// Set some safe database connection options
const client = postgres(connectionString, {
  max: 10, // maximum number of connections
  idle_timeout: 20, // max seconds a connection can be idle before being terminated
  connect_timeout: 10, // max seconds to wait for a connection
  prepare: false, // automatically prepare statements
  ssl: { rejectUnauthorized: false } // Allow self-signed certificates but still use SSL encryption
});

// Create a Drizzle ORM instance with the client and schema
export const db = drizzle(client, { schema });

// Export the client for use in migrations and other utilities
export const pgClient = client;

// Log database connection status
try {
  console.log("Database connection initialized successfully");
} catch (error: any) {
  console.error("Error initializing database connection:", error.message);
}