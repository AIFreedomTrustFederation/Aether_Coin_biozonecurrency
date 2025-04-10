/**
 * Create Admin User Script
 * 
 * This script creates an admin user with the specified credentials.
 * It checks if the user already exists before creating it.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../shared/schema-proxy';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    // Admin user credentials
    const adminEmail = 'aifreedomtrust@gmail.com';
    const adminUsername = adminEmail.split('@')[0]; // Extract username from email
    const adminPassword = 'FreedomLiberty2021$';
    const adminRole = 'super_admin'; // Highest level of access

    console.log('Checking if admin user already exists...');
    
    // Check if user already exists by email
    const existingUserByEmail = await db.select()
      .from(users)
      .where(eq(users.email, adminEmail));
    
    if (existingUserByEmail.length > 0) {
      console.log('Admin user already exists with email:', adminEmail);
      return;
    }
    
    // Check if user already exists by username
    const existingUserByUsername = await db.select()
      .from(users)
      .where(eq(users.username, adminUsername));
    
    if (existingUserByUsername.length > 0) {
      console.log('Admin user already exists with username:', adminUsername);
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    // Create the admin user
    const [adminUser] = await db.insert(users)
      .values({
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        role: adminRole,
        isTrustMember: true, // Admin is a trust member
        trustMemberSince: new Date(),
        trustMemberLevel: 'governing', // Highest level of trust membership
        isActive: true
      })
      .returning();
    
    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      isTrustMember: adminUser.isTrustMember,
      trustMemberLevel: adminUser.trustMemberLevel
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
createAdminUser();