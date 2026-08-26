# Aetherion Biozoecurrency Project Structure

Aetherion is the economic and digital-stewardship layer of the AI Freedom Trust Federation. The repository now contains two clearly separated realities:

1. a **canonical protocol design lane** for the sovereign abundance-first Layer 1; and
2. a **legacy/application lane** containing wallet UI, server services, DynastyLink, historical blockchain demonstrations, and research surfaces that must migrate toward the canonical protocol rather than define it implicitly.

## Canonical authority order

When economic behavior conflicts across the repository, use this order:

1. `MONETARY-CONSTITUTION.md`
2. `HUMAN-RIGHTS-AND-SAFEGUARDS.md`
3. `protocol/genesis.seed.json` and `protocol/protocol.manifest.json`
4. `WHITEPAPER.md`, `GENESIS.md`, `COMPUTER-DESIGN.md`, `FLIGHTPAPER.md`
5. deterministic code under `protocol/reference/`
6. application adapters and UI
7. legacy prototype code

This ordering prevents a historical demo implementation from silently redefining the monetary constitution.

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
├── protocol/
│   ├── README.md
│   ├── genesis.seed.json
│   ├── protocol.manifest.json
│   └── reference/
│       ├── biozoe-policy.mjs
│       ├── biozoe-policy.test.mjs
│       ├── aetherion-state-machine.mjs
│       └── aetherion-state-machine.test.mjs
├── docs/
│   ├── status.md
│   ├── validation.md
│   ├── aetherion-threat-model.md
│   ├── consensus-and-governance.md
│   ├── external-anchoring.md
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

The protocol lane owns:

- canonical genesis rules,
- ATC denomination and supply model,
- issuance classes,
- demurrage arithmetic,
- supply invariants,
- consensus/governance separation,
- future node message definitions,
- future persistent state migration contracts.

The current reference implementation is executable specification, not production consensus.

## Client layer

`client/` is a user interface and adapter layer. It must not invent canonical ATC balances, mining rewards, chain finality, validator state, or production RPC reality locally.

Historical blockchain components are legacy simulations until migrated. New UI must label design/test/prototype status and consume canonical node/API state when that state exists.

## Server layer

`server/` may provide APIs, persistence, evidence workflows, AI assistance, and integration services. It must not create an undocumented mint path or become a database superuser that can rewrite canonical Layer 1 balances.

Off-chain services may prepare transactions. Canonical economic mutation belongs to authenticated protocol state transitions.

## Shared layer

`shared/` carries schemas, TypeScript contracts, Federation event types, consent records, operational status, and future client/server representations of protocol data.

Shared TypeScript types are integration contracts, not consensus law unless generated from or explicitly bound to the canonical protocol schema.

## Identity relationship

AIFT-Genesis owns constitutional identity/trust inheritance. Aetherion consumes scoped eligibility attestations. It should not duplicate the entire Federation identity system inside the economic ledger.

## DynastyLink relationship

DynastyLink remains a local-first human stewardship interface. It may prepare economic actions, inheritance relationships, or trust packets, but cannot bypass Aetherion signing, consent, issuance, governance, or identity rules.

## AI relationship

AI belongs above the authorization boundary.

AI may inspect, explain, simulate, propose, compare, and warn. It cannot become a hidden signer, mint administrator, identity oracle, or constitutional voter merely because it is integrated into the application stack.

## External anchor relationship

Bitcoin and BitcoinOS-like systems live behind an optional anchor adapter. They can receive state commitments. They do not own Aetherion liveness or monetary policy.

## Validation

Canonical protocol checks:

```bash
npm run protocol:verify
npm run protocol:test
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

High-risk monetary and protocol work should be developed on a branch and reviewed through a pull request. Direct mainline changes are inappropriate for consensus, issuance, identity, governance, custody, or genesis changes once collaborative review is available.

A protocol-changing pull request should state:

- affected invariant,
- implementation status,
- test evidence,
- security impact,
- economic impact where relevant,
- governance/constitutional classification,
- migration consequences.

## Public claim rule

Use labels precisely:

- `implemented`
- `prototype`
- `experimental`
- `planned`
- `blocked`
- `needs review`
- `audited`

A document can be complete while the described network remains unimplemented. A unit test can pass while the system remains unaudited. A spiritual or philosophical commitment can be sincere while a technical claim still requires empirical evidence.
