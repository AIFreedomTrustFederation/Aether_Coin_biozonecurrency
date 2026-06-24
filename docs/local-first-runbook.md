# Local-First Runbook

This runbook defines the early operating path for Aether Coin Biozoecurrency.

## Purpose

The Federation foundation should be inspectable and usable locally before depending on hosted infrastructure.

## Main-Only Workflow

This repository currently uses main-only development.

- Commit directly to `main`.
- Keep commits focused.
- Avoid branches and PRs unless the human owner explicitly asks for them.
- Prefer small, reversible changes.
- Update status docs after canonical changes.

## First Local Checks

From a local checkout:

```bash
npm run qa:local
```

Then, once dependencies and lockfile are healthy:

```bash
npm run check
npm run build
```

## Federation Contract Check

Run the standalone Federation contract verifier:

```bash
node scripts/verify-federation-contracts.mjs
```

It checks that the manifest, federation docs, and typed contracts are present.

## Biozoecurrency Terminology Check

Run the terminology verifier:

```bash
node scripts/verify-biozoecurrency-terminology.mjs
```

It checks active source and documentation for the old Biozone spelling while skipping generated, dependency, lockfile, and archived asset paths.

## DynastyLink Local Check

When changing the local DynastyLink app:

```bash
cd apps/dynastylink-local/backend
python -m compileall app
```

Then run the local service according to the DynastyLink README.

## Federation Contract Surfaces

Confirm these files exist and remain status-labeled:

```text
federation.manifest.json
docs/federation-integration.md
docs/biozoecurrency-token-taxonomy.md
docs/consent-ledger.md
docs/dynastylink-aetherion-bridge.md
docs/federation-events.md
docs/operations-dashboard.md
docs/optional-integrations.md
docs/local-first-runbook.md
scripts/verify-federation-contracts.mjs
scripts/verify-biozoecurrency-terminology.mjs
shared/types/biozoecurrency-token.ts
shared/types/consent-ledger.ts
shared/types/federation-events.ts
shared/types/operational-status.ts
```

## Public Claim Check

Before publishing, confirm the repo does not imply:

- production token value
- audited wallet custody
- autonomous AI financial action
- completed legal trust validity
- deployment readiness without run evidence
- post-quantum guarantees without review evidence

## Local-First Definition Of Done

A Federation-aligned change is complete when:

1. The intended file surface is clear.
2. The claim label is accurate.
3. Core flows do not require hidden external services.
4. Sensitive examples are synthetic.
5. Local verification steps are documented.
6. `docs/status.md` reflects the current truth.
