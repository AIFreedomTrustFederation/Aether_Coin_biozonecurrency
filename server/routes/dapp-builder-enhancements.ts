/**
 * DApp Builder Enhancement Routes
 * 
 * API routes for the enhanced features of the DApp Builder.
 */
import { Router } from 'express';
import { 
  versionService, 
  sandboxService, 
  collaborationService,
  deploymentService,
  securityAnalysisService,
  completionService,
  matrixDappIntegration 
} from '../services';
import { z } from 'zod';
import { db } from '../db';
import { 
  userDapps,
  dappVersions,
  dappFiles,
  collaborativeSessions,
  codeCommentThreads,
  codeComments 
} from '../../shared/dapp-schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Schema validators
const versionCreateSchema = z.object({
  userDappId: z.number(),
  version: z.string().optional(),
  changes: z.string().optional(),
  createdBy: z.number(),
  branch: z.string().optional(),
  parentVersionId: z.number().optional(),
  commitMessage: z.string().optional()
});

const branchCreateSchema = z.object({
  userDappId: z.number(),
  sourceVersionId: z.number(),
  branchName: z.string(),
  userId: z.number()
});

const branchMergeSchema = z.object({
  userDappId: z.number(),
  sourceBranch: z.string(),
  targetBranch: z.string(),
  userId: z.number()
});

const sandboxCreateSchema = z.object({
  userId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  environmentType: z.string()
});

const deploymentCreateSchema = z.object({
  sandboxId: z.number(),
  userDappId: z.number(),
  dappVersionId: z.number()
});

const securityAnalysisSchema = z.object({
  contractCode: z.string(),
  contractType: z.string().optional()
});

const collaborationSessionSchema = z.object({
  userDappId: z.number(),
  createdBy: z.number(),
  settings: z.record(z.any()).optional()
});

const commentThreadSchema = z.object({
  fileId: z.number(),
  createdBy: z.number(),
  startLine: z.number(),
  endLine: z.number(),
  content: z.string()
});

const codeCompletionSchema = z.object({
  code: z.string(),
  position: z.object({
    line: z.number(),
    character: z.number()
  }),
  prefix: z.string()
});

