/**
 * Database Storage Implementation
 * 
 * This class provides a database implementation of the IStorage interface
 * using Drizzle ORM and PostgreSQL.
 */

import { eq } from "drizzle-orm";
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
}

// Create and export a singleton instance
export const databaseStorage = new DatabaseStorage();