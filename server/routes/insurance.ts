import express from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { 
  insertInsuranceRiskPoolSchema, 
  insertInsurancePolicySchema, 
  insertInsuranceClaimSchema,
  insertPolicyPremiumSchema,
  insertIULPolicySchema
} from '@shared/schema';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all risk pools for a LAO
router.get('/api/laos/:laoId/risk-pools', async (req, res) => {
  try {
    const laoId = parseInt(req.params.laoId);
    const riskPools = await storage.getRiskPoolsByLAO(laoId);
    res.json(riskPools);
  } catch (error) {
    console.error('Error fetching risk pools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get risk pools by type
router.get('/api/risk-pools/by-type/:type', async (req, res) => {
  try {
    const policyType = req.params.type;
    const riskPools = await storage.getRiskPoolsByType(policyType);
    res.json(riskPools);
  } catch (error) {
    console.error('Error fetching risk pools by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new risk pool (requires authentication and ownership/management role)
router.post('/api/laos/:laoId/risk-pools', isAuthenticated, async (req, res) => {
  try {
    const laoId = parseInt(req.params.laoId);
    
    // Check if user is owner or manager of this LAO
    const member = await storage.getLAOMemberByUserAndLAO(req.session.userId, laoId);
    if (!member || (member.role !== 'owner' && member.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can create risk pools' });
    }
    
    const validatedData = insertInsuranceRiskPoolSchema.parse({
      ...req.body,
      laoId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newRiskPool = await storage.createRiskPool(validatedData);
    res.status(201).json(newRiskPool);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating risk pool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get risk pool balance
router.get('/api/risk-pools/:id/balance', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const balance = await storage.getRiskPoolBalance(id);
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching risk pool balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update risk pool balance (requires authentication and appropriate permissions)
router.post('/api/risk-pools/:id/balance', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, isDeposit } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Get the risk pool to check LAO
    const riskPool = await storage.getRiskPool(id);
    if (!riskPool) {
      return res.status(404).json({ error: 'Risk pool not found' });
    }
    
    // Check if user is owner or manager of this LAO
    const member = await storage.getLAOMemberByUserAndLAO(req.session.userId, riskPool.laoId);
    if (!member || (member.role !== 'owner' && member.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can update risk pool balance' });
    }
    
    const updatedRiskPool = await storage.updateRiskPoolBalance(id, amount, isDeposit);
    if (!updatedRiskPool) {
      return res.status(404).json({ error: 'Risk pool not found' });
    }
    
    res.json(updatedRiskPool);
  } catch (error) {
    console.error('Error updating risk pool balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all policies for a member
router.get('/api/members/:memberId/policies', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const policies = await storage.getPoliciesByHolder(memberId);
    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all policies for a risk pool
router.get('/api/risk-pools/:id/policies', async (req, res) => {
  try {
    const riskPoolId = parseInt(req.params.id);
    const policies = await storage.getPoliciesByRiskPool(riskPoolId);
    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies for risk pool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new policy (requires authentication)
router.post('/api/policies', isAuthenticated, async (req, res) => {
  try {
    // Get LAO membership for the specified policyHolderId (which should be a LAO member id)
    const policyHolderId = req.body.policyHolderId;
    const member = await storage.getLAOMember(policyHolderId);
    
    if (!member) {
      return res.status(404).json({ error: 'LAO member not found' });
    }
    
    // Check if the authenticated user is the policy holder or has appropriate permissions
    const userMembership = await storage.getLAOMemberByUserAndLAO(req.session.userId, member.laoId);
    const isSelf = member.userId === req.session.userId;
    const isOwnerOrManager = userMembership && (userMembership.role === 'owner' || userMembership.role === 'manager');
    
    if (!isSelf && !isOwnerOrManager) {
      return res.status(403).json({ error: 'Forbidden: You can only create policies for yourself unless you are an owner or manager' });
    }
    
    // Check the risk pool exists and belongs to the same LAO
    const riskPoolId = req.body.riskPoolId;
    const riskPool = await storage.getRiskPool(riskPoolId);
    
    if (!riskPool) {
      return res.status(404).json({ error: 'Risk pool not found' });
    }
    
    if (riskPool.laoId !== member.laoId) {
      return res.status(400).json({ error: 'Risk pool and policy holder must belong to the same LAO' });
    }
    
    // Generate a policy number
    const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const validatedData = insertInsurancePolicySchema.parse({
      ...req.body,
      policyNumber,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newPolicy = await storage.createPolicy(validatedData);
    
    // Create initial premium
    await storage.createPremium({
      policyId: newPolicy.id,
      amount: validatedData.premium,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(newPolicy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activate a policy (requires authentication and appropriate permissions)
router.post('/api/policies/:id/activate', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const policy = await storage.getPolicy(id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    // Check if user is owner or manager of the LAO
    const riskPool = await storage.getRiskPool(policy.riskPoolId);
    const member = await storage.getLAOMemberByUserAndLAO(req.session.userId, riskPool.laoId);
    
    if (!member || (member.role !== 'owner' && member.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can activate policies' });
    }
    
    const activatedPolicy = await storage.activatePolicy(
      id, 
      new Date(startDate), 
      new Date(endDate)
    );
    
    res.json(activatedPolicy);
  } catch (error) {
    console.error('Error activating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all claims for a policy
router.get('/api/policies/:id/claims', async (req, res) => {
  try {
    const policyId = parseInt(req.params.id);
    const claims = await storage.getClaimsByPolicy(policyId);
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File a new claim (requires authentication)
router.post('/api/policies/:id/claims', isAuthenticated, async (req, res) => {
  try {
    const policyId = parseInt(req.params.id);
    const policy = await storage.getPolicy(policyId);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    // Check if policy is active
    if (policy.status !== 'active') {
      return res.status(400).json({ error: 'Cannot file a claim on an inactive policy' });
    }
    
    // Check if the authenticated user is the policy holder or has appropriate permissions
    const policyHolder = await storage.getLAOMember(policy.policyHolderId);
    const isSelf = policyHolder && policyHolder.userId === req.session.userId;
    
    if (!isSelf) {
      return res.status(403).json({ error: 'Forbidden: You can only file claims for your own policies' });
    }
    
    // Generate a claim number
    const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const validatedData = insertInsuranceClaimSchema.parse({
      ...req.body,
      policyId,
      claimantId: policy.policyHolderId,
      claimNumber,
      status: 'submitted',
      filingDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newClaim = await storage.createClaim(validatedData);
    res.status(201).json(newClaim);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error filing claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Review a claim (requires authentication and appropriate permissions)
router.post('/api/claims/:id/review', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { approved, approvedAmount, notes } = req.body;
    
    const claim = await storage.getClaim(id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    // Check if claim is in a reviewable state
    if (claim.status !== 'submitted' && claim.status !== 'appealed') {
      return res.status(400).json({ error: `Cannot review a claim in ${claim.status} status` });
    }
    
    // Get policy and risk pool to check LAO
    const policy = await storage.getPolicy(claim.policyId);
    const riskPool = await storage.getRiskPool(policy.riskPoolId);
    
    // Check if user is owner or manager of the LAO
    const reviewer = await storage.getLAOMemberByUserAndLAO(req.session.userId, riskPool.laoId);
    if (!reviewer || (reviewer.role !== 'owner' && reviewer.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can review claims' });
    }
    
    const reviewedClaim = await storage.reviewClaim(
      id,
      reviewer.id,
      approved,
      approvedAmount,
      notes
    );
    
    res.json(reviewedClaim);
  } catch (error) {
    console.error('Error reviewing claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get premiums for a policy
router.get('/api/policies/:id/premiums', async (req, res) => {
  try {
    const policyId = parseInt(req.params.id);
    const premiums = await storage.getPremiumsByPolicy(policyId);
    res.json(premiums);
  } catch (error) {
    console.error('Error fetching premiums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record premium payment (requires authentication)
router.post('/api/premiums/:id/pay', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { transactionHash } = req.body;
    
    if (!transactionHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }
    
    const premium = await storage.getPremium(id);
    if (!premium) {
      return res.status(404).json({ error: 'Premium not found' });
    }
    
    // Get policy and check if user is the policy holder
    const policy = await storage.getPolicy(premium.policyId);
    const policyHolder = await storage.getLAOMember(policy.policyHolderId);
    
    if (policyHolder.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only pay premiums for your own policies' });
    }
    
    const paidPremium = await storage.recordPremiumPayment(id, transactionHash);
    
    // Update risk pool balance
    const riskPool = await storage.getRiskPool(policy.riskPoolId);
    await storage.updateRiskPoolBalance(riskPool.id, Number(premium.amount), true);
    
    res.json(paidPremium);
  } catch (error) {
    console.error('Error recording premium payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all IUL policies for a member
router.get('/api/members/:memberId/iul-policies', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const policies = await storage.getIULPoliciesByMember(memberId);
    res.json(policies);
  } catch (error) {
    console.error('Error fetching IUL policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new IUL policy (requires authentication and LAO membership)
router.post('/api/iul-policies', isAuthenticated, async (req, res) => {
  try {
    // Check if the authenticated user is the policy holder or has appropriate permissions
    const memberId = req.body.memberId;
    const member = await storage.getLAOMember(memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'LAO member not found' });
    }
    
    const isSelf = member.userId === req.session.userId;
    
    if (!isSelf) {
      const userMembership = await storage.getLAOMemberByUserAndLAO(req.session.userId, member.laoId);
      const isOwnerOrManager = userMembership && (userMembership.role === 'owner' || userMembership.role === 'manager');
      
      if (!isOwnerOrManager) {
        return res.status(403).json({ error: 'Forbidden: You can only create IUL policies for yourself unless you are an owner or manager' });
      }
    }
    
    // Generate a policy number
    const policyNumber = `IUL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Calculate maturity date (typically 30 years from now)
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + 30);
    
    const validatedData = insertIULPolicySchema.parse({
      ...req.body,
      policyNumber,
      status: 'active',
      issueDate: new Date(),
      maturityDate,
      lastIndexingDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newPolicy = await storage.createIULPolicy(validatedData);
    
    // Record initial premium payment transaction
    await storage.recordIULPolicyTransaction({
      policyId: newPolicy.id,
      transactionType: 'initial_premium',
      amount: validatedData.initialPremium,
      description: 'Initial premium payment',
      transactionDate: new Date(),
      createdAt: new Date()
    });
    
    res.status(201).json(newPolicy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating IUL policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions for an IUL policy
router.get('/api/iul-policies/:id/transactions', async (req, res) => {
  try {
    const policyId = parseInt(req.params.id);
    const transactions = await storage.getIULPolicyTransactions(policyId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching IUL policy transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Index an IUL policy (requires authentication and appropriate permissions)
router.post('/api/iul-policies/:id/index', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { indexRate } = req.body;
    
    if (typeof indexRate !== 'number' || indexRate < -100 || indexRate > 100) {
      return res.status(400).json({ error: 'Invalid index rate' });
    }
    
    const policy = await storage.getIULPolicy(id);
    if (!policy) {
      return res.status(404).json({ error: 'IUL policy not found' });
    }
    
    // Check if user is owner or manager of the LAO
    const member = await storage.getLAOMember(policy.memberId);
    const laoMember = await storage.getLAOMemberByUserAndLAO(req.session.userId, member.laoId);
    
    if (!laoMember || (laoMember.role !== 'owner' && laoMember.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can index IUL policies' });
    }
    
    const indexedPolicy = await storage.indexIULPolicy(id, indexRate);
    res.json(indexedPolicy);
  } catch (error) {
    console.error('Error indexing IUL policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;