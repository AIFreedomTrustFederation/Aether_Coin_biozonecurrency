import type { FederationStatusLabel } from './biozoecurrency-token';

export type OperationalCheckKey =
  | 'repo_health'
  | 'qa_local'
  | 'typescript_check'
  | 'build_status'
  | 'dependency_review'
  | 'secret_scan'
  | 'dynastylink_local'
  | 'biozoecurrency_taxonomy'
  | 'consent_ledger'
  | 'federation_manifest'
  | 'federation_events'
  | 'deployment_status';

export type OperationalCheck = {
  key: OperationalCheckKey;
  status: FederationStatusLabel;
  summary: string;
  evidenceRefs: string[];
  lastCheckedAt?: string;
};

export type OperationalStatusSnapshot = {
  repo: string;
  createdAt: string;
  overallStatus: FederationStatusLabel;
  checks: OperationalCheck[];
  blockers: string[];
  nextActions: string[];
};

export const initialOperationalStatus: OperationalStatusSnapshot = {
  repo: 'AIFreedomTrustFederation/Aether_Coin_biozonecurrency',
  createdAt: '2026-06-24T00:00:00.000Z',
  overallStatus: 'needs_review',
  checks: [
    {
      key: 'federation_manifest',
      status: 'implemented',
      summary: 'Federation manifest exists as the machine-readable integration handshake.',
      evidenceRefs: ['federation.manifest.json'],
    },
    {
      key: 'biozoecurrency_taxonomy',
      status: 'implemented',
      summary: 'Typed Biozoecurrency taxonomy exists with claim boundaries.',
      evidenceRefs: ['shared/types/biozoecurrency-token.ts', 'docs/biozoecurrency-token-taxonomy.md'],
    },
    {
      key: 'consent_ledger',
      status: 'implemented',
      summary: 'Typed Consent Ledger contract exists for human-consented stewardship records.',
      evidenceRefs: ['shared/types/consent-ledger.ts', 'docs/consent-ledger.md'],
    },
  ],
  blockers: [
    'Full local build and TypeScript verification must be run in a local checkout.',
    'Wallet custody, token value, deployment, legal, and security production claims remain out of scope until reviewed.',
  ],
  nextActions: [
    'Run npm run qa:local in a local checkout.',
    'Run npm run check and npm run build after dependency setup is repaired.',
    'Wire typed contracts into app UI and server routes only after local checks are green.',
  ],
};
