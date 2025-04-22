"use strict";
/**
 * mysterion-client.ts
 *
 * Client-side API for interacting with the Mysterion AI service
 * This uses the browser vault for securing API keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysterionClient = exports.MysterionClient = void 0;
const browser_vault_1 = require("./browser-vault");
// Implementation of the Mysterion client
class MysterionClient {
    // API key management
    async addApiKey(service, key, nickname, enableTraining = true) {
        try {
            // Store the API key securely in the browser vault
            const vaultKeyId = await browser_vault_1.browserVault.storeKey(service, key);
            // Register the key with the server (without sending the actual key)
            const response = await fetch('/api/mysterion/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service,
                    nickname,
                    vaultKeyId, // Send the vault key ID instead of the actual key
                    isActive: true,
                    isTrainingEnabled: enableTraining
                })
            });
            if (!response.ok) {
                throw new Error('Failed to register API key with server');
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error adding API key:', error);
            throw error;
        }
    }
    async getApiKeys() {
        try {
            const response = await fetch('/api/mysterion/api-keys');
            if (!response.ok) {
                throw new Error('Failed to fetch API keys');
            }
            const data = await response.json();
            return data.apiKeys || [];
        }
        catch (error) {
            console.error('Error fetching API keys:', error);
            return [];
        }
    }
    async updateApiKey(keyId, updates) {
        try {
            const response = await fetch(`/api/mysterion/api-keys/${keyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                throw new Error('Failed to update API key');
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error updating API key:', error);
            throw error;
        }
    }
    async deleteApiKey(keyId) {
        try {
            // Get the vault key ID from the server
            const keys = await this.getApiKeys();
            const key = keys.find(k => k.id === keyId);
            if (!key || !key.vaultKeyId) {
                throw new Error('API key not found or missing vault key ID');
            }
            // Delete the key from the server
            const response = await fetch(`/api/mysterion/api-keys/${keyId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete API key from server');
            }
            // Delete the key from the browser vault
            await browser_vault_1.browserVault.deleteKey(key.vaultKeyId);
            return true;
        }
        catch (error) {
            console.error('Error deleting API key:', error);
            throw error;
        }
    }
    // Mysterion AI functions
    async getContributionPoints() {
        try {
            const response = await fetch('/api/mysterion/contribution');
            if (!response.ok) {
                throw new Error('Failed to fetch contribution points');
            }
            const data = await response.json();
            return data.points || 0;
        }
        catch (error) {
            console.error('Error fetching contribution points:', error);
            return 0;
        }
    }
    async generateText(prompt, options = {}) {
        try {
            // Get the first active API key
            const keys = await this.getApiKeys();
            const activeKey = keys.find(k => k.isActive);
            if (!activeKey) {
                throw new Error('No active API key found');
            }
            // Retrieve the actual API key from the vault
            let apiKey = null;
            if (activeKey.vaultKeyId) {
                apiKey = await browser_vault_1.browserVault.retrieveKey(activeKey.vaultKeyId);
            }
            if (!apiKey) {
                throw new Error('Could not retrieve API key from vault');
            }
            // Make the API request
            const response = await fetch('/api/mysterion/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // We include the key in the request, but in a production environment
                    // this would be handled differently to avoid sending the key directly
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({
                    prompt,
                    keyId: activeKey.id,
                    ...options
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate text');
            }
            const data = await response.json();
            return data.text || '';
        }
        catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    }
}
exports.MysterionClient = MysterionClient;
// Create a singleton instance
exports.mysterionClient = new MysterionClient();
exports.default = exports.mysterionClient;
