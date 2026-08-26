# Aetherion — AetherCoin Biozoecurrency

**The abundance-first sovereign economy layer of the AI Freedom Trust Federation.**

Aetherion is being rebuilt as an application-specific Layer 1 whose monetary constitution does **not** depend on a fixed terminal supply, founder premine, early-adopter scarcity reward, token-weighted governance, or wealth-weighted validator power. Its native currency is **AetherCoin (`ATC`)**. Its monetary architecture is the **Biozoe protocol**.

The governing principle is:

> **Unbounded monetary possibility. Bounded issuance authority. Equal human standing. Real resource constraints.**

Aetherion is not yet a live, audited mainnet. The repository now distinguishes constitutional target, deterministic reference implementation, legacy prototypes, and future production work so the language cannot outrun the evidence.

---

## The constitutional core

Aetherion begins with zero private monetary ownership at genesis:

- **0 premine**
- **0 founder allocation**
- **0 investor allocation**
- **0 team allocation**
- **0 genesis treasury allocation**
- **no terminal ATC supply cap**
- **no token-weighted human governance**
- **no ATC-balance-derived validator power**
- **no early-adopter multiplier on universal issuance**

Genesis establishes the rules; it does not establish an aristocracy.

The machine-readable design seed is [`protocol/genesis.seed.json`](protocol/genesis.seed.json).

---

## Biozoe monetary model

At every finite point in time, ATC supply is finite and auditable. The protocol simply does not impose a final maximum supply.

New ATC may enter through enumerated issuance classes:

1. **Universal issuance** — equal baseline issuance for an eligible unique person per epoch.
2. **Contribution issuance** — governed, budgeted issuance backed by accepted evidence.
3. **Regenerative issuance** — governed, budgeted issuance for accepted restoration outcomes.
4. **Stewardship issuance** — governed, budgeted compensation for public/network infrastructure.

No generic administrator `mint(amount)` path belongs in the production protocol.

A small deterministic demurrage mechanism is supported so time alone does not convert early access into permanent passive dominance. The design-devnet seed currently uses one ATC of universal issuance per daily epoch and 192 ppm daily demurrage. Those are test parameters, not claims of final economic calibration.

Read the binding design documents:

- [`WHITEPAPER.md`](WHITEPAPER.md) — economic and protocol thesis
- [`MONETARY-CONSTITUTION.md`](MONETARY-CONSTITUTION.md) — protected monetary rights and constraints
- [`PHILOSOPHY.md`](PHILOSOPHY.md) — dignity, abundance, stewardship, and spiritual/epistemic boundaries
- [`COMPUTER-DESIGN.md`](COMPUTER-DESIGN.md) — target node and state-machine architecture
- [`GENESIS.md`](GENESIS.md) — reproducible zero-allocation genesis
- [`FLIGHTPAPER.md`](FLIGHTPAPER.md) — implementation phases, launch gates, and abort conditions

---

## Consensus is not wealth

Aetherion's target Layer 1 uses a mature Byzantine-fault-tolerant consensus engine, with a CometBFT-compatible architecture as the reference direction.

Consensus answers **what state was finalized**.

The Biozoe state machine answers **whether a monetary transition is legal**.

Identity answers **who is eligible for a right**.

Governance answers **who may alter a rule**.

ATC balance does not answer all four.

The target validator model uses an authorized validator registry with equal unit voting power per active validator rather than proof-of-stake wealth weighting. Operator independence, diversity, monitoring, and due process remain necessary because removing stake does not remove the need for Sybil resistance or validator accountability.

---

## Human dignity is not a productivity score

Universal issuance and contribution issuance are intentionally separate.

A person's baseline economic standing does not disappear because they are sick, elderly, caregiving, displaced, unemployed, studying, recovering, or otherwise producing less market-measurable output during a period of life.

Contribution programs can recognize care, repair, ecological restoration, teaching, code, art, infrastructure, food production, mediation, research, and other work without constructing one universal score of human worth.

---

## Identity without a public surveillance ledger

Equal baseline issuance requires duplicate resistance. It does **not** require publishing every participant's civil identity on-chain.

The target path is:

```text
AIFT-Genesis identity/trust patterns
        ↓
plural independent attestation
        ↓
privacy-preserving uniqueness credential
        ↓
Aetherion eligibility
```

Production identity must support recovery, revocation, appeal, minimal disclosure, and multiple attestation paths. No single government, company, church, biometric provider, or Federation operator should become the permanent universal identity oracle.

---

## Money is not the spam budget

Real compute, storage, bandwidth, energy, and human attention remain finite even when the currency has no terminal cap.

Aetherion therefore separates ATC from **Pulse**, a planned non-transferable resource accounting primitive for fair-use quotas, congestion, and anti-spam controls.

