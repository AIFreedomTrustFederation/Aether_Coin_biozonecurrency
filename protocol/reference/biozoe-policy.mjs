const PPM = 1_000_000n;

export function assertNonNegative(value, name = 'value') {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new TypeError(`${name} must be a non-negative bigint`);
  }
}

export function applyDemurrage(balance, ppmPerEpoch) {
  assertNonNegative(balance, 'balance');
  if (!Number.isInteger(ppmPerEpoch) || ppmPerEpoch < 0 || ppmPerEpoch >= 1_000_000) {
    throw new RangeError('ppmPerEpoch must be an integer in [0, 1000000)');
  }
  const retained = PPM - BigInt(ppmPerEpoch);
  return (balance * retained) / PPM;
}

export function calculateUniversalIssuance({
  eligible,
  alreadyClaimed,
  amountPerEpoch,
}) {
  assertNonNegative(amountPerEpoch, 'amountPerEpoch');
  if (!eligible || alreadyClaimed) return 0n;
  return amountPerEpoch;
}

export function calculateBudgetedIssuance({
  requested,
  remainingBudget,
  evidenceAccepted,
}) {
  assertNonNegative(requested, 'requested');
  assertNonNegative(remainingBudget, 'remainingBudget');
  if (!evidenceAccepted) return 0n;
  if (requested > remainingBudget) {
    throw new RangeError('requested issuance exceeds governed epoch budget');
  }
  return requested;
}

export function humanGovernanceWeight({ verified, suspended = false }) {
  return verified && !suspended ? 1n : 0n;
}

export function validatorVotingPower({ authorized, active = true }) {
  return authorized && active ? 1n : 0n;
}

export function transfer({ fromBalance, toBalance, amount }) {
  assertNonNegative(fromBalance, 'fromBalance');
  assertNonNegative(toBalance, 'toBalance');
  assertNonNegative(amount, 'amount');
  if (amount > fromBalance) throw new RangeError('insufficient balance');
  return {
    fromBalance: fromBalance - amount,
    toBalance: toBalance + amount,
  };
}

export function passiveEquilibriumApprox({ issuancePerEpoch, demurragePpmPerEpoch }) {
  assertNonNegative(issuancePerEpoch, 'issuancePerEpoch');
  if (!Number.isInteger(demurragePpmPerEpoch) || demurragePpmPerEpoch <= 0) {
    return null;
  }
  return (issuancePerEpoch * PPM) / BigInt(demurragePpmPerEpoch);
}

export const BIOZOE_INVARIANTS = Object.freeze({
  terminalSupplyCap: null,
  premine: 0n,
  founderAllocation: 0n,
  investorAllocation: 0n,
  tokenWeightedGovernance: false,
  tokenWeightedConsensus: false,
  balanceConfersValidatorPower: false,
  earlyBalanceConfersExtraBaselineIssuance: false,
});
