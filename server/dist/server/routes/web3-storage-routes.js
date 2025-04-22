"use strict";
/**
 * Web3 Storage Routes
 *
 * Routes for managing Web3.Storage API tokens and IPFS functionality
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ipfs_service_1 = require("../services/ipfs-service");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
/**
 * Generate a temporary demo token for Web3.Storage
 * This is for testing/demo purposes only and should be replaced
 * with proper authentication in production
 */
router.post('/generate-token', async (req, res) => {
    try {
        // In a real implementation, you would integrate with Web3.Storage API
        // Here we're generating a mock token for demonstration
        const token = `web3_storage_demo_${crypto_1.default.randomBytes(16).toString('hex')}`;
        res.status(200).json({
            success: true,
            token,
            message: 'Demo token generated. Replace with a real token in production.',
            expiresIn: '24h'
        });
    }
    catch (error) {
        console.error('Error generating Web3.Storage token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate token'
        });
    }
});
/**
 * Set Web3.Storage token in environment
 * In production, this should be secured with proper authentication and
 * use environment management services rather than writing to the .env file
 */
router.post('/configure', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }
        // Update environment variable
        process.env.WEB3_STORAGE_TOKEN = token;
        // For persistence between restarts, we can update the .env file
        // Note: This is a simplified approach for demonstration purposes
        const envPath = path_1.default.resolve(process.cwd(), '.env');
        let envContent = '';
        try {
            // Read existing .env file if it exists
            envContent = fs_1.default.readFileSync(envPath, 'utf8');
        }
        catch (err) {
            // If file doesn't exist, create it
            envContent = '';
        }
        // Check if WEB3_STORAGE_TOKEN already exists in the file
        const tokenRegex = /WEB3_STORAGE_TOKEN=.*/;
        const newEnvVar = `WEB3_STORAGE_TOKEN=${token}`;
        if (tokenRegex.test(envContent)) {
            // Replace existing token
            envContent = envContent.replace(tokenRegex, newEnvVar);
        }
        else {
            // Add new token
            envContent += envContent.endsWith('\n') ? newEnvVar : '\n' + newEnvVar;
        }
        // Write back to .env file
        fs_1.default.writeFileSync(envPath, envContent);
        // Reinitialize environment variables
        dotenv_1.default.config();
        // Reconfigure IPFS service (this would need to be implemented in the service)
        // We're checking if the ipfsService has a reconfigure method first
        if (typeof ipfs_service_1.ipfsService.configure === 'function') {
            ipfs_service_1.ipfsService.configure();
        }
        res.status(200).json({
            success: true,
            message: 'Web3.Storage token configured successfully'
        });
    }
    catch (error) {
        console.error('Error configuring Web3.Storage token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to configure Web3.Storage token'
        });
    }
});
/**
 * Get current Web3.Storage configuration status
 */
router.get('/status', (req, res) => {
    try {
        const isConfigured = !!process.env.WEB3_STORAGE_TOKEN;
        res.status(200).json({
            success: true,
            isConfigured,
            message: isConfigured
                ? 'Web3.Storage is configured with a token'
                : 'Web3.Storage is not configured'
        });
    }
    catch (error) {
        console.error('Error checking Web3.Storage configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check Web3.Storage configuration'
        });
    }
});
/**
 * Remove configured Web3.Storage token
 */
router.post('/reset', (req, res) => {
    try {
        // Remove from environment variables
        delete process.env.WEB3_STORAGE_TOKEN;
        // Update .env file
        const envPath = path_1.default.resolve(process.cwd(), '.env');
        let envContent = '';
        try {
            // Read existing .env file
            envContent = fs_1.default.readFileSync(envPath, 'utf8');
            // Remove the token line
            const tokenRegex = /WEB3_STORAGE_TOKEN=.*/;
            envContent = envContent.replace(tokenRegex, '');
            // Clean up any double newlines
            envContent = envContent.replace(/\n\n+/g, '\n');
            // Write back to file
            fs_1.default.writeFileSync(envPath, envContent);
        }
        catch (err) {
            console.error('Error updating .env file:', err);
            // Non-blocking error
        }
        // Reset IPFS service config
        if (typeof ipfs_service_1.ipfsService.configure === 'function') {
            ipfs_service_1.ipfsService.configure();
        }
        res.status(200).json({
            success: true,
            message: 'Web3.Storage configuration reset successfully'
        });
    }
    catch (error) {
        console.error('Error resetting Web3.Storage configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset Web3.Storage configuration'
        });
    }
});
exports.default = router;
