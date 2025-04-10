/**
 * Update Admin User Script
 * 
 * This script updates the existing admin user with the proper credentials and privileges.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../shared/schema-proxy';
import { eq } from 'drizzle-orm';

async function updateAdminUser() {
  try {
    // Admin user credentials
    const adminEmail = 'aifreedomtrust@gmail.com';
    const adminUsername = 'aifreedomtrust';
    const adminPassword = 'FreedomLiberty2021$';
    const adminRole = 'super_admin'; // Highest level of access

    console.log('Checking if admin user exists...');
    
    // Check if user exists by username
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.username, adminUsername));
    
    if (existingUser.length === 0) {
      console.log('Admin user not found with username:', adminUsername);
      return;
    }
    
    const user = existingUser[0];
    console.log('Found existing user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isTrustMember: user.isTrustMember
    });
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    // Update the admin user
    const [updatedUser] = await db.update(users)
      .set({
        email: adminEmail,
        passwordHash,
        role: adminRole,
        isTrustMember: true, // Admin is a trust member
        trustMemberSince: user.trustMemberSince || new Date(),
        trustMemberLevel: 'governing', // Highest level of trust membership
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();
    
    console.log('Admin user updated successfully:', {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isTrustMember: updatedUser.isTrustMember,
      trustMemberLevel: updatedUser.trustMemberLevel
    });
    
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
updateAdminUser();