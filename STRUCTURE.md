# Aetherion Biozoecurrency Project Structure

This document outlines the project architecture, file organization, and key components for developers and Federation stewards.

## Overview

Aetherion is a TypeScript-based stewardship and wallet research application for Aether Coin Biozoecurrency. It combines a React frontend, Node/Express backend services, shared schema contracts, local-first DynastyLink foundations, and status-labeled research paths for regenerative value coordination.

This repository contains high-risk concepts. Architecture language must remain honest: wallet, custody, token, legal, financial, deployment, and post-quantum claims require evidence before production language is used.

## Federation-Aligned Architecture

The current architecture is organized around these layers:

1. **Client Layer**: React interface and user-facing stewardship workflows.
2. **Backend Services**: Express services, API routes, persistence paths, and integration logic.
3. **Shared Contracts**: Cross-layer TypeScript types and schemas.
4. **DynastyLink Local Lane**: Local-first trust identity onboarding and packet preparation.
5. **Federation Contracts**: Manifest, event vocabulary, consent ledger, Biozoecurrency taxonomy, and operations status.
6. **Research Adapters**: Optional decentralized storage, notification, wallet, and post-quantum research paths.

## Directory Structure

```text
Aether_Coin_biozonecurrency/
├── federation.manifest.json       # Machine-readable Federation handshake
├── docs/                          # Status, validation, security, and integration docs
├── client/                        # React frontend application
├── server/                        # Node/Express backend services
├── shared/                        # Shared schemas and TypeScript contracts
│   └── types/                     # Federation-facing typed contracts
├── apps/dynastylink-local/        # Local-first DynastyLink app foundation
├── api-gateway/                   # API gateway research surface
├── quantum-validator/             # Post-quantum validation research surface
└── scripts/                       # Verification, security, and utility scripts
```

## Canonical Federation Files

| File | Purpose |
|---|---|
| `federation.manifest.json` | Machine-readable integration contract for Federation tools. |
| `docs/federation-integration.md` | Human-readable Federation integration guide. |
| `docs/biozoecurrency-token-taxonomy.md` | Biozoecurrency token taxonomy and claim boundary. |
| `docs/consent-ledger.md` | Human-consent record doctrine and implementation path. |
| `docs/dynastylink-aetherion-bridge.md` | Local-first bridge between DynastyLink and Aetherion. |
| `docs/federation-events.md` | Event vocabulary for cross-Federation coordination. |
| `docs/operations-dashboard.md` | Operating truth layer and dashboard plan. |

## Shared Typed Contracts

| File | Purpose |
|---|---|
| `shared/types/biozoecurrency-token.ts` | Token taxonomy primitives and claim boundaries. |
| `shared/types/consent-ledger.ts` | Human consent record shape and helper rules. |
| `shared/types/federation-events.ts` | Minimal event envelope for Federation tools. |
| `shared/types/operational-status.ts` | Operational status snapshot contract. |

## Existing Application Areas

### Frontend

The frontend lives under `client/` and contains React pages, layout components, dashboard components, hooks, utility libraries, and UI primitives.

### Backend

The backend lives under `server/` and contains API routes, service logic, middleware, storage interfaces, and persistence paths.

### Shared Schemas

The `shared/` directory contains Drizzle schemas, cross-layer types, wallet schemas, bridge schemas, AI assistant schemas, and new Federation-facing contracts.

### DynastyLink Local App

The DynastyLink lane lives under `apps/dynastylink-local/`. It is the local-first onboarding path for Federation identity and should not require remote services for its core MVP.

### API Gateway And Validator Packages

The `api-gateway/` and `quantum-validator/` packages are research or prototype surfaces unless build, test, and review evidence prove a stronger status label.

## Development Workflow

The early-stage Federation workflow is main-only:

1. Read `README.md`, `AGENTS.md`, `docs/status.md`, and `docs/validation.md`.
2. Make focused commits directly on `main`.
3. Keep claim labels honest.
4. Run the available local checks in a local checkout.
5. Update status documentation when a surface becomes canonical.

## Validation Commands

Use the dependency-light gate for docs, manifests, scripts, and structure changes:

```bash
npm run qa:local
```

Use broader checks for application code changes:

```bash
npm run check
npm run build
```

Use database checks only against an intended local or development database:

```bash
npm run db:push
```

## Deployment Boundary

Deployment references are research or prototype paths until verified. Do not claim deployment readiness without local build evidence, environment review, security review, and operational runbook coverage.

## Public Claim Rule

Use these labels consistently:

- `implemented`
- `prototype`
- `experimental`
- `planned`
- `blocked`
- `needs_review`
- `audited`

Only use `audited` when a named review artifact exists. Only use production-ready language when implementation, validation, security, deployment, and operational evidence support it.
