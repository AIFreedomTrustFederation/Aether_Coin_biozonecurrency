"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const auth_1 = require("../middleware/auth");
const domain_hosting_service_1 = require("../services/domain-hosting-service");
const schema_1 = require("../../shared/schema");
// Setup router
const router = (0, express_1.Router)();
// Setup temporary storage for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        // Create a unique temporary directory for each upload
        const uniqueDir = path_1.default.join(os_1.default.tmpdir(), `fractalcoin-upload-${Date.now()}`);
        fs_1.default.mkdirSync(uniqueDir, { recursive: true });
        cb(null, uniqueDir);
    },
    filename: (_req, file, cb) => {
        // Preserve original filename
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
// Validation schemas
const createDomainSchema = zod_1.z.object({
    domainName: zod_1.z.string().min(3).max(255),
    domainType: zod_1.z.enum(['standard', 'premium', 'enterprise']).default('standard'),
    nameservers: zod_1.z.array(zod_1.z.string()).optional(),
    ensRegistered: zod_1.z.boolean().optional(),
    expiresAt: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    autoRenew: zod_1.z.boolean().optional()
});
const allocateStorageSchema = zod_1.z.object({
    storageBytes: zod_1.z.number().int().positive().optional(),
    nodeCount: zod_1.z.number().int().positive().min(1).max(10).optional()
});
// Routes
/**
 * Get all domains for the logged in user
 */
router.get('/domains', auth_1.authenticateUser, async (req, res) => {
    try {
        const domains = await (0, domain_hosting_service_1.getUserDomains)(req.user.id);
        res.json({ domains });
    }
    catch (error) {
        console.error('Error fetching domains:', error);
        res.status(500).json({ error: 'Failed to fetch domains', message: error.message });
    }
});
/**
 * Create a new domain
 */
router.post('/domains', auth_1.authenticateUser, async (req, res) => {
    try {
        const validatedData = createDomainSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({ error: 'Invalid domain data', issues: validatedData.error.issues });
        }
        const domainData = schema_1.insertDomainConfigurationSchema.parse({
            ...validatedData.data,
            active: true,
            paymentStatus: 'pending'
        });
        const domain = await (0, domain_hosting_service_1.createDomain)(req.user.id, domainData);
        res.status(201).json({ domain });
    }
    catch (error) {
        console.error('Error creating domain:', error);
        res.status(500).json({ error: 'Failed to create domain', message: error.message });
    }
});
/**
 * Get domain details
 */
router.get('/domains/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const domainId = parseInt(req.params.id, 10);
        if (isNaN(domainId)) {
            return res.status(400).json({ error: 'Invalid domain ID' });
        }
        const domain = await (0, domain_hosting_service_1.getDomainById)(domainId);
        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }
        // Check if user owns this domain
        if (domain.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to access this domain' });
        }
        // Get additional domain information
        const allocation = await (0, domain_hosting_service_1.getActiveAllocation)(domainId);
        const deployments = await (0, domain_hosting_service_1.getDomainDeployments)(domainId);
        res.json({
            domain,
            storage: allocation,
            deployments
        });
    }
    catch (error) {
        console.error('Error fetching domain:', error);
        res.status(500).json({ error: 'Failed to fetch domain details', message: error.message });
    }
});
/**
 * Allocate storage for a domain
 */
router.post('/domains/:id/allocate', auth_1.authenticateUser, async (req, res) => {
    try {
        const domainId = parseInt(req.params.id, 10);
        if (isNaN(domainId)) {
            return res.status(400).json({ error: 'Invalid domain ID' });
        }
        const domain = await (0, domain_hosting_service_1.getDomainById)(domainId);
        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }
        // Check if user owns this domain
        if (domain.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to modify this domain' });
        }
        const validatedData = allocateStorageSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({ error: 'Invalid allocation data', issues: validatedData.error.issues });
        }
        const { storageBytes, nodeCount } = validatedData.data;
        const allocation = await (0, domain_hosting_service_1.allocateStorage)(domainId, req.user.id, storageBytes, nodeCount);
        res.json({ allocation });
    }
    catch (error) {
        console.error('Error allocating storage:', error);
        res.status(500).json({ error: 'Failed to allocate storage', message: error.message });
    }
});
/**
 * Deploy website to a domain (file upload)
 */
router.post('/domains/:id/deploy', auth_1.authenticateUser, upload.array('files'), async (req, res) => {
    let uploadDir = null;
    try {
        const domainId = parseInt(req.params.id, 10);
        if (isNaN(domainId)) {
            return res.status(400).json({ error: 'Invalid domain ID' });
        }
        const domain = await (0, domain_hosting_service_1.getDomainById)(domainId);
        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }
        // Check if user owns this domain
        if (domain.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to modify this domain' });
        }
        // Check if there are files
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        // Get the directory where files were uploaded
        uploadDir = path_1.default.dirname(files[0].path);
        // Get deployment config
        const config = req.body.config ? JSON.parse(req.body.config) : {};
        // Deploy website
        const deployment = await (0, domain_hosting_service_1.deployWebsite)(domainId, req.user.id, uploadDir, config);
        res.json({ deployment });
    }
    catch (error) {
        console.error('Error deploying website:', error);
        res.status(500).json({ error: 'Failed to deploy website', message: error.message });
    }
    finally {
        // Clean up the temporary upload directory
        if (uploadDir && fs_1.default.existsSync(uploadDir)) {
            try {
                fs_1.default.rmSync(uploadDir, { recursive: true, force: true });
            }
            catch (cleanupError) {
                console.error('Error cleaning up temporary files:', cleanupError);
            }
        }
    }
});
/**
 * Deploy website to a domain (from existing path)
 */
router.post('/domains/:id/deploy-path', auth_1.authenticateUser, async (req, res) => {
    try {
        const domainId = parseInt(req.params.id, 10);
        if (isNaN(domainId)) {
            return res.status(400).json({ error: 'Invalid domain ID' });
        }
        const domain = await (0, domain_hosting_service_1.getDomainById)(domainId);
        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }
        // Check if user owns this domain
        if (domain.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to modify this domain' });
        }
        // Validate request
        if (!req.body.contentPath) {
            return res.status(400).json({ error: 'Content path is required' });
        }
        const contentPath = req.body.contentPath;
        // Check if the path exists
        if (!fs_1.default.existsSync(contentPath)) {
            return res.status(400).json({ error: 'Content path does not exist' });
        }
        // Get deployment config
        const config = req.body.config || {};
        // Deploy website
        const deployment = await (0, domain_hosting_service_1.deployWebsite)(domainId, req.user.id, contentPath, config);
        res.json({ deployment });
    }
    catch (error) {
        console.error('Error deploying website from path:', error);
        res.status(500).json({ error: 'Failed to deploy website', message: error.message });
    }
});
/**
 * Get domain hosting analytics (Trust portal view)
 */
router.get('/analytics', auth_1.authenticateUser, auth_1.isTrustMember, async (req, res) => {
    try {
        const analytics = await (0, domain_hosting_service_1.getDomainAnalytics)(req.user.id);
        res.json(analytics);
    }
    catch (error) {
        console.error('Error fetching domain analytics:', error);
        res.status(500).json({ error: 'Failed to fetch domain analytics', message: error.message });
    }
});
exports.default = router;
