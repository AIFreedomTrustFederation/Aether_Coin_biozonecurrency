# Consent Ledger

The Consent Ledger is the trust record layer for Aetherion.

It exists to make the core rule operational:

```text
AI may guide.
AI may warn.
AI may explain.
The human consents.
The human acts.
The system records clearly.
```

## Purpose

The Consent Ledger records the difference between guidance and action.

It should capture:

- what was requested
- what the AI explained
- what risk notice was shown
- what the human decided
- what action was taken or not taken
- whether the action needs outside review
- which evidence references support the record

## Non-Negotiable Boundary

An AI assistant must not be the final approving actor for wallet, token, trust, vault, legal, financial, security, deployment, or irreversible stewardship decisions.

The AI can explain, warn, classify, and summarize. The human actor consents and acts.

## Typed Contract

The canonical TypeScript contract lives at:

```text
shared/types/consent-ledger.ts
```

## Early Implementation Pattern

Start with local records before networked or database-backed records.

Recommended MVP path:

1. in-memory prototype record
2. local JSON export
3. database-backed record
4. signed receipt or hash reference
5. federation event emission

## Record Examples

A Consent Ledger record can describe:

- a user declining a risky transaction
- a user approving export of a local trust packet
- a steward deferring a Biozoecurrency status change pending review
- a system recording that a production claim was blocked

## Federation Integration

Consent records should be referenced by Federation events when relevant. They should not expose sensitive personal, wallet, trust, or vault details in public event streams.

Use synthetic examples in public documentation.
