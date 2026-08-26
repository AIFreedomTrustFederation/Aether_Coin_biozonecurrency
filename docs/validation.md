# Aetherion Biozoecurrency Validation

This repository contains high-risk monetary, circulation, exchange, wallet, identity, governance, security, AI, and trust concepts. Validation must distinguish source checks, deterministic tests, adversarial economic testing, audits, legal/operator readiness, and production operations.

## Required first step

Before editing or publishing changes:

```bash
git fetch origin
git status --short --branch
```

Read `README.md`, `AGENTS.md`, `docs/status.md`, this file, and the canonical protocol documents relevant to the change.

## Canonical protocol gate

For changes to the monetary constitution, genesis, issuance, circulation, demurrage, canonical conversion, governance weight, validator power, or reference state machine:

```bash
npm run protocol:verify
npm run protocol:test
npm run protocol:simulate
```

`protocol:verify` checks machine-readable constitutional invariants including zero premine/private genesis allocations, zero initial balances, no terminal supply cap, no token-weighted governance/consensus, no balance-derived validator power, offline-safe baseline entitlement, circulation pool bounds, no raw-transaction-count minting, no circulation receipt replay, ordinary-transfer freedom from canonical exit friction, a hard exit-friction ceiling, truthful reference-value separation, no generic mint from external deposits, settlement-before-retirement, and no guaranteed-appreciation claim.

`protocol:test` executes Node's built-in test runner against `protocol/reference/*.test.mjs`, including circulation/exchange attack and accounting tests.

`protocol:simulate` runs the dependency-light cohort simulator. A simulator pass means the script executed under its assumptions; it does not prove price stability or economic optimality.

Passing these checks does **not** prove economic stability, consensus security, cryptographic safety, exchange solvency, legal authorization, or mainnet readiness.

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

The GitHub protocol workflow additionally runs the dependency-light simulation. This gate does not substitute for the full application build or future node/consensus testing.

## Protocol arithmetic rules

Consensus-critical monetary code must use integer base units; avoid floating-point balances, `Math.random()`, validator-local wall-clock reads, external HTTP calls during state execution, and opaque AI output; reject unauthorized mint classes; preserve `circulating = issued - retired`; ensure ordinary transfers conserve supply; and make every issuance/retirement cause explicit.

## Circulation validation

Before circulation issuance can activate, test at minimum:

- self-transfers,
- exact and partial direct round trips,
- repeated same-pair transfers,
- receipt replay,
- transfer double qualification,
- microtransaction splitting,
- large-holder concentration,
- identity splitting,
- coordinated ring wash trading,
- merchant/customer collusion,
- low-volume legitimate participants,
- privacy leakage from circulation receipts.

Required invariants:

- total circulation issuance never exceeds the authorized epoch pool,
- each identity remains at or below its configured reward cap,
- direct pair round trips are netted,
- raw transaction count does not itself increase reward,
- computation is deterministic,
- unused pool authority remains accounted for rather than silently minted.

Production activation additionally requires a credible uniqueness layer and published residual attack analysis. Pairwise netting is not claimed to solve every wash-trading graph.

## Canonical conversion validation

Canonical conversion remains disabled by default. Before technical activation, test:

- stale/manipulated reference inputs,
- bounded stress inputs,
- hard-cap enforcement,
- patient-exit discounts and minimum floor,
- conversion receipt replay,
- external settlement rejection and timeout,
- double settlement,
- reserve depletion and correlated exits,
- quote/UI disclosure,
- operator service outage,
- ATC retirement timing,
- supply accounting after exit.

Required invariants:

- ordinary ATC transfer never receives canonical exit friction,
- reference external value remains distinct from applied spread and proceeds,
- total friction cannot exceed the constitutional hard cap,
- no indefinite discretionary exit lock is introduced,
- ATC is not retired before external settlement acceptance,
- depositing an external asset does not create generic ATC mint authority,
- exchange failure cannot halt Layer 1 consensus.

The reference implementation does not constitute reserve custody or cross-asset settlement safety.

## Regulatory/operator validation

A Federation-operated exchange/redemption facility has a separate launch gate in `docs/regulatory-launch-gate.md`.

Technical tests cannot substitute for jurisdiction-specific legal, licensing, sanctions, AML/KYC, consumer-protection, custody, reserve, accounting, tax, privacy, or operator-readiness analysis. No exchange service should be described as authorized merely because the protocol can compute a quote.

## Genesis validation

A production genesis candidate must be independently reproduced from public inputs. Verify source commit, protocol version, chain ID, module versions, validator public keys, governance bootstrap configuration, zero private allocations, zero initial ATC balances, zero/unratified-disabled circulation pool state, canonical conversion activation state, and generated genesis hash.

A design seed is not a production genesis merely because it parses.

## Consensus validation

When the future BFT node exists, test deterministic execution across independent nodes, validator restart/recovery, state sync, minority failures, equivocation handling, governance validator-set changes, network partitions, reproducible upgrades, and safety within the documented fault assumption.

Do not describe a one-node or one-operator environment as decentralized.

## Identity validation

Universal issuance and per-person circulation caps require meaningful Sybil resistance. Production eligibility work must test duplicate identities, revoked/recovered credentials, replayed/conflicting attestations, privacy leakage, appeal paths, attester loss, colluding attesters, and identity splitting used to evade circulation caps.

No passing identity unit test proves universal personhood.

## Economic validation

Before production parameter ratification, publish simulations covering population change, claim participation, demurrage sensitivity, saving/circulation behavior, circulation pool size, reward caps, sender/receiver score weights, contribution budget growth, resource shocks, validator/service compensation, large-holder behavior, fraud/Sybil pressure, exchange-rate volatility, exit-friction curves, reserve stress, correlated exits, and local trust migration.

Economic simulations must disclose assumptions and cannot be represented as guarantees.

## Security checks

For security, API, auth, wallet, payment, key, identity, governance, circulation, canonical exchange, anchor, or deployment changes:

```bash
npm run security:audit
npm run security:deps
npm run security:api-keys
```

Treat these as review aids, not formal audits.

## Wallet/custody validation

Production signing requires real cryptography. Placeholder hashes or browser demos are insufficient. Test chain-ID, recipient/amount display, signatures, replay resistance, malformed transactions, key/seed confidentiality, AI isolation, device loss/recovery, malicious prompts, and full canonical conversion disclosure where applicable.

## Anchor/bridge validation

External Bitcoin or BitcoinOS-like anchoring is optional. Before activation, verify failure isolation and receipts independently, verify Aetherion liveness without the anchor, audit any value-moving bridge, and do not describe an unaudited bridge as trustless.

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

Only use `audited` when a named independent review artifact exists within a defined scope. Only use `production-ready` when build, security, deployment, governance, identity, economic, operational, and—where relevant—exchange/operator evidence support the claim.

Spiritual or philosophical conviction is not a substitute for engineering validation, and an incentive design is not a guarantee of market price or return.
