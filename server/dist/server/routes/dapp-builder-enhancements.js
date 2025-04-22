"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DApp Builder Enhancement Routes
 *
 * API routes for the enhanced features of the DApp Builder.
 */
const express_1 = require("express");
const services_1 = require("../services");
const zod_1 = require("zod");
const db_1 = require("../db");
const dapp_schema_1 = require("../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Schema validators
const versionCreateSchema = zod_1.z.object({
    userDappId: zod_1.z.number(),
    version: zod_1.z.string().optional(),
    changes: zod_1.z.string().optional(),
    createdBy: zod_1.z.number(),
    branch: zod_1.z.string().optional(),
    parentVersionId: zod_1.z.number().optional(),
    commitMessage: zod_1.z.string().optional()
});
const branchCreateSchema = zod_1.z.object({
    userDappId: zod_1.z.number(),
    sourceVersionId: zod_1.z.number(),
    branchName: zod_1.z.string(),
    userId: zod_1.z.number()
});
const branchMergeSchema = zod_1.z.object({
    userDappId: zod_1.z.number(),
    sourceBranch: zod_1.z.string(),
    targetBranch: zod_1.z.string(),
    userId: zod_1.z.number()
});
const sandboxCreateSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    environmentType: zod_1.z.string()
});
const deploymentCreateSchema = zod_1.z.object({
    sandboxId: zod_1.z.number(),
    userDappId: zod_1.z.number(),
    dappVersionId: zod_1.z.number()
});
const securityAnalysisSchema = zod_1.z.object({
    contractCode: zod_1.z.string(),
    contractType: zod_1.z.string().optional()
});
const collaborationSessionSchema = zod_1.z.object({
    userDappId: zod_1.z.number(),
    createdBy: zod_1.z.number(),
    settings: zod_1.z.record(zod_1.z.any()).optional()
});
const commentThreadSchema = zod_1.z.object({
    fileId: zod_1.z.number(),
    createdBy: zod_1.z.number(),
    startLine: zod_1.z.number(),
    endLine: zod_1.z.number(),
    content: zod_1.z.string()
});
const codeCompletionSchema = zod_1.z.object({
    code: zod_1.z.string(),
    position: zod_1.z.object({
        line: zod_1.z.number(),
        character: zod_1.z.number()
    }),
    prefix: zod_1.z.string()
});
// Routes for version control
router.post('/versions', async (req, res) => {
    try {
        const validatedData = versionCreateSchema.parse(req.body);
        const version = await services_1.versionService.createVersion(validatedData);
        res.json(version);
    }
    catch (error) {
        console.error('Error creating version:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/dapps/:dappId/versions', async (req, res) => {
    try {
        const dappId = parseInt(req.params.dappId);
        const versions = await services_1.versionService.getDappVersions(dappId);
        res.json(versions);
    }
    catch (error) {
        console.error('Error fetching versions:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/dapps/:dappId/branches', async (req, res) => {
    try {
        const dappId = parseInt(req.params.dappId);
        const branches = await services_1.versionService.getDappBranches(dappId);
        res.json(branches);
    }
    catch (error) {
        console.error('Error fetching branches:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/branches', async (req, res) => {
    try {
        const validatedData = branchCreateSchema.parse(req.body);
        const version = await services_1.versionService.createBranch(validatedData.userDappId, validatedData.sourceVersionId, validatedData.branchName, validatedData.userId);
        res.json(version);
    }
    catch (error) {
        console.error('Error creating branch:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/branches/merge', async (req, res) => {
    try {
        const validatedData = branchMergeSchema.parse(req.body);
        const result = await services_1.versionService.mergeBranches(validatedData.userDappId, validatedData.sourceBranch, validatedData.targetBranch, validatedData.userId);
        res.json(result);
    }
    catch (error) {
        console.error('Error merging branches:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/files/:fileId/history', async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const history = await services_1.versionService.getFileHistory(fileId);
        res.json(history);
    }
    catch (error) {
        console.error('Error fetching file history:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/files/diff', async (req, res) => {
    try {
        const { oldContent, newContent } = req.body;
        const diff = services_1.versionService.diffContents(oldContent, newContent);
        res.json({ diff });
    }
    catch (error) {
        console.error('Error computing diff:', error);
        res.status(400).json({ error: error.message });
    }
});
// Routes for sandbox environments
router.post('/sandboxes', async (req, res) => {
    try {
        const validatedData = sandboxCreateSchema.parse(req.body);
        const sandbox = await services_1.sandboxService.createSandbox(validatedData);
        res.json(sandbox);
    }
    catch (error) {
        console.error('Error creating sandbox:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/users/:userId/sandboxes', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const sandboxes = await services_1.sandboxService.getUserSandboxes(userId);
        res.json(sandboxes);
    }
    catch (error) {
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
        const deployment = await services_1.sandboxService.createDeployment(validatedData);
        res.json(deployment);
    }
    catch (error) {
        console.error('Error creating deployment:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/sandboxes/:sandboxId/deployments', async (req, res) => {
    try {
        const sandboxId = parseInt(req.params.sandboxId);
        const deployments = await services_1.sandboxService.getSandboxDeployments(sandboxId);
        res.json(deployments);
    }
    catch (error) {
        console.error('Error fetching deployments:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/deployments/:deploymentId/transactions', async (req, res) => {
    try {
        const deploymentId = parseInt(req.params.deploymentId);
        const transaction = await services_1.sandboxService.executeTransaction({
            ...req.body,
            deploymentId
        });
        res.json(transaction);
    }
    catch (error) {
        console.error('Error executing transaction:', error);
        res.status(400).json({ error: error.message });
    }
});
router.delete('/sandboxes/:sandboxId', async (req, res) => {
    try {
        const sandboxId = parseInt(req.params.sandboxId);
        const result = await services_1.sandboxService.terminateSandbox(sandboxId);
        res.json(result);
    }
    catch (error) {
        console.error('Error terminating sandbox:', error);
        res.status(400).json({ error: error.message });
    }
});
// Routes for security analysis
router.post('/security/analyze', async (req, res) => {
    try {
        const validatedData = securityAnalysisSchema.parse(req.body);
        const result = await services_1.securityAnalysisService.analyzeContract(validatedData.contractCode, validatedData.contractType);
        res.json(result);
    }
    catch (error) {
        console.error('Error analyzing contract:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/security/templates', async (req, res) => {
    try {
        const templates = await services_1.securityAnalysisService.getSecurityTemplates();
        res.json(templates);
    }
    catch (error) {
        console.error('Error fetching security templates:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/security/fix-recommendations', async (req, res) => {
    try {
        const { vulnerabilityId, contractCode } = req.body;
        const recommendations = services_1.securityAnalysisService.getVulnerabilityFixRecommendations(vulnerabilityId, contractCode);
        res.json(recommendations);
    }
    catch (error) {
        console.error('Error getting fix recommendations:', error);
        res.status(400).json({ error: error.message });
    }
});
// Routes for code completion
router.post('/completion/suggestions', async (req, res) => {
    try {
        const validatedData = codeCompletionSchema.parse(req.body);
        const suggestions = services_1.completionService.getCompletionSuggestions(validatedData.code, validatedData.position, validatedData.prefix);
        res.json(suggestions);
    }
    catch (error) {
        console.error('Error getting completion suggestions:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/completion/improvements', async (req, res) => {
    try {
        const { code } = req.body;
        const improvements = await services_1.completionService.suggestCodeImprovements(code);
        res.json(improvements);
    }
    catch (error) {
        console.error('Error suggesting code improvements:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/completion/documentation/:item', async (req, res) => {
    try {
        const item = req.params.item;
        const documentation = services_1.completionService.getCompletionDocumentation(item);
        res.json({ documentation });
    }
    catch (error) {
        console.error('Error getting documentation:', error);
        res.status(400).json({ error: error.message });
    }
});
// Routes for collaborative editing
router.post('/collaboration/sessions', async (req, res) => {
    try {
        const validatedData = collaborationSessionSchema.parse(req.body);
        const session = await services_1.collaborationService.createSession(validatedData);
        // Notify through Matrix
        await services_1.matrixDappIntegration.sendCollaborationSessionEvent(session.id, 'started', validatedData.createdBy);
        res.json(session);
    }
    catch (error) {
        console.error('Error creating collaboration session:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/collaboration/sessions/:sessionId/participants', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const participant = await services_1.collaborationService.addParticipant(sessionId, req.body);
        // Notify through Matrix
        await services_1.matrixDappIntegration.sendCollaborationSessionEvent(sessionId, 'joined', req.body.userId);
        res.json(participant);
    }
    catch (error) {
        console.error('Error adding participant:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/collaboration/sessions/:sessionId/participants', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const participants = await services_1.collaborationService.getSessionParticipants(sessionId);
        res.json(participants);
    }
    catch (error) {
        console.error('Error fetching participants:', error);
        res.status(400).json({ error: error.message });
    }
});
router.put('/collaboration/sessions/:sessionId/cursor', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const session = await db_1.db.query.collaborativeSessions.findFirst({
            where: (0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeSessions.id, sessionId)
        });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        services_1.collaborationService.updateUserCursor(session.sessionToken, req.body.userId, req.body.cursor);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating cursor:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/collaboration/sessions/:sessionId/end', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const session = await services_1.collaborationService.endSession(sessionId);
        // Notify through Matrix
        await services_1.matrixDappIntegration.sendCollaborationSessionEvent(sessionId, 'ended', req.body.userId);
        res.json(session);
    }
    catch (error) {
        console.error('Error ending session:', error);
        res.status(400).json({ error: error.message });
    }
});
// Routes for comments
router.post('/comments/threads', async (req, res) => {
    try {
        const validatedData = commentThreadSchema.parse(req.body);
        // Create the thread
        const thread = await services_1.collaborationService.createCommentThread({
            fileId: validatedData.fileId,
            createdBy: validatedData.createdBy,
            startLine: validatedData.startLine,
            endLine: validatedData.endLine
        });
        // Add the first comment
        const comment = await services_1.collaborationService.addComment({
            threadId: thread.id,
            userId: validatedData.createdBy,
            content: validatedData.content
        });
        // Notify through Matrix
        await services_1.matrixDappIntegration.sendCodeCommentNotification(thread.id);
        res.json({ thread, comment });
    }
    catch (error) {
        console.error('Error creating comment thread:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/comments/threads/:threadId/comments', async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId);
        const comment = await services_1.collaborationService.addComment({
            ...req.body,
            threadId
        });
        // Notify through Matrix
        await services_1.matrixDappIntegration.sendCodeCommentNotification(threadId);
        res.json(comment);
    }
    catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/comments/files/:fileId/threads', async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const threads = await services_1.collaborationService.getFileCommentThreads(fileId);
        res.json(threads);
    }
    catch (error) {
        console.error('Error fetching comment threads:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/comments/threads/:threadId/resolve', async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId);
        const userId = req.body.userId;
        const thread = await services_1.collaborationService.resolveThread(threadId, userId);
        res.json(thread);
    }
    catch (error) {
        console.error('Error resolving thread:', error);
        res.status(400).json({ error: error.message });
    }
});
// Routes for multi-chain deployment
router.get('/deployment/networks', (req, res) => {
    try {
        const networks = services_1.deploymentService.getSupportedNetworks();
        res.json(networks);
    }
    catch (error) {
        console.error('Error fetching networks:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/deployment/chain-deployments', async (req, res) => {
    try {
        const deployment = await services_1.deploymentService.createDeployment(req.body);
        // Notify through Matrix
        await services_1.matrixDappIntegration.sendDeploymentNotification(req.body.userDappId, deployment.id, req.body.deployedBy, 'started', req.body.chain);
        res.json(deployment);
    }
    catch (error) {
        console.error('Error creating chain deployment:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/deployment/dapps/:dappId/deployments', async (req, res) => {
    try {
        const dappId = parseInt(req.params.dappId);
        const deployments = await services_1.deploymentService.getDappDeployments(dappId);
        res.json(deployments);
    }
    catch (error) {
        console.error('Error fetching deployments:', error);
        res.status(400).json({ error: error.message });
    }
});
router.put('/deployment/chain-deployments/:deploymentId', async (req, res) => {
    try {
        const deploymentId = parseInt(req.params.deploymentId);
        const deployment = await services_1.deploymentService.updateDeployment(deploymentId, req.body);
        // Notify through Matrix about success/failure
        if (deployment.status === 'success' || deployment.status === 'failed') {
            await services_1.matrixDappIntegration.sendDeploymentNotification(deployment.userDappId, deploymentId, deployment.deployedBy, deployment.status, deployment.chain);
        }
        res.json(deployment);
    }
    catch (error) {
        console.error('Error updating deployment:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/deployment/validate-contract', async (req, res) => {
    try {
        const { contractCode, network } = req.body;
        const validation = services_1.deploymentService.validateContractForNetwork(contractCode, network);
        res.json(validation);
    }
    catch (error) {
        console.error('Error validating contract:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/deployment/costs', async (req, res) => {
    try {
        const costs = await services_1.deploymentService.getDeploymentCosts();
        res.json(costs);
    }
    catch (error) {
        console.error('Error fetching deployment costs:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/deployment/networks/:network/instructions', (req, res) => {
    try {
        const network = req.params.network;
        const instructions = services_1.deploymentService.getDeploymentInstructions(network);
        res.json(instructions);
    }
    catch (error) {
        console.error('Error fetching deployment instructions:', error);
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
