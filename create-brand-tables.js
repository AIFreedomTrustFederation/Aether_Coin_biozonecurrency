import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

// Create a new PostgreSQL connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createBrandTables() {
  // Connect to the database
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create brands table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        short_description TEXT,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        logo_path VARCHAR(255),
        banner_path VARCHAR(255),
        github_repo VARCHAR(255),
        documentation_url VARCHAR(255),
        primary_color VARCHAR(20),
        website_url VARCHAR(255),
        featured BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create brand_features table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brand_features (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        icon_name VARCHAR(50),
        priority INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create brand_technologies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brand_technologies (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        is_open_source BOOLEAN DEFAULT TRUE,
        open_source_alternative_id INTEGER,
        logo_path VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create brand_integrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brand_integrations (
        id SERIAL PRIMARY KEY,
        source_brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        target_brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        description TEXT,
        integration_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create brand_team_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brand_team_members (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        bio TEXT,
        avatar_path VARCHAR(255),
        linkedin_url VARCHAR(255),
        github_url VARCHAR(255),
        twitter_url VARCHAR(255),
        priority INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create brand_case_studies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brand_case_studies (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        challenge TEXT,
        solution TEXT,
        results TEXT,
        image_path VARCHAR(255),
        url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data - Quantum Domain brand
    await client.query(`
      INSERT INTO brands (
        name, slug, short_description, description, category, 
        status, logo_path, github_repo, documentation_url, 
        primary_color, website_url, featured, priority
      ) VALUES (
        'Quantum Domain', 
        'quantum-domain', 
        'Revolutionary quantum-resistant encryption framework for secure distributed applications', 
        'Quantum Domain is a cutting-edge framework that provides post-quantum cryptographic algorithms and tools for building secure decentralized applications. It offers a comprehensive suite of quantum-resistant encryption methods, secure key generation, and advanced authentication protocols that protect against both classical and quantum computing attacks.', 
        'security', 
        'active', 
        '/assets/brands/quantum-domain-logo.svg', 
        'https://github.com/aifreedomtrust/quantum-domain', 
        'https://docs.aifreedomtrust.com/quantum-domain', 
        '#3B82F6', 
        'https://quantum-domain.aifreedomtrust.com', 
        TRUE, 
        10
      ) ON CONFLICT (slug) DO NOTHING
    `);
    
    // Insert sample data - Zero Trust Framework brand
    await client.query(`
      INSERT INTO brands (
        name, slug, short_description, description, category, 
        status, logo_path, github_repo, documentation_url, 
        primary_color, website_url, featured, priority
      ) VALUES (
        'Zero Trust Framework', 
        'zero-trust-framework', 
        'Enterprise-grade authorization and access control for distributed systems', 
        'Zero Trust Framework provides a comprehensive security model that requires strict identity verification for every person and device trying to access resources in a private network, regardless of whether they are sitting within or outside the network perimeter. It leverages advanced cryptographic protocols, continuous validation, and least-privilege access principles to maintain system integrity.', 
        'security', 
        'active', 
        '/assets/brands/zero-trust-logo.svg', 
        'https://github.com/aifreedomtrust/zero-trust-framework', 
        'https://docs.aifreedomtrust.com/zero-trust', 
        '#10B981', 
        'https://zero-trust.aifreedomtrust.com', 
        TRUE, 
        20
      ) ON CONFLICT (slug) DO NOTHING
    `);
    
    // Insert sample data - Fractal Network brand
    await client.query(`
      INSERT INTO brands (
        name, slug, short_description, description, category, 
        status, logo_path, github_repo, documentation_url, 
        primary_color, website_url, featured, priority
      ) VALUES (
        'Fractal Network', 
        'fractal-network', 
        'Self-optimizing distributed peer-to-peer infrastructure with fractal topology', 
        'Fractal Network is a next-generation distributed infrastructure that uses mathematical fractal patterns to create a self-healing, self-optimizing mesh of nodes. It leverages recursive network topology that maintains performance at any scale, automatically balancing loads and routing around failures without central coordination.', 
        'infrastructure', 
        'active', 
        '/assets/brands/fractal-network-logo.svg', 
        'https://github.com/aifreedomtrust/fractal-network', 
        'https://docs.aifreedomtrust.com/fractal-network', 
        '#8B5CF6', 
        'https://fractal-network.aifreedomtrust.com', 
        TRUE, 
        30
      ) ON CONFLICT (slug) DO NOTHING
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Brand tables created successfully!');
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error creating brand tables:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
    await pool.end();
  }
}

// Execute the function
createBrandTables().catch(err => {
  console.error('Failed to create brand tables:', err);
  process.exit(1);
});