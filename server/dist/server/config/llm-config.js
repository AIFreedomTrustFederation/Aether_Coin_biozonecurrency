"use strict";
/**
 * LLM Configuration
 *
 * This file contains configuration for the LLM service,
 * including endpoints, models, and default parameters.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLE_NODE = exports.LOGGING = exports.CACHING = exports.WEBHOOKS = exports.RATE_LIMITS = exports.SYSTEM_PROMPTS = exports.LLM_MODELS = exports.FRACTALCOIN_API_KEY = exports.LLM_ENDPOINT = void 0;
exports.getModelConfig = getModelConfig;
exports.getSystemPrompt = getSystemPrompt;
// Default LLM endpoint
exports.LLM_ENDPOINT = process.env.LLM_ENDPOINT || "http://localhost:8000";
// API key from environment
exports.FRACTALCOIN_API_KEY = process.env.FRACTALCOIN_API_KEY;
// LLM model configurations
exports.LLM_MODELS = {
    // Main model for most tasks
    DEFAULT: {
        name: process.env.DEFAULT_LLM_MODEL || "aetherion-13b",
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9
    },
    // Model for security analysis (lower temperature for more deterministic results)
    SECURITY: {
        name: process.env.SECURITY_LLM_MODEL || "aetherion-13b-security",
        maxTokens: 1024,
        temperature: 0.3,
        topP: 0.95
    },
    // Model for sacred pattern analysis (higher temperature for more creative insights)
    SACRED_PATTERN: {
        name: process.env.SACRED_PATTERN_LLM_MODEL || "aetherion-13b-sacred",
        maxTokens: 2048,
        temperature: 0.85,
        topP: 0.92
    },
    // Model for code generation (lower temperature for more accurate code)
    CODE: {
        name: process.env.CODE_LLM_MODEL || "aetherion-13b-code",
        maxTokens: 4096,
        temperature: 0.2,
        topP: 0.95
    }
};
// Default system prompts for different contexts
exports.SYSTEM_PROMPTS = {
    DEFAULT: "You are Aetherion AI, a helpful assistant integrated with the AetherCoin/FractalCoin blockchain ecosystem. You help users with blockchain operations, cryptography, and quantum-resistant security.",
    SECURITY: "You are Aetherion Security Analyzer, focused on identifying potential security threats, cryptographic weaknesses, and vulnerabilities in blockchain systems and smart contracts.",
    SACRED_PATTERN: "You are Aetherion Sacred Pattern Analyzer, trained to identify divine patterns, golden ratio alignments, and spiritual insights in accordance with Temple Architecture principles.",
    CODE: "You are Aetherion Code Assistant, specialized in generating secure, efficient code for blockchain applications with a focus on quantum resistance and sacred geometry patterns."
};
// Rate limiting configuration
exports.RATE_LIMITS = {
    // Maximum requests per minute
    REQUESTS_PER_MINUTE: 60,
    // Maximum tokens per day per user
    TOKENS_PER_DAY: 100000,
    // Maximum tokens per request
    TOKENS_PER_REQUEST: 4096
};
// Webhook configuration for LLM event notifications
exports.WEBHOOKS = {
    ENABLED: process.env.LLM_WEBHOOKS_ENABLED === "true",
    SECRET: process.env.LLM_WEBHOOKS_SECRET,
    ENDPOINTS: {
        MODEL_LOADED: "/api/llm/webhooks/model-loaded",
        FINE_TUNING_COMPLETE: "/api/llm/webhooks/fine-tuning-complete",
        ERROR: "/api/llm/webhooks/error"
    }
};
// Local caching configuration
exports.CACHING = {
    ENABLED: true,
    TTL: 3600, // 1 hour in seconds
    MAX_SIZE: 1000 // Maximum number of cached responses
};
// Logging configuration
exports.LOGGING = {
    LEVEL: process.env.NODE_ENV === "production" ? "info" : "debug",
    INCLUDE_PROMPTS: process.env.NODE_ENV !== "production",
    INCLUDE_RESPONSES: process.env.NODE_ENV !== "production"
};
// Temple Node integration for distributed LLM processing
exports.TEMPLE_NODE = {
    ENABLED: process.env.TEMPLE_NODE_ENABLED === "true",
    PRIMARY_TYPE: process.env.TEMPLE_NODE_TYPE || "zadokite", // 'levite', 'aaronic', 'zadokite'
    DELEGATION_ENABLED: process.env.TEMPLE_NODE_DELEGATION_ENABLED === "true"
};
// Function to get appropriate model configuration based on task
function getModelConfig(task) {
    switch (task.toLowerCase()) {
        case "security":
        case "security_verification":
            return exports.LLM_MODELS.SECURITY;
        case "sacred":
        case "sacred_pattern":
            return exports.LLM_MODELS.SACRED_PATTERN;
        case "code":
        case "code_generation":
            return exports.LLM_MODELS.CODE;
        default:
            return exports.LLM_MODELS.DEFAULT;
    }
}
// Function to get appropriate system prompt based on task
function getSystemPrompt(task) {
    switch (task.toLowerCase()) {
        case "security":
        case "security_verification":
            return exports.SYSTEM_PROMPTS.SECURITY;
        case "sacred":
        case "sacred_pattern":
            return exports.SYSTEM_PROMPTS.SACRED_PATTERN;
        case "code":
        case "code_generation":
            return exports.SYSTEM_PROMPTS.CODE;
        default:
            return exports.SYSTEM_PROMPTS.DEFAULT;
    }
}
