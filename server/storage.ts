/**
 * Storage interface for the server.
 * This module provides a unified interface for interacting with the database.
 */

import dotenv from 'dotenv';
import { User, InsertUser } from '../shared/schema';
import { DatabaseStorage } from './database-storage';

// Load environment variables
dotenv.config();

// Create and export the storage instance
export const storage = new DatabaseStorage();

// Export the interfaces for the storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
}

// Re-export types for convenience
export type { User, InsertUser };