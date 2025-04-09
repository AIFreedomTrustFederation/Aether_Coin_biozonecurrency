# LLM Integration with AetherCoin/FractalCoin

This document provides a comprehensive guide on how the AetherCoin/FractalCoin ecosystem integrates with open-source LLMs (Large Language Models) to power various features of the platform.

## Architecture Overview

The integration follows a layered architecture that separates concerns and provides a clean interface:

1. **Database Layer**: Stores conversations, prompts, messages, and analysis results
2. **Service Layer**: Provides a standardized interface for LLM operations
3. **API Layer**: Exposes LLM functionality via RESTful endpoints
4. **Configuration Layer**: Manages model configurations, endpoints, and parameters

## Key Components

### LLM Service (`server/services/llm-service.ts`)

The LLM Service is the core component that interacts with the actual LLM endpoint. It:

- Manages connection to the LLM endpoint
- Handles prompt formatting and response parsing
- Implements specialized analysis functions:
  - Quantum Security Verification
  - Sacred Pattern Analysis
- Handles error conditions gracefully
- Logs activity for monitoring and auditing

### Database Schema (`shared/llm-schema.ts`)

The database schema defines:

- LLM Prompts: Predefined prompt templates for different operations
- LLM Conversations: Threaded conversations with the LLM
- LLM Messages: Individual messages in conversations
- LLM Fine-tuning Jobs: Tracking model fine-tuning operations
- Sacred Pattern Records: Stores divine pattern analyses

### API Routes (`server/routes/llm-routes.ts`)

The API provides RESTful endpoints for:

- Generating text with the LLM
- Creating and managing conversations
- Performing quantum security verification
- Analyzing sacred patterns
- Fine-tuning models
- Retrieving analytics and historical data

### Configuration (`server/config/llm-config.ts`)

The configuration system specifies:

- Default model parameters
- Specialization for different task types:
  - Default conversational interface
  - Security analysis
  - Sacred pattern analysis
  - Code generation
- System prompts for different contexts
- Rate limiting and caching settings
- Integration with Temple Node Architecture

## Temple Architecture Integration

The LLM integration is designed in alignment with the Temple Architecture principles:

1. **Three-tier Node Structure**: 
   - Levite Nodes: Handle initial request validation
   - Aaronic Nodes: Process requests and manage caching
   - Zadokite Nodes: Perform advanced analyses and ensure quantum security

2. **Sacred Utility Modules (SUMs)**: 
   - Sacred Pattern Analysis: Identifies divine patterns and golden ratio manifestations
   - Fractal Recursive Quantum Security: Performs multi-layer recursive security analysis
   - Temporal State Management: Maintains consistency across time-dimensions

3. **Divine Pattern Alignment**:
   - Golden Ratio parameter tuning
   - Phi-based token allocation
   - π-wrapped encryption for sacred data

## Setting Up & Configuration

### Environment Variables

Required environment variables:
- `LLM_ENDPOINT`: The API endpoint for the LLM service
- `FRACTALCOIN_API_KEY`: API key for authentication
- `LLM_MODEL_NAME`: Default model name to use

Optional environment variables:
- `SECURITY_LLM_MODEL`: Model for security analysis
- `SACRED_PATTERN_LLM_MODEL`: Model for sacred pattern analysis
- `CODE_LLM_MODEL`: Model for code generation
- `LLM_WEBHOOKS_ENABLED`: Enable webhook notifications
- `LLM_WEBHOOKS_SECRET`: Secret for webhook authentication
- `TEMPLE_NODE_ENABLED`: Enable Temple Node Architecture
- `TEMPLE_NODE_TYPE`: Type of node ('levite', 'aaronic', 'zadokite')

### Initialization Script

Run the initialization script to set up the LLM service:

```bash
npx tsx server/scripts/init-llm.ts
```

This will:
1. Test the connection to the LLM service
2. Add default prompts to the database
3. Configure optimal parameters

## Usage Examples

### Generating Text

```typescript
// Direct service usage
import { llmService } from "../services/llm-service";

const response = await llmService.generateText(
  "What is the divine nature of blockchain technology?",
  userId, // optional
  {
    temperature:, // optional parameters override defaults
    maxTokens: 
  }
);

console.log(response.text);
```

### Security Verification

```typescript
// Security verification of text
const securityResult = await llmService.runSecurityVerification(
  "Some text to analyze for security vulnerabilities",
  userId // optional
);

if (securityResult.isSecure) {
  console.log(`Security Score: ${securityResult.securityScore}`);
} else {
  console.log("Security issues found:", securityResult.findings);
}
```

### Sacred Pattern Analysis

```typescript
// Divine pattern analysis
const patternResult = await llmService.generateSacredPatternAnalysis(
  "Input to analyze for divine patterns and golden ratio alignment",
  userId // optional
);

console.log(`Divine Principle: ${patternResult.divinePrinciple}`);
console.log(`Golden Ratio Alignment: ${patternResult.goldenRatioAlignment}`);
console.log(`Temporal Harmonic Score: ${patternResult.temporalHarmonicScore}`);
console.log("Recommendations:", patternResult.recommendations);
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/llm/generate` | POST | Generate text using the LLM |
| `/api/llm/conversations` | POST | Create a new conversation |
| `/api/llm/conversations` | GET | Get user's conversations |
| `/api/llm/conversations/:id` | GET | Get a specific conversation with messages |
| `/api/llm/messages` | POST | Send a message in a conversation |
| `/api/llm/fine-tuning` | POST | Start a fine-tuning job |
| `/api/llm/sacred-pattern` | POST | Analyze input for sacred patterns |
| `/api/llm/sacred-pattern/analytics` | GET | Get sacred pattern analytics |
| `/api/llm/security-verification` | POST | Run security verification on text |

## Best Practices

1. **Always use the service layer**: Never make direct API calls to the LLM endpoint
2. **Handle errors gracefully**: LLM responses can be unpredictable
3. **Use appropriate model specializations**: Different tasks need different parameters
4. **Respect rate limits**: Implement proper throttling
5. **Log activity**: Important for auditing and improving the system
6. **Cache responses**: Use caching for common requests
7. **Validate inputs**: Sanitize and validate all user inputs
8. **Process outputs**: Parse and validate LLM outputs before using them
9. **Use appropriate system prompts**: Different contexts need different prompts
10. **Monitor for hallucinations**: LLMs can generate incorrect information