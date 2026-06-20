# Aether Coin Biozonecurrency Security And Privacy

This repository touches wallets, payments, AI guidance, credentials, token taxonomy, trust profiles, and local vault concepts. Treat all security and privacy claims as high-risk until verified.

## Canonical Security Docs

- `SECURITY.md`: project security practices and reporting path.
- `API-SECURITY-GUIDELINES.md`: API-key and credential handling.
- `QUANTUM-SECURITY.md`: post-quantum and hybrid security research.
- `apps/dynastylink-local/docs/security/privacy-security-checklist.md`: DynastyLink local app privacy and security checklist.

## Current Boundaries

- No private keys, seed phrases, wallet credentials, API keys, database URLs, OAuth grants, SMTP credentials, or production secrets belong in Git.
- AI may explain, warn, summarize, and guide, but must not silently authorize financial or custody actions.
- Post-quantum terms must stay status-labeled as implemented, prototype, experimental, planned, or audited.
- DynastyLink core must remain local-first and must not require external APIs, telemetry, analytics, or hidden vendor calls.
- Trust-profile, beneficiary, vault, asset, and role data must be treated as private user data.
- Legal, tax, financial, investment, insurance, and trust-document outputs require qualified professional review.

## Human Approval Required

Require explicit human approval before:

- token taxonomy changes
- production security claim changes
- custody, payment, or transaction authorization changes
- publishing private user data, trust data, wallet data, or vault files
- destructive database, wallet, or repository operations
- production deployment or route changes

## Local-First Rule

Core DynastyLink and stewardship flows should work without required third-party APIs. Optional integrations must be clearly labeled, disabled by default where practical, and documented with the exact data they transmit.

## Audit Rule

Automated scripts can catch obvious problems, but they are not formal audits. Do not claim audited wallet safety, audited cryptography, or audited legal-document validity without a named review artifact.
