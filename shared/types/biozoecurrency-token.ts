export type FederationStatusLabel =
  | 'implemented'
  | 'prototype'
  | 'experimental'
  | 'planned'
  | 'blocked'
  | 'needs_review'
  | 'audited';

export type BiozoecurrencySymbol = 'ATC' | 'FTC' | 'ICON' | 'SING';

export type BiozoecurrencyClaimBoundary = {
  tokenValue: string;
  custody: string;
  transferAuthority: string;
  legalReview: string;
  auditStatus: FederationStatusLabel;
};

export type BiozoecurrencyTokenDefinition = {
  symbol: BiozoecurrencySymbol;
  name: string;
  purpose: string;
  federationRole: string;
  status: FederationStatusLabel;
  claimBoundary: BiozoecurrencyClaimBoundary;
  notes: string[];
};

const defaultClaimBoundary: BiozoecurrencyClaimBoundary = {
  tokenValue: 'No production token value or investment utility is claimed.',
  custody: 'No audited production custody claim is made.',
  transferAuthority: 'AI may explain or warn, but a human actor must consent and act.',
  legalReview: 'Legal, tax, trust, investment, and insurance interpretations require qualified review.',
  auditStatus: 'needs_review',
};

export const biozoecurrencyTokenDefinitions: BiozoecurrencyTokenDefinition[] = [
  {
    symbol: 'ATC',
    name: 'Aether Trust Coin',
    purpose: 'Primary trust and stewardship value unit for the Aetherion ecosystem.',
    federationRole: 'stewardship-value-unit',
    status: 'planned',
    claimBoundary: defaultClaimBoundary,
    notes: [
      'Represents stewardship intent and trust coordination before production tokenization.',
      'Must remain clearly separated from investment or production custody claims.',
    ],
  },
  {
    symbol: 'FTC',
    name: 'Freedom Trust Coin',
    purpose: 'Federated trust settlement primitive across aligned people, groups, and projects.',
    federationRole: 'federated-settlement-reference',
    status: 'planned',
    claimBoundary: defaultClaimBoundary,
    notes: [
      'Represents future federation settlement logic at the taxonomy level.',
      'Requires legal, accounting, governance, and technical review before any live use.',
    ],
  },
  {
    symbol: 'ICON',
    name: 'Iconic Covenant Token',
    purpose: 'Recognition primitive for identity, role, authorship, contribution, and covenant memory.',
    federationRole: 'identity-and-contribution-marker',
    status: 'planned',
    claimBoundary: defaultClaimBoundary,
    notes: [
      'May be used as a non-custodial recognition and metadata primitive in early prototypes.',
      'Should not imply financial value unless a reviewed implementation later supports that claim.',
    ],
  },
  {
    symbol: 'SING',
    name: 'Singularity Grace Note',
    purpose: 'Harmonic coordination primitive for AI-human co-creation and macro-achievement recognition.',
    federationRole: 'coherence-and-achievement-marker',
    status: 'planned',
    claimBoundary: defaultClaimBoundary,
    notes: [
      'Represents long-horizon coordination and achievement doctrine at the taxonomy level.',
      'Must remain symbolic and status-labeled until implementation and review evidence exists.',
    ],
  },
];

export function getBiozoecurrencyTokenDefinition(symbol: BiozoecurrencySymbol) {
  return biozoecurrencyTokenDefinitions.find((token) => token.symbol === symbol);
}
