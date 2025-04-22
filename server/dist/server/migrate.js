"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_1 = require("@neondatabase/serverless");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema = __importStar(require("../shared/schema"));
const ws_1 = __importDefault(require("ws"));
// Configure WebSocket for Neon connections
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
// Main function to run migrations
async function runMigrations() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }
    console.log('Creating database connection...');
    const pool = new serverless_1.Pool({ connectionString: process.env.DATABASE_URL });
    const db = (0, neon_serverless_1.drizzle)(pool, { schema });
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
    }
    catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
    finally {
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
