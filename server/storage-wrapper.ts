/**
 * StorageWrapper
 * 
 * This class provides a wrapper around the storage interface to make it easy to use.
 * It has methods that match those needed by services like LlmApiService.
 */

import { storage, IStorage } from './storage';
import { User } from '../shared/schema-proxy';

export class StorageWrapper {
  private storage: IStorage;

  constructor() {
    this.storage = storage;
  }

  /**
   * Get a user by ID
   * @param id User ID
   * @returns User object or undefined if not found
   */
  async getUserById(id: number): Promise<User | undefined> {
    return this.storage.getUserById(id);
  }

  /**
   * Get a user by username
   * @param username Username
   * @returns User object or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.storage.getUserByUsername(username);
  }

  /**
   * Update the last login timestamp for a user
   * @param id User ID
   * @returns Updated user object or undefined if not found
   */
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    return this.storage.updateUserLastLogin(id);
  }
}