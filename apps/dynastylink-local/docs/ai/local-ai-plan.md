# DynastyLink Local AI Plan

DynastyLink should use only locally hosted AI in the core app.

## Goals
- No external AI API calls.
- No vendor rate limits.
- No hidden telemetry.
- Full inspectability of prompts, retrieval, logs, and model behavior.

## Recommended Local Runtime Options
- Ollama for simplest local model operations.
- llama.cpp for portable CPU/GPU local inference.
- vLLM for higher-throughput local GPU inference.

## RAG Knowledge Base
Approved AIFT materials should be stored locally and indexed into a local vector store. Possible options:
- pgvector in PostgreSQL
- Qdrant self-hosted
- Chroma local-only

## Initial AI Features
1. Trust Guide answers from approved local AIFT content.
2. Covenant language polishing from user answers.
3. Document checklist suggestions.
4. Risk flag detection for legal, tax, insurance, financial, or investment topics.
5. Packet language refinement.

## Legal-Safe Behavior
The local AI must clearly state that DynastyLink organizes information and does not provide legal, tax, financial, investment, or insurance advice. It should recommend professional review for binding decisions.
