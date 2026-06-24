# DynastyLink To Aetherion Bridge

DynastyLink is the local onboarding lane for Federation identity. Aetherion is the stewardship and Biozoecurrency lane.

The bridge between them should remain local-first, inspectable, and status-labeled.

## Goal

Connect a local DynastyLink profile export to Aetherion stewardship context without requiring external services.

## Bridge Flow

```text
DynastyLink local profile export
-> Aetherion local import
-> stewardship summary
-> consent record
-> Biozoecurrency status review
-> federation event
```

## Local-First Rule

The bridge should work through local file import/export before remote sync.

Remote sync, hosted identity, cloud storage, analytics, or third-party automation must be optional and clearly labeled.

## Minimum Shared Fields

A safe bridge payload should include only the minimum needed fields:

- profile id
- display name
- profile path
- completion percentage
- selected roles
- local reference ids
- review status
- updated timestamp

Avoid placing sensitive documents or full personal records into public examples.

## Aetherion Responsibilities

Aetherion should:

- explain what was imported
- show uncertainty and missing fields
- ask for human confirmation before status changes
- record consent decisions
- emit a local federation event when appropriate

## DynastyLink Responsibilities

DynastyLink should:

- keep the core app local-first
- export clear profile packets
- mark incomplete or draft fields
- avoid implying legal validity without review

## Future Typed Contract

A typed bridge contract should be added after the profile vocabulary is finalized and reviewed. Until then, this document is the canonical bridge boundary.
