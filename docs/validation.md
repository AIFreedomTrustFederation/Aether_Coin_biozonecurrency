# Aetherion Biozoecurrency Validation

This repository contains high-risk monetary, wallet, identity, governance, security, AI, and trust concepts. Validation must distinguish source checks, tests, audits, economic evidence, and production operations.

## Required first step

Before editing or publishing changes:

```bash
git fetch origin
git status --short --branch
```

Read `README.md`, `AGENTS.md`, `docs/status.md`, this file, and the canonical protocol documents relevant to the change.

## Canonical protocol gate

For changes to the monetary constitution, genesis, issuance, demurrage, governance weight, validator power, or reference state machine:

```bash
npm run protocol:verify
npm run protocol:test
```

`protocol:verify` checks machine-readable constitutional invariants including:

- zero premine/private genesis allocations,
- zero initial balances,
- no terminal supply cap,
- no token-weighted governance,
- no token-weighted consensus,
- no balance-derived validator power,
- separation of ATC from Pulse anti-spam accounting,
- no random values in the canonical reference monetary path,
- no false live-mainnet claim in the design genesis seed.

`protocol:test` executes Node's built-in test runner against `protocol/reference/*.test.mjs`.

Passing these checks does **not** prove economic stability, consensus security, cryptographic safety, or mainnet readiness.

## Lightweight repository gate

Run:

```bash
npm run qa:local
```

The intended sequence is:

```bash
npm run verify:structure
npm run protocol:verify
npm run protocol:test
npm run security:api-keys
```

This gate is dependency-light and intentionally does not substitute for the full application build or future node/consensus testing.

## Application checks

When changing application code under `client`, `server`, `shared`, root runtime configuration, or wallet-facing integration:

```bash
npm run check
npm run build
```

If either fails, document the first failure and do not claim build readiness.

## Protocol arithmetic rules

Consensus-critical monetary code must:

- use integer base units,
- avoid floating-point balances,
- avoid `Math.random()`,
- avoid local wall-clock reads as independent consensus input,
- avoid external network calls during deterministic state execution,
- reject unauthorized mint classes,
- preserve `circulating = issued - retired`,
- ensure ordinary transfers conserve supply.

## Genesis validation

A production genesis candidate must be independently reproduced from public inputs.

At minimum verify:

- source commit,
- protocol version,
- chain ID,
- module versions,
- validator public keys,
- governance bootstrap configuration,
- zero private allocations,
- zero initial ATC balances,
- generated genesis hash.

A design seed is not a production genesis merely because it parses.

## Consensus validation

When the future BFT node exists, test:

- deterministic execution across independent nodes,
- validator restart and recovery,
- state sync,
- minority failures,
- equivocation/double-sign handling,
- governance validator-set changes,
- network partition behavior,
- reproducible upgrade/migration execution,
- consensus safety within the documented fault assumption.

Do not describe a one-node or one-operator environment as decentralized.

## Identity validation

Universal issuance requires meaningful Sybil resistance.

Production eligibility work must test:

- duplicate identity attempts,
- revoked credentials,
- recovered credentials,
- replayed attestations,
- conflicting attestations,
- privacy leakage,
- appeal/review paths,
- loss of an attester,
- colluding attesters.

No passing identity unit test proves universal personhood.

## Economic validation

Before production parameter ratification, publish simulations for:

- population change,
- different claim participation rates,
- demurrage sensitivity,
- saving/circulation behavior,
- contribution budget growth,
- resource shocks,
- validator/service compensation,
- large-holder behavior,
- fraud and Sybil pressure,
- exchange-rate volatility.

Economic simulations must disclose assumptions and cannot be represented as guarantees.

## Security checks

For security, API, auth, wallet, payment, key, identity, governance, anchor, or deployment changes:

```bash
npm run security:audit
npm run security:deps
npm run security:api-keys
```

Treat these as review aids, not formal audits. A wallet, consensus, bridge, or cryptographic feature is not audited merely because these scripts pass.

## Wallet/custody validation

Production signing requires real cryptography. Placeholder hashes or browser demos are insufficient.

Test:

- exact chain ID display,
- exact recipient and amount display,
- signature verification,
- nonce/sequence replay resistance,
- malformed transaction rejection,
- key/seed confidentiality,
- AI-provider isolation from secrets,
- device loss and recovery,
- malicious transaction prompts.

## Anchor/bridge validation

External Bitcoin or BitcoinOS-like anchoring is optional. Before activation:

- verify failure isolation,
- verify receipts independently,
- verify Aetherion liveness without the anchor,
- audit any bridge that can custody or move value,
- do not describe an unaudited bridge as trustless.

## Database checks

When changing Drizzle schemas, migrations, or database-backed services:

```bash
npm run db:push
```

Run only against an intended local or development database. Never mutate production schema without explicit human approval and a reviewed migration plan.

## DynastyLink checks

When changing `apps/dynastylink-local`:

```bash
cd apps/dynastylink-local/backend
python -m compileall app
```

If running the service locally, follow the local README and verify the documented loopback endpoint.

## Public claim labels

Use these labels precisely:

- `implemented`
- `prototype`
- `experimental`
- `planned`
- `blocked`
- `needs review`
- `audited`

Only use `audited` when a named independent review artifact exists within a defined scope. Only use `production-ready` when build, security, deployment, governance, identity, economic, and operational evidence support the claim.

Spiritual or philosophical conviction is not a substitute for any engineering validation category.
