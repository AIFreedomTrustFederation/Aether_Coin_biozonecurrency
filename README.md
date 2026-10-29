# Aetherion — Aether Coin Biozonecurrency

**The economy layer of the AI Freedom Trust Federation: DynastyLink, AetherCoin, Biozoe/Biozone currency systems, sovereign wallet intelligence, regenerative value, and consent-centered digital stewardship.**

| Federation metadata | Value |
| --- | --- |
| Layer | `economy` |
| Role | economic layer, DynastyLink, AetherCoin, and biozone currency systems |
| Workspace | `AIFT/Aether_Coin_biozonecurrency` |
| Control plane | AIFT workspace / AIFT-OS |
| Primary application stack | TypeScript, React/Vite, Node/Express, PostgreSQL/Drizzle integration paths |
| Verification | lint, typecheck, tests, build, and security checks when configured |
| Operating standards | local-first, inspectable, sovereign by default, AI behind governed provider interfaces |

Aetherion is the Federation's economic and stewardship architecture. It explores how identity, contribution, memory, exchange, wallet interaction, AI guidance, and regenerative purpose can be joined without allowing the system that measures value to become the owner of the person whose value it records.

The constitutional basis is carried in the [One Eternal Scroll of ALO'ha](https://aifreedomtrustfederation.github.io/AI-Freedom-Trust/docs/pdf/one-eternal-scroll-of-aloha.pdf). Its operating discipline is [SOP-ALOHA-001](https://github.com/AIFreedomTrustFederation/AI-Freedom-Trust/blob/main/SOP-ALOHA-001.md).

---

## Book I — Value as Relationship

Aetherion begins from the proposition that value is more than price. A system may record exchange, contribution, stewardship, covenant memory, identity, or mutual aid, but no token or ledger can exhaust the human reality from which those relationships arise.

The economic layer therefore places **sovereign consent** before convenience. AI may explain wallet activity, identify anomalies, summarize smart-contract context, model risk, support escrow or dispute understanding, and help a person see consequences before acting. It may not silently authorize transfers, assume custody, conceal uncertainty, or treat an economic recommendation as permission.

### Illuminated passage — Biozoe Tree of Life

![Biozoe Tree of Life](https://raw.githubusercontent.com/AIFreedomTrustFederation/AI-Freedom-Trust/main/docs/images/aetherion/biozoe-tree-of-life.png)

The Tree of Life is the natural image of this layer because it places exchange inside an ecology of identity, stewardship, mission, memory, and contribution. The economic system is one branch of the Federation, not the root of human worth.

---

## Book II — Aetherion in the Federation Architecture

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

## Book III — SOP-ALOHA-001 in the Economy Layer

The shared covenant loop is especially strict where money, identity, and custody are involved:

```text
Receive → Inspect → Name → Propose → Consent → Act → Verify → Record → Return
```

**Receive** accepts wallet state, transaction intent, value event, escrow condition, stewardship record, or economic query. **Inspect** reads the real account, contract, network, database, credential boundary, and risk context available to the application. **Name** identifies the asset or symbolic primitive, source, destination, authority, network, amount, status, and uncertainty. **Propose** allows AI to explain or recommend while keeping the proposal visibly separate from execution. **Consent** is mandatory for transactions, custody changes, escrow release, credential use, signing, or other consequential financial acts. **Act** invokes the real governed transaction or application operation. **Verify** checks receipts, persistence, expected state changes, and security conditions rather than assuming success from a UI event. **Record** preserves appropriate audit and provenance without exposing private keys or sensitive credentials. **Return** gives the human a readable result and the continuing authority to stop, question, dispute, or reverse where the system permits.

The root declares these local development commands, but the startup limitation below applies to fresh checkouts:

```bash
npm install
npm run dev
```

**Current startup limitation (verified 2026-10-23):** The root [`package.json`](package.json) defines `npm run dev` as `node combined-server.js`, but `combined-server.js` is absent from the default branch. The [`.replit`](.replit) configuration invokes the same script, so neither is a verified fresh-checkout startup path. Although [`server/index.ts`](server/index.ts) contains an Express application entry point, it has not been validated as a drop-in replacement for the missing script. Until the entry point is repaired and exercised, the QA, TypeScript, and build commands below verify only their respective scopes; they do not establish that the development server starts successfully.

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

**Deployment trigger documentation boundary (source-verified 2026-10-26):** [`DEPLOYMENT.md`](DEPLOYMENT.md) describes staging on `main` pushes and production deployment only by manual dispatch, but the actual [wallet deployment workflow](.github/workflows/deploy.yml) runs on `main` pushes and defaults its deploy job to the `production` environment when no manual environment input is supplied. A `main` push that passes the test and build jobs can therefore reach the production deployment path if its required secrets and environment gates permit. The [October 26 wallet workflow run](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/actions/runs/40345651861) failed the terminology gate with six matches; its build and deployment jobs were skipped. The guide's trigger summary is outdated; inspect the actual workflow and environment protections before authorizing a release.

**Wallet frontend artifact-path boundary (source-verified 2026-10-27):** [`vite.config.ts`](vite.config.ts) writes the frontend build to `dist/public`, but [`server-redirect.js`](server-redirect.js), launched from the repository root by the [wallet deployment workflow](.github/workflows/deploy.yml), serves `/dapp` and `/wallet` from `dist` and looks for `dist/index.html`. The build and serve paths therefore do not agree. The workflow's root HTTP probe accepts status 302, which the redirect server returns for `GET /` without checking frontend assets; its `/health` endpoint likewise reports only the redirect process. A successful process check or root redirect would not establish a working wallet UI, API, database, or payment service. Reconcile the artifact paths and add route-level smoke coverage through the separate Verification & Repair task before claiming operational wallet deployment.

The [traditional-server workflow](.github/workflows/deploy-traditional.yml) and [frontend sync/deploy workflow](.github/workflows/sync-and-deploy.yml) can report success even when missing credentials cause all actual deployment or synchronization steps to be skipped.

**Additional wallet deployment verification boundary:** The [wallet deployment workflow](.github/workflows/deploy.yml) collects the SSH host key with `ssh-keyscan` without comparing it to an independently trusted fingerprint. If deployment reaches the server, `systemctl is-active` establishes only service process state. The subsequent HTTP probe accepts 200/302 responses but logs a warning, rather than failing the step, for other HTTP status codes. Therefore even a green deployment job would not by itself prove SSH host authenticity, correct application behavior, TLS protection, or external production readiness. Independently verify the server's SSH host fingerprint and exercise the intended HTTPS application routes before claiming a live, secure release. The October 23 [traditional-server run](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/actions/runs/39932066570) and [frontend sync/deploy run](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/actions/runs/39932066541) demonstrate that skip case: their credential checks ran, but the actual build, synchronization, and deployment steps were skipped; neither run verified host authenticity or HTTPS application behavior. Inspect individual job steps, produced artifacts, and live service health before claiming deployment success. When configured, frontend synchronization can also commit and push to another federation repository.

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

## Book IV — Restorative Exchange and the Human Center

Aetherion is designed toward a future in which digital value can carry more context than extraction-first speculation. Contribution can be connected to mission. Stewardship can be visible. Identity can remain sovereign. AI can help a person understand complexity without becoming the owner of the decision. Infrastructure can be compensated without becoming a centralized gatekeeper. Publishing, community systems, and practical services can connect to value rails without collapsing every relationship into a token.

That future remains credible only when the present implementation speaks precisely. The application, database, cryptographic libraries, contracts, wallet adapters, and security controls are the evidence for engineering claims. The Scroll provides meaning; the code provides operational proof.

### The Return of the Word

In Aetherion, the Word returns when value completes its circuit without losing consent. Intention becomes a proposed exchange, the proposed exchange becomes an authorized act, the act becomes a verifiable record, and the record returns to the human being with custody and meaning still intact. Regenerative value begins there: not where the ledger replaces life, but where the ledger remembers whom it serves.
