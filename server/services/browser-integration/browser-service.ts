/**
 * Browser Integration Service
 * This service handles integration with Brave and Chromium browsers,
 * including user settings, extension management, and sandbox environments.
 */

import { db } from '../../storage';
import { browserUsers, sandboxEnvironments, userDapps } from '../../../shared/dapp-schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Interface for browser settings
interface BrowserSettings {
  defaultChain: string;
  privacyMode: 'standard' | 'enhanced' | 'maximum';
  ipfs: {
    enabled: boolean;
    gateway: string;
  };
  web3: {
    enabled: boolean;
    nodeUrl: string;
    autoConnect: boolean;
  };
  browserType: 'brave' | 'chromium' | 'integrated';
  uiTheme: 'light' | 'dark' | 'system';
}

// Interface for sandbox configuration
interface SandboxConfig {
  resources: {
    memory: number; // MB
    cpu: number; // Cores
    storage: number; // MB
  };
  network: {
    type: 'mainnet' | 'testnet' | 'local';
    chainId?: number;
    nodeUrl?: string;
  };
  runtime: {
    timeout: number; // Minutes
    permissions: string[];
  };
}

export class BrowserService {
  /**
   * Create or update a user's browser settings
   * @param userId User ID
   * @param browserType Browser type
   * @param settings Browser settings
   * @returns Updated browser user record
   */
  async saveUserSettings(
    userId: number,
    browserType: 'brave' | 'chromium' | 'integrated',
    settings: Partial<BrowserSettings>
  ): Promise<any> {
    try {
      // Check if user already has settings
      const existingSettings = await db.query.browserUsers.findFirst({
        where: eq(browserUsers.userId, userId)
      });
      
      if (existingSettings) {
        // Update existing settings
        const mergedSettings = {
          ...existingSettings.settings,
          ...settings
        };
        
        const updatedUser = await db
          .update(browserUsers)
          .set({
            browserType,
            settings: mergedSettings,
            updatedAt: new Date()
          })
          .where(eq(browserUsers.userId, userId))
          .returning();
        
        return updatedUser[0];
      } else {
        // Create new settings with defaults
        const defaultSettings: BrowserSettings = {
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
        
        const newUser = await db
          .insert(browserUsers)
          .values({
            userId,
            browserType,
            settings: mergedSettings,
            syncEnabled: false
          })
          .returning();
        
        return newUser[0];
      }
    } catch (error) {
      console.error("Error saving browser settings:", error);
      throw error;
    }
  }

  /**
   * Get a user's browser settings
   * @param userId User ID
   * @returns Browser settings
   */
  async getUserSettings(userId: number): Promise<any> {
    try {
      return await db.query.browserUsers.findFirst({
        where: eq(browserUsers.userId, userId)
      });
    } catch (error) {
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
  async createSandbox(
    userId: number,
    dappId: number,
    environmentType: 'development' | 'testing' | 'demo',
    config: SandboxConfig
  ): Promise<any> {
    try {
      // Verify the user has access to this DApp
      const dapp = await db.query.userDapps.findFirst({
        where: and(
          eq(userDapps.id, dappId),
          eq(userDapps.userId, userId)
        )
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
      const sandboxId = crypto.randomBytes(8).toString('hex');
      const endpoints = {
        http: `https://sandbox-${sandboxId}.aetherion.net`,
        ws: `wss://sandbox-${sandboxId}.aetherion.net/ws`
      };
      
      // Create the sandbox
      const sandbox = await db
        .insert(sandboxEnvironments)
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
        await db
          .update(sandboxEnvironments)
          .set({
            status: 'running',
            updatedAt: new Date()
          })
          .where(eq(sandboxEnvironments.id, sandbox[0].id));
          
        // And simulate shutting it down when it expires
        const timeUntilExpiry = expiresAt.getTime() - Date.now();
        setTimeout(async () => {
          await db
            .update(sandboxEnvironments)
            .set({
              status: 'stopped',
              updatedAt: new Date()
            })
            .where(eq(sandboxEnvironments.id, sandbox[0].id));
        }, timeUntilExpiry);
      }, 5000); // Simulate 5 seconds to start
      
      return sandbox[0];
    } catch (error) {
      console.error("Error creating sandbox:", error);
      throw error;
    }
  }

  /**
   * Get all sandbox environments for a user
   * @param userId User ID
   * @returns Array of sandbox environments
   */
  async getUserSandboxes(userId: number): Promise<any[]> {
    try {
      return await db.query.sandboxEnvironments.findMany({
        where: eq(sandboxEnvironments.userId, userId),
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
    } catch (error) {
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
  async stopSandbox(userId: number, sandboxId: number): Promise<any> {
    try {
      // Verify the user owns this sandbox
      const sandbox = await db.query.sandboxEnvironments.findFirst({
        where: and(
          eq(sandboxEnvironments.id, sandboxId),
          eq(sandboxEnvironments.userId, userId)
        )
      });
      
      if (!sandbox) {
        throw new Error('Sandbox not found or you do not have permission');
      }
      
      if (sandbox.status !== 'running') {
        throw new Error('Sandbox is not running');
      }
      
      // Update the sandbox status
      const updatedSandbox = await db
        .update(sandboxEnvironments)
        .set({
          status: 'stopped',
          updatedAt: new Date()
        })
        .where(eq(sandboxEnvironments.id, sandboxId))
        .returning();
        
      // In a real implementation, we would actually stop the sandbox container here
      
      return updatedSandbox[0];
    } catch (error) {
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
  async updateExtensions(
    userId: number,
    extensions: Array<{id: string; name: string; version: string; enabled: boolean}>
  ): Promise<any> {
    try {
      const user = await db.query.browserUsers.findFirst({
        where: eq(browserUsers.userId, userId)
      });
      
      if (!user) {
        throw new Error('User browser settings not found');
      }
      
      // Merge with existing extensions
      const existingExtensions = user.installedExtensions || [];
      const mergedExtensions = [...existingExtensions];
      
      extensions.forEach(newExt => {
        const existingIndex = mergedExtensions.findIndex(
          (ext: any) => ext.id === newExt.id
        );
        
        if (existingIndex >= 0) {
          // Update existing extension
          mergedExtensions[existingIndex] = newExt;
        } else {
          // Add new extension
          mergedExtensions.push(newExt);
        }
      });
      
      // Update the user record
      const updatedUser = await db
        .update(browserUsers)
        .set({
          installedExtensions: mergedExtensions,
          updatedAt: new Date()
        })
        .where(eq(browserUsers.userId, userId))
        .returning();
        
      return updatedUser[0];
    } catch (error) {
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
  async toggleSync(userId: number, enabled: boolean): Promise<any> {
    try {
      const user = await db.query.browserUsers.findFirst({
        where: eq(browserUsers.userId, userId)
      });
      
      if (!user) {
        throw new Error('User browser settings not found');
      }
      
      const updatedUser = await db
        .update(browserUsers)
        .set({
          syncEnabled: enabled,
          lastSync: enabled ? new Date() : user.lastSync,
          updatedAt: new Date()
        })
        .where(eq(browserUsers.userId, userId))
        .returning();
        
      return updatedUser[0];
    } catch (error) {
      console.error("Error toggling sync:", error);
      throw error;
    }
  }
}

export default new BrowserService();