"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fixed_storage_1 = require("../fixed-storage");
const admin_auth_1 = require("../middleware/admin-auth");
const router = express_1.default.Router();
/**
 * Create authentication routes
 */
function createAuthRoutes() {
    // Login route
    router.post('/login', async (req, res) => {
        try {
            // Validate login request body
            const loginSchema = zod_1.z.object({
                username: zod_1.z.string().min(3),
                password: zod_1.z.string().min(6),
            });
            const result = loginSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: 'Invalid request data',
                    errors: result.error.issues
                });
            }
            const { username, password } = result.data;
            // Find user by username
            const user = await fixed_storage_1.storage.getUserByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            // Verify password
            const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!passwordValid) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
            }
            // Set up session
            const authReq = req;
            authReq.session.userId = user.id;
            authReq.session.isAuthenticated = true;
            // Update last login time
            await fixed_storage_1.storage.updateUserLastLogin(user.id);
            // Send user data (excluding sensitive information)
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isTrustMember: user.isTrustMember,
                trustMemberSince: user.trustMemberSince,
                trustMemberLevel: user.trustMemberLevel,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
                isActive: user.isActive,
            };
            return res.status(200).json({
                message: 'Login successful',
                user: safeUser
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
    // Logout route
    router.post('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logout successful' });
        });
    });
    // Get current user route
    router.get('/current-user', async (req, res) => {
        try {
            const authReq = req;
            // Check if user is authenticated via session
            if (!authReq.session || !authReq.session.isAuthenticated) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const userId = authReq.session.userId;
            const user = await fixed_storage_1.storage.getUserById(userId);
            if (!user) {
                // Clear invalid session
                authReq.session.destroy((err) => {
                    if (err)
                        console.error('Error destroying invalid session:', err);
                });
                return res.status(401).json({ message: 'User not found' });
            }
            // Return user data without sensitive information
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isTrustMember: user.isTrustMember,
                trustMemberSince: user.trustMemberSince,
                trustMemberLevel: user.trustMemberLevel,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
                isActive: user.isActive,
            };
            return res.status(200).json({ user: safeUser });
        }
        catch (error) {
            console.error('Error getting current user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
    // Middleware to protect routes requiring authentication
    const requireAuth = (req, res, next) => {
        const authReq = req;
        if (!authReq.session || !authReq.session.isAuthenticated) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        next();
    };
    // Middleware to protect routes requiring trust membership
    const requireTrustMember = async (req, res, next) => {
        try {
            const authReq = req;
            // First check if authenticated
            if (!authReq.session || !authReq.session.isAuthenticated) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            const userId = authReq.session.userId;
            const user = await fixed_storage_1.storage.getUserById(userId);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            if (!user.isTrustMember) {
                return res.status(403).json({ message: 'Trust membership required' });
            }
            next();
        }
        catch (error) {
            console.error('Error in trust member middleware:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
    // Example protected route requiring trust membership
    router.get('/trust-data', requireTrustMember, (req, res) => {
        res.status(200).json({
            message: 'This data is only available to trust members',
            // Add trust-specific data here 
        });
    });
    // Check if user has admin privileges
    router.get('/check-admin', requireAuth, admin_auth_1.checkAdminPrivilege, (req, res) => {
        const authReq = req; // using any to avoid type issues with session.isAdmin
        res.status(200).json({
            isAdmin: authReq.session?.isAdmin || false,
        });
    });
    return router;
}
exports.default = createAuthRoutes;