// Routes for version control
router.post('/versions', async (req, res) => {
  try {
    const validatedData = versionCreateSchema.parse(req.body);
    const version = await versionService.createVersion(validatedData);
    res.json(version);
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/dapps/:dappId/versions', async (req, res) => {
  try {
    const dappId = parseInt(req.params.dappId);
    const versions = await versionService.getDappVersions(dappId);
    res.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/dapps/:dappId/branches', async (req, res) => {
  try {
    const dappId = parseInt(req.params.dappId);
    const branches = await versionService.getDappBranches(dappId);
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/branches', async (req, res) => {
  try {
    const validatedData = branchCreateSchema.parse(req.body);
    const version = await versionService.createBranch(
      validatedData.userDappId,
      validatedData.sourceVersionId,
      validatedData.branchName,
      validatedData.userId
    );
    res.json(version);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/branches/merge', async (req, res) => {
  try {
    const validatedData = branchMergeSchema.parse(req.body);
    const result = await versionService.mergeBranches(
      validatedData.userDappId,
      validatedData.sourceBranch,
      validatedData.targetBranch,
      validatedData.userId
    );
    res.json(result);
  } catch (error) {
    console.error('Error merging branches:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/files/:fileId/history', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const history = await versionService.getFileHistory(fileId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching file history:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/files/diff', async (req, res) => {
  try {
    const { oldContent, newContent } = req.body;
    const diff = versionService.diffContents(oldContent, newContent);
    res.json({ diff });
  } catch (error) {
    console.error('Error computing diff:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes for sandbox environments
router.post('/sandboxes', async (req, res) => {
  try {
    const validatedData = sandboxCreateSchema.parse(req.body);
    const sandbox = await sandboxService.createSandbox(validatedData);
    res.json(sandbox);
  } catch (error) {
    console.error('Error creating sandbox:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/:userId/sandboxes', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sandboxes = await sandboxService.getUserSandboxes(userId);
    res.json(sandboxes);
  } catch (error) {
    console.error('Error fetching sandboxes:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/sandboxes/:sandboxId/deployments', async (req, res) => {
  try {
    const sandboxId = parseInt(req.params.sandboxId);
    const validatedData = deploymentCreateSchema.parse({
      ...req.body,
      sandboxId
    });
    const deployment = await sandboxService.createDeployment(validatedData);
    res.json(deployment);
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/sandboxes/:sandboxId/deployments', async (req, res) => {
  try {
    const sandboxId = parseInt(req.params.sandboxId);
    const deployments = await sandboxService.getSandboxDeployments(sandboxId);
    res.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/deployments/:deploymentId/transactions', async (req, res) => {
  try {
    const deploymentId = parseInt(req.params.deploymentId);
    const transaction = await sandboxService.executeTransaction({
      ...req.body,
      deploymentId
    });
    res.json(transaction);
  } catch (error) {
    console.error('Error executing transaction:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/sandboxes/:sandboxId', async (req, res) => {
  try {
    const sandboxId = parseInt(req.params.sandboxId);
    const result = await sandboxService.terminateSandbox(sandboxId);
    res.json(result);
  } catch (error) {
    console.error('Error terminating sandbox:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes for security analysis
router.post('/security/analyze', async (req, res) => {
  try {
    const validatedData = securityAnalysisSchema.parse(req.body);
    const result = await securityAnalysisService.analyzeContract(
      validatedData.contractCode,
      validatedData.contractType
    );
    res.json(result);
  } catch (error) {
    console.error('Error analyzing contract:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/security/templates', async (req, res) => {
  try {
    const templates = await securityAnalysisService.getSecurityTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching security templates:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/security/fix-recommendations', async (req, res) => {
  try {
    const { vulnerabilityId, contractCode } = req.body;
    const recommendations = securityAnalysisService.getVulnerabilityFixRecommendations(
      vulnerabilityId,
      contractCode
    );
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting fix recommendations:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes for code completion
router.post('/completion/suggestions', async (req, res) => {
  try {
    const validatedData = codeCompletionSchema.parse(req.body);
    const suggestions = completionService.getCompletionSuggestions(
      validatedData.code,
      validatedData.position,
      validatedData.prefix
    );
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting completion suggestions:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/completion/improvements', async (req, res) => {
  try {
    const { code } = req.body;
    const improvements = await completionService.suggestCodeImprovements(code);
    res.json(improvements);
  } catch (error) {
    console.error('Error suggesting code improvements:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/completion/documentation/:item', async (req, res) => {
  try {
    const item = req.params.item;
    const documentation = completionService.getCompletionDocumentation(item);
    res.json({ documentation });
  } catch (error) {
    console.error('Error getting documentation:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes for collaborative editing
router.post('/collaboration/sessions', async (req, res) => {
  try {
    const validatedData = collaborationSessionSchema.parse(req.body);
    const session = await collaborationService.createSession(validatedData);
    
    // Notify through Matrix
    await matrixDappIntegration.sendCollaborationSessionEvent(
      session.id,
      'started',
      validatedData.createdBy
    );
    
    res.json(session);
  } catch (error) {
    console.error('Error creating collaboration session:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/collaboration/sessions/:sessionId/participants', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const participant = await collaborationService.addParticipant(sessionId, req.body);
    
    // Notify through Matrix
    await matrixDappIntegration.sendCollaborationSessionEvent(
      sessionId,
      'joined',
      req.body.userId
    );
    
    res.json(participant);
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/collaboration/sessions/:sessionId/participants', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const participants = await collaborationService.getSessionParticipants(sessionId);
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/collaboration/sessions/:sessionId/cursor', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const session = await db.query.collaborativeSessions.findFirst({
      where: eq(collaborativeSessions.id, sessionId)
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    collaborationService.updateUserCursor(
      session.sessionToken,
      req.body.userId,
      req.body.cursor
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cursor:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/collaboration/sessions/:sessionId/end', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const session = await collaborationService.endSession(sessionId);
    
    // Notify through Matrix
    await matrixDappIntegration.sendCollaborationSessionEvent(
      sessionId,
      'ended',
      req.body.userId
    );
    
    res.json(session);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes for comments
router.post('/comments/threads', async (req, res) => {
  try {
    const validatedData = commentThreadSchema.parse(req.body);
    
    // Create the thread
    const thread = await collaborationService.createCommentThread({
      fileId: validatedData.fileId,
      createdBy: validatedData.createdBy,
      startLine: validatedData.startLine,
      endLine: validatedData.endLine
    });
    
    // Add the first comment
    const comment = await collaborationService.addComment({
      threadId: thread.id,
      userId: validatedData.createdBy,
      content: validatedData.content
    });
    
    // Notify through Matrix
    await matrixDappIntegration.sendCodeCommentNotification(thread.id);
    
    res.json({ thread, comment });
  } catch (error) {
    console.error('Error creating comment thread:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/comments/threads/:threadId/comments', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const comment = await collaborationService.addComment({
      ...req.body,
      threadId
    });
    
    // Notify through Matrix
    await matrixDappIntegration.sendCodeCommentNotification(threadId);
    
    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/comments/files/:fileId/threads', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const threads = await collaborationService.getFileCommentThreads(fileId);
    res.json(threads);
  } catch (error) {
    console.error('Error fetching comment threads:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/comments/threads/:threadId/resolve', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const userId = req.body.userId;
    const thread = await collaborationService.resolveThread(threadId, userId);
    res.json(thread);
  } catch (error) {
    console.error('Error resolving thread:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes for multi-chain deployment
router.get('/deployment/networks', (req, res) => {
  try {
    const networks = deploymentService.getSupportedNetworks();
    res.json(networks);
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/deployment/chain-deployments', async (req, res) => {
  try {
    const deployment = await deploymentService.createDeployment(req.body);
    
    // Notify through Matrix
    await matrixDappIntegration.sendDeploymentNotification(
      req.body.userDappId,
      deployment.id,
      req.body.deployedBy,
      'started',
      req.body.chain
    );
    
    res.json(deployment);
  } catch (error) {
    console.error('Error creating chain deployment:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/deployment/dapps/:dappId/deployments', async (req, res) => {
  try {
    const dappId = parseInt(req.params.dappId);
    const deployments = await deploymentService.getDappDeployments(dappId);
    res.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/deployment/chain-deployments/:deploymentId', async (req, res) => {
  try {
    const deploymentId = parseInt(req.params.deploymentId);
    const deployment = await deploymentService.updateDeployment(deploymentId, req.body);
    
    // Notify through Matrix about success/failure
    if (deployment.status === 'success' || deployment.status === 'failed') {
      await matrixDappIntegration.sendDeploymentNotification(
        deployment.userDappId,
        deploymentId,
        deployment.deployedBy,
        deployment.status as any,
        deployment.chain
      );
    }
    
    res.json(deployment);
  } catch (error) {
    console.error('Error updating deployment:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/deployment/validate-contract', async (req, res) => {
  try {
    const { contractCode, network } = req.body;
    const validation = deploymentService.validateContractForNetwork(contractCode, network);
    res.json(validation);
  } catch (error) {
    console.error('Error validating contract:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/deployment/costs', async (req, res) => {
  try {
    const costs = await deploymentService.getDeploymentCosts();
    res.json(costs);
  } catch (error) {
    console.error('Error fetching deployment costs:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/deployment/networks/:network/instructions', (req, res) => {
  try {
    const network = req.params.network;
    const instructions = deploymentService.getDeploymentInstructions(network as any);
    res.json(instructions);
  } catch (error) {
    console.error('Error fetching deployment instructions:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;