/**
 * Database Storage Implementation
 * 
 * This class provides a database implementation of the IStorage interface
 * using Drizzle ORM and PostgreSQL.
 */

import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";
import {
  users,
  type User,
  type InsertUser
} from "@shared/schema-proxy";

/**
 * DatabaseStorage implements IStorage using PostgreSQL through Drizzle ORM
 * This replaces the MemStorage implementation with a persistent database
 */
export class DatabaseStorage implements IStorage {
  /**
   * Get a user by ID
   * @param id User ID
   * @returns User or undefined if not found
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    
    return user;
  }

  /**
   * Get a user by ID (alias for getUser)
   * @param id User ID
   * @returns User or undefined if not found
   */
  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  /**
   * Get a user by username
   * @param username Username to look up
   * @returns User or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    return user;
  }

  /**
   * Get a user by email
   * @param email Email to look up
   * @returns User or undefined if not found
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));
    
    return user;
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  /**
   * Create a new user
   * @param insertUser User data to insert
   * @returns The created user
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    return user;
  }

  /**
   * Update user's last login time
   * @param id User ID
   * @returns Updated user or undefined if not found
   */
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ 
          lastLogin: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating last login for user ${id}:`, error);
      // Fall back to just returning the user
      return this.getUser(id);
    }
  }

  /**
   * Check if a user is a trust member
   * @param id User ID
   * @returns Boolean indicating trust membership status
   */
  async isTrustMember(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    return !!user?.isTrustMember;
  }

  /**
   * Get all trust members
   * @returns Array of users who are trust members
   */
  async getTrustMembers(): Promise<User[]> {
    return db.select()
      .from(users)
      .where(eq(users.isTrustMember, true));
  }

  /**
   * Set a user as a trust member
   * @param id User ID
   * @param level Trust membership level
   * @returns Updated user or undefined if not found
   */
  async setUserAsTrustMember(id: number, level: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isTrustMember: true,
        trustMemberLevel: level,
        trustMemberSince: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
}

// Create and export a singleton instance
export const databaseStorage = new DatabaseStorage();