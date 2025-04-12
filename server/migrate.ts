import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '../shared/schema';
import ws from 'ws';

// Configure WebSocket for Neon connections
neonConfig.webSocketConstructor = ws;

// Main function to run migrations
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Creating database connection...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Running migrations...');
  try {
    // Using plain SQL to create enums first
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_category') THEN
          CREATE TYPE achievement_category AS ENUM (
            'account_security',
            'wallet_security',
            'communication_security',
            'quantum_security',
            'transaction_security',
            'node_operations',
            'special_events'
          );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
          CREATE TYPE difficulty_level AS ENUM (
            'beginner',
            'intermediate',
            'advanced',
            'expert',
            'master'
          );
        END IF;
      END $$;
    `);

    // Create tables directly using schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        wallet_address VARCHAR(255) UNIQUE,
        security_score INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category achievement_category NOT NULL,
        difficulty difficulty_level NOT NULL,
        points_value INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        nft_metadata JSONB,
        requirement_description TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        achievement_id INTEGER NOT NULL REFERENCES achievements(id),
        date_earned TIMESTAMP NOT NULL DEFAULT NOW(),
        nft_token_id VARCHAR(255),
        nft_minted BOOLEAN NOT NULL DEFAULT FALSE,
        transaction_hash VARCHAR(255),
        UNIQUE(user_id, achievement_id)
      );
      
      CREATE TABLE IF NOT EXISTS achievement_criteria (
        id SERIAL PRIMARY KEY,
        achievement_id INTEGER NOT NULL REFERENCES achievements(id),
        criteria_type VARCHAR(100) NOT NULL,
        criteria_value JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        activity_type VARCHAR(100) NOT NULL,
        activity_data JSONB,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS nft_badges (
        id SERIAL PRIMARY KEY,
        achievement_id INTEGER NOT NULL REFERENCES achievements(id),
        token_id VARCHAR(255) UNIQUE,
        metadata JSONB NOT NULL,
        image_url TEXT NOT NULL,
        badge_rarity VARCHAR(50) NOT NULL,
        minted_at TIMESTAMP,
        contract_address VARCHAR(255),
        chain_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Database schema migration completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('Migrations complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error in migration process:', err);
    process.exit(1);
  });