# Federation Events

Federation events are small, status-labeled records that help Aetherion communicate with the wider AI Freedom Trust Federation.

They are not a public data dump. They should be minimal, synthetic when used in docs, and safe to inspect.

## Purpose

Events let federation tools understand what changed without tightly coupling every app.

Aetherion can emit events for:

- local profile imports
- consent records
- wallet risk reviews
- local reference additions
- Biozoecurrency status changes
- blocked public-claim boundaries
- operations status updates

## Typed Contract

The canonical TypeScript contract lives at:

```text
shared/types/federation-events.ts
```

## Public Safety Rule

Every event includes a `publicSafe` field.

Only public-safe events should be used in public dashboards, README badges, example feeds, or docs.

Events should not include sensitive profile details, full documents, credential material, or personal financial records.

## Event Severity

| Severity | Meaning |
|---|---|
| `info` | Routine status update. |
| `notice` | Meaningful but safe update. |
| `warning` | Needs human attention. |
| `blocked` | Action was blocked by a claim, consent, validation, or review boundary. |

## Example

```json
{
  "id": "evt_example_001",
  "type": "biozoecurrency_status_changed",
  "createdAt": "2026-06-24T00:00:00.000Z",
  "repo": "AIFreedomTrustFederation/Aether_Coin_biozonecurrency",
  "source": "human",
  "severity": "notice",
  "status": "planned",
  "summary": "ATC taxonomy status reviewed as planned, not implemented.",
  "relatedTokenSymbol": "ATC",
  "evidenceRefs": ["docs/biozoecurrency-token-taxonomy.md"],
  "publicSafe": true
}
```

## Future Work

- Add event export from local app actions.
- Add event viewer in Aetherion UI.
- Add federation dashboard ingestion.
- Add local signing or hash references after the schema stabilizes.
