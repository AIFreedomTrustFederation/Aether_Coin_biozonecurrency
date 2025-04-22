"use strict";
/**
 * FractalNode Hosting Service
 *
 * Provides functionality for hosting webpages and content on FractalCoin node storage.
 * Implements HTTQS (HTTP Quantum Secure) protocol for secure hosting.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fractalNodeHostingService = void 0;
const httqsProtocol_1 = require("../protocols/httqsProtocol");
// Default hosting configuration
const DEFAULT_HOSTING_CONFIG = {
    domain: '',
    protocol: 'httqs',
    encryptionAlgorithm: 'hybrid',
    securityLevel: 'maximum',
    fractalSharding: {
        enabled: true,
        shards: 128,
        globalDistribution: true,
    },
    backups: {
        enabled: true,
        frequency: 'daily',
        retentionDays: 30,
    },
    ddosProtection: true,
    quantumFirewall: true,
};
/**
 * FractalNode Hosting Service Class
 */
class FractalNodeHostingService {
    constructor() {
        this.websites = new Map();
        // Try to load websites from local storage
        this.loadFromLocalStorage();
        console.log('FractalNode Hosting Service initialized');
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!FractalNodeHostingService.instance) {
            FractalNodeHostingService.instance = new FractalNodeHostingService();
        }
        return FractalNodeHostingService.instance;
    }
    /**
     * Load websites from local storage
     */
    loadFromLocalStorage() {
        try {
            const savedWebsites = localStorage.getItem('fractalNode.websites');
            if (savedWebsites) {
                const parsed = JSON.parse(savedWebsites);
                Object.entries(parsed).forEach(([domain, data]) => {
                    this.websites.set(domain, {
                        config: data.config,
                        content: data.content,
                        status: data.status
                    });
                });
            }
        }
        catch (error) {
            console.error('Error loading websites from local storage:', error);
        }
    }
    /**
     * Save websites to local storage
     */
    saveToLocalStorage() {
        try {
            const websitesObj = Object.fromEntries(this.websites.entries());
            localStorage.setItem('fractalNode.websites', JSON.stringify(websitesObj));
        }
        catch (error) {
            console.error('Error saving websites to local storage:', error);
        }
    }
    /**
     * Check if a domain is available for registration
     */
    async checkDomainAvailability(domain) {
        // Remove any protocol prefix
        domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
        // Add .trust suffix if not already present
        if (!domain.endsWith('.trust')) {
            domain += '.trust';
        }
        // Check if the domain is already registered in our system
        return !this.websites.has(domain);
    }
    /**
     * Deploy a website to FractalCoin node storage
     */
    async deployWebsite(domain, content, config = {}) {
        try {
            // Normalize domain
            domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
            if (!domain.endsWith('.trust')) {
                domain += '.trust';
            }
            // Check if domain is available
            const isAvailable = await this.checkDomainAvailability(domain);
            if (!isAvailable) {
                throw new Error(`Domain ${domain} is already registered. Please use updateWebsite instead.`);
            }
            // Create full config by merging with defaults
            const fullConfig = {
                ...DEFAULT_HOSTING_CONFIG,
                ...config,
                domain
            };
            // Simulate pushing content to FractalCoin node storage
            console.log(`Deploying website ${domain} to FractalCoin node storage...`);
            await this.simulateContentDistribution(fullConfig.fractalSharding.shards);
            // Initialize hosting status
            const hostingStatus = {
                active: true,
                domain,
                protocol: fullConfig.protocol,
                lastDeployed: new Date().toISOString(),
                shardDistribution: fullConfig.fractalSharding.shards,
                visitorCount: 0,
                uptimePercentage: 100,
                securityScore: this.calculateSecurityScore(fullConfig),
                quantumSecure: fullConfig.protocol === 'httqs',
                httpsProxyEnabled: true
            };
            // Store website data
            this.websites.set(domain, {
                config: fullConfig,
                content,
                status: hostingStatus
            });
            // Save to local storage
            this.saveToLocalStorage();
            console.log(`Website ${domain} deployed successfully`);
            return true;
        }
        catch (error) {
            console.error('Error deploying website:', error);
            return false;
        }
    }
    /**
     * Update an existing website
     */
    async updateWebsite(domain, content, config = {}) {
        try {
            // Normalize domain
            domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
            if (!domain.endsWith('.trust')) {
                domain += '.trust';
            }
            // Check if website exists
            if (!this.websites.has(domain)) {
                throw new Error(`Website for domain ${domain} does not exist. Please use deployWebsite instead.`);
            }
            // Get existing website data
            const existingData = this.websites.get(domain);
            // Merge content and config with existing data
            const updatedContent = {
                ...existingData.content,
                ...content,
                metadata: {
                    ...existingData.content.metadata,
                    ...content.metadata,
                    updatedAt: new Date().toISOString()
                }
            };
            const updatedConfig = {
                ...existingData.config,
                ...config
            };
            // Simulate updating content on FractalCoin node storage
            console.log(`Updating website ${domain} on FractalCoin node storage...`);
            await this.simulateContentDistribution(updatedConfig.fractalSharding.shards);
            // Update hosting status
            const updatedStatus = {
                ...existingData.status,
                lastDeployed: new Date().toISOString(),
                shardDistribution: updatedConfig.fractalSharding.shards,
                securityScore: this.calculateSecurityScore(updatedConfig),
                quantumSecure: updatedConfig.protocol === 'httqs',
                protocol: updatedConfig.protocol
            };
            // Update website data
            this.websites.set(domain, {
                config: updatedConfig,
                content: updatedContent,
                status: updatedStatus
            });
            // Save to local storage
            this.saveToLocalStorage();
            console.log(`Website ${domain} updated successfully`);
            return true;
        }
        catch (error) {
            console.error('Error updating website:', error);
            return false;
        }
    }
    /**
     * Get website data
     */
    getWebsite(domain) {
        // Normalize domain
        domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
        if (!domain.endsWith('.trust')) {
            domain += '.trust';
        }
        return this.websites.get(domain) || null;
    }
    /**
     * Get a list of all hosted websites
     */
    getAllWebsites() {
        return Array.from(this.websites.entries()).map(([domain, data]) => ({
            domain,
            status: data.status
        }));
    }
    /**
     * Delete a website
     */
    async deleteWebsite(domain) {
        try {
            // Normalize domain
            domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
            if (!domain.endsWith('.trust')) {
                domain += '.trust';
            }
            // Check if website exists
            if (!this.websites.has(domain)) {
                throw new Error(`Website for domain ${domain} does not exist.`);
            }
            // Simulate removing content from FractalCoin node storage
            console.log(`Removing website ${domain} from FractalCoin node storage...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Remove website data
            this.websites.delete(domain);
            // Save to local storage
            this.saveToLocalStorage();
            console.log(`Website ${domain} deleted successfully`);
            return true;
        }
        catch (error) {
            console.error('Error deleting website:', error);
            return false;
        }
    }
    /**
     * Toggle website status (active/inactive)
     */
    async toggleWebsiteStatus(domain) {
        try {
            // Normalize domain
            domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
            if (!domain.endsWith('.trust')) {
                domain += '.trust';
            }
            // Check if website exists
            if (!this.websites.has(domain)) {
                throw new Error(`Website for domain ${domain} does not exist.`);
            }
            // Get existing website data
            const existingData = this.websites.get(domain);
            // Toggle active status
            const updatedStatus = {
                ...existingData.status,
                active: !existingData.status.active
            };
            // Update website data
            this.websites.set(domain, {
                ...existingData,
                status: updatedStatus
            });
            // Save to local storage
            this.saveToLocalStorage();
            console.log(`Website ${domain} ${updatedStatus.active ? 'activated' : 'deactivated'} successfully`);
            return true;
        }
        catch (error) {
            console.error('Error toggling website status:', error);
            return false;
        }
    }
    /**
     * Get website security verification
     */
    async verifyWebsiteSecurity(domain) {
        try {
            // Normalize domain
            domain = domain.replace(/^(https?:\/\/)|(httqs:\/\/)/i, '');
            if (!domain.endsWith('.trust')) {
                domain += '.trust';
            }
            // Check if website exists
            if (!this.websites.has(domain)) {
                throw new Error(`Website for domain ${domain} does not exist.`);
            }
            // Get existing website data
            const existingData = this.websites.get(domain);
            // Only HTTQS protocol supports quantum security verification
            if (existingData.config.protocol !== 'httqs') {
                console.warn(`Website ${domain} is not using HTTQS protocol, cannot perform quantum security verification`);
                return null;
            }
            // Create HTTQS protocol instance
            const httqsProtocol = (0, httqsProtocol_1.createHTTQSProtocol)({
                url: `httqs://${domain}`,
                config: {
                    algorithm: existingData.config.encryptionAlgorithm,
                    fractalShards: existingData.config.fractalSharding.shards
                }
            });
            // Connect to the website using HTTQS
            await httqsProtocol.connect();
            // Get verification status
            const verificationStatus = httqsProtocol.getVerificationStatus();
            return verificationStatus;
        }
        catch (error) {
            console.error('Error verifying website security:', error);
            return null;
        }
    }
    /**
     * Calculate security score based on hosting configuration
     */
    calculateSecurityScore(config) {
        let score = 0;
        // Protocol score
        score += config.protocol === 'httqs' ? 25 : 15;
        // Encryption algorithm score
        switch (config.encryptionAlgorithm) {
            case 'hybrid':
                score += 25;
                break;
            case 'sphincs':
                score += 20;
                break;
            case 'kyber':
            case 'falcon':
                score += 15;
                break;
        }
        // Fractal sharding score
        if (config.fractalSharding.enabled) {
            score += 10;
            score += Math.min(10, config.fractalSharding.shards / 32);
            score += config.fractalSharding.globalDistribution ? 5 : 0;
        }
        // Backup score
        if (config.backups.enabled) {
            score += 5;
            score += config.backups.frequency === 'hourly' ? 5 : (config.backups.frequency === 'daily' ? 3 : 1);
        }
        // Protection features score
        score += config.ddosProtection ? 5 : 0;
        score += config.quantumFirewall ? 5 : 0;
        // Cap at 100
        return Math.min(100, score);
    }
    /**
     * Simulate content distribution to FractalCoin node storage
     */
    async simulateContentDistribution(shards) {
        // Simulate the time it takes to distribute content to nodes
        const distributionTime = 500 + (shards * 5);
        await new Promise(resolve => setTimeout(resolve, distributionTime));
        // Log shard distribution
        console.log(`Content distributed to ${shards} fractal shards`);
    }
}
// Export singleton instance
exports.fractalNodeHostingService = FractalNodeHostingService.getInstance();
