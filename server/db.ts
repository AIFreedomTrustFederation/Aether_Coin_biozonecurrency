import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Create a Postgres client with the connection string from environment variables
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Create a Drizzle ORM instance with the client and schema
export const db = drizzle(client, { schema });

// Export the client for use in migrations and other utilities
export const pgClient = client;