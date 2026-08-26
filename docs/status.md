# Aetherion Biozoecurrency Status

Last reviewed: 2026-08-25

## Current role

This repository is the AI Freedom Trust Federation's economic and stewardship layer. The active architecture refactor moves Aetherion from a collection of wallet/token/blockchain prototypes toward a clearly specified sovereign Layer 1 with an abundance-first Biozoe monetary constitution, bounded circulation incentives, and an optional failure-isolated canonical exchange boundary.

The active implementation branch is `feat/biozoe-abundance-l1`.

## Current verified repository facts

- The repository is public and active.
- The application stack includes React/Vite, TypeScript, Node/Express, shared schemas, and PostgreSQL/Drizzle integration paths.
- Historical browser-side blockchain and Biozoe demonstrations remain in the repository but are explicitly legacy/prototype surfaces.
- Security guidance exists in `SECURITY.md`, `API-SECURITY-GUIDELINES.md`, `QUANTUM-SECURITY.md`, and `docs/security-and-privacy.md`.
- DynastyLink local-first work remains under `apps/dynastylink-local`.
- A machine-readable Federation handshake exists in `federation.manifest.json`.

## Canonical protocol surfaces on the refactor branch

The following now define the intended Aetherion monetary architecture:

- `README.md`
- `WHITEPAPER.md`
- `FLIGHTPAPER.md`
- `PHILOSOPHY.md`
- `MONETARY-CONSTITUTION.md`
- `HUMAN-RIGHTS-AND-SAFEGUARDS.md`
- `COMPUTER-DESIGN.md`
- `GENESIS.md`
- `docs/circulation-and-exchange.md`
- `docs/regulatory-launch-gate.md`
- `protocol/genesis.seed.json`
- `protocol/protocol.manifest.json`
- `protocol/reference/biozoe-policy.mjs`
- `protocol/reference/aetherion-state-machine.mjs`
- `protocol/reference/*.test.mjs`
- `protocol/simulation/biozoe-sim.mjs`
- `scripts/verify-biozoe-protocol.mjs`

## Implemented in the deterministic reference specification

The dependency-light reference implementation contains deterministic logic for:

- offline-safe accrued universal entitlement settlement,
- suspension-aware eligibility intervals,
- integer demurrage,
- contribution, regenerative, and stewardship budget stores,
- evidence replay protection,
- spent-budget reset protection,
- ordinary ATC transfers that conserve supply,
- transfer identifiers for circulation qualification,
- unique circulation-receipt tracking,
- transfer double-qualification protection,
- pairwise direct-round-trip netting,
- deterministic integer-square-root circulation scoring,
- configurable sender/receiver circulation score weights,
- per-identity circulation reward caps,
- fixed circulation epoch pools with unissued remainder,
- progressive canonical exit-friction quote calculation,
- bounded stress input,
- patient-exit discount,
- minimum and maximum exit-friction enforcement,
- reference-value separation from net exit proceeds,
- replay-protected conversion receipts,
- ATC retirement only after external settlement acceptance,
- cumulative issuance accounting,
- cumulative retirement accounting,
- supply invariant verification,
- balance-independent human governance weight,
- stake-independent equal validator voting power.

## Machine-readable design defaults

The design genesis seed specifies zero premine, zero founder/investor/team/treasury allocation, zero initial balances, no terminal ATC supply cap, no token-weighted governance or consensus, no balance-derived validator power, and optional rather than mandatory Bitcoin/BitcoinOS-like anchoring.

Circulation issuance is **disabled** in genesis and its epoch pool begins at zero. The reference algorithm exists so it can be tested before any monetary authority is granted.

Canonical conversion is also **disabled** in genesis. The current scenario values model a 2% starting maturity spread, an 8% mature target after 1,825 daily epochs, a maximum 7% stress surcharge, a 15% total hard cap, patient-exit discounts up to 7 percentage points, and a 1% floor. These values are simulation inputs rather than production settings or promises.

