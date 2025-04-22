"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const recurve_fractal_service_1 = require("../services/recurve-fractal-service");
const auth_1 = require("../middleware/auth");
const recurve_schema_1 = require("@shared/recurve-schema");
const router = express_1.default.Router();
// Validation schemas
const registerPolicySchema = zod_1.z.object({
    policyProvider: zod_1.z.string().min(1),
    policyNumber: zod_1.z.string().min(1),
    policyType: zod_1.z.nativeEnum(recurve_schema_1.InsurancePolicyType),
    faceValue: zod_1.z.number().positive(),
    cashValue: zod_1.z.number().positive(),
    premiumAmount: zod_1.z.number().positive(),
    premiumFrequency: zod_1.z.string().min(1),
    beneficiaryType: zod_1.z.nativeEnum(recurve_schema_1.BeneficiaryType),
    beneficiaryId: zod_1.z.string().min(1),
    beneficiaryPercentage: zod_1.z.number().min(1).max(100),
    maturityDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    policyDocumentCid: zod_1.z.string().optional()
});
const mintTokenSchema = zod_1.z.object({
    policyId: zod_1.z.number().positive(),
    collateralizationRatio: zod_1.z.number().min(100).max(500),
    tokenAmount: zod_1.z.number().positive(),
    fractalRecursionDepth: zod_1.z.number().min(1).max(12).optional()
});
const createLoanSchema = zod_1.z.object({
    loanAmount: zod_1.z.number().positive(),
    collateralPercentage: zod_1.z.number().min(100),
    collateralType: zod_1.z.nativeEnum(recurve_schema_1.FractalLoanCollateralType),
    policyId: zod_1.z.number().positive().optional(),
    recurveTokenId: zod_1.z.number().positive().optional(),
    interestRate: zod_1.z.number().min(0),
    maturityDate: zod_1.z.string().transform(val => new Date(val)),
    walletId: zod_1.z.number().positive(),
    loanPurpose: zod_1.z.string().optional()
});
// Routes
// Register an insurance policy
router.post('/policies', auth_1.requireAuth, async (req, res) => {
    try {
        const validatedData = registerPolicySchema.parse(req.body);
        // Use req.user instead of req.session.user
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const policy = await recurve_fractal_service_1.recurveFractalService.registerInsurancePolicy(req.user.id, validatedData);
        res.status(201).json(policy);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            console.error('Error registering policy:', error);
            res.status(500).json({ error: 'Failed to register policy' });
        }
    }
});
// Get a user's policies
router.get('/policies', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const policies = await recurve_fractal_service_1.recurveFractalService.getUserPolicies(req.user.id);
        res.json(policies);
    }
    catch (error) {
        console.error('Error getting policies:', error);
        res.status(500).json({ error: 'Failed to get policies' });
    }
});
// Mint Recurve tokens
router.post('/tokens', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const validatedData = mintTokenSchema.parse(req.body);
        const token = await recurve_fractal_service_1.recurveFractalService.mintRecurveTokens(req.user.id, validatedData.policyId, {
            collateralizationRatio: validatedData.collateralizationRatio,
            tokenAmount: validatedData.tokenAmount,
            fractalRecursionDepth: validatedData.fractalRecursionDepth
        });
        res.status(201).json(token);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            console.error('Error minting tokens:', error);
            res.status(500).json({ error: 'Failed to mint tokens' });
        }
    }
});
// Get a user's tokens
router.get('/tokens', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const tokens = await recurve_fractal_service_1.recurveFractalService.getUserRecurveTokens(req.user.id);
        res.json(tokens);
    }
    catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).json({ error: 'Failed to get tokens' });
    }
});
// Create a fractal loan
router.post('/loans', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const validatedData = createLoanSchema.parse(req.body);
        // Check that at least one of policyId or recurveTokenId is provided
        if (!validatedData.policyId && !validatedData.recurveTokenId) {
            return res.status(400).json({ error: 'Either policyId or recurveTokenId must be provided' });
        }
        // For HYBRID type, both must be provided
        if (validatedData.collateralType === recurve_schema_1.FractalLoanCollateralType.HYBRID &&
            (!validatedData.policyId || !validatedData.recurveTokenId)) {
            return res.status(400).json({ error: 'Both policyId and recurveTokenId must be provided for HYBRID collateral type' });
        }
        const loan = await recurve_fractal_service_1.recurveFractalService.createFractalLoan(req.user.id, validatedData);
        res.status(201).json(loan);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            console.error('Error creating loan:', error);
            res.status(500).json({ error: 'Failed to create loan' });
        }
    }
});
// Get a user's loans
router.get('/loans', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const loans = await recurve_fractal_service_1.recurveFractalService.getUserFractalLoans(req.user.id);
        res.json(loans);
    }
    catch (error) {
        console.error('Error getting loans:', error);
        res.status(500).json({ error: 'Failed to get loans' });
    }
});
// Get a user's security nodes
router.get('/security-nodes', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const nodes = await recurve_fractal_service_1.recurveFractalService.getUserSecurityNodes(req.user.id);
        res.json(nodes);
    }
    catch (error) {
        console.error('Error getting security nodes:', error);
        res.status(500).json({ error: 'Failed to get security nodes' });
    }
});
// Get network security metrics (trust members only)
router.get('/network/security', auth_1.requireAuth, auth_1.requireTrustMember, async (req, res) => {
    try {
        const metrics = await recurve_fractal_service_1.recurveFractalService.getNetworkSecurityMetrics();
        res.json(metrics);
    }
    catch (error) {
        console.error('Error getting network security metrics:', error);
        res.status(500).json({ error: 'Failed to get network security metrics' });
    }
});
// Get fractal reserve system status
router.get('/system/status', auth_1.requireAuth, async (req, res) => {
    try {
        const status = await recurve_fractal_service_1.recurveFractalService.getFractalReserveStatus();
        res.json(status);
    }
    catch (error) {
        console.error('Error getting system status:', error);
        res.status(500).json({ error: 'Failed to get system status' });
    }
});
exports.default = router;
