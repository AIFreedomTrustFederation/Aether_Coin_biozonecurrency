# Aetherion — AetherCoin Biozoecurrency

**The abundance-first sovereign economy layer of the AI Freedom Trust Federation.**

Aetherion is being rebuilt as an application-specific Layer 1 whose monetary constitution does **not** depend on a fixed terminal supply, founder premine, early-adopter scarcity reward, token-weighted governance, or wealth-weighted validator power. Its native currency is **AetherCoin (`ATC`)**. Its monetary architecture is the **Biozoe protocol**.

The governing principle is:

> **Unbounded monetary possibility. Bounded issuance authority. Equal human standing. Rewarded circulation. Real resource constraints. Freedom without trapped liquidity.**

Aetherion is not yet a live, audited mainnet. The repository distinguishes constitutional target, deterministic reference implementation, legacy prototypes, and future production work so the language cannot outrun the evidence.

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
- **no connectivity requirement to preserve an earned baseline entitlement**
- **no unlimited circulation mint based on transaction count**
- **no canonical exit friction on ordinary ATC-to-ATC transfer**
- **no uncapped canonical exit barrier**
- **no guaranteed appreciation or infinite-value promise**

Genesis establishes the rules; it does not establish an aristocracy.

The machine-readable design seed is [`protocol/genesis.seed.json`](protocol/genesis.seed.json).

---

## Aetherion in the Federation architecture

Aetherion owns the economic relationship and its software surfaces while remaining dependent on other layers for identity, infrastructure, governance, and evidence.

- **AIFT-Genesis → Aetherion:** Genesis supplies identity, trust, mission, governance, and inheritance structures. The economy may reference those identities but does not create constitutional authority by itself.
- **AI-Freedom-Trust → Aetherion:** doctrine establishes the covenant, restorative-economy language, trust philosophy, and evidentiary boundaries through which economic claims are interpreted.
- **AIFT-Forge → Aetherion:** shared package, agent, provider-interface, and build patterns may be inherited without giving Forge control of wallet or transaction decisions.
- **AIFT-OS ↔ Aetherion:** the control plane may discover health, services, or governed capabilities. Financial and custody operations remain explicit high-risk boundaries and do not become ordinary orchestration merely because the OS can invoke a service.
- **AIFT-Runtime ↔ Aetherion:** local runtimes may host wallet-adjacent services, models, or interfaces while preserving secrets and requiring explicit transaction authority.
- **VPS ↔ Aetherion:** VPS provides deployment, nodes, routes, and service availability. Aetherion may provide value and stewardship relationships around those services; neither layer inherits the other's authority.
- **BookSmith ↔ Aetherion:** publishing may eventually connect royalties, licenses, treasury flows, or marketplace settlement to the economy layer, while authorship and publishing approval remain in BookSmith.
- **biozone-harmony-boost → Aetherion:** Circleunchain/Biozoe interface research can inform this repository, while economic and wallet claims remain grounded in the code and security state of this repository.

**Federation layer metadata boundary:** [`aift.repo.json`](aift.repo.json) declares `layer: economy`, while the separate [`federation.manifest.json`](federation.manifest.json) declares `federationLayer: stewardship` and `status: active-protocol-research`. The [`scripts/verify-federation-contracts.mjs`](scripts/verify-federation-contracts.mjs) gate checks required file presence and JSON parsing, not equivalence between these layer labels. Treat them as distinct declarations until a reviewed cross-repository mapping establishes their relationship; neither label alone establishes operational wallet, token, or custody services.

### Illuminated passage — Circleunchain memory

