# Aetherion Biozoecurrency Project Structure

Aetherion is the economic and digital-stewardship layer of the AI Freedom Trust Federation. The repository contains two clearly separated realities:

1. a **canonical protocol design lane** for the sovereign abundance-first Layer 1; and
2. a **legacy/application lane** containing wallet UI, server services, DynastyLink, historical blockchain demonstrations, and research surfaces that must migrate toward the canonical protocol rather than define it implicitly.

## Canonical authority order

When economic behavior conflicts across the repository, use this order:

1. `MONETARY-CONSTITUTION.md`
2. `HUMAN-RIGHTS-AND-SAFEGUARDS.md`
3. `protocol/genesis.seed.json` and `protocol/protocol.manifest.json`
4. `WHITEPAPER.md`, `GENESIS.md`, `COMPUTER-DESIGN.md`, `FLIGHTPAPER.md`
5. `docs/circulation-and-exchange.md` and other canonical design/threat documentation
6. deterministic code under `protocol/reference/`
7. application adapters and UI
8. legacy prototype code

This ordering prevents a historical demo implementation, exchange adapter, UI heuristic, or service operator from silently redefining the monetary constitution.

## Architecture

```text
Aether_Coin_biozonecurrency/
├── README.md
├── WHITEPAPER.md
├── FLIGHTPAPER.md
├── PHILOSOPHY.md
├── MONETARY-CONSTITUTION.md
├── HUMAN-RIGHTS-AND-SAFEGUARDS.md
├── COMPUTER-DESIGN.md
├── GENESIS.md
├── STRUCTURE.md
├── protocol/
│   ├── README.md
│   ├── genesis.seed.json
│   ├── protocol.manifest.json
│   ├── reference/
│   │   ├── biozoe-policy.mjs
│   │   ├── biozoe-policy.test.mjs
│   │   ├── aetherion-state-machine.mjs
│   │   ├── aetherion-state-machine.test.mjs
│   │   └── circulation-exchange.test.mjs
│   └── simulation/
│       └── biozoe-sim.mjs
├── docs/
│   ├── status.md
│   ├── validation.md
│   ├── aetherion-threat-model.md
│   ├── consensus-and-governance.md
│   ├── external-anchoring.md
│   ├── circulation-and-exchange.md
│   ├── regulatory-launch-gate.md
│   └── ...existing Federation/application documentation
├── client/                        # React application and legacy wallet/blockchain UI
├── server/                        # Node/Express services and integration paths
├── shared/                        # Shared schemas and Federation contracts
├── apps/dynastylink-local/        # Local-first DynastyLink application
├── api-gateway/                   # Prototype/research API package
├── quantum-validator/             # Post-quantum research surface
└── scripts/
    ├── aether-verify-structure.mjs
    ├── verify-biozoe-protocol.mjs
    └── ...security and utility scripts
```

## Protocol layer

`protocol/` is the only directory that should acquire future consensus-critical monetary code unless a dedicated node repository/package is explicitly created and linked back to the same constitutional manifest.

The protocol lane owns canonical genesis rules, ATC denomination and supply model, all five issuance classes, accrued universal entitlement settlement, demurrage arithmetic, circulation pools and qualification rules, canonical conversion policy state, retirement accounting, supply invariants, consensus/governance separation, future node message definitions, and persistent state migration contracts.

The current reference implementation is executable specification, not production consensus.

## Circulation layer

Circulation is part of canonical economic state but remains separate from ordinary transfer.

An ATC transfer conserves supply and does not automatically create a reward. A separately authenticated qualification references the finalized transfer. The reference state machine then applies replay protection, identity checks, direct pairwise netting, diminishing-return scoring, an authorized epoch pool, and a per-identity cap.

Production circulation infrastructure still requires cryptographic receipt verification, privacy-preserving qualification, stronger graph-level anti-wash defenses, and adversarial economic validation.

## Canonical exchange boundary

Canonical external conversion is an optional adapter/service boundary, not part of Layer 1 liveness and not part of ordinary native transfer.

The protocol may own deterministic policy fields such as maturity friction, bounded stress state, patient-exit discount, hard cap, conversion receipt status, and ATC retirement. The external operator owns real-world custody, external settlement, reserve/liability accounting, compliance, licensing, customer support, and banking or external-chain relationships.

The canonical exchange service is disabled in the design genesis. Protocol code that can calculate a quote does not prove that an exchange is live, solvent, licensed, audited, or safe.

## Client layer

`client/` is a user interface and adapter layer. It must not invent canonical ATC balances, mining rewards, chain finality, validator state, production RPC reality, circulation qualification, reference prices, or exchange availability locally.

Historical blockchain components are legacy simulations until migrated. New UI must label design/test/prototype status and consume canonical node/API state when that state exists.

## Server layer

`server/` may provide APIs, persistence, evidence workflows, circulation receipt services, AI assistance, and integration services. It must not create an undocumented mint path, silently qualify arbitrary circulation, become a database superuser that rewrites canonical Layer 1 balances, or operate an external conversion business merely because a quote function exists.

Off-chain services may prepare authenticated transactions. Canonical economic mutation belongs to protocol state transitions.

## Shared layer

`shared/` carries schemas, TypeScript contracts, Federation event types, consent records, operational status, and future client/server representations of protocol data.

Shared TypeScript types are integration contracts, not consensus law unless generated from or explicitly bound to the canonical protocol schema.

## Identity relationship

AIFT-Genesis owns constitutional identity/trust inheritance. Aetherion consumes scoped eligibility attestations. It should not duplicate the entire Federation identity system inside the economic ledger.

The same uniqueness architecture ultimately protects both universal issuance and per-person circulation limits. Circulation must not become an excuse to publish complete purchase histories or build a universal behavioral score.

## DynastyLink relationship

DynastyLink remains a local-first human stewardship interface. It may prepare economic actions, inheritance relationships, circulation receipts, or trust packets, but cannot bypass Aetherion signing, consent, issuance, governance, identity, or exchange rules.

## AI relationship

AI belongs above the authorization boundary.

AI may inspect, explain, simulate, propose, compare, detect anomalies, and warn. It cannot become a hidden signer, mint administrator, identity oracle, circulation oracle, exchange-stress oracle, constitutional voter, or final fraud judge merely because it is integrated into the application stack.

## External anchor relationship

Bitcoin and BitcoinOS-like systems live behind an optional anchor adapter. They can receive state commitments. They do not own Aetherion liveness or monetary policy.

## Validation

Canonical protocol checks:

```bash
npm run protocol:verify
npm run protocol:test
npm run protocol:simulate
```

Repository gate:

```bash
npm run qa:local
```

Application checks:

```bash
npm run check
npm run build
```

Security review aids:

```bash
npm run security:audit
npm run security:deps
npm run security:api-keys
```

## Change workflow

High-risk monetary and protocol work should be developed on a branch and reviewed through a pull request. Direct mainline changes are inappropriate for consensus, issuance, circulation, identity, governance, custody, canonical exchange, or genesis changes once collaborative review is available.

A protocol-changing pull request should state affected invariant, implementation status, test evidence, security impact, economic impact, governance/constitutional classification, regulatory/operator impact where applicable, and migration consequences.

## Public claim rule

Use labels precisely:

- `implemented`
- `prototype`
- `experimental`
- `planned`
- `blocked`
- `needs review`
- `audited`

A document can be complete while the described network remains unimplemented. A unit test can pass while the system remains unaudited. A deterministic exchange quote can be correct while no external exchange service exists. A spiritual or philosophical commitment can be sincere while a technical, financial, or legal claim still requires independent evidence.
