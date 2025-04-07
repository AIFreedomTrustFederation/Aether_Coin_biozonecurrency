import express from 'express';
import { z } from 'zod';
import { recurveFractalService } from '../services/recurve-fractal-service';
import { requireAuth, requireTrustMember } from '../middleware/auth';
import { 
  BeneficiaryType, 
  FractalLoanCollateralType,
  InsurancePolicyType
} from '@shared/recurve-schema';

const router = express.Router();

// Validation schemas
const registerPolicySchema = z.object({
  policyProvider: z.string().min(1),
  policyNumber: z.string().min(1),
  policyType: z.nativeEnum(InsurancePolicyType),
  faceValue: z.number().positive(),
  cashValue: z.number().positive(),
  premiumAmount: z.number().positive(),
  premiumFrequency: z.string().min(1),
  beneficiaryType: z.nativeEnum(BeneficiaryType),
  beneficiaryId: z.string().min(1),
  beneficiaryPercentage: z.number().min(1).max(100),
  maturityDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  policyDocumentCid: z.string().optional()
});

const mintTokenSchema = z.object({
  policyId: z.number().positive(),
  collateralizationRatio: z.number().min(100).max(500),
  tokenAmount: z.number().positive(),
  fractalRecursionDepth: z.number().min(1).max(12).optional()
});

const createLoanSchema = z.object({
  loanAmount: z.number().positive(),
  collateralPercentage: z.number().min(100),
  collateralType: z.nativeEnum(FractalLoanCollateralType),
  policyId: z.number().positive().optional(),
  recurveTokenId: z.number().positive().optional(),
  interestRate: z.number().min(0),
  maturityDate: z.string().transform(val => new Date(val)),
  walletId: z.number().positive(),
  loanPurpose: z.string().optional()
});

// Routes

// Register an insurance policy
router.post('/policies', requireAuth, async (req, res) => {
  try {
    const validatedData = registerPolicySchema.parse(req.body);
    // Use req.user instead of req.session.user
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const policy = await recurveFractalService.registerInsurancePolicy(
      req.user.id,
      validatedData
    );
    res.status(201).json(policy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error registering policy:', error);
      res.status(500).json({ error: 'Failed to register policy' });
    }
  }
});

// Get a user's policies
router.get('/policies', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const policies = await recurveFractalService.getUserPolicies(req.user.id);
    res.json(policies);
  } catch (error) {
    console.error('Error getting policies:', error);
    res.status(500).json({ error: 'Failed to get policies' });
  }
});

// Mint Recurve tokens
router.post('/tokens', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const validatedData = mintTokenSchema.parse(req.body);
    const token = await recurveFractalService.mintRecurveTokens(
      req.user.id,
      validatedData.policyId,
      {
        collateralizationRatio: validatedData.collateralizationRatio,
        tokenAmount: validatedData.tokenAmount,
        fractalRecursionDepth: validatedData.fractalRecursionDepth
      }
    );
    res.status(201).json(token);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error minting tokens:', error);
      res.status(500).json({ error: 'Failed to mint tokens' });
    }
  }
});

// Get a user's tokens
router.get('/tokens', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const tokens = await recurveFractalService.getUserRecurveTokens(req.user.id);
    res.json(tokens);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).json({ error: 'Failed to get tokens' });
  }
});

// Create a fractal loan
router.post('/loans', requireAuth, async (req, res) => {
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
    if (validatedData.collateralType === FractalLoanCollateralType.HYBRID && 
        (!validatedData.policyId || !validatedData.recurveTokenId)) {
      return res.status(400).json({ error: 'Both policyId and recurveTokenId must be provided for HYBRID collateral type' });
    }
    
    const loan = await recurveFractalService.createFractalLoan(
      req.user.id,
      validatedData
    );
    res.status(201).json(loan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error creating loan:', error);
      res.status(500).json({ error: 'Failed to create loan' });
    }
  }
});

// Get a user's loans
router.get('/loans', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const loans = await recurveFractalService.getUserFractalLoans(req.user.id);
    res.json(loans);
  } catch (error) {
    console.error('Error getting loans:', error);
    res.status(500).json({ error: 'Failed to get loans' });
  }
});

// Get a user's security nodes
router.get('/security-nodes', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const nodes = await recurveFractalService.getUserSecurityNodes(req.user.id);
    res.json(nodes);
  } catch (error) {
    console.error('Error getting security nodes:', error);
    res.status(500).json({ error: 'Failed to get security nodes' });
  }
});

// Get network security metrics (trust members only)
router.get('/network/security', requireAuth, requireTrustMember, async (req, res) => {
  try {
    const metrics = await recurveFractalService.getNetworkSecurityMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting network security metrics:', error);
    res.status(500).json({ error: 'Failed to get network security metrics' });
  }
});

// Get fractal reserve system status
router.get('/system/status', requireAuth, async (req, res) => {
  try {
    const status = await recurveFractalService.getFractalReserveStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

export default router;