"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = authenticateUser;
exports.isTrustMember = isTrustMember;
exports.hasAdminPermission = hasAdminPermission;
exports.requireAuth = requireAuth;
exports.requireTrustMember = requireTrustMember;
const db_1 = require("../db");
const schema_1 = require("../../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Middleware to authenticate users based on session data
 */
function authenticateUser(req, res, next) {
    // Check if there's a user in the session
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    // Get user ID from session
    const userId = req.session.userId;
    // Set user object on request for use in routes
    if (req.session.user) {
        req.user = req.session.user;
        return next();
    }
    // If we don't have the user object in session, fetch from DB
    db_1.db.select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
        .then(result => {
        if (result.length === 0) {
            // User not found, clear session
            req.session.destroy((err) => {
                if (err)
                    console.error('Session destruction error:', err);
            });
            return res.status(401).json({ message: 'User not found' });
        }
        const user = result[0];
        // Set user object on request and in session for future requests
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email || '',
            name: user.name || undefined,
            isTrustMember: !!user.isTrustMember,
            role: user.role || undefined
        };
        req.session.user = req.user;
        next();
    })
        .catch(error => {
        console.error('Authentication middleware error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    });
}
/**
 * Middleware to check if user is a trust member
 */
function isTrustMember(req, res, next) {
    // First, ensure the user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    // Check if the user is a trust member
    if (!req.user.isTrustMember) {
        return res.status(403).json({
            message: 'Access denied. You must be a member of the AI Freedom Trust to access this resource.'
        });
    }
    next();
}
/**
 * Middleware to check if user has admin permission
 * @param permissionName Name of the permission to check
 */
function hasAdminPermission(permissionName) {
    return async (req, res, next) => {
        // First, ensure the user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        try {
            // Check if the user has the required admin permission
            const permissions = await db_1.db.select()
                .from(schema_1.adminPermissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.adminPermissions.userId, req.user.id), (0, drizzle_orm_1.eq)(schema_1.adminPermissions.permissionName, permissionName), (0, drizzle_orm_1.eq)(schema_1.adminPermissions.isActive, true)));
            if (permissions.length === 0) {
                return res.status(403).json({
                    message: `Access denied. You need the '${permissionName}' permission to access this resource.`
                });
            }
            next();
        }
        catch (error) {
            console.error('Admin permission middleware error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    };
}
/**
 * Middleware that requires authentication to access a route
 * This is a simple wrapper around authenticateUser that can be used in routes
 */
function requireAuth(req, res, next) {
    // Check if there's a user in the session
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    // If user is already set on request, proceed
    if (req.user) {
        return next();
    }
    // Otherwise, authenticate the user
    authenticateUser(req, res, next);
}
/**
 * Middleware that requires both authentication and trust member status
 * Use this for routes that should only be accessible to trust members
 */
function requireTrustMember(req, res, next) {
    // First check authentication
    requireAuth(req, res, (err) => {
        if (err)
            return next(err);
        // Then check if user is a trust member
        isTrustMember(req, res, next);
    });
}
