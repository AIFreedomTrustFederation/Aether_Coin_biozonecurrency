# Attached Assets Intake

This folder is an intake archive, not a runtime asset directory.

It contains screenshots, photos, pasted notes, whitepaper fragments, implementation logs, and other captured material that may be useful for future documentation, design review, QA evidence, or product planning.

## Current Snapshot

As of 2026-06-24, this folder contained:

- 115 screenshot files.
- 9 photo files.
- 6 generated or miscellaneous image files.
- 26 pasted note files.
- 2 FractalCoin / AI-agent whitepaper fragment files.

The image files are not currently referenced by application code or project docs. That means they are available as reference material, but they are not part of the product UI or build pipeline.

## How To Use This Folder

- Use screenshots as QA, design, or historical evidence.
- Mine pasted notes for docs, roadmap, architecture, and whitepaper updates.
- Move polished, canonical text into `docs/`, `updated_whitepaper/`, or another named source folder before treating it as project doctrine.
- Move selected product images into `client/public/` or `client/src/assets/` only when the app actually needs to render them.
- Keep private, credential-bearing, or personal material out of this folder.

## Suggested Future Routing

| Material | Better Long-Term Home | Notes |
| --- | --- | --- |
| Screenshot evidence | `docs/qa/` or GitHub issues | Keep only screenshots tied to decisions, bugs, or release notes. |
| Whitepaper fragments | `updated_whitepaper/` | Merge into canonical sections before deleting raw notes. |
| Architecture notes | `docs/architecture/` | Convert pasted notes into reviewed docs with status labels. |
| Deployment notes | `docs/deployment/` or `deployment-guides/` | Review for secrets and current platform accuracy first. |
| Product images | `client/public/` or `client/src/assets/` | Only after a component or page references them. |

## Guardrail

Do not bulk-delete this folder without first checking whether any file has been routed into a canonical doc, issue, release note, QA record, or product asset.
