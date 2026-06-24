# Optional Integrations

Aether Coin Biozoecurrency should keep its core stewardship and DynastyLink paths local-first.

Optional integrations may exist, but they must be clearly labeled, disabled by default where practical, and documented with the exact purpose of the integration.

## Core Rule

The core app should not require third-party services for basic local stewardship, local profile review, consent records, Biozoecurrency taxonomy display, or local packet preparation.

## Integration Categories

| Category | Examples | Core Requirement? | Status Boundary |
|---|---|---:|---|
| notifications | Matrix, SMS, email, local notifications | No | Optional adapter |
| AI evaluation | model evaluation, prompt testing | No | Optional research adapter |
| payments | checkout or subscription tools | No | Optional and review-required |
| decentralized storage | IPFS, Filecoin, gateways | No | Research or optional adapter |
| wallet explorers | chain explorers and price feeds | No | Optional data adapter |
| deployment | hosted, decentralized, or node deployment | No | Requires validation evidence |

## Configuration Rule

Configuration examples should separate local core settings from optional service settings.

Recommended future split:

```text
.env.example                     # local core settings only
.env.optional-integrations.example # optional adapters only
```

## Documentation Requirement

Every optional integration should document:

- why it exists
- whether it is required
- what data it receives
- what local fallback exists
- what status label applies
- what review is required before production use

## Federation Boundary

Optional integrations must not become hidden dependencies for DynastyLink or Aetherion core flows.

A user should be able to understand, inspect, and run the core stewardship flow locally before enabling any external adapter.
