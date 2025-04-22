"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDappBuilderRoutes = registerDappBuilderRoutes;
const zod_1 = require("zod");
const storage_1 = require("../storage");
const code_generator_1 = require("../services/code-generation/code-generator");
const nlp_processor_1 = require("../services/code-generation/nlp-processor");
const schema_manager_1 = require("../services/schema-system/schema-manager");
const auth_1 = require("../auth");
const dapp_schema_1 = require("../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
// Initialize services
const nlpProcessor = new nlp_processor_1.NLPProcessor();
const schemaManager = new schema_manager_1.SchemaManager();
const codeGenerator = new code_generator_1.CodeGenerator(nlpProcessor, schemaManager);
/**
 * Function to register DApp Builder routes
 * @param app Express application
 */
async function registerDappBuilderRoutes(app) {
    // Get active chat or create new one
    app.get("/api/dapp-builder/chat", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // Get current active chat or create one
            const activeChats = await storage_1.db.select()
                .from(dapp_schema_1.dappCreationChats)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.userId, userId), (0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.status, "active")))
                .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappCreationChats.updatedAt))
                .limit(1);
            let chat;
            if (activeChats.length === 0) {
                // Create a new chat
                const result = await storage_1.db.insert(dapp_schema_1.dappCreationChats)
                    .values({
                    userId,
                    title: "New DApp Conversation",
                    description: "Started a new conversation with Mysterion AI",
                    status: "active"
                })
                    .returning();
                chat = result[0];
                // Add welcome message
                await storage_1.db.insert(dapp_schema_1.conversationMessages)
                    .values({
                    chatId: chat.id,
                    content: "Hello! I'm Mysterion, your DApp creation assistant. I can help you build custom smart contracts and decentralized applications using natural language. What kind of DApp would you like to create today?",
                    sender: "mysterion"
                });
            }
            else {
                chat = activeChats[0];
            }
            // Get all messages for this chat
            const messages = await storage_1.db.select()
                .from(dapp_schema_1.conversationMessages)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.conversationMessages.chatId, chat.id))
                .orderBy(dapp_schema_1.conversationMessages.timestamp);
            return res.status(200).json({
                chat,
                messages
            });
        }
        catch (error) {
            console.error("Error in /api/dapp-builder/chat:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Get chat history
    app.get("/api/dapp-builder/chats", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const chats = await storage_1.db.select()
                .from(dapp_schema_1.dappCreationChats)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappCreationChats.updatedAt));
            return res.status(200).json(chats);
        }
        catch (error) {
            console.error("Error in /api/dapp-builder/chats:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Get chat messages
    app.get("/api/dapp-builder/chat/:chatId/messages", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const chatId = parseInt(req.params.chatId);
            if (isNaN(chatId)) {
                return res.status(400).json({ error: "Invalid chat ID" });
            }
            // Verify chat belongs to user
            const chat = await storage_1.db.select()
                .from(dapp_schema_1.dappCreationChats)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.id, chatId), (0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.userId, userId)))
                .limit(1);
            if (chat.length === 0) {
                return res.status(404).json({ error: "Chat not found" });
            }
            const messages = await storage_1.db.select()
                .from(dapp_schema_1.conversationMessages)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.conversationMessages.chatId, chatId))
                .orderBy(dapp_schema_1.conversationMessages.timestamp);
            return res.status(200).json(messages);
        }
        catch (error) {
            console.error(`Error in /api/dapp-builder/chat/${req.params.chatId}/messages:`, error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Process message and generate response
    app.post("/api/dapp-builder/process", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // Validate request body
            const schema = zod_1.z.object({
                prompt: zod_1.z.string(),
                chatId: zod_1.z.number().optional(), // Optional - if not provided, we'll use the active chat
                settings: zod_1.z.object({
                    includeTests: zod_1.z.boolean().default(true),
                    includeDocumentation: zod_1.z.boolean().default(true),
                    includeFrontend: zod_1.z.boolean().default(true),
                    optimizationLevel: zod_1.z.enum(['none', 'basic', 'advanced']).default('basic'),
                    securityChecks: zod_1.z.boolean().default(true)
                }).optional()
            });
            const validatedData = schema.parse(req.body);
            // Get or create chat
            let chatId = validatedData.chatId;
            if (!chatId) {
                const activeChats = await storage_1.db.select()
                    .from(dapp_schema_1.dappCreationChats)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.userId, userId), (0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.status, "active")))
                    .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappCreationChats.updatedAt))
                    .limit(1);
                if (activeChats.length === 0) {
                    // Create a new chat
                    const result = await storage_1.db.insert(dapp_schema_1.dappCreationChats)
                        .values({
                        userId,
                        title: "New DApp Conversation",
                        description: "Started a new conversation with Mysterion AI",
                        status: "active",
                        settings: validatedData.settings
                    })
                        .returning();
                    chatId = result[0].id;
                }
                else {
                    chatId = activeChats[0].id;
                    // Update settings if provided
                    if (validatedData.settings) {
                        await storage_1.db.update(dapp_schema_1.dappCreationChats)
                            .set({ settings: validatedData.settings })
                            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.id, chatId));
                    }
                }
            }
            // Add user message to chat
            await storage_1.db.insert(dapp_schema_1.conversationMessages)
                .values({
                chatId,
                content: validatedData.prompt,
                sender: "user"
            });
            // Process the message and generate response using the NLP and Code generation services
            const { response, generatedCode, projectName } = await nlpProcessor.processUserInput(validatedData.prompt, userId, chatId);
            // Add AI response to chat
            await storage_1.db.insert(dapp_schema_1.conversationMessages)
                .values({
                chatId,
                content: response,
                sender: "mysterion"
            });
            // Update chat title if we have a project name
            if (projectName) {
                await storage_1.db.update(dapp_schema_1.dappCreationChats)
                    .set({
                    title: projectName,
                    description: validatedData.prompt.substring(0, 100) + (validatedData.prompt.length > 100 ? '...' : '')
                })
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.id, chatId));
            }
            return res.status(200).json({
                message: response,
                generatedCode: generatedCode,
                projectName: projectName,
                chatId
            });
        }
        catch (error) {
            console.error("Error in /api/dapp-builder/process:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Get available templates
    app.get("/api/dapp-builder/templates", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const category = req.query.category;
            let query = storage_1.db.select().from(dapp_schema_1.dappTemplates).where((0, drizzle_orm_1.eq)(dapp_schema_1.dappTemplates.isActive, true));
            if (category && category !== 'all') {
                query = query.where((0, drizzle_orm_1.eq)(dapp_schema_1.dappTemplates.category, category));
            }
            const templates = await query;
            return res.status(200).json(templates);
        }
        catch (error) {
            console.error("Error in /api/dapp-builder/templates:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Get template by ID
    app.get("/api/dapp-builder/templates/:id", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const templateId = parseInt(req.params.id);
            if (isNaN(templateId)) {
                return res.status(400).json({ error: "Invalid template ID" });
            }
            const template = await storage_1.db.select()
                .from(dapp_schema_1.dappTemplates)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappTemplates.id, templateId), (0, drizzle_orm_1.eq)(dapp_schema_1.dappTemplates.isActive, true)))
                .limit(1);
            if (template.length === 0) {
                return res.status(404).json({ error: "Template not found" });
            }
            return res.status(200).json(template[0]);
        }
        catch (error) {
            console.error(`Error in /api/dapp-builder/templates/${req.params.id}:`, error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Get all user DApps
    app.get("/api/dapp-builder/projects", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const dapps = await storage_1.db.select()
                .from(dapp_schema_1.userDapps)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.userDapps.updatedAt));
            return res.status(200).json(dapps);
        }
        catch (error) {
            console.error("Error in /api/dapp-builder/projects:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Get DApp by ID with files
    app.get("/api/dapp-builder/projects/:id", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const dappId = parseInt(req.params.id);
            if (isNaN(dappId)) {
                return res.status(400).json({ error: "Invalid project ID" });
            }
            // Get the DApp
            const dapp = await storage_1.db.select()
                .from(dapp_schema_1.userDapps)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId), (0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId)))
                .limit(1);
            if (dapp.length === 0) {
                return res.status(404).json({ error: "Project not found" });
            }
            // Get the latest version
            const versions = await storage_1.db.select()
                .from(dapp_schema_1.dappVersions)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.userDappId, dappId))
                .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappVersions.createdAt))
                .limit(1);
            const latestVersion = versions.length > 0 ? versions[0] : null;
            // Get all files for this DApp
            const files = await storage_1.db.select()
                .from(dapp_schema_1.dappFiles)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappFiles.userDappId, dappId));
            // Format the response
            const codeFiles = files.reduce((acc, file) => {
                if (file.fileType === 'contract') {
                    acc.contractCode = file.content;
                }
                else if (file.fileType === 'test') {
                    acc.testCode = file.content;
                }
                else if (file.fileType === 'frontend') {
                    acc.uiCode = file.content;
                }
                else if (file.fileType === 'api') {
                    acc.apiCode = file.content;
                }
                else if (file.fileType === 'documentation') {
                    acc.docs = file.content;
                }
                else if (file.fileType === 'security_report') {
                    acc.securityReport = JSON.parse(file.content);
                }
                return acc;
            }, {});
            return res.status(200).json({
                dapp: dapp[0],
                version: latestVersion,
                code: codeFiles
            });
        }
        catch (error) {
            console.error(`Error in /api/dapp-builder/projects/${req.params.id}:`, error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Create a new DApp
    app.post("/api/dapp-builder/projects", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // Validate request body using the insert schema
            const data = dapp_schema_1.insertUserDappSchema.parse({
                ...req.body,
                userId
            });
            // Create the DApp
            const result = await storage_1.db.insert(dapp_schema_1.userDapps)
                .values(data)
                .returning();
            const dapp = result[0];
            // Create initial version
            await storage_1.db.insert(dapp_schema_1.dappVersions)
                .values({
                userDappId: dapp.id,
                version: "0.1.0",
                changes: "Initial creation"
            });
            return res.status(201).json(dapp);
        }
        catch (error) {
            console.error("Error in POST /api/dapp-builder/projects:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Save generated code to a project
    app.post("/api/dapp-builder/projects/save-code", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // Validate request
            const schema = zod_1.z.object({
                projectId: zod_1.z.number().optional(), // Optional - if not provided, create a new project
                name: zod_1.z.string(),
                description: zod_1.z.string().optional(),
                chain: zod_1.z.string().default("ethereum"),
                code: zod_1.z.object({
                    contractCode: zod_1.z.string(),
                    testCode: zod_1.z.string().optional(),
                    uiCode: zod_1.z.string().optional(),
                    apiCode: zod_1.z.string().optional(),
                    docs: zod_1.z.string().optional(),
                    securityReport: zod_1.z.any().optional()
                })
            });
            const validatedData = schema.parse(req.body);
            let dappId;
            // Create project if no projectId provided
            if (!validatedData.projectId) {
                // Create new DApp
                const result = await storage_1.db.insert(dapp_schema_1.userDapps)
                    .values({
                    userId,
                    name: validatedData.name,
                    description: validatedData.description || "",
                    status: "draft",
                    chain: validatedData.chain,
                    additionalDetails: {
                        securityScore: validatedData.code.securityReport?.score,
                        generatedAt: new Date().toISOString()
                    }
                })
                    .returning();
                dappId = result[0].id;
                // Create initial version
                await storage_1.db.insert(dapp_schema_1.dappVersions)
                    .values({
                    userDappId: dappId,
                    version: "0.1.0",
                    changes: "Initial code generation"
                });
            }
            else {
                // Update existing project
                dappId = validatedData.projectId;
                // Verify project belongs to user
                const existingDapp = await storage_1.db.select()
                    .from(dapp_schema_1.userDapps)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId), (0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId)))
                    .limit(1);
                if (existingDapp.length === 0) {
                    return res.status(404).json({ error: "Project not found" });
                }
                // Update DApp details
                await storage_1.db.update(dapp_schema_1.userDapps)
                    .set({
                    name: validatedData.name,
                    description: validatedData.description || existingDapp[0].description,
                    updatedAt: new Date(),
                    additionalDetails: {
                        ...existingDapp[0].additionalDetails,
                        securityScore: validatedData.code.securityReport?.score,
                    }
                })
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
                // Create new version
                const versions = await storage_1.db.select()
                    .from(dapp_schema_1.dappVersions)
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.userDappId, dappId))
                    .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappVersions.createdAt))
                    .limit(1);
                let versionNum = "0.1.0";
                if (versions.length > 0) {
                    const parts = versions[0].version.split(".");
                    const patch = parseInt(parts[2]) + 1;
                    versionNum = `${parts[0]}.${parts[1]}.${patch}`;
                }
                await storage_1.db.insert(dapp_schema_1.dappVersions)
                    .values({
                    userDappId: dappId,
                    version: versionNum,
                    changes: "Code update"
                });
                // Delete existing files
                await storage_1.db.delete(dapp_schema_1.dappFiles)
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappFiles.userDappId, dappId));
            }
            // Save all code files
            const filesToSave = [
                {
                    userDappId: dappId,
                    fileName: "contract.sol",
                    fileType: "contract",
                    content: validatedData.code.contractCode
                }
            ];
            if (validatedData.code.testCode) {
                filesToSave.push({
                    userDappId: dappId,
                    fileName: "test.js",
                    fileType: "test",
                    content: validatedData.code.testCode
                });
            }
            if (validatedData.code.uiCode) {
                filesToSave.push({
                    userDappId: dappId,
                    fileName: "interface.jsx",
                    fileType: "frontend",
                    content: validatedData.code.uiCode
                });
            }
            if (validatedData.code.apiCode) {
                filesToSave.push({
                    userDappId: dappId,
                    fileName: "api.js",
                    fileType: "api",
                    content: validatedData.code.apiCode
                });
            }
            if (validatedData.code.docs) {
                filesToSave.push({
                    userDappId: dappId,
                    fileName: "documentation.md",
                    fileType: "documentation",
                    content: validatedData.code.docs
                });
            }
            if (validatedData.code.securityReport) {
                filesToSave.push({
                    userDappId: dappId,
                    fileName: "security-report.json",
                    fileType: "security_report",
                    content: JSON.stringify(validatedData.code.securityReport)
                });
            }
            await storage_1.db.insert(dapp_schema_1.dappFiles).values(filesToSave);
            // Return the created/updated DApp
            const dapp = await storage_1.db.select()
                .from(dapp_schema_1.userDapps)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId))
                .limit(1);
            return res.status(200).json({
                success: true,
                dapp: dapp[0],
                files: filesToSave.length
            });
        }
        catch (error) {
            console.error("Error in POST /api/dapp-builder/projects/save-code:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Update DApp status (draft, published, archived)
    app.patch("/api/dapp-builder/projects/:id/status", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const dappId = parseInt(req.params.id);
            if (isNaN(dappId)) {
                return res.status(400).json({ error: "Invalid project ID" });
            }
            // Validate request body
            const schema = zod_1.z.object({
                status: zod_1.z.enum(["draft", "published", "archived"])
            });
            const { status } = schema.parse(req.body);
            // Verify project belongs to user
            const existingDapp = await storage_1.db.select()
                .from(dapp_schema_1.userDapps)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId), (0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId)))
                .limit(1);
            if (existingDapp.length === 0) {
                return res.status(404).json({ error: "Project not found" });
            }
            // Update status
            await storage_1.db.update(dapp_schema_1.userDapps)
                .set({
                status,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
            return res.status(200).json({ success: true, status });
        }
        catch (error) {
            console.error(`Error in PATCH /api/dapp-builder/projects/${req.params.id}/status:`, error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
    // Delete a DApp
    app.delete("/api/dapp-builder/projects/:id", async (req, res) => {
        try {
            const userId = (0, auth_1.getLoggedInUserId)(req);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const dappId = parseInt(req.params.id);
            if (isNaN(dappId)) {
                return res.status(400).json({ error: "Invalid project ID" });
            }
            // Verify project belongs to user
            const existingDapp = await storage_1.db.select()
                .from(dapp_schema_1.userDapps)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId), (0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId)))
                .limit(1);
            if (existingDapp.length === 0) {
                return res.status(404).json({ error: "Project not found" });
            }
            // Delete DApp files first (due to foreign key constraints)
            await storage_1.db.delete(dapp_schema_1.dappFiles)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappFiles.userDappId, dappId));
            // Delete DApp versions
            await storage_1.db.delete(dapp_schema_1.dappVersions)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.userDappId, dappId));
            // Delete the DApp
            await storage_1.db.delete(dapp_schema_1.userDapps)
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
            return res.status(200).json({ success: true });
        }
        catch (error) {
            console.error(`Error in DELETE /api/dapp-builder/projects/${req.params.id}:`, error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
}
