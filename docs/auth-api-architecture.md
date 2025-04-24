# Authenticated API Access Architecture

## Overview

This document outlines the architecture for secure, platform-agnostic authenticated API access to OpenAI's services. The goal is to enable robust conversation extraction while maintaining security and flexibility.

## Core Components

### 1. Auth Provider Module

**Location**: `server/services/auth/providers/`

A pluggable authentication provider system that supports multiple authentication methods:

- `openai-token.js` - OpenAI API token provider
- `session-cookie.js` - Session cookie authentication provider
- `oauth.js` - OAuth2 provider for integrated login

The provider interface allows new auth methods to be added without changing the core system.

### 2. Secure Credential Management

**Location**: `server/services/auth/credential-manager.js`

- In-memory credential storage (never persisted to disk)
- Encryption utilities for token storage if temporary persistence is needed
- Automatic token expiry and rotation
- Configurable session management

### 3. API Client Factory

**Location**: `server/services/api-clients/`

- `openai-client.js` - OpenAI API client with authentication
- `client-factory.js` - Factory method to create appropriate clients

### 4. Conversation Extractor Service

**Location**: `server/services/scroll-keeper/extractors/`

- `chatgpt-api-extractor.js` - Extraction via authenticated API
- `chatgpt-html-extractor.js` - Fallback extraction via HTML parsing
- `extractor-factory.js` - Factory to select appropriate extractor

## Authentication Flow

1. User provides API credentials through secure UI
2. Credentials are stored temporarily in memory (never persisted without explicit user consent)
3. Auth Provider validates and prepares credentials for API requests
4. API Client uses credentials to make authenticated requests
5. Extractor Service processes API responses into conversation data
6. After extraction, credentials can be immediately discarded or kept for the session (user choice)

## Security Considerations

- No persistent storage of credentials without explicit encryption
- All API keys and tokens are stored in memory only by default
- Transport-level encryption (HTTPS) required for production
- Rate limiting to prevent abuse
- Audit logging for security events (authentication attempts, etc.)

## Extensibility

The modular design ensures:

- New authentication methods can be added as providers
- New API endpoints can be supported via new extractors
- The system remains independent of any specific platform
- Services can be deployed individually or as a complete system