![Circleunchain Memory Network](https://raw.githubusercontent.com/AIFreedomTrustFederation/AI-Freedom-Trust/main/docs/images/aetherion/circleunchain-memory-network.png)

Circleunchain is read here as an architecture of attributable relationship and memory. Any technical realization must name its actual cryptographic and storage mechanisms rather than allowing the symbolic name to substitute for implementation.

The token vocabulary may include AetherCoin/ATC and other Biozoe or Federation value primitives, but symbolic purpose and financial fact must remain distinct. A conceptual token is not a guaranteed asset. A prototype wallet is not audited custody. Post-quantum research language is not a production security guarantee unless the exact implemented mechanism and audit path support that statement.

---

## Biozoe monetary model

At every finite point in time, ATC supply is finite and auditable. The protocol simply does not impose a final maximum supply.

New ATC may enter through five enumerated issuance classes:

1. **Universal issuance** — one equal baseline entitlement for each eligible unique person in each eligible epoch.
2. **Contribution issuance** — governed, budgeted issuance backed by accepted evidence.
3. **Regenerative issuance** — governed, budgeted issuance for accepted restoration outcomes.
4. **Stewardship issuance** — governed, budgeted compensation for public/network infrastructure.
5. **Circulation issuance** — a bounded epoch pool distributed for qualified net circulation of ATC between distinct eligible participants.

No generic administrator `mint(amount)` path belongs in the production protocol.

Universal issuance is an **accrued right, not a daily attendance test**. A person who is eligible but temporarily offline, displaced, hospitalized, without a device, or otherwise unable to transact does not lose the eligible epochs. When the entitlement is later settled, older portions are passed through the same deterministic historical demurrage they would have experienced if claimed on time.

A small deterministic demurrage mechanism is supported so time alone does not convert early access into permanent passive dominance. Circulation issuance supplies the positive counterpart: qualified movement of ATC can earn new ATC from a fixed governed pool rather than relying only on a carrying cost to discourage stagnation.

The design-devnet seed currently uses one ATC of universal issuance per daily epoch and 192 ppm daily demurrage. Circulation issuance and canonical external conversion remain **disabled** in the seed until their production gates are satisfied. All displayed rates are test/scenario parameters, not final monetary calibration.

---

## Reward circulation, not transaction spam

Aetherion does not pay simply because someone created a transaction.

A transfer becomes eligible for circulation scoring only when it is linked to a unique authenticated circulation receipt or equivalent proof. The reference implementation rejects self-transfers, replayed receipts, and double qualification of the same transfer.

Direct pairwise round trips are netted:

```text
qualified pair flow = |A→B - B→A|
```

So `100 ATC` sent out and `100 ATC` sent directly back creates zero pair score.

The reference score uses deterministic integer square root of net pair flow. This creates diminishing returns: larger genuine commerce can earn more weight, but wealth does not receive a linear rebate. Each independent pair contributes separately, so broad circulation can matter more than concentrating the same value through one counterparty.

The disabled design seed uses a 40/60 sender/receiver score weighting and a prototype per-person circulation reward cap. Total circulation issuance can never exceed the authorized epoch pool. Unused authority remains unissued.

The design goal is:

```text
hold passively        → mild carrying cost
spend/accept ATC      → bounded circulation reward
create/steward value  → governed program issuance
extract externally    → transparent canonical friction
```

Human dignity, governance weight, and validator power remain separate from all of those behaviors.

---

## Asymmetric monetary permeability

Aetherion may make **entry easier than immediate canonical exit** without taxing ordinary ATC transfers.

The canonical exchange design separates the external reference value from the service's exit proceeds:

```text
net exit proceeds = reference value × (1 - applied friction)
```

The reference price is not rewritten merely because the canonical facility applies a spread.

The disabled design seed currently models a maturity spread that begins at 2% and gradually approaches 8% over about five years. A future authenticated liquidity-stress state may add at most 7 percentage points, while the seed places a **15% total hard cap** on canonical exit friction. A user choosing an orderly delayed exit receives a public discount schedule that can reduce the friction toward a 1% floor.

These numbers are scenario values for simulation, not promises or production settings.

The constitutional rule is more important than the numbers:

> **Aetherion shall make remaining economically desirable; it shall not make leaving economically impossible.**

Ordinary ATC-to-ATC transfers have no canonical exit friction. Aetherion does not attempt to police every private trade or pretend it can decree a universal secondary-market price.

Read [`docs/circulation-and-exchange.md`](docs/circulation-and-exchange.md) for the full mechanics.

---

## Canonical exits retire surrendered ATC

Under the reference design, ATC surrendered through an executed canonical external conversion is retired from circulating supply. Retirement occurs only **after the external settlement path has accepted the conversion** under the defined settlement procedure.

A failed or rejected external settlement must not silently burn the user's ATC.

The reference state machine records the reference external value, applied friction, expected net proceeds, reserve retention, and ATC retirement. It does **not** pretend to custody ETH, BTC, stablecoins, fiat, or banking reserves. Those external functions require their own audited operator systems.

Likewise, depositing an external asset does not create a generic `mint ATC` authority. Inbound exchange should source existing ATC liquidity unless a future constitutional amendment explicitly creates another issuance mechanism.

---

## Real value, not infinite-price theater

Aetherion's long-run objective is not to make a number on an exchange screen approach infinity.

The stronger objective is that ATC becomes increasingly useful for real relationships: goods, services, productive capacity, infrastructure, mutual aid, knowledge, energy, housing access, transportation, computation, creative work, regenerative activity, and other forms of human exchange.

The goal is not:

> "Nobody can sell ATC."

It is:

> **"People generally find more reason to earn, accept, save appropriately, and circulate ATC than to immediately convert it into something less useful."**

No part of the protocol guarantees appreciation, purchasing power, investment return, or infinite nominal value.

---

## Consensus is not wealth

Aetherion's target Layer 1 uses a mature Byzantine-fault-tolerant consensus engine, with a CometBFT-compatible architecture as the reference direction.

Consensus answers **what state was finalized**. The Biozoe state machine answers **whether a monetary transition is legal**. Identity answers **who is eligible for a right**. Governance answers **who may alter a rule**. ATC balance does not answer all four.

The target validator model uses an authorized validator registry with equal unit voting power per active validator rather than proof-of-stake wealth weighting.

---

## Human dignity is not a productivity or circulation score

A person's baseline economic standing does not disappear because they are sick, elderly, caregiving, displaced, unemployed, studying, recovering, temporarily offline, saving for a future need, or otherwise producing or spending less during a period of life.

Contribution programs can recognize work without constructing one universal score of human worth. Circulation rewards likewise recognize one narrow behavior without becoming citizenship, credit, reputation, or moral ranking.

---

## Identity without a public surveillance ledger

Equal baseline issuance and fair circulation caps require duplicate resistance. They do **not** require publishing every participant's civil identity or complete purchase history on-chain.

The target path is:

```text
AIFT-Genesis identity/trust patterns
        ↓
plural independent attestation
        ↓
privacy-preserving uniqueness credential
        ↓
Aetherion eligibility
        ↓
minimal circulation proof when reward is requested
```

Production identity must support recovery, revocation, appeal, minimal disclosure, and multiple attestation paths. No single government, company, church, biometric provider, exchange operator, or Federation administrator should become the permanent universal identity oracle.

---

## Money is not the spam budget

Real compute, storage, bandwidth, energy, and human attention remain finite even when the currency has no terminal cap.

Aetherion therefore separates ATC from **Pulse**, a planned non-transferable resource accounting primitive for fair-use quotas, congestion, and anti-spam controls.

Pulse is not money, cannot be traded, cannot vote, and cannot create validator power.

---

## Bitcoin and BitcoinOS are witnesses, not sovereigns

Aetherion is designed to remain live without Bitcoin.

An optional anchor adapter may periodically commit a canonical Aetherion state root to Bitcoin or a BitcoinOS-like zero-knowledge settlement rail. External anchoring must be failure-isolated.

ETH, BTC, stablecoins, fiat, and other external assets may also appear at optional exchange boundaries, but they do not define Aetherion's monetary constitution.

---

## Spiritual purpose, technical honesty

The Federation's founding writings speak of the Most High, covenant, truth, mercy, justice, restoration, and Kingdom frequency. In Aetherion, those ideas guide ethical purpose: truth becomes verifiability and truthful quotes, mercy becomes due process and recovery, justice becomes equal standing and anti-capture design, stewardship becomes accountable resource and reserve use, and covenant means administrators remain bound by the rules they administer.

"Kingdom frequency" is not represented as a physical hertz measurement or consensus variable. Symbolic language involving toroidal flow, Fibonacci order, sacred geometry, entanglement, resonance, or quantum relationship is not treated as cryptographic, biological, or economic evidence unless a specific measurable mechanism is separately implemented and supported.

The network remains usable by people of any faith or no faith.

---

## Binding design documents

- [`WHITEPAPER.md`](WHITEPAPER.md) — economic and protocol thesis
- [`MONETARY-CONSTITUTION.md`](MONETARY-CONSTITUTION.md) — protected monetary rights and constraints
- [`HUMAN-RIGHTS-AND-SAFEGUARDS.md`](HUMAN-RIGHTS-AND-SAFEGUARDS.md) — anti-coercion, privacy, accessibility, due-process, transfer, and exit protections
- [`PHILOSOPHY.md`](PHILOSOPHY.md) — dignity, abundance, circulation, stewardship, and spiritual/epistemic boundaries
- [`COMPUTER-DESIGN.md`](COMPUTER-DESIGN.md) — target node, circulation, and exchange architecture
- [`GENESIS.md`](GENESIS.md) — reproducible zero-allocation genesis
- [`FLIGHTPAPER.md`](FLIGHTPAPER.md) — implementation phases, launch gates, and abort conditions
- [`docs/circulation-and-exchange.md`](docs/circulation-and-exchange.md) — circulation and asymmetric monetary-permeability mechanics
- [`docs/regulatory-launch-gate.md`](docs/regulatory-launch-gate.md) — legal/operational boundary before an operated exchange service can activate

---

## Reference implementation

The deterministic executable specification lives under [`protocol/reference/`](protocol/reference/).

It currently includes:

- equal universal issuance rights,
- offline-safe accrued entitlement settlement,
- suspension-aware eligibility intervals,
- deterministic integer demurrage,
- governed contribution, regenerative, and stewardship budgets,
- circulation epoch pools,
- replay-protected circulation receipts,
- direct pairwise round-trip netting,
- integer square-root circulation scoring,
- per-person circulation reward caps,
- ordinary transfer conservation without exit friction,
- progressive canonical exit quote math,
- patient-exit discounts,
- stress and hard-cap enforcement,
- conversion-receipt replay protection,
- ATC retirement only after accepted external settlement,
- cumulative issuance/retirement accounting,
- supply invariant verification,
- balance-independent human governance weight,
- stake-independent validator voting power.

Run:

```bash
npm run protocol:verify
npm run protocol:test
npm run protocol:simulate
```

The simulator and test parameters make no price or purchasing-power guarantee.

---

## Regulatory launch boundary

The protocol can research exchange mathematics while the operated service remains disabled. A Federation-operated facility that exchanges ATC for ETH, BTC, stablecoins, fiat, or other value must complete the applicable legal, licensing, custody, consumer-protection, reserve, sanctions, AML/KYC, tax, privacy, and operational analysis for the actual service before activation.

Governance approval is not a substitute for legal authority required of an operator. See [`docs/regulatory-launch-gate.md`](docs/regulatory-launch-gate.md).

---

## Legacy prototype boundary

This repository predates the current constitution and contains historical browser-side blockchain experiments, placeholder signing, local proof-of-work demonstrations, old RPC/explorer assumptions, and randomly generated symbolic Biozoe metrics.

Those artifacts are **not** proof that an Aetherion mainnet exists and are **not** canonical consensus code.

New consensus-critical work belongs under `protocol/` or a future dedicated node package. Browser/UI code must consume canonical state rather than inventing it locally. Random symbolic metrics remain visualization-only. Placeholder signatures never enter production custody. Old EVM-style chain IDs and RPC strings do not establish network reality, and old transfer-tax heuristics do not define canonical Biozoe exchange policy.

---

## Federation architecture

Aetherion remains one layer of a wider system. AIFT-Genesis supplies constitutional identity and trust patterns; AI-Freedom-Trust supplies doctrine and epistemic discipline; AIFT-Forge supplies reusable engineering patterns; AIFT-OS coordinates governed capabilities without inheriting wallet authority; AIFT-Runtime hosts local-first services; DynastyLink provides human-facing stewardship surfaces; and Aetherion owns canonical economic state and monetary rules.

The economic layer serves the person. It does not become the owner of the person whose value it records.

---

## Verification

Dependency-light repository validation:

```bash
npm run qa:local
```

Protocol validation:

```bash
npm run protocol:verify
npm run protocol:test
```

Application validation where dependencies are installed:

```bash
npm run check
npm run build
npm run security:audit
npm run security:deps
```

The root `package-lock.json` supports reproducible dependency installation; keep it aligned with `package.json`. Protocol QA remains dependency-light. No green local or CI check should be represented as an independent security audit.

---

## The covenant loop

Financial and identity operations continue to follow the Federation operating discipline:

```text
Receive → Inspect → Name → Propose → Consent → Act → Verify → Record → Return
```

AI may explain, model, compare, warn, and propose. It does not silently sign, custody, redefine personhood, manufacture evidence, decide a private trade is immoral, or treat a recommendation as consent.

**Receive** accepts wallet state, transaction intent, value event, escrow condition, stewardship record, or economic query. **Inspect** reads the real account, contract, network, database, credential boundary, and risk context available to the application. **Name** identifies the asset or symbolic primitive, source, destination, authority, network, amount, status, and uncertainty. **Propose** allows AI to explain or recommend while keeping the proposal visibly separate from execution. **Consent** is mandatory for transactions, custody changes, escrow release, credential use, signing, or other consequential financial acts. **Act** invokes the real governed transaction or application operation. **Verify** checks receipts, persistence, expected state changes, and security conditions rather than assuming success from a UI event. **Record** preserves appropriate audit and provenance without exposing private keys or sensitive credentials. **Return** gives the human a readable result and the continuing authority to stop, question, dispute, or reverse where the system permits.

The root declares these local development commands, but the startup limitation below applies to fresh checkouts:

```bash
npm ci
npm run dev
```

**Frontend startup:** `npm run dev` now starts the existing React/Vite UI on `http://127.0.0.1:5000` through `combined-server.js`. After `npm run build`, `npm start` serves `dist/public` on port 3000 (override with `PORT`). Both are frontend-only hosts: `/api`, `/wallet/api`, and `/dapp/api` return HTTP 503. They do not start the legacy PostgreSQL, payment, signing, or custody services. `/health` reports only frontend availability and explicitly identifies the unavailable API.

Core verification may include:

```bash
npm run build
npm run check
npm run security:audit
npm run security:deps
```

Database-backed paths may additionally require PostgreSQL configuration and:

```bash
npm run db:push
```

### CI results versus actual deployment (checked 2026-10-23)

The [dependency-light QA workflow](.github/workflows/qa.yml) runs `npm run qa:local` on Node.js 22 without installing dependencies. Its success does not establish that the separate [wallet deployment workflow](.github/workflows/deploy.yml) passed its terminology gate, TypeScript check, build, or deployment. In the [October 23 wallet workflow run](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/actions/runs/39932066528), the terminology gate reported six matches across `README.md`, `FEDERATION.md`, and `aift.repo.json`; build and deployment were skipped.

**Wallet frontend and deployment:** The shipped preview displays the Biozoe protocol and marks wallet connection, signing, transfers, and payments unavailable. The legacy UI and provider remain in source and are excluded from the preview entry point. GitHub Actions checks both routes and real built assets, including desktop and mobile browser coverage. The deployment workflow builds on pull requests and `main` pushes; publishing requires a confirmed manual run from `main`, environment credentials, and an independently verified SSH host key. It verifies the release SHA, HTML, JS, CSS and unavailable API responses over HTTPS. See [deployment instructions](DEPLOYMENT.md) and the [dependency audit](docs/dependency-audit.md). These checks establish frontend behavior within their tested scope.

The manual [`scripts/sync-and-deploy.sh`](scripts/sync-and-deploy.sh) now stops with a nonzero status on failed `rsync`, file copy, or requested cPanel deployment rather than continuing to report success. Its [focused regression tests](tests/sync-and-deploy.test.mjs) exercise these cases without external deployment. A failed sync can still leave partial target changes; the backup must be inspected and restored manually. This fix does **not** change the separate GitHub Actions sync/deploy workflow or establish live production health. See [manual sync/deploy instructions](scripts/SYNC-DEPLOY-README.md).

### What the current verification commands actually prove

The root [`package.json`](package.json) maps `npm test` to `npm run qa:local`, which runs **structure checks, federation-contract checks, secret-scanner regressions, sync/deploy failure-path regressions, and an API-key pattern scan of tracked Git index files**. The pre-commit hook's default mode checks only staged changes; QA uses `--tracked` because clean CI checkouts have no staged changes. It is not, by itself, a smart-contract test suite, a custody audit, or a demonstration of reserve backing. The root `lint` command also invokes the structure checker rather than ESLint. Run the distinct TypeScript and application build checks separately:

```bash
npm ci
npm test
npm run check
npm run build
npm run security:deps
npm run security:audit
```

**Federation verification metadata boundary:** [`aift.repo.json`](aift.repo.json) advertises `npm run typecheck --if-present` in its `verify` chain, but the root [`package.json`](package.json) defines `npm run check` (`tsc`) and no `typecheck` script. The advertised TypeScript step is therefore silently skipped; a successful metadata-driven verification must not be reported as TypeScript-checked without separately running `npm run check`. The chain also does not establish deployed wallet or network health.

The [`scripts/security-audit.js`](scripts/security-audit.js) uses heuristic source-pattern scanning and catches dependency-audit errors for reporting; it should not be treated as proof that dependencies are vulnerability-free or that an external security audit occurred. The [`scripts/pre-commit-hook.js`](scripts/pre-commit-hook.js) scans selected staged filenames against key-like patterns, but excludes certain paths and remains a bypassable heuristic. It reads Git index snapshots, fails closed on unreadable entries, and reports match locations without printing suspected credentials. Its default invocation checks staged additions/changes; `node scripts/pre-commit-hook.js --tracked` scans every tracked index entry except documented ignored paths. The tracked QA mode uses the narrower high-confidence key-prefix patterns to avoid false positives from ordinary long identifiers; the staged hook retains its broader patterns. Git submodule pointers are skipped rather than read as files, and submodule contents are not scanned. Neither mode scans untracked files, excluded paths, or Git history. Do not treat a passing secret scan as evidence that committed history, deployment configuration, or logs contain no credentials.

**Financial verification boundary:** token names, reserve targets, wallet adapters, and escrow concepts do not establish token issuance, reserve assets, redemption rights, audited balances, or production custody. Before making such claims, identify the specific deployed network and contract address, independently verified contract source, controlling keys, reserve custodian and dated attestation, redemption terms, and transaction evidence. No such claim follows from the README or the root QA commands alone. Treat database migrations such as `npm run db:push` as state-changing operations requiring explicit environment review and authorization, not as routine verification.

**Open-source payment settlement boundary (source-verified 2026-10-26):** [`server/services/openSourcePayment.ts`](server/services/openSourcePayment.ts) explicitly simulates success: `processPayment()` inserts a `pending` payment, changes its local database status to `completed` without contacting an external payment processor, and returns `completed`; `verifyPayment()` treats that stored status alone as verification. Routes in [`server/routes.ts`](server/routes.ts) and [`server/routes/quantum-secure-payment.ts`](server/routes/quantum-secure-payment.ts) invoke this service in source, but live route availability remains unverified. Neither a `completed` response nor `verified: true` proves funds were received or settled, or authorizes downstream fulfillment. Processor confirmation and reconciliation need separate implementation and tests before operational payment claims.

**IPFS secret-loading action boundary (source-verified 2026-10-27):** The checked-in [custom deployment action](.github/actions/aetherion-wallet-deployment/action.yml) describes loading encrypted secrets, but its [implementation](.github/actions/aetherion-wallet-deployment/index.js) passes the storage retrieval result directly to `JSON.parse` and exports parsed fields as environment variables; it implements no decryption, payload authenticity check, or allowed-variable filter. The inspected GitHub Actions workflows do not invoke this local action. Its presence therefore establishes neither secure secret recovery nor an operational deployment path; do not supply production credentials to it without an independently reviewed implementation and focused tests.

Never commit private keys, seed phrases, wallet credentials, API keys, database secrets, OAuth grants, signing keys, or other production credentials. Security language remains tied to what can actually be inspected and tested.

---

## The return of the Word

Aetherion succeeds only if its deepest principles survive contact with money and power.

The founder must remain bound by the same monetary constitution as the newcomer. Wealth must not silently become sovereignty. A person's dignity must not collapse into a productivity or circulation score. Poverty or intermittent connectivity must not erase an earned economic right. Abundance must not become permission for arbitrary minting. Circulation must not become transaction surveillance. Monetary gravity must not become captivity. Spiritual aspiration must not become an excuse for false technical or financial claims.

The purpose of the ledger is not to teach life how to serve the ledger. The purpose of the ledger is to remember how value can return to life without losing consent, truth, freedom, or relationship along the way.
