import express from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertLAOSchema, insertLAOMemberSchema, insertTribeSchema, insertTribalAffiliationSchema } from '@shared/schema';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all LAOs
router.get('/api/laos', async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const laos = await storage.getAllLAOs(activeOnly);
    res.json(laos);
  } catch (error) {
    console.error('Error fetching LAOs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get LAO by ID
router.get('/api/laos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lao = await storage.getLAO(id);
    
    if (!lao) {
      return res.status(404).json({ error: 'LAO not found' });
    }
    
    res.json(lao);
  } catch (error) {
    console.error('Error fetching LAO:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new LAO (requires authentication)
router.post('/api/laos', isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertLAOSchema.parse(req.body);
    const newLAO = await storage.createLAO(validatedData);
    
    // Automatically add creator as LAO owner
    await storage.addLAOMember({
      laoId: newLAO.id,
      userId: req.session.userId,
      role: 'owner',
      votingPower: 10, // Owner gets higher voting power
      joinDate: new Date(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(newLAO);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating LAO:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update LAO (requires authentication and ownership)
router.patch('/api/laos/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user is owner of this LAO
    const member = await storage.getLAOMemberByUserAndLAO(req.session.userId, id);
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners can update LAO details' });
    }
    
    const validatedData = insertLAOSchema.partial().parse(req.body);
    const updatedLAO = await storage.updateLAO(id, validatedData);
    
    if (!updatedLAO) {
      return res.status(404).json({ error: 'LAO not found' });
    }
    
    res.json(updatedLAO);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating LAO:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get LAO members
router.get('/api/laos/:id/members', async (req, res) => {
  try {
    const laoId = parseInt(req.params.id);
    const members = await storage.getLAOMembersByLAO(laoId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching LAO members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to LAO (requires authentication and appropriate permissions)
router.post('/api/laos/:id/members', isAuthenticated, async (req, res) => {
  try {
    const laoId = parseInt(req.params.id);
    
    // Check if user is owner or manager of this LAO
    const currentMember = await storage.getLAOMemberByUserAndLAO(req.session.userId, laoId);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can add members' });
    }
    
    const validatedData = insertLAOMemberSchema.parse({
      ...req.body,
      laoId,
      joinDate: new Date(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newMember = await storage.addLAOMember(validatedData);
    res.status(201).json(newMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error adding LAO member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tribes for a LAO
router.get('/api/laos/:id/tribes', async (req, res) => {
  try {
    const laoId = parseInt(req.params.id);
    const tribes = await storage.getTribesByLAO(laoId);
    res.json(tribes);
  } catch (error) {
    console.error('Error fetching tribes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new tribe (requires authentication and appropriate permissions)
router.post('/api/laos/:id/tribes', isAuthenticated, async (req, res) => {
  try {
    const laoId = parseInt(req.params.id);
    
    // Check if user is owner or manager of this LAO
    const currentMember = await storage.getLAOMemberByUserAndLAO(req.session.userId, laoId);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden: Only LAO owners and managers can create tribes' });
    }
    
    const validatedData = insertTribeSchema.parse({
      ...req.body,
      laoId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newTribe = await storage.createTribe(validatedData);
    
    // Automatically add creator as tribe leader if leadMemberId wasn't specified
    if (!validatedData.leadMemberId) {
      await storage.updateTribe(newTribe.id, { leadMemberId: currentMember.id });
    }
    
    // Add creator to the tribe
    await storage.addTribalAffiliation({
      tribeId: newTribe.id,
      memberId: currentMember.id,
      role: 'leader',
      joinDate: new Date(),
      active: true,
      createdAt: new Date()
    });
    
    res.status(201).json(newTribe);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating tribe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tribe members
router.get('/api/tribes/:id/members', async (req, res) => {
  try {
    const tribeId = parseInt(req.params.id);
    const members = await storage.getTribeMembers(tribeId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching tribe members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to tribe (requires authentication and appropriate permissions)
router.post('/api/tribes/:id/members', isAuthenticated, async (req, res) => {
  try {
    const tribeId = parseInt(req.params.id);
    
    // Get tribe info to check LAO
    const tribe = await storage.getTribe(tribeId);
    if (!tribe) {
      return res.status(404).json({ error: 'Tribe not found' });
    }
    
    // Check if user is tribe leader or LAO owner/manager
    const userLAOMembership = await storage.getLAOMemberByUserAndLAO(req.session.userId, tribe.laoId);
    if (!userLAOMembership) {
      return res.status(403).json({ error: 'Forbidden: You must be a member of the LAO' });
    }
    
    const isLeader = tribe.leadMemberId === userLAOMembership.id;
    const isOwnerOrManager = userLAOMembership.role === 'owner' || userLAOMembership.role === 'manager';
    
    if (!isLeader && !isOwnerOrManager) {
      return res.status(403).json({ error: 'Forbidden: Only tribe leaders or LAO owners/managers can add members to tribes' });
    }
    
    // Validate that the member being added belongs to the LAO
    const memberId = req.body.memberId;
    const member = await storage.getLAOMember(memberId);
    if (!member || member.laoId !== tribe.laoId) {
      return res.status(400).json({ error: 'Member does not belong to the LAO' });
    }
    
    const validatedData = insertTribalAffiliationSchema.parse({
      ...req.body,
      tribeId,
      joinDate: new Date(),
      active: true,
      createdAt: new Date()
    });
    
    const newTribalAffiliation = await storage.addTribalAffiliation(validatedData);
    res.status(201).json(newTribalAffiliation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error adding tribe member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get LAO governance proposals
router.get('/api/laos/:id/proposals', async (req, res) => {
  try {
    const laoId = parseInt(req.params.id);
    const activeOnly = req.query.activeOnly === 'true';
    const proposals = await storage.getProposalsByLAO(laoId, activeOnly);
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get proposal votes and results
router.get('/api/proposals/:id/votes', async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const votes = await storage.getVotesByProposal(proposalId);
    const results = await storage.getProposalResults(proposalId);
    
    res.json({
      votes,
      results
    });
  } catch (error) {
    console.error('Error fetching proposal votes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;