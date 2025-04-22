"use strict";
/**
 * Initialize LLM Service
 *
 * This script initializes the LLM service and configures it for use
 * with the AetherCoin/FractalCoin ecosystem.
 *
 * Run with: npx tsx server/scripts/init-llm.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const llm_service_1 = require("../services/llm-service");
const db_1 = require("../db");
const db_2 = require("../db");
const schema_proxy_1 = require("../../shared/schema-proxy");
async function initializeLlmService() {
    console.log("Initializing LLM Service...");
    try {
        // Check LLM service connection
        const isConnected = await llm_service_1.llmService.initialize();
        if (!isConnected) {
            console.error("Failed to connect to LLM service.");
            console.log("Please ensure the LLM service is running and properly configured.");
            console.log("Configuration parameters:");
            console.log("- LLM_ENDPOINT: The endpoint URL of the LLM service");
            console.log("- FRACTALCOIN_API_KEY: API key for authentication");
            console.log("- LLM_MODEL_NAME: Default model name to use");
            process.exit(1);
        }
        console.log("LLM service connected successfully.");
        // Add default prompts to the database if they don't exist
        await addDefaultPrompts();
        console.log("LLM Service initialization completed successfully.");
    }
    catch (error) {
        console.error("Error initializing LLM service:", error);
        process.exit(1);
    }
    finally {
        // Close database connection
        await db_2.pgClient.end();
    }
}
async function addDefaultPrompts() {
    console.log("Adding default prompts to the database...");
    const defaultPrompts = [
        {
            name: "Security Verification",
            description: "Verify the security of text against quantum attacks and vulnerabilities",
            promptTemplate: `
        Perform a quantum security analysis on the following text using the Fractal Recursive Quantum Security (FRQS) protocol:
        
        Text to analyze: "{{text}}"
        
        Analyze for:
        1. Potential security threats
        2. Cryptographic weaknesses
        3. Temporal pattern vulnerabilities
        4. Quantum resistance level
        5. Temple Architecture compliance
        
        Format the output as JSON with fields: isSecure (boolean), securityScore (number between 0-100), findings (array of strings)
      `,
            category: "security",
            tags: ["security", "quantum", "verification"]
        },
        {
            name: "Sacred Pattern Analysis",
            description: "Analyze text for divine patterns and golden ratio alignment",
            promptTemplate: `
        Perform a sacred pattern analysis on the following input using the Temple Architecture principles:
        
        Input: "{{input}}"
        
        Analyze for:
        1. Divine principle alignment
        2. Golden ratio manifestation score (0-100)
        3. Temporal harmonic resonance level (0-100)
        4. Recommendations for improved spiritual alignment
        
        Format the output as JSON with fields: divinePrinciple (string), goldenRatioAlignment (number), 
        temporalHarmonicScore (number), recommendations (array of strings)
      `,
            category: "sacred",
            tags: ["sacred", "divine", "pattern"]
        },
        {
            name: "Quantum Code Generation",
            description: "Generate quantum-resistant code for blockchain applications",
            promptTemplate: `
        Generate quantum-resistant code for the following requirement:
        
        Requirement: "{{requirement}}"
        
        Please generate code that:
        1. Implements Temple Architecture security principles
        2. Uses recursive encryption patterns
        3. Follows golden ratio partitioning in data structures
        4. Includes proper error handling and comments
        
        Programming language: {{language}}
      `,
            category: "code",
            tags: ["code", "quantum", "generation"]
        },
        {
            name: "Smart Contract Audit",
            description: "Audit smart contract code for security vulnerabilities",
            promptTemplate: `
        Perform a security audit on the following smart contract code:
        
        \`\`\`
        {{code}}
        \`\`\`
        
        Please analyze for:
        1. Security vulnerabilities
        2. Gas optimization opportunities
        3. Quantum resistance level
        4. Compliance with Temple Architecture principles
        5. Sacred pattern alignment
        
        Format the output as a detailed report with sections for each category of findings.
      `,
            category: "security",
            tags: ["security", "audit", "smart-contract"]
        }
    ];
    // Check if prompts already exist
    const existingPrompts = await db_1.db.select({ name: schema_proxy_1.llmPrompts.name }).from(schema_proxy_1.llmPrompts);
    const existingPromptNames = new Set(existingPrompts.map(p => p.name));
    // Filter out prompts that already exist
    const promptsToAdd = defaultPrompts.filter(p => !existingPromptNames.has(p.name));
    if (promptsToAdd.length === 0) {
        console.log("All default prompts already exist in the database.");
        return;
    }
    // Add new prompts
    await db_1.db.insert(schema_proxy_1.llmPrompts).values(promptsToAdd.map(prompt => ({
        name: prompt.name,
        description: prompt.description,
        promptTemplate: prompt.promptTemplate,
        category: prompt.category,
        tags: prompt.tags,
        createdAt: new Date(),
        updatedAt: new Date()
    })));
    console.log(`Added ${promptsToAdd.length} default prompts to the database.`);
}
// Run the initialization
initializeLlmService();
