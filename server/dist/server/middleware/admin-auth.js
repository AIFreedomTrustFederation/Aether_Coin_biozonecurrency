"use strict";
/**
 * Admin Authentication Middleware
 *
 * This middleware ensures that only AI Freedom Trust admin members
 * can access admin-specific API routes and functionality.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminPrivilege = exports.requireAdmin = void 0;
const fixed_storage_1 = require("../fixed-storage");
/**
 * Middleware to require admin privilege
 *
 * This middleware checks if the user is authenticated, is a Trust member,
 * and has the 'admin' role. It also verifies quantum authentication.
 */
const requireAdmin = async (req, res, next) => {
    try {
        const authReq = req;
        // Check if authenticated
        if (!authReq.session || !authReq.session.isAuthenticated) {
            return res.status(401).json({
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }
        const userId = authReq.session.userId;
        const user = await fixed_storage_1.storage.getUserById(userId);
        if (!user) {
            return res.status(401).json({
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        // Check if the user is a Trust member
        if (!user.isTrustMember) {
            return res.status(403).json({
                message: 'AI Freedom Trust membership required for admin access',
                code: 'TRUST_MEMBERSHIP_REQUIRED'
            });
        }
        // Check if the user has admin role
        if (user.role !== 'admin' && user.role !== 'super_admin') {
            return res.status(403).json({
                message: 'Admin role required',
                code: 'ADMIN_ROLE_REQUIRED'
            });
        }
        // Check if the user has quantum authentication
        if (!authReq.session.isQuantumAuthenticated) {
            return res.status(403).json({
                message: 'Quantum authentication required for admin actions',
                code: 'QUANTUM_AUTH_REQUIRED'
            });
        }
        // User is a verified admin, allow access
        next();
    }
    catch (error) {
        console.error('Error in admin authentication middleware:', error);
        return res.status(500).json({
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    }
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware to check if user has admin privileges
 * This middleware doesn't block the request, just adds isAdmin flag
 */
const checkAdminPrivilege = async (req, res, next) => {
    try {
        const authReq = req;
        // Set default as not admin
        authReq.session = authReq.session || { userId: 0, isAuthenticated: false };
        authReq.session.isAdmin = false;
        // Skip check if not authenticated
        if (!authReq.session.isAuthenticated) {
            return next();
        }
        const userId = authReq.session.userId;
        const user = await fixed_storage_1.storage.getUserById(userId);
        if (user &&
            user.isTrustMember &&
            (user.role === 'admin' || user.role === 'super_admin') &&
            authReq.session.isQuantumAuthenticated) {
            // Set admin flag if all conditions are met
            authReq.session.isAdmin = true;
        }
        next();
    }
    catch (error) {
        console.error('Error checking admin privilege:', error);
        next();
    }
};
exports.checkAdminPrivilege = checkAdminPrivilege;
