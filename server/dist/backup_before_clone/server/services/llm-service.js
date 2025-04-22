"use strict";
/**
 * LLM Service
 *
 * This service integrates the open-source LLM with the AetherCoin ecosystem.
 * It provides a standardized interface for all LLM operations and manages
 * connections, caching, and optimizations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmService = void 0;
const schema_proxy_1 = require("../../shared/schema-proxy");
const db_1 = require("../db");
const llm_config_1 = require("../config/llm-config");
// Default configuration
const defaultConfig = {
    endpoint: llm_config_1.LLM_ENDPOINT,
    apiKey: llm_config_1.FRACTALCOIN_API_KEY,
    modelName: llm_config_1.LLM_MODELS.DEFAULT.name,
    maxTokens: llm_config_1.LLM_MODELS.DEFAULT.maxTokens,
    temperature: llm_config_1.LLM_MODELS.DEFAULT.temperature,
    topP: llm_config_1.LLM_MODELS.DEFAULT.topP
};
/**
 * LLM Service for integrating with the open-source LLM
 */
class LLMService {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        // Check for required configuration
        if (!this.config.endpoint) {
            console.warn("LLM endpoint not configured, using default local endpoint");
        }
        if (!this.config.apiKey && process.env.NODE_ENV === 'production') {
            console.warn("FRACTALCOIN_API_KEY not set, LLM requests may fail in production");
        }
    }
    /**
     * Initialize the LLM service
     */
    async initialize() {
        try {
            // Check connection to LLM
            const response = await fetch(`${this.config.endpoint}/health`);
            const isHealthy = response.ok;
            if (isHealthy) {
                console.log("LLM service connected successfully");
            }
            else {
                console.error("LLM service connection failed");
            }
            return isHealthy;
        }
        catch (error) {
            console.error("Failed to initialize LLM service:", error);
            return false;
        }
    }
    /**
     * Generate text using the LLM
     */
    async generateText(prompt, userId, options) {
        const requestConfig = { ...this.config, ...options };
        const startTime = Date.now();
        try {
            // Prepare request payload
            const payload = {
                prompt,
                max_tokens: requestConfig.maxTokens,
                temperature: requestConfig.temperature,
                top_p: requestConfig.topP,
                model: requestConfig.modelName
            };
            // Make request to LLM endpoint
            const response = await fetch(`${requestConfig.endpoint}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(requestConfig.apiKey ? { 'Authorization': `Bearer ${requestConfig.apiKey}` } : {})
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`LLM request failed with status: ${response.status}`);
            }
            const result = await response.json();
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            // Log the request for monitoring
            if (userId) {
                await this.logRequest(userId, prompt, result.text, processingTime);
            }
            return {
                text: result.text,
                usage: {
                    promptTokens: result.usage?.prompt_tokens || 0,
                    completionTokens: result.usage?.completion_tokens || 0,
                    totalTokens: result.usage?.total_tokens || 0
                },
                metadata: {
                    model: requestConfig.modelName,
                    processingTime
                }
            };
        }
        catch (error) {
            console.error("Error generating text with LLM:", error);
            // Log the failed request
            if (userId) {
                await this.logRequest(userId, prompt, "ERROR: Request failed", Date.now() - startTime, true);
            }
            // Return a fallback response
            return {
                text: "I apologize, but I encountered an issue processing your request. Please try again later.",
                usage: {
                    promptTokens: prompt.length / 4, // rough estimate
                    completionTokens: 0,
                    totalTokens: prompt.length / 4
                },
                metadata: {
                    error: true,
                    errorMessage: error instanceof Error ? error.message : "Unknown error"
                }
            };
        }
    }
    /**
     * Log LLM request to database for monitoring and auditing
     */
    async logRequest(userId, prompt, response, processingTime, isError = false) {
        try {
            await db_1.db.insert(schema_proxy_1.aiMonitoringLogs).values({
                userId,
                timestamp: new Date(),
                action: "llm_request",
                details: {
                    prompt,
                    response: response.substring(0, 1000), // Limit size for storage
                    processingTime,
                    isError,
                    model: this.config.modelName
                }
            });
        }
        catch (error) {
            console.error("Failed to log LLM request:", error);
        }
    }
    /**
     * Run a quantum security verification on text using the LLM
     * This implements the Fractal Recursive Quantum Security (FRQS) pattern
     */
    async runSecurityVerification(text, userId) {
        // Use the specialized security model configuration
        const securityModelConfig = (0, llm_config_1.getModelConfig)("security");
        const systemPrompt = llm_config_1.SYSTEM_PROMPTS.SECURITY;
        const prompt = `
      ${systemPrompt}
      
      Perform a quantum security analysis on the following text using the Fractal Recursive Quantum Security (FRQS) protocol:
      
      Text to analyze: "${text}"
      
      Analyze for:
      1. Potential security threats
      2. Cryptographic weaknesses
      3. Temporal pattern vulnerabilities
      4. Quantum resistance level
      5. Temple Architecture compliance
      
      Format the output as JSON with fields: isSecure (boolean), securityScore (number between 0-100), findings (array of strings)
    `;
        const response = await this.generateText(prompt, userId, {
            modelName: securityModelConfig.name,
            temperature: securityModelConfig.temperature,
            topP: securityModelConfig.topP,
            maxTokens: securityModelConfig.maxTokens
        });
        try {
            // Try to parse JSON from the response
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    isSecure: result.isSecure || false,
                    securityScore: result.securityScore || 0,
                    findings: result.findings || []
                };
            }
        }
        catch (error) {
            console.error("Failed to parse security verification result:", error);
        }
        // Fallback response if parsing fails
        return {
            isSecure: false,
            securityScore: 0,
            findings: ["Unable to complete security verification"]
        };
    }
    /**
     * Generate sacred pattern analysis using the LLM
     * Implements Sacred Utility Module (SUM) patterns aligned with divine architecture
     */
    async generateSacredPatternAnalysis(input, userId) {
        // Use the specialized sacred pattern model configuration
        const sacredModelConfig = (0, llm_config_1.getModelConfig)("sacred_pattern");
        const systemPrompt = llm_config_1.SYSTEM_PROMPTS.SACRED_PATTERN;
        const prompt = `
      ${systemPrompt}
      
      Perform a sacred pattern analysis on the following input using the Temple Architecture principles:
      
      Input: "${input}"
      
      Analyze for:
      1. Divine principle alignment
      2. Golden ratio manifestation score (0-100)
      3. Temporal harmonic resonance level (0-100)
      4. Recommendations for improved spiritual alignment
      
      Format the output as JSON with fields: divinePrinciple (string), goldenRatioAlignment (number), 
      temporalHarmonicScore (number), recommendations (array of strings)
    `;
        const response = await this.generateText(prompt, userId, {
            modelName: sacredModelConfig.name,
            temperature: sacredModelConfig.temperature,
            topP: sacredModelConfig.topP,
            maxTokens: sacredModelConfig.maxTokens
        });
        try {
            // Try to parse JSON from the response
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    divinePrinciple: result.divinePrinciple || "Unknown",
                    goldenRatioAlignment: result.goldenRatioAlignment || 0,
                    temporalHarmonicScore: result.temporalHarmonicScore || 0,
                    recommendations: result.recommendations || []
                };
            }
        }
        catch (error) {
            console.error("Failed to parse sacred pattern analysis:", error);
        }
        // Fallback response if parsing fails
        return {
            divinePrinciple: "Universal Harmony",
            goldenRatioAlignment: 33,
            temporalHarmonicScore: 42,
            recommendations: ["Seek deeper divine connection"]
        };
    }
}
// Export singleton instance
exports.llmService = new LLMService();
