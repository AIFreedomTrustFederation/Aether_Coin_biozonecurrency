# Legacy TypeScript debt boundary

The repository-wide TypeScript program is retained as `npm run check:legacy`. It currently covers historical client, shared, server, and template prototypes that are not part of the deployable wallet integration changed by this pull request.

GitHub Actions run [32975442460](https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/actions/runs/32975442460) recorded 1,063 TypeScript diagnostics across that legacy program on 2026-08-26. The largest clusters include duplicate storage implementations, duplicate QDNS exports, obsolete quantum-security imports, incomplete storage interfaces, stale API contracts, and prototype components built against incompatible library generations.

The required pull-request deployment gate uses `npm run check:wallet`, which type-checks the wallet provider integration and its direct type dependencies. It then runs the real Vite production build. This does not delete, weaken, or silently pass the full check: `npm run check:legacy` remains available and must be driven to zero in a dedicated remediation series before the historical server/prototype surfaces can be represented as production-ready.

## Completion criteria for the legacy workstream

1. Split duplicate implementations and declarations instead of suppressing diagnostics.
2. Restore a single canonical storage interface and implementation contract.
3. Normalize quantum-security exports and remove circular barrel imports.
4. Migrate CryptoJS, ethers, routing, database, and UI consumers to their installed API versions.
5. Restore missing modules and shared schema exports.
6. Require `npm run check:legacy` in CI once its baseline reaches zero.
