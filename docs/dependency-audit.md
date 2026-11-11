# Aetherion dependency audit

Audit snapshot: November 10, 2026 (Pacific time). Counts are npm audit package findings, not unique CVEs or exploitability determinations.

| Scope | Low | Moderate | High | Critical | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Root before remediation | 15 | 26 | 53 | 5 | 99 |
| Root after remediation | 12 | 22 | 30 | 0 | 64 |
| Isolated frontend runtime | 0 | 0 | 0 | 0 | 0 |

Applied compatible lockfile updates and targeted versions for Vite, PostCSS, React Router, rimraf, jsPDF, Braintrust and autoevals. The latter two were exercised with an offline evaluation; no external evaluation service was contacted. DOMPurify, shell quoting, PDF and old Git tooling account for the previously reported critical findings.

The release artifact installs only Express and Helmet from the separate runtime lock. The read-only preview does not import legacy payment, wallet-provider, storage, or AI modules. These facts limit what the preview loads; they do not establish that the root development and build graph is safe.

## Unresolved direct dependency groups

| Dependency | Severity | npm audit suggested remediation |
| --- | --- | --- |
| `@reown/appkit` | high | `wagmi@3.7.11` |
| `@tailwindcss/typography` | moderate | `@tailwindcss/typography@0.5.4` |
| `braintrust` | moderate | `braintrust@0.0.21` |
| `diff` | low | `diff@9.0.0` |
| `drizzle-kit` | moderate | `drizzle-kit@0.31.11` |
| `drizzle-orm` | high | `drizzle-orm@0.45.4` |
| `firebase` | high | `firebase@9.14.0` |
| `glob` | moderate | `glob@14.0.4` |
| `helia` | high | `helia@7.1.16` |
| `matrix-js-sdk` | moderate | `matrix-js-sdk@45.0.0` |
| `openai` | high | `openai@7.55.0` |
| `vite-plugin-node-polyfills` | low | `vite-plugin-node-polyfills@0.2.0` |
| `wagmi` | moderate | `wagmi@3.7.11` |
| `zod` | high | `wagmi@3.7.11` |
| `zod-validation-error` | high | `zod-validation-error@5.0.0` |

Treat audit suggestions as candidates. Several are major migrations or downgrades; verify API compatibility, usage, and the full advisory chain before adopting them. Prioritize wallet connectors, database tooling, storage, Firebase and AI integrations in separate changes. No risk exception is granted here.

Reproduce with `npm audit --json` and `npm audit --prefix deploy/runtime --omit=dev --json`. CI fails for any finding in the isolated runtime and for critical findings in the root graph. Production additionally fails for unresolved root high or critical findings.
