"use strict";
/**
 * Database Storage Implementation
 *
 * This class provides a database implementation of the IStorage interface
 * using Drizzle ORM and PostgreSQL.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseStorage = exports.DatabaseStorage = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const schema_proxy_1 = require("@shared/schema-proxy");
/**
 * DatabaseStorage implements IStorage using PostgreSQL through Drizzle ORM
 * This replaces the MemStorage implementation with a persistent database
 */
class DatabaseStorage {
    /**
     * Get a user by ID
     * @param id User ID
     * @returns User or undefined if not found
     */
    async getUser(id) {
        const [user] = await db_1.db.select()
            .from(schema_proxy_1.users)
            .where((0, drizzle_orm_1.eq)(schema_proxy_1.users.id, id));
        return user;
    }
    /**
     * Get a user by username
     * @param username Username to look up
     * @returns User or undefined if not found
     */
    async getUserByUsername(username) {
        const [user] = await db_1.db.select()
            .from(schema_proxy_1.users)
            .where((0, drizzle_orm_1.eq)(schema_proxy_1.users.username, username));
        return user;
    }
    /**
     * Create a new user
     * @param insertUser User data to insert
     * @returns The created user
     */
    async createUser(insertUser) {
        const [user] = await db_1.db
            .insert(schema_proxy_1.users)
            .values(insertUser)
            .returning();
        return user;
    }
}
exports.DatabaseStorage = DatabaseStorage;
// Create and export a singleton instance
exports.databaseStorage = new DatabaseStorage();
