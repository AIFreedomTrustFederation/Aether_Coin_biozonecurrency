import type { FederationStatusLabel } from './biozoecurrency-token';

export type FederationEventType =
  | 'profile_imported'
  | 'consent_recorded'
  | 'wallet_risk_reviewed'
  | 'local_reference_added'
  | 'biozoecurrency_status_changed'
  | 'status_boundary_blocked'
  | 'operations_status_updated';

export type FederationEventSeverity = 'info' | 'notice' | 'warning' | 'blocked';

export type FederationEvent = {
  id: string;
  type: FederationEventType;
  createdAt: string;
  repo: string;
  source: 'aetherion' | 'dynastylink' | 'system' | 'human';
  severity: FederationEventSeverity;
  status: FederationStatusLabel;
  summary: string;
  consentRecordId?: string;
  relatedProfileId?: string;
  relatedTokenSymbol?: string;
  evidenceRefs: string[];
  publicSafe: boolean;
};

export function isPublicFederationEvent(event: FederationEvent) {
  return event.publicSafe === true && event.severity !== 'blocked';
}
