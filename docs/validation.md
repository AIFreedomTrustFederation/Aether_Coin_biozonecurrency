# Aether Coin Biozonecurrency Validation

This repository contains high-risk wallet, security, AI, token, and trust-document concepts. Use truthful validation labels and avoid production claims without evidence.

## Required First Step

Before editing or publishing changes:

```bash
git fetch origin
git status --short --branch
```

Read `README.md`, `AGENTS.md`, `docs/status.md`, this file, and any area-specific docs for the files being changed.

## Lightweight Local Gate

Run this for docs, manifests, scripts, status labels, repo structure, and local-first boundary changes:

```bash
npm run qa:local
```

This runs:

```bash
npm run verify:structure
npm run security:api-keys
```

The gate intentionally avoids running the full app build and TypeScript graph.

## Application Checks

When changing application code under `client`, `server`, `shared`, `src`, or root runtime configuration:

```bash
npm run check
npm run build
```

If these fail, document the first failure and do not claim the app is build-ready.

## Security Checks

For security, API, auth, wallet, payment, key, or deployment changes:

```bash
npm run security:audit
npm run security:deps
npm run security:api-keys
```

Treat these as review aids, not formal audits. A wallet or cryptography feature is not audited merely because these scripts pass.

## Database Checks

When changing Drizzle schemas, migrations, or database-backed services:

```bash
npm run db:push
```

Run only against an intended local or development database. Never run schema mutation commands against production without explicit human approval.

## DynastyLink Checks

When changing `apps/dynastylink-local`:

```bash
cd apps/dynastylink-local/backend
python -m compileall app
```

If running the service locally, use the README path and verify `http://127.0.0.1:8000` responds.

## Public Claim Rule

Use these labels:

- `implemented`
- `prototype`
- `experimental`
- `planned`
- `blocked`
- `needs review`
- `audited`

Only use `audited` when a named review artifact exists. Only use `production-ready` when build, security, deployment, and operational evidence support the claim.
