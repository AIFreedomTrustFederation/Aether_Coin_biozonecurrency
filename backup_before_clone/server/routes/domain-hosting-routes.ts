import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { authenticateUser, isTrustMember } from '../middleware/auth';
import { 
  createDomain, 
  allocateStorage, 
  deployWebsite, 
  getUserDomains,
  getDomainById,
  getActiveAllocation,
  getDomainDeployments,
  getDomainAnalytics
} from '../services/domain-hosting-service';
import { insertDomainConfigurationSchema } from '../../shared/schema';

// Setup router
const router = Router();

// Setup temporary storage for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Create a unique temporary directory for each upload
    const uniqueDir = path.join(os.tmpdir(), `fractalcoin-upload-${Date.now()}`);
    fs.mkdirSync(uniqueDir, { recursive: true });
    cb(null, uniqueDir);
  },
  filename: (_req, file, cb) => {
    // Preserve original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Validation schemas
const createDomainSchema = z.object({
  domainName: z.string().min(3).max(255),
  domainType: z.enum(['standard', 'premium', 'enterprise']).default('standard'),
  nameservers: z.array(z.string()).optional(),
  ensRegistered: z.boolean().optional(),
  expiresAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
  autoRenew: z.boolean().optional()
});

const allocateStorageSchema = z.object({
  storageBytes: z.number().int().positive().optional(),
  nodeCount: z.number().int().positive().min(1).max(10).optional()
});

// Routes

/**
 * Get all domains for the logged in user
 */
router.get('/domains', authenticateUser, async (req, res) => {
  try {
    const domains = await getUserDomains(req.user!.id);
    res.json({ domains });
  } catch (error: any) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains', message: error.message });
  }
});

/**
 * Create a new domain
 */
router.post('/domains', authenticateUser, async (req, res) => {
  try {
    const validatedData = createDomainSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid domain data', issues: validatedData.error.issues });
    }
    
    const domainData = insertDomainConfigurationSchema.parse({
      ...validatedData.data,
      active: true,
      paymentStatus: 'pending'
    });
    
    const domain = await createDomain(req.user!.id, domainData);
    res.status(201).json({ domain });
  } catch (error: any) {
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Failed to create domain', message: error.message });
  }
});

/**
 * Get domain details
 */
router.get('/domains/:id', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain
    if (domain.userId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to access this domain' });
    }
    
    // Get additional domain information
    const allocation = await getActiveAllocation(domainId);
    const deployments = await getDomainDeployments(domainId);
    
    res.json({
      domain,
      storage: allocation,
      deployments
    });
  } catch (error: any) {
    console.error('Error fetching domain:', error);
    res.status(500).json({ error: 'Failed to fetch domain details', message: error.message });
  }
});

/**
 * Allocate storage for a domain
 */
router.post('/domains/:id/allocate', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain
    if (domain.userId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to modify this domain' });
    }
    
    const validatedData = allocateStorageSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid allocation data', issues: validatedData.error.issues });
    }
    
    const { storageBytes, nodeCount } = validatedData.data;
    
    const allocation = await allocateStorage(domainId, req.user!.id, storageBytes, nodeCount);
    
    res.json({ allocation });
  } catch (error: any) {
    console.error('Error allocating storage:', error);
    res.status(500).json({ error: 'Failed to allocate storage', message: error.message });
  }
});

/**
 * Deploy website to a domain (file upload)
 */
router.post('/domains/:id/deploy', authenticateUser, upload.array('files'), async (req, res) => {
  let uploadDir: string | null = null;
  
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain
    if (domain.userId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to modify this domain' });
    }
    
    // Check if there are files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Get the directory where files were uploaded
    uploadDir = path.dirname(files[0].path);
    
    // Get deployment config
    const config = req.body.config ? JSON.parse(req.body.config) : {};
    
    // Deploy website
    const deployment = await deployWebsite(domainId, req.user!.id, uploadDir, config);
    
    res.json({ deployment });
  } catch (error: any) {
    console.error('Error deploying website:', error);
    res.status(500).json({ error: 'Failed to deploy website', message: error.message });
  } finally {
    // Clean up the temporary upload directory
    if (uploadDir && fs.existsSync(uploadDir)) {
      try {
        fs.rmSync(uploadDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files:', cleanupError);
      }
    }
  }
});

/**
 * Deploy website to a domain (from existing path)
 */
router.post('/domains/:id/deploy-path', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain
    if (domain.userId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to modify this domain' });
    }
    
    // Validate request
    if (!req.body.contentPath) {
      return res.status(400).json({ error: 'Content path is required' });
    }
    
    const contentPath = req.body.contentPath;
    
    // Check if the path exists
    if (!fs.existsSync(contentPath)) {
      return res.status(400).json({ error: 'Content path does not exist' });
    }
    
    // Get deployment config
    const config = req.body.config || {};
    
    // Deploy website
    const deployment = await deployWebsite(domainId, req.user!.id, contentPath, config);
    
    res.json({ deployment });
  } catch (error: any) {
    console.error('Error deploying website from path:', error);
    res.status(500).json({ error: 'Failed to deploy website', message: error.message });
  }
});

/**
 * Get domain hosting analytics (Trust portal view)
 */
router.get('/analytics', authenticateUser, isTrustMember, async (req, res) => {
  try {
    const analytics = await getDomainAnalytics(req.user!.id);
    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching domain analytics:', error);
    res.status(500).json({ error: 'Failed to fetch domain analytics', message: error.message });
  }
});

export default router;