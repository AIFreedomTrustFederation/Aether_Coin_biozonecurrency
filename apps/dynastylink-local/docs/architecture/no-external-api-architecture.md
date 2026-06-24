# DynastyLink No-External-API Architecture

DynastyLink is designed as a sovereign, self-hosted web app. The core application must not depend on external APIs, rate-limited SaaS products, vendor-hosted AI, external analytics, or cloud-only infrastructure.

## Core Principle
The Federation must be able to inspect, control, modify, and self-host every essential part of the app.

## Allowed Core Flows
- Browser to local frontend/backend
- Frontend to backend routes served by the same app
- Backend to local SQLite or self-hosted PostgreSQL
- Backend to local filesystem or self-hosted object storage
- Backend to local AI runtime if enabled

## Disallowed Core Dependencies
- External AI APIs
- Bubble API Connector or Bubble runtime dependency
- SaaS authentication as required dependency
- External analytics or telemetry
- External document storage as required dependency
- Required payment provider for app operation

## MVP Runtime
The MVP runs with FastAPI, static frontend files, local SQLite, and local file uploads. This provides a runnable foundation before upgrading to PostgreSQL, MinIO, and local AI.

## Future Local AI
Use Ollama, llama.cpp, or vLLM locally. The AI guide should use local retrieval over approved AIFT materials and should refuse legal, tax, financial, investment, or insurance advice.
