"use strict";
/**
 * Browser Integration Service
 * This service handles integration with Brave and Chromium browsers,
 * including user settings, extension management, and sandbox environments.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserService = void 0;
const storage_1 = require("../../storage");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
class BrowserService {
    /**
     * Create or update a user's browser settings
     * @param userId User ID
     * @param browserType Browser type
     * @param settings Browser settings
     * @returns Updated browser user record
     */
    async saveUserSettings(userId, browserType, settings) {
        try {
            // Check if user already has settings
            const existingSettings = await storage_1.db.query.browserUsers.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId)
            });
            if (existingSettings) {
                // Update existing settings
                const mergedSettings = {
                    ...existingSettings.settings,
                    ...settings
                };
                const updatedUser = await storage_1.db
                    .update(dapp_schema_1.browserUsers)
                    .set({
                    browserType,
                    settings: mergedSettings,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId))
                    .returning();
                return updatedUser[0];
            }
            else {
                // Create new settings with defaults
                const defaultSettings = {
                    defaultChain: 'ethereum',
                    privacyMode: 'standard',
                    ipfs: {
                        enabled: true,
                        gateway: 'https://ipfs.io/ipfs/'
                    },
                    web3: {
                        enabled: true,
                        nodeUrl: '',
                        autoConnect: false
                    },
                    browserType,
                    uiTheme: 'system'
                };
                const mergedSettings = {
                    ...defaultSettings,
                    ...settings
                };
                const newUser = await storage_1.db
                    .insert(dapp_schema_1.browserUsers)
                    .values({
                    userId,
                    browserType,
                    settings: mergedSettings,
                    syncEnabled: false
                })
                    .returning();
                return newUser[0];
            }
        }
        catch (error) {
            console.error("Error saving browser settings:", error);
            throw error;
        }
    }
    /**
     * Get a user's browser settings
     * @param userId User ID
     * @returns Browser settings
     */
    async getUserSettings(userId) {
        try {
            return await storage_1.db.query.browserUsers.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId)
            });
        }
        catch (error) {
            console.error("Error getting browser settings:", error);
            return null;
        }
    }
    /**
     * Create a new sandbox environment for testing DApps
     * @param userId User ID
     * @param dappId DApp ID
     * @param environmentType Type of environment
     * @param config Sandbox configuration
     * @returns Created sandbox environment
     */
    async createSandbox(userId, dappId, environmentType, config) {
        try {
            // Verify the user has access to this DApp
            const dapp = await storage_1.db.query.userDapps.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId), (0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId))
            });
            if (!dapp) {
                throw new Error('You do not have access to this DApp');
            }
            // Calculate expiration time (default: 1 hour)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            // Modify timeout if specified in config
            if (config.runtime?.timeout) {
                expiresAt.setMinutes(expiresAt.getMinutes() + config.runtime.timeout);
            }
            // Generate endpoints
            const sandboxId = crypto_1.default.randomBytes(8).toString('hex');
            const endpoints = {
                http: `https://sandbox-${sandboxId}.aetherion.net`,
                ws: `wss://sandbox-${sandboxId}.aetherion.net/ws`
            };
            // Create the sandbox
            const sandbox = await storage_1.db
                .insert(dapp_schema_1.sandboxEnvironments)
                .values({
                userId,
                userDappId: dappId,
                environmentType,
                status: 'starting',
                configuration: config,
                endpoints,
                expiresAt
            })
                .returning();
            // In a real implementation, we would spin up the actual sandbox environment here
            // For now, we'll simulate it with a setTimeout
            setTimeout(async () => {
                await storage_1.db
                    .update(dapp_schema_1.sandboxEnvironments)
                    .set({
                    status: 'running',
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.sandboxEnvironments.id, sandbox[0].id));
                // And simulate shutting it down when it expires
                const timeUntilExpiry = expiresAt.getTime() - Date.now();
                setTimeout(async () => {
                    await storage_1.db
                        .update(dapp_schema_1.sandboxEnvironments)
                        .set({
                        status: 'stopped',
                        updatedAt: new Date()
                    })
                        .where((0, drizzle_orm_1.eq)(dapp_schema_1.sandboxEnvironments.id, sandbox[0].id));
                }, timeUntilExpiry);
            }, 5000); // Simulate 5 seconds to start
            return sandbox[0];
        }
        catch (error) {
            console.error("Error creating sandbox:", error);
            throw error;
        }
    }
    /**
     * Get all sandbox environments for a user
     * @param userId User ID
     * @returns Array of sandbox environments
     */
    async getUserSandboxes(userId) {
        try {
            return await storage_1.db.query.sandboxEnvironments.findMany({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.sandboxEnvironments.userId, userId),
                with: {
                    dapp: true
                },
                orderBy: (sandboxes) => [
                    sandboxes.createdAt,
                    {
                        column: sandboxes.status,
                        order: 'asc'
                    }
                ]
            });
        }
        catch (error) {
            console.error("Error getting user sandboxes:", error);
            return [];
        }
    }
    /**
     * Stop a running sandbox environment
     * @param userId User ID
     * @param sandboxId Sandbox ID
     * @returns Updated sandbox environment
     */
    async stopSandbox(userId, sandboxId) {
        try {
            // Verify the user owns this sandbox
            const sandbox = await storage_1.db.query.sandboxEnvironments.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.sandboxEnvironments.id, sandboxId), (0, drizzle_orm_1.eq)(dapp_schema_1.sandboxEnvironments.userId, userId))
            });
            if (!sandbox) {
                throw new Error('Sandbox not found or you do not have permission');
            }
            if (sandbox.status !== 'running') {
                throw new Error('Sandbox is not running');
            }
            // Update the sandbox status
            const updatedSandbox = await storage_1.db
                .update(dapp_schema_1.sandboxEnvironments)
                .set({
                status: 'stopped',
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.sandboxEnvironments.id, sandboxId))
                .returning();
            // In a real implementation, we would actually stop the sandbox container here
            return updatedSandbox[0];
        }
        catch (error) {
            console.error("Error stopping sandbox:", error);
            throw error;
        }
    }
    /**
     * Install or update browser extensions
     * @param userId User ID
     * @param extensions Array of extension IDs and versions
     * @returns Updated browser user record
     */
    async updateExtensions(userId, extensions) {
        try {
            const user = await storage_1.db.query.browserUsers.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId)
            });
            if (!user) {
                throw new Error('User browser settings not found');
            }
            // Merge with existing extensions
            const existingExtensions = user.installedExtensions || [];
            const mergedExtensions = [...existingExtensions];
            extensions.forEach(newExt => {
                const existingIndex = mergedExtensions.findIndex((ext) => ext.id === newExt.id);
                if (existingIndex >= 0) {
                    // Update existing extension
                    mergedExtensions[existingIndex] = newExt;
                }
                else {
                    // Add new extension
                    mergedExtensions.push(newExt);
                }
            });
            // Update the user record
            const updatedUser = await storage_1.db
                .update(dapp_schema_1.browserUsers)
                .set({
                installedExtensions: mergedExtensions,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId))
                .returning();
            return updatedUser[0];
        }
        catch (error) {
            console.error("Error updating extensions:", error);
            throw error;
        }
    }
    /**
     * Enable or disable browser sync
     * @param userId User ID
     * @param enabled Whether sync should be enabled
     * @returns Updated browser user record
     */
    async toggleSync(userId, enabled) {
        try {
            const user = await storage_1.db.query.browserUsers.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId)
            });
            if (!user) {
                throw new Error('User browser settings not found');
            }
            const updatedUser = await storage_1.db
                .update(dapp_schema_1.browserUsers)
                .set({
                syncEnabled: enabled,
                lastSync: enabled ? new Date() : user.lastSync,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.browserUsers.userId, userId))
                .returning();
            return updatedUser[0];
        }
        catch (error) {
            console.error("Error toggling sync:", error);
            throw error;
        }
    }
}
exports.BrowserService = BrowserService;
exports.default = new BrowserService();
