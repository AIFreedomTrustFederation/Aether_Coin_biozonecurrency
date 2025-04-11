/**
 * Governance Service Interface
 * Defines the interface for AetherCore governance
 */

import { 
  GovernanceProposal, 
  VotingWeightStrategy 
} from '@shared/aethercore/types';
import { 
  GovernanceProposal as DbGovernanceProposal,
  GovernanceVote 
} from '@shared/aethercore/schema';

export interface IGovernanceServiceConfig {
  votingPeriod: number; // in blocks
  executionDelay: number; // in blocks
  minimumProposalThreshold: string; // minimum tokens required to submit proposal
  defaultMinimumQuorum: number; // percentage of total supply
  defaultSupportThreshold: number; // percentage of votes
  maxProposalsPerUser: number;
}

export interface IFractalInfluenceScore {
  address: string;
  rawBalance: string;
  stakeDuration: number;
  networkContributions: number;
  historicalParticipation: number;
  fractalInfluenceScore: number;
}

export interface IGovernanceService {
  /**
   * Create a governance proposal with fractal influence weighting
   * @param dappId DApp ID (if applicable)
   * @param proposal Proposal details
   * @param creatorAddress Creator wallet address
   */
  createProposal(
    dappId: string | null,
    proposal: {
      title: string;
      description: string;
      changes: any[];
      votingPeriod: number; // in blocks
      votingStrategy?: VotingWeightStrategy;
    },
    creatorAddress: string
  ): Promise<string>; // Returns proposal ID
  
  /**
   * Get a proposal by ID
   * @param proposalId Proposal ID
   */
  getProposal(proposalId: string): Promise<DbGovernanceProposal | null>;
  
  /**
   * Get all proposals with optional filters
   * @param status Optional status filter
   * @param limit Optional limit
   * @param offset Optional offset
   */
  getProposals(
    status?: string,
    limit?: number,
    offset?: number
  ): Promise<DbGovernanceProposal[]>;
  
  /**
   * Get votes for a proposal
   * @param proposalId Proposal ID
   */
  getProposalVotes(proposalId: string): Promise<GovernanceVote[]>;
  
  /**
   * Cast a vote with fractal decay weighting
   * @param proposalId Proposal ID
   * @param voterAddress Voter wallet address
   * @param vote Vote ('support', 'reject', or 'abstain')
   * @param votingPower Optional voting power
   */
  castVote(
    proposalId: string,
    voterAddress: string,
    vote: 'support' | 'reject' | 'abstain',
    votingPower?: number
  ): Promise<void>;
  
  /**
   * Calculate the fractal influence score for an address
   * @param address Wallet address
   */
  calculateFractalInfluence(address: string): Promise<IFractalInfluenceScore>;
  
  /**
   * Calculate the adaptive support threshold based on fractal mathematics
   * @param totalStake Total stake in the system
   * @param fractalInfluence Fractal influence of the creator
   */
  calculateAdaptiveThreshold(
    totalStake: string,
    fractalInfluence: number
  ): number;
  
  /**
   * Calculate the effective voting power using the fractal decay formula
   * @param voterAddress Voter address
   * @param rawBalance Raw token balance
   * @param requestedVotingPower Optional requested voting power (can be less than maximum)
   */
  calculateFractalVotingPower(
    voterAddress: string,
    rawBalance: string,
    requestedVotingPower?: number
  ): string;
  
  /**
   * Check if a proposal is ready for execution
   * @param proposalId Proposal ID
   */
  isProposalExecutable(proposalId: string): Promise<boolean>;
  
  /**
   * Execute a successful proposal
   * @param proposalId Proposal ID
   * @param executorAddress Executor address
   */
  executeProposal(
    proposalId: string,
    executorAddress: string
  ): Promise<boolean>;
  
  /**
   * Cancel a proposal (only creator or governance admin)
   * @param proposalId Proposal ID
   * @param cancellerAddress Canceller address
   */
  cancelProposal(
    proposalId: string,
    cancellerAddress: string
  ): Promise<boolean>;
}