The seed explicitly states that ordinary ATC transfers do not receive exit friction, inbound external deposits do not authorize generic ATC minting, the reference value remains distinct from exit proceeds, and the protocol does not guarantee appreciation or infinite nominal value.

## Human-rights boundary

The current Constitution and safeguards protect:

- equal baseline standing,
- intermittent connectivity,
- freedom of conscience,
- no universal social-credit score,
- no forced biometrics as the sole participation path,
- no AI ownership of consent,
- ordinary ATC transfer without canonical exit friction,
- transparent bounded canonical exit,
- freedom from trapped-liquidity economics,
- circulation qualification without generalized purchase surveillance.

## Prototype/legacy boundary

Historical blockchain code predates the new constitution and must not be represented as canonical Layer 1 consensus.

Known prototype characteristics include browser-side state, simple local proof-of-work demonstrations, placeholder signatures, historical network/RPC configuration, and randomly generated symbolic Biozoe/quantum-style metrics.

Those artifacts are retained for provenance and UI research until deliberately migrated or retired. They are not evidence that an Aetherion mainnet, exchange, bridge, reserve, or audited custody system is live.

## Not yet implemented as production infrastructure

- CometBFT-compatible node integration
- authenticated production transaction envelope
- persistent consensus state
- privacy-preserving unique-person eligibility
- multi-attester identity and recovery
- production cryptographic circulation receipts
- graph-level anti-wash controls beyond direct pair netting
- executable multi-chamber governance
- governed liquidity-stress state/oracle
- validator registry and independent-operator enforcement
- Pulse non-transferable resource accounting
- lazy production demurrage settlement
- wallet migration to canonical node state
- reproducible public devnet genesis
- optional Bitcoin/BitcoinOS-like state-root anchor adapter
- external reserve custody and reconciliation
- atomic/failure-safe ATC-to-external-asset settlement
- licensed/authorized Federation-operated conversion service
- independent security/economic review
- public testnet and mainnet

## Validation boundary

The branch wires protocol checks into repository QA:

```bash
npm run protocol:verify
npm run protocol:test
npm run protocol:simulate
npm run qa:local
```

`npm run qa:local` is intended to run the structure check, Biozoe constitutional verifier, protocol unit tests, and API-key guard.

The new circulation/exchange test file is included automatically by the `protocol/reference/*.test.mjs` glob.

Runtime/CI execution evidence must still be inspected before this branch is described as green. Source review and successful connector writes are not equivalent to a test pass.

Application-level checks remain:

```bash
npm run check
npm run build
npm run security:audit
npm run security:deps
```

The root repository still lacks a `package-lock.json`, so dependency-free protocol checks can run independently while reproducible application dependency installation requires a deliberately regenerated and reviewed lockfile.

## Claims that remain prohibited without evidence

Do not claim:

- a live Aetherion mainnet,
- a live Federation-operated canonical exchange,
- audited custody or reserve safety,
- audited Layer 1 cryptography,
- proven economic stability,
- legal-tender status,
- guaranteed ATC value, appreciation, purchasing power, or infinite nominal value,
- production post-quantum security,
- autonomous AI financial authority,
- trustless Bitcoin bridging before a reviewed bridge exists,
- measured physical or biological effects from symbolic Biozoe/quantum language,
- regulatory authorization merely because the protocol can compute an exchange quote.

## Next engineering gate

After dependency-light protocol QA is actually green, the next major engineering step remains a dedicated node implementation that binds the state machine to authenticated transactions, persistent storage, and a mature BFT consensus engine.

Circulation issuance should then advance through adversarial devnet simulation before activation. Canonical conversion should remain disabled until a separate exchange implementation passes reserve, settlement, security, disclosure, governance, and regulatory gates.

The launch sequence and abort conditions are defined in `FLIGHTPAPER.md`.