Pulse is not money, cannot be traded, cannot vote, and cannot create validator power.

---

## Bitcoin and BitcoinOS are witnesses, not sovereigns

Aetherion is designed to remain live without Bitcoin.

An optional anchor adapter may periodically commit a canonical Aetherion state root to Bitcoin or a BitcoinOS-like zero-knowledge settlement rail. That external receipt can strengthen historical auditability without importing Bitcoin's fixed-supply monetary constitution into Aetherion.

External anchoring must be failure-isolated: if Bitcoin fees spike, an anchor stalls, or an external bridge fails, Aetherion consensus and internal monetary validity continue.

---

## Spiritual purpose, technical honesty

The Federation's founding writings speak of the Most High, covenant, truth, mercy, justice, restoration, and Kingdom frequency. In Aetherion, those ideas guide ethical purpose: truth becomes verifiability, mercy becomes due process and recovery, justice becomes equal standing and anti-capture design, stewardship becomes accountable resource use, and covenant means administrators remain bound by the rules they administer.

"Kingdom frequency" is not represented as a physical hertz measurement or consensus variable. Likewise, symbolic language involving toroidal flow, Fibonacci order, sacred geometry, entanglement, resonance, or quantum relationship is not treated as cryptographic, biological, or economic evidence unless a specific measurable mechanism is separately implemented and supported.

The network is intended to remain usable by people of any faith or no faith. Spiritual inspiration does not become a theological gate on economic dignity.

---

## Reference implementation

The new deterministic reference implementation lives under [`protocol/reference/`](protocol/reference/).

It currently includes:

- equal universal issuance,
- deterministic integer demurrage,
- governed budgeted issuance,
- transfer conservation,
- identity eligibility state,
- epoch transitions,
- cumulative issuance/retirement accounting,
- supply invariant verification,
- balance-independent human governance weight,
- stake-independent validator voting power.

Run:

```bash
npm run protocol:test
npm run protocol:verify
```

The reference state machine deliberately contains no wallet-signing pretense. Authentication belongs at the transaction/consensus boundary and must use real cryptography in the production node.

---

## Legacy prototype boundary

This repository predates the current constitution and contains historical browser-side blockchain experiments, placeholder signing, local proof-of-work demonstrations, hard-coded RPC/explorer URLs, and randomly generated symbolic Biozoe metrics.

Those artifacts are **not** proof that an Aetherion mainnet exists and are **not** canonical consensus code.

Migration rules are now explicit:

- consensus-critical work moves under `protocol/` or a future dedicated node package;
- browser/UI code must consume canonical state instead of inventing it locally;
- random symbolic metrics remain visualization-only;
- placeholder signatures never enter production custody;
- old EVM-style chain IDs and RPC strings do not establish network reality.

---

## Federation architecture

Aetherion remains one layer of a wider system:

- **AIFT-Genesis** supplies constitutional identity, trust, mission, governance, and inheritance patterns.
- **AI-Freedom-Trust** supplies doctrine, covenant, and epistemic discipline.
- **AIFT-Forge** supplies reusable engineering patterns.
- **AIFT-OS** coordinates governed capabilities without inheriting wallet authority.
- **AIFT-Runtime** hosts local-first services and wallet-adjacent capabilities.
- **DynastyLink** provides human-facing stewardship and inheritance surfaces.
- **Aetherion** owns canonical economic state and monetary rules.

The economic layer serves the person. It does not become the owner of the person whose value it records.

---

## Verification

Dependency-light repository validation:

```bash
npm run qa:local
```

Protocol validation:

```bash
npm run protocol:test
npm run protocol:verify
```

Application validation where dependencies are installed:

```bash
npm run check
npm run build
npm run security:audit
npm run security:deps
```

No green local check should be represented as an independent security audit.

---

## The covenant loop

Financial and identity operations continue to follow the Federation operating discipline:

```text
Receive → Inspect → Name → Propose → Consent → Act → Verify → Record → Return
```

AI may explain, model, compare, warn, and propose. It does not silently sign, custody, redefine personhood, manufacture evidence, or treat a recommendation as consent.

---

## The return of the Word

Aetherion succeeds only if its deepest principles survive contact with money and power.

The founder must remain bound by the same monetary constitution as the newcomer. Wealth must not silently become sovereignty. A person's dignity must not collapse into a productivity score. Abundance must not become permission for arbitrary minting. Spiritual aspiration must not become an excuse for false technical claims. Interoperability must not become dependency.

The purpose of the ledger is not to teach life how to serve the ledger. The purpose of the ledger is to remember how value can return to life without losing consent, truth, or relationship along the way.
