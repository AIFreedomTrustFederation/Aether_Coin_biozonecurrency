# Aetherion Biozoecurrency Status

Last reviewed: 2026-08-25

## Current role

This repository is the AI Freedom Trust Federation's economic and stewardship layer. The active architecture refactor moves Aetherion from a collection of wallet/token/blockchain prototypes toward a clearly specified sovereign Layer 1 with an abundance-first Biozoe monetary constitution.

The active implementation branch is `feat/biozoe-abundance-l1`.

## Current verified repository facts

- The repository is public and active.
- The application stack includes React/Vite, TypeScript, Node/Express, shared schemas, and PostgreSQL/Drizzle integration paths.
- Historical browser-side blockchain and Biozoe demonstrations remain in the repository.
- Security guidance exists in `SECURITY.md`, `API-SECURITY-GUIDELINES.md`, `QUANTUM-SECURITY.md`, and `docs/security-and-privacy.md`.
- DynastyLink local-first work remains under `apps/dynastylink-local`.
- A machine-readable Federation handshake exists in `federation.manifest.json`.

## New canonical protocol surfaces on the refactor branch

The following now define the intended Aetherion monetary architecture:

- `WHITEPAPER.md`
- `FLIGHTPAPER.md`
- `PHILOSOPHY.md`
- `MONETARY-CONSTITUTION.md`
- `COMPUTER-DESIGN.md`
- `GENESIS.md`
- `protocol/genesis.seed.json`
- `protocol/reference/biozoe-policy.mjs`
- `protocol/reference/aetherion-state-machine.mjs`
- protocol unit tests
- `scripts/verify-biozoe-protocol.mjs`

## Implemented on the refactor branch

The dependency-light reference implementation now contains deterministic logic for:

- universal issuance eligibility,
- one baseline claim per person per epoch,
- integer demurrage,
- budget-constrained evidence-gated issuance,
- ordinary transfers,
- epoch advancement,
- cumulative issuance accounting,
- cumulative retirement accounting,
- supply invariant verification,
- balance-independent human governance weight,
- stake-independent equal validator voting power.

The design genesis seed specifies:

- zero premine,
- zero founder allocation,
- zero investor allocation,
- zero team allocation,
- zero genesis treasury allocation,
- zero initial balances,
- no terminal ATC supply cap,
- no token-weighted governance,
- no token-weighted consensus,
- no balance-derived validator power,
- an optional rather than mandatory Bitcoin/BitcoinOS-like anchor path.

## Prototype/legacy boundary

Historical blockchain code predates the new constitution and must not be represented as canonical Layer 1 consensus.

Known prototype characteristics include browser-side state, simple local proof-of-work demonstrations, placeholder signatures, hard-coded network/RPC configuration, and randomly generated symbolic Biozoe/quantum-style metrics.

Those artifacts are retained for provenance and UI research until deliberately migrated or retired. They are not evidence that an Aetherion mainnet is live, decentralized, secure, or audited.

## Planned but not yet implemented

- CometBFT-compatible node integration
- authenticated production transaction envelope
- persistent consensus state
- privacy-preserving unique-person eligibility
- multi-attester identity and recovery
- executable multi-chamber governance
- validator registry and independent-operator enforcement
- Pulse non-transferable resource accounting
- lazy production demurrage settlement
- evidence replay protection suitable for consensus
- wallet migration to canonical node state
- reproducible public devnet genesis
- optional Bitcoin/BitcoinOS-like state-root anchor adapter
- economic simulation suite
- independent security review
- public testnet and mainnet

## Validation boundary

The branch wires protocol checks into repository QA:

```bash
npm run protocol:test
npm run protocol:verify
npm run qa:local
```

`npm run qa:local` is intended to run the structure check, Biozoe constitutional verifier, protocol unit tests, and API-key guard.

These connector-authored changes have not yet been executed in a local checkout in this session. Passing source inspection is not the same as a green runtime test. CI or local execution must provide that evidence before the branch is described as validated.

Application-level checks remain:

```bash
npm run check
npm run build
npm run security:audit
npm run security:deps
```

## Claims that remain prohibited without evidence

Do not claim:

- a live Aetherion mainnet,
- audited custody safety,
- audited Layer 1 cryptography,
- proven economic stability,
- legal-tender status,
- guaranteed ATC value or appreciation,
- production post-quantum security,
- autonomous AI financial authority,
- trustless Bitcoin bridging before a reviewed bridge exists,
- measured physical or biological effects from symbolic Biozoe/quantum language.

## Next engineering gate

The next major engineering step after the reference branch passes local/CI validation is a dedicated node implementation that binds the state machine to authenticated transactions, persistent storage, and a mature BFT consensus engine. The launch sequence and abort conditions are defined in `FLIGHTPAPER.md`.
