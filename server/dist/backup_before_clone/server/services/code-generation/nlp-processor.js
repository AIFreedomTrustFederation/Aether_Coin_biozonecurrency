"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPProcessor = void 0;
const storage_1 = require("../../storage");
const schema_manager_1 = require("../schema-system/schema-manager");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * NLP Processor Service
 * Processes user inputs in natural language and interfaces with code generation services
 */
class NLPProcessor {
    constructor() {
        this.codeGenerator = null;
        this.schemaManager = null;
        // We'll set these later to avoid circular dependencies
        this.schemaManager = new schema_manager_1.SchemaManager();
    }
    /**
     * Set code generator instance (called from CodeGenerator to avoid circular dependencies)
     */
    setCodeGenerator(codeGenerator) {
        this.codeGenerator = codeGenerator;
    }
    /**
     * Process user input and generate a response
     * @param userInput The natural language input from the user
     * @param userId The user's ID
     * @param chatId The chat session ID
     * @returns Generated response and code
     */
    async processUserInput(userInput, userId, chatId) {
        try {
            // Get chat settings
            const chatSettings = await this.getChatSettings(chatId);
            // Analyze the intent of the user's message
            const { intent, entities } = await this.analyzeIntent(userInput);
            let response = '';
            let generatedCode = null;
            let projectName = null;
            // Handle the intent
            switch (intent) {
                case 'create_contract':
                    // Generate code based on the user's requirements
                    const result = await this.generateCode(userInput, entities, chatSettings);
                    generatedCode = result.code;
                    projectName = result.projectName;
                    response = result.response;
                    break;
                case 'modify_contract':
                    // Modify existing contract code
                    if (entities.contractId) {
                        const result = await this.modifyCode(entities.contractId, userInput, chatSettings);
                        generatedCode = result.code;
                        projectName = result.projectName || null;
                        response = result.response;
                    }
                    else {
                        response = "I'd be happy to help you modify a contract. Could you please specify which contract you'd like to modify or provide more details about what you want to change?";
                    }
                    break;
                case 'explain_concept':
                    // Provide explanation on blockchain concepts
                    response = await this.explainConcept(entities.concept || '');
                    break;
                case 'security_audit':
                    // Perform security audit on contract
                    if (entities.contractId) {
                        const result = await this.auditCode(entities.contractId);
                        generatedCode = result.code;
                        response = result.response;
                    }
                    else {
                        response = "I'd be happy to conduct a security audit on your smart contract. Could you please specify which contract you'd like me to analyze?";
                    }
                    break;
                case 'deploy_request':
                    // Handle deployment request
                    response = "To deploy your contract, we'll need to first ensure it's properly tested and audited. I can help you prepare it for deployment. Would you like me to generate deployment scripts and configuration files?";
                    break;
                case 'general_question':
                    // Answer general questions about DApps
                    response = this.answerGeneralQuestion(userInput);
                    break;
                default:
                    // Default response if we can't determine the intent
                    response = "I'm not sure I fully understand what you're looking for. Could you provide more details about what kind of DApp or smart contract you want to create? For example, you could say something like 'Create a token with 1 million total supply' or 'Build an NFT marketplace with 2.5% royalties'.";
            }
            // Save the conversation
            await this.saveConversation(chatId, userInput, response);
            return { response, generatedCode, projectName };
        }
        catch (error) {
            console.error('Error processing user input:', error);
            return {
                response: "I'm sorry, I encountered an error while processing your request. Please try again with a different description or check the technical requirements.",
                generatedCode: null,
                projectName: null
            };
        }
    }
    /**
     * Get chat settings
     * @param chatId Chat ID
     * @returns Chat settings
     */
    async getChatSettings(chatId) {
        const chat = await storage_1.db.select()
            .from(dapp_schema_1.dappCreationChats)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.id, chatId))
            .limit(1);
        return chat[0]?.settings || {
            includeTests: true,
            includeDocumentation: true,
            includeFrontend: true,
            optimizationLevel: 'basic',
            securityChecks: true
        };
    }
    /**
     * Analyze the intent of the user's message
     * @param userInput User's natural language input
     * @returns Intent and extracted entities
     */
    async analyzeIntent(userInput) {
        const input = userInput.toLowerCase();
        const entities = {};
        // Simple intent detection based on keywords
        if (input.includes('create') ||
            input.includes('generate') ||
            input.includes('build') ||
            input.includes('make') ||
            input.includes('develop')) {
            // Extract project name if mentioned
            const projectNameMatch = userInput.match(/called\s+([A-Za-z0-9]+)/i) ||
                userInput.match(/named\s+([A-Za-z0-9]+)/i);
            if (projectNameMatch && projectNameMatch[1]) {
                entities.projectName = projectNameMatch[1];
            }
            return { intent: 'create_contract', entities };
        }
        else if (input.includes('modify') ||
            input.includes('change') ||
            input.includes('update') ||
            input.includes('improve') ||
            input.includes('edit')) {
            // Extract contract ID if mentioned
            const contractIdMatch = input.match(/contract\s+(\d+)/i);
            if (contractIdMatch && contractIdMatch[1]) {
                entities.contractId = parseInt(contractIdMatch[1]);
            }
            return { intent: 'modify_contract', entities };
        }
        else if (input.includes('explain') ||
            input.includes('what is') ||
            input.includes('how does') ||
            input.includes('tell me about')) {
            // Extract concept if mentioned
            const conceptMatches = [
                input.match(/explain\s+([a-z\s]+)/i),
                input.match(/what\s+is\s+([a-z\s]+)/i),
                input.match(/how\s+does\s+([a-z\s]+)/i),
                input.match(/tell\s+me\s+about\s+([a-z\s]+)/i)
            ].filter(Boolean);
            if (conceptMatches.length > 0 && conceptMatches[0]) {
                entities.concept = conceptMatches[0][1].trim();
            }
            return { intent: 'explain_concept', entities };
        }
        else if (input.includes('audit') ||
            input.includes('security') ||
            input.includes('check') ||
            input.includes('vulnerabilities')) {
            // Extract contract ID if mentioned
            const contractIdMatch = input.match(/contract\s+(\d+)/i);
            if (contractIdMatch && contractIdMatch[1]) {
                entities.contractId = parseInt(contractIdMatch[1]);
            }
            return { intent: 'security_audit', entities };
        }
        else if (input.includes('deploy') ||
            input.includes('publish') ||
            input.includes('release')) {
            return { intent: 'deploy_request', entities };
        }
        else {
            return { intent: 'general_question', entities };
        }
    }
    /**
     * Generate code based on user requirements
     * @param userInput User's natural language input
     * @param entities Extracted entities from input
     * @param settings Chat settings
     * @returns Generated code, project name, and response
     */
    async generateCode(userInput, entities, settings) {
        try {
            if (!this.codeGenerator) {
                throw new Error('Code generator not initialized');
            }
            // Extract project name from entities or generate one
            let projectName = entities.projectName || this.generateProjectName(userInput);
            // Generate code using the code generator service
            const generatedCode = await this.codeGenerator.generateContract(userInput, settings);
            let response = `I've generated the ${projectName} smart contract based on your requirements. `;
            if (settings.includeTests) {
                response += "I've also included tests to ensure the contract functions correctly. ";
            }
            if (settings.includeDocumentation) {
                response += "Documentation has been generated to help you understand the contract's functionality. ";
            }
            if (settings.includeFrontend) {
                response += "I've created a basic UI component to interact with the contract. ";
            }
            if (settings.securityChecks) {
                if (generatedCode.securityReport && generatedCode.securityReport.issues.length > 0) {
                    const criticalIssues = generatedCode.securityReport.issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high');
                    if (criticalIssues.length > 0) {
                        response += `⚠️ The security analysis found ${criticalIssues.length} critical/high severity issues that should be addressed before deployment. `;
                    }
                    else {
                        response += `The security analysis found ${generatedCode.securityReport.issues.length} minor issues that you might want to review. `;
                    }
                }
                else {
                    response += "The security analysis didn't find any issues with the generated code. ";
                }
            }
            response += "Please review the generated code. Would you like me to help you implement any additional features or make any modifications?";
            return {
                code: generatedCode,
                projectName,
                response
            };
        }
        catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    }
    /**
     * Modify existing code based on user requirements
     * @param contractId Contract ID to modify
     * @param userInput User's natural language input
     * @param settings Chat settings
     * @returns Modified code, project name, and response
     */
    async modifyCode(contractId, userInput, settings) {
        // This would be implemented to retrieve and modify existing code
        // For now, we'll return a placeholder response
        return {
            code: {
                contractCode: '// Modified contract code would go here',
                testCode: '// Modified test code would go here',
            },
            projectName: null,
            response: "I would modify the contract based on your requirements, but this functionality is not yet implemented. Please try generating a new contract instead."
        };
    }
    /**
     * Perform a security audit on existing code
     * @param contractId Contract ID to audit
     * @returns Audit results and response
     */
    async auditCode(contractId) {
        // This would be implemented to retrieve and audit existing code
        // For now, we'll return a placeholder response
        return {
            code: {
                contractCode: '// Contract code',
                securityReport: {
                    issues: [],
                    score: 95,
                    passedChecks: ['No reentrancy vulnerabilities', 'Proper access control'],
                    failedChecks: []
                }
            },
            response: "I would perform a security audit on the contract, but this functionality is not yet implemented. Please try generating a new contract with security checks enabled instead."
        };
    }
    /**
     * Explain a blockchain or smart contract concept
     * @param concept The concept to explain
     * @returns Explanation
     */
    async explainConcept(concept) {
        // This would ideally use a more sophisticated knowledge base or LLM
        // For now, we'll return a simple explanation based on common concepts
        const concepts = {
            'erc20': "ERC-20 is the technical standard for fungible tokens created using the Ethereum blockchain. A fungible token is one that is interchangeable with another token—where the value of one token is always equal to the value of another token. ERC-20 tokens are designed to be equivalent and interchangeable, similar to how one dollar bill is equivalent to another.",
            'erc721': "ERC-721 is the standard for non-fungible tokens (NFTs) on the Ethereum blockchain. NFTs are unique digital assets where each token has distinct properties and values. Unlike fungible tokens such as ERC-20, each ERC-721 token is unique and cannot be interchanged with another token at a 1:1 ratio.",
            'smart contract': "A smart contract is a self-executing contract with the terms of the agreement directly written into code. Smart contracts run on blockchain networks and automatically execute when predetermined conditions are met. They eliminate the need for third-party intermediaries, making transactions traceable, transparent, and irreversible.",
            'dao': "A DAO (Decentralized Autonomous Organization) is an entity with no central leadership. Decisions get made from the bottom-up, governed by a community organized around a specific set of rules enforced on a blockchain. DAOs are internet-native organizations collectively owned and managed by their members. They have built-in treasuries that are only accessible with the approval of their members.",
            'gas': "Gas refers to the fee required to successfully conduct a transaction or execute a contract on the Ethereum blockchain. Gas fees are paid in Ethereum's native currency, Ether (ETH), and are used to allocate resources of the Ethereum Virtual Machine (EVM) so that decentralized applications can self-execute in a secured but decentralized fashion.",
            'defi': "DeFi (Decentralized Finance) refers to a financial ecosystem built on blockchain technology that aims to recreate and improve upon traditional financial systems using smart contracts. DeFi applications provide services like lending, borrowing, trading, and earning interest without relying on traditional financial intermediaries like banks or brokers."
        };
        // Try to match the concept with our knowledge base
        const matchedConcept = Object.keys(concepts).find(key => concept.toLowerCase().includes(key.toLowerCase()));
        if (matchedConcept) {
            return concepts[matchedConcept];
        }
        else {
            return `I don't have specific information about "${concept}" in my knowledge base. Would you like me to help you create a smart contract or DApp related to this concept instead?`;
        }
    }
    /**
     * Answer a general question about DApps or blockchain
     * @param question The user's question
     * @returns Answer
     */
    answerGeneralQuestion(question) {
        // This would ideally use a more sophisticated knowledge base or LLM
        // For now, we'll return a generic response
        return "I'd be happy to help you build a decentralized application (DApp) or smart contract. To get started, could you tell me what specific functionality you'd like your DApp to have? For example, you might want to create a token, an NFT collection, a marketplace, or a DAO governance system.";
    }
    /**
     * Generate a project name based on user input
     * @param userInput User's natural language input
     * @returns Generated project name
     */
    generateProjectName(userInput) {
        // Extract meaningful words from the input
        const words = userInput.split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['create', 'build', 'generate', 'make', 'develop', 'would', 'like', 'want', 'need', 'please', 'could', 'should'].includes(word.toLowerCase()));
        // If we have meaningful words, use them to create a name
        if (words.length > 0) {
            const word = words[Math.floor(Math.random() * words.length)];
            return word.charAt(0).toUpperCase() + word.slice(1) + 'DApp';
        }
        // Default names if we can't extract anything meaningful
        const defaultNames = ['AetherDApp', 'QuantumContract', 'FractalProject', 'MysterionDApp', 'CryptoProject'];
        return defaultNames[Math.floor(Math.random() * defaultNames.length)];
    }
    /**
     * Save conversation to the database
     * @param chatId Chat ID
     * @param userMessage User's message
     * @param aiResponse AI's response
     */
    async saveConversation(chatId, userMessage, aiResponse) {
        // Update chat's last update time
        await storage_1.db.update(dapp_schema_1.dappCreationChats)
            .set({ updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappCreationChats.id, chatId));
    }
}
exports.NLPProcessor = NLPProcessor;
