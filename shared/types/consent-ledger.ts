import type { FederationStatusLabel } from './biozoecurrency-token';

export type ConsentRiskDomain =
  | 'wallet'
  | 'token'
  | 'trust_profile'
  | 'vault_reference'
  | 'legal_context'
  | 'financial_context'
  | 'security_context'
  | 'deployment_context'
  | 'general_stewardship';

export type ConsentDecision = 'approved' | 'rejected' | 'deferred' | 'revoked';

export type ConsentActor = 'human_user' | 'human_steward' | 'system' | 'ai_assistant';

export type ConsentLedgerRecord = {
  id: string;
  createdAt: string;
  actor: ConsentActor;
  humanActorId?: string;
  trustProfileId?: string;
  riskDomains: ConsentRiskDomain[];
  requestSummary: string;
  aiExplanation?: string;
  riskNotice: string;
  decision: ConsentDecision;
  decisionReason?: string;
  actionTaken?: string;
  actionStatus: FederationStatusLabel;
  irreversibleAction: boolean;
  requiresProfessionalReview: boolean;
  evidenceRefs: string[];
};

export function requiresExplicitHumanConsent(record: ConsentLedgerRecord) {
  return record.irreversibleAction || record.riskDomains.some((domain) => domain !== 'general_stewardship');
}

export function isActionAllowedByConsent(record: ConsentLedgerRecord) {
  return record.actor !== 'ai_assistant' && record.decision === 'approved';
}
