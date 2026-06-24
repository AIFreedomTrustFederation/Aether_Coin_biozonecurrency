# Repository Material Routing

This document explains how to treat loose, generated, archival, and deployment-related material in this repository. The goal is to preserve useful work without letting unreviewed clutter silently become product behavior.

## Snapshot

| Area | Current Role | Runtime Use | Recommended Routing |
| --- | --- | --- | --- |
| `attached_assets/` | Raw intake archive: screenshots, photos, pasted notes, whitepaper fragments, logs. | None found by filename reference scan. | Keep as reference until individual files are reviewed and routed into docs, QA records, issues, or app assets. |
| `.vite/` | Local Vite dependency cache. | No intentional source role. | Treat as generated cache. Remove from source control only in a dedicated cleanup after confirming build still works. |
| `quantum-validator/dist/` | Compiled output for `quantum-validator/src`. | API gateway imports source directly. | Keep only if publishing `quantum-validator` as a package from the repo. Otherwise regenerate with `npm run build` inside `quantum-validator/`. |
| `.github/workflows/` | Deployment and sync automation. | GitHub automation, not app runtime. | Review each workflow before enabling broad push deployment. Deployment secrets and remote commands require owner approval. |
| Root deployment scripts | cPanel, domain, decentralized deployment, sync, and setup experiments. | Operator tooling. | Consolidate into `deployment-guides/` plus a small supported script set. Mark old scripts as legacy before removal. |
| `updated_whitepaper/` | Canonical long-form whitepaper material. | Documentation and public narrative. | Prefer this over raw pasted fragments in `attached_assets/`. |
| `templates/` | Reusable page/template material. | Source for future UI work. | Keep and connect only when a concrete route or generator consumes it. |
| `apps/dynastylink-local/` | Local/offline DynastyLink app surface. | Separate app surface. | Keep isolated with its own docs, checks, and privacy boundary. |
| `api-gateway/` | Separate gateway package. | Service package. | Keep package-level build and validation distinct from root checks. |
| `quantum-validator/src/` | Validator source package. | Source dependency for API gateway. | Keep as source of truth for validator behavior. |

## Wiring Rules

1. Route raw material into a named canonical home before using it in product claims.
2. Keep reference archives out of runtime imports and production bundles.
3. Treat generated folders as reproducible unless a package publication workflow explicitly requires committed build output.
4. Treat deployment automation as high-risk. Review triggers, secrets, and remote commands before enabling or merging.
5. For wallet, payment, custody, token, AI-agent, or security claims, preserve status labels: implemented, prototype, simulated, experimental, planned, or audited.

## Useful Next Work

1. Create `docs/qa/` and move selected screenshots into issue-linked QA notes.
2. Consolidate overlapping deployment guides into one supported deployment path and one research appendix.
3. Review `.github/workflows/deploy*.yml` and make dangerous deployment jobs manual-only until secrets and environments are verified.
4. Decide whether `quantum-validator` should be a published package. If yes, add package build/publish docs. If no, stop treating `dist/` as source.
5. Mine `attached_assets/Pasted-*` files for architecture, security, and whitepaper content, then mark raw files as routed in `attached_assets/README.md`.
