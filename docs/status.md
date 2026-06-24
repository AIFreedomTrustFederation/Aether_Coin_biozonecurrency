# Aether Coin Biozoecurrency Status

Last reviewed: 2026-06-24

## Current Role

This repository is the federation stewardship and wallet research lane. It contains Aetherion wallet UI work, regenerative token taxonomy concepts, AI-guided risk and consent research, post-quantum security experiments, QDNS/decentralized deployment references, and the local-first DynastyLink application foundation.

## Current Verified Foundation

- The root repository is public and active.
- The main application stack is React/Vite, TypeScript, Node/Express, shared schemas, and Drizzle/PostgreSQL integration paths.
- Security docs exist in `SECURITY.md`, `API-SECURITY-GUIDELINES.md`, and `QUANTUM-SECURITY.md`.
- Dependency and static security review scripts exist under `scripts`.
- The local-first DynastyLink lane lives under `apps/dynastylink-local`.
- The quantum-validator and API-gateway packages are present as separate package surfaces.
- Lightweight local repo verification is available through `npm run qa:local`.
- `federation.manifest.json` now defines the machine-readable Federation handshake.
- Biozoecurrency token taxonomy docs and TypeScript primitives now exist.
- Consent Ledger docs and TypeScript primitives now exist.
- Federation event docs and TypeScript primitives now exist.
- Operational status docs and TypeScript primitives now exist.
- The DynastyLink to Aetherion bridge guide now defines the local-first integration boundary.
- `scripts/verify-federation-contracts.mjs` now provides a standalone Federation contract check.
- `scripts/verify-biozoecurrency-terminology.mjs` now provides a standalone terminology check.
- `shared/types/federation.ts` now provides a Federation type barrel export.
- `client/src/features/biozoecurrency/pages/BiozoecurrencyPage.tsx` now reads canonical token definitions from shared Federation types.

## Not Yet Claimed

Do not claim these as production-ready without matching implementation, review, and verification evidence:

- audited wallet custody safety
- production token value or investment utility
- post-quantum security guarantees
- autonomous AI financial authorization
- decentralized deployment reliability
- legal, tax, investment, insurance, or financial advice
- production DynastyLink legal document validity

## Current Validation Boundary

`npm run qa:local` is the current dependency-light repo gate. It validates required docs, package scripts, package-lock alignment, major source directories, DynastyLink local-first docs, package surfaces, and the API-key guard script.

Last local `npm run qa:local` pass: 2026-06-24 on the Windows local builder.

Full build, TypeScript, database, dependency, and security audit checks require the full local dependency stack and environment. See `docs/validation.md`.

Standalone local checks:

```bash
node scripts/verify-federation-contracts.mjs
node scripts/verify-biozoecurrency-terminology.mjs
```

## Federation Alignment Added On 2026-06-24

- `federation.manifest.json`
- `docs/federation-integration.md`
- `docs/biozoecurrency-token-taxonomy.md`
- `docs/consent-ledger.md`
- `docs/dynastylink-aetherion-bridge.md`
- `docs/federation-events.md`
- `docs/operations-dashboard.md`
- `docs/optional-integrations.md`
- `docs/local-first-runbook.md`
- `scripts/verify-federation-contracts.mjs`
- `scripts/verify-biozoecurrency-terminology.mjs`
- `shared/types/biozoecurrency-token.ts`
- `shared/types/consent-ledger.ts`
- `shared/types/federation-events.ts`
- `shared/types/operational-status.ts`
- `shared/types/federation.ts`

## Current Known Gaps

- Full local build and TypeScript checks have not been run in this connector session.
- `package.json` still needs a local script hook for `verify:federation`; an attempted connector update was blocked by the tool safety layer.
- The root `package-lock.json` is a minimal identity repair and should be regenerated from a local checkout.
- `docs/security-and-privacy.md`, `AGENTS.md`, and deeper UI copy still need dedicated terminology and claim-boundary passes where connector safety blocked direct rewrites.
- Older scripts, archived pasted logs, and deployment helper files may still contain the old Biozone spelling and should be cleaned in a dedicated terminology pass.
- Real custody, live token, legal trust, deployment, and post-quantum production claims remain out of scope until verified and reviewed.

## Next Best Work

1. Run `node scripts/verify-federation-contracts.mjs` in a local checkout.
2. Run `node scripts/verify-biozoecurrency-terminology.mjs` in a local checkout.
3. Run `npm run qa:local` in a local checkout.
4. Regenerate a full `package-lock.json` from `package.json` in a local checkout.
5. Add `verify:federation` and terminology scripts to `package.json` locally if the connector continues blocking that rewrite.
6. Continue wiring typed contracts into UI and server code after TypeScript and build checks are green.
