import "dotenv/config";
import { db, pgClient } from "./db";
import { 
  users, wallets, transactions, smartContracts, aiMonitoringLogs, cidEntries,
  walletHealthScores, walletHealthIssues, notificationPreferences
} from "../shared/schema";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting database migration...");

  try {
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        chain VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        balance VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        dollar_value DECIMAL NOT NULL,
        percent_change DECIMAL NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        wallet_id INTEGER NOT NULL REFERENCES wallets(id),
        tx_hash VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount VARCHAR(255) NOT NULL,
        token_symbol VARCHAR(20) NOT NULL,
        from_address VARCHAR(255),
        to_address VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fee VARCHAR(100),
        block_number INTEGER,
        ai_verified BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS smart_contracts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        chain VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        last_interaction TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_monitoring_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        related_entity_id INTEGER,
        related_entity_type VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS cid_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        cid VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wallet_health_scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        wallet_id INTEGER NOT NULL REFERENCES wallets(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        overall_score INTEGER NOT NULL,
        security_score INTEGER NOT NULL,
        diversification_score INTEGER NOT NULL,
        activity_score INTEGER NOT NULL,
        gas_optimization_score INTEGER NOT NULL,
        background_scan_timestamp TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS wallet_health_issues (
        id SERIAL PRIMARY KEY,
        health_score_id INTEGER NOT NULL REFERENCES wallet_health_scores(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        category VARCHAR(100) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // Create a sample user for demo purposes
    const userExists = await db.select({ count: sql`count(*)` }).from(users).where(sql`username = 'demo'`);
    if (parseInt(userExists[0].count.toString()) === 0) {
      // Create demo user
      const [demoUser] = await db.insert(users).values({
        username: 'demo',
        email: 'demo@aetherion.wallet',
        passwordHash: 'demo_password_hash' // In a real app, this would be securely hashed
      }).returning();

      if (demoUser) {
        const userId = demoUser.id;
        console.log(`Created demo user with ID: ${userId}`);

        // Create sample wallets for the demo user
        const [btcWallet] = await db.insert(wallets).values({
          userId: userId,
          chain: 'bitcoin',
          name: 'Bitcoin Wallet',
          address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
          balance: '0.35',
          type: 'native',
          symbol: 'BTC',
          dollarValue: 17500,
          percentChange: 2.5
        }).returning();

        const [ethWallet] = await db.insert(wallets).values({
          userId: userId,
          chain: 'ethereum',
          name: 'Ethereum Wallet',
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          balance: '1.75',
          type: 'native',
          symbol: 'ETH',
          dollarValue: 3500,
          percentChange: -1.2
        }).returning();

        const [solWallet] = await db.insert(wallets).values({
          userId: userId,
          chain: 'solana',
          name: 'Solana Wallet',
          address: 'So11111111111111111111111111111111111111112',
          balance: '42.5',
          type: 'native',
          symbol: 'SOL',
          dollarValue: 4250,
          percentChange: 5.8
        }).returning();

        console.log('Created sample wallets');

        // Create sample transactions for the demo user's wallets
        if (btcWallet) {
          await db.insert(transactions).values([
            {
              walletId: btcWallet.id,
              txHash: '7f8e35b48e0ea21114d2c2d210a05e1ec70f88c48b1db3b23f92c29f0b7a1a0c',
              type: 'receive',
              amount: '0.15',
              tokenSymbol: 'BTC',
              fromAddress: '35hK24tcLEWcgNA4JxpvbkNkoAcDGqQPsP',
              toAddress: btcWallet.address,
              status: 'confirmed',
              fee: '0.0001',
              blockNumber: 754321,
              aiVerified: true
            },
            {
              walletId: btcWallet.id,
              txHash: '8a3e58bd2c0a8f1e65f9b5e6a3c7d4e1f2b0c9a8e7d6f5a4c3b2d1e0f9a8b7c6d',
              type: 'send',
              amount: '0.05',
              tokenSymbol: 'BTC',
              fromAddress: btcWallet.address,
              toAddress: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
              status: 'confirmed',
              fee: '0.0002',
              blockNumber: 754350,
              aiVerified: true
            }
          ]);
        }

        if (ethWallet) {
          await db.insert(transactions).values([
            {
              walletId: ethWallet.id,
              txHash: '0x7fb1f78e44a34c2e2a7a8bc92c21a7eac6c8d8e3a1b9c0d4e5f6a7b8c9d0e1f2',
              type: 'contract_interaction',
              amount: '0.01',
              tokenSymbol: 'ETH',
              fromAddress: ethWallet.address,
              toAddress: '0x1234567890123456789012345678901234567890',
              status: 'confirmed',
              fee: '0.002',
              blockNumber: 14568921,
              aiVerified: true
            },
            {
              walletId: ethWallet.id,
              txHash: '0xe1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2',
              type: 'receive',
              amount: '0.5',
              tokenSymbol: 'ETH',
              fromAddress: '0x0987654321098765432109876543210987654321',
              toAddress: ethWallet.address,
              status: 'pending',
              fee: '0.001',
              aiVerified: false
            }
          ]);
        }

        console.log('Created sample transactions');

        // Create sample smart contracts
        await db.insert(smartContracts).values([
          {
            userId,
            name: 'Aetherion NFT Marketplace',
            address: '0x1234567890123456789012345678901234567890',
            chain: 'ethereum',
            status: 'active',
            lastInteraction: new Date(Date.now() - 86400000) // 1 day ago
          },
          {
            userId,
            name: 'Quantum Token Bridge',
            address: '0x0987654321098765432109876543210987654321',
            chain: 'ethereum',
            status: 'pending'
          },
          {
            userId,
            name: 'Fractal DAO Governance',
            address: 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq',
            chain: 'solana',
            status: 'inactive'
          }
        ]);

        console.log('Created sample smart contracts');

        // Create sample AI monitoring logs
        await db.insert(aiMonitoringLogs).values([
          {
            userId,
            action: 'threat_detected',
            description: 'Unusual transaction pattern detected in contract interaction',
            severity: 'warning',
            relatedEntityId: 1,
            relatedEntityType: 'transaction'
          },
          {
            userId,
            action: 'transaction_verified',
            description: 'Cross-chain transaction verified with quantum resistance check',
            severity: 'info',
            relatedEntityId: 2,
            relatedEntityType: 'transaction'
          },
          {
            userId,
            action: 'gas_optimization',
            description: 'Applied gas optimization to recurring contract interactions',
            severity: 'info',
            relatedEntityId: 1,
            relatedEntityType: 'contract'
          },
          {
            userId,
            action: 'threat_detected',
            description: 'Potential replay attack blocked on transaction',
            severity: 'critical',
            relatedEntityId: 3,
            relatedEntityType: 'transaction'
          }
        ]);

        console.log('Created sample AI monitoring logs');

        // Create sample CID entries
        await db.insert(cidEntries).values([
          {
            userId,
            cid: 'bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavoju',
            type: 'wallet_backup',
            status: 'active'
          },
          {
            userId,
            cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
            type: 'smart_contract',
            status: 'syncing'
          },
          {
            userId,
            cid: 'bafkreiebycw3p4guua3jmxjvgp7tzfjvoh3jvlhgnjghiiy4jhtepqfppu',
            type: 'transaction_log',
            status: 'inactive'
          }
        ]);

        console.log('Created sample CID entries');

        // Create wallet health scores for each wallet
        if (btcWallet && ethWallet && solWallet) {
          // Create health scores
          const [btcHealthScore] = await db.insert(walletHealthScores).values({
            userId,
            walletId: btcWallet.id,
            overallScore: 87,
            securityScore: 92,
            diversificationScore: 75,
            activityScore: 88,
            gasOptimizationScore: 80,
            backgroundScanTimestamp: new Date(Date.now() - 3600000) // 1 hour ago
          }).returning();

          const [ethHealthScore] = await db.insert(walletHealthScores).values({
            userId,
            walletId: ethWallet.id,
            overallScore: 82,
            securityScore: 89,
            diversificationScore: 70,
            activityScore: 85,
            gasOptimizationScore: 78,
            backgroundScanTimestamp: new Date(Date.now() - 3600000) // 1 hour ago
          }).returning();
            
          const [solHealthScore] = await db.insert(walletHealthScores).values({
            userId,
            walletId: solWallet.id,
            overallScore: 90,
            securityScore: 95,
            diversificationScore: 85,
            activityScore: 87,
            gasOptimizationScore: 92,
            backgroundScanTimestamp: new Date(Date.now() - 3600000) // 1 hour ago
          }).returning();

          console.log('Created wallet health scores');

          // Create health issues
          if (btcHealthScore) {
            await db.insert(walletHealthIssues).values([
              {
                healthScoreId: btcHealthScore.id,
                category: 'security',
                severity: 'medium',
                title: 'Insufficient entropy in private key',
                description: 'Your wallet was created with lower than recommended entropy which could make it vulnerable to brute force attacks.',
                recommendation: 'Consider creating a new wallet with a hardware wallet device that generates high-entropy keys.',
                resolved: false
              },
              {
                healthScoreId: btcHealthScore.id,
                category: 'security',
                severity: 'critical',
                title: 'Interaction with flagged contract',
                description: 'Your wallet has interacted with a smart contract that has been flagged as potentially malicious by security researchers.',
                recommendation: 'Avoid further interactions with this contract and consider moving funds to a new wallet if you authorized token approvals.',
                resolved: false
              }
            ]);
          }

          if (ethHealthScore) {
            await db.insert(walletHealthIssues).values([
              {
                healthScoreId: ethHealthScore.id,
                category: 'gasOptimization',
                severity: 'low',
                title: 'High gas usage patterns',
                description: 'Your recent transactions show inefficient gas usage patterns that could be optimized.',
                recommendation: 'Use batch transactions and optimize contract interactions to reduce gas consumption.',
                resolved: false
              },
              {
                healthScoreId: ethHealthScore.id,
                category: 'diversification',
                severity: 'medium',
                title: 'Portfolio concentration risk',
                description: 'Over 70% of your portfolio value is concentrated in a single asset.',
                recommendation: 'Consider diversifying your holdings across multiple assets to reduce risk.',
                resolved: false
              }
            ]);
          }

          console.log('Created wallet health issues');
        }
      }
    } else {
      console.log('Demo user already exists, skipping sample data creation');
    }

    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    // Close the database connection
    await pgClient.end();
  }
}

// Run the migration
migrate().catch(console.error);