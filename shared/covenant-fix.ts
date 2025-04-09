/**
 * Temporary workaround for CovenantRegistration import issue
 */

// Define a basic CovenantRegistration type to satisfy imports
export interface CovenantRegistration {
  id: number;
  covenantName: string;
  covenantType: string;
  participants: unknown;
  covenantTerms: unknown;
  sacredHarmonicSequence: string;
  activationDate: Date;
  expirationDate?: Date | null;
  renewalPattern?: string;
  isActive: boolean | null;
  fruitMetrics: unknown;
  lastHarvestDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}