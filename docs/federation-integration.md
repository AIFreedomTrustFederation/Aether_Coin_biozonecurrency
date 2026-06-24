# Federation Integration

Aether Coin Biozoecurrency is the AI Freedom Trust Federation stewardship lane for wallet research, consent records, regenerative value primitives, and trust-interface coordination.

This document defines how the repository should integrate with the wider Federation without overclaiming wallet, token, legal, financial, deployment, or security readiness.

## Integration Role

Aetherion should function as a trust interface between:

- human intent
- AI-guided explanation
- wallet and asset awareness
- Biozoecurrency token taxonomy
- DynastyLink trust identity profiles
- local vault references
- future federation node operations

The system should help users understand and organize stewardship decisions. It should not silently execute irreversible financial, legal, or custody actions.

## Main-Only Development Rule

During early Federation development, this repository uses a main-only workflow.

- Commit focused changes directly to `main`.
- Avoid branch and pull request bloat unless the human owner explicitly asks for a branch or PR.
- Keep commits narrow, reversible, and clearly named.
- Update status docs when a surface becomes canonical.

## Canonical Integration Surfaces

- `federation.manifest.json` is the machine-readable federation handshake.
- `docs/federation-integration.md` is the human-readable integration guide.
- `shared/types/*` files define typed local contracts.
- `docs/status.md` records the public claim boundary.
- `docs/validation.md` records verification expectations.

## Federation Data Ownership

Aetherion may define local schemas and references for:

- stewardship profiles
- consent ledger records
- wallet risk review summaries
- Biozoecurrency token definitions
- local vault file references
- federation event envelopes
- operations status snapshots

Aetherion should not publish personal trust data, vault contents, sensitive wallet material, or legal documents as public examples. Use synthetic examples only.

## Integration With DynastyLink

DynastyLink creates or exports Federated Trust Profile data.

Aetherion consumes that data as stewardship context:

```text
DynastyLink Federated Trust Profile
-> Aetherion Stewardship Profile
-> Consent Ledger
-> Asset and Vault References
-> Biozoecurrency Eligibility and Status
-> Federation Event Stream
```

The bridge should be local-first. Import/export files are preferred before remote services.

## Integration With AIFT-Forge

AIFT-Forge may later coordinate local source hosting, issue workflows, builds, releases, and agent-assisted development.

Aetherion should expose enough structure for Forge to understand:

- repo role
- validation commands
- typed contracts
- event schema
- risk boundaries
- operational status

## Integration With VPS And Federation Nodes

Future VPS or node infrastructure should treat Aetherion as a deployable stewardship app only after validation evidence exists.

Until then, deployment references are research or prototype lanes.

## Integration With BookSmith AI And Doctrine Repos

BookSmith AI and doctrine repositories may generate educational, theological, legal-review, or philosophical packets that explain Federation concepts.

Aetherion should consume only finalized, status-labeled doctrine or public education material. It should not turn visionary doctrine into production financial claims.

## Required Boundaries

Use these labels consistently:

- `implemented`
- `prototype`
- `experimental`
- `planned`
- `blocked`
- `needs_review`
- `audited`

Only use `audited` when a named review artifact exists. Only use production-ready language when build, security, deployment, and operational evidence support it.

## Near-Term Operating Target

The near-term target is a local-first federation stewardship foundation:

1. manifest present
2. typed Biozoecurrency taxonomy present
3. consent ledger contract present
4. DynastyLink bridge contract present
5. federation event contract present
6. operations status contract present
7. local QA gate kept green
