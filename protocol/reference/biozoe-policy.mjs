const PPM = 1_000_000n;

export function assertNonNegative(value, name = 'value') {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new TypeError(`${name} must be a non-negative bigint`);
  }
}

function assertEpoch(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`);
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

/**
 * Settle baseline issuance that accrued across one or more historical epochs.
 *
 * Each eligible epoch creates exactly one entitlement. A person does not lose
 * that entitlement merely because they were offline or unable to submit a
 * transaction. Older entitlements are aged through the same deterministic
 * demurrage path they would have experienced if claimed when earned, so a late
 * claim creates neither a connectivity penalty nor a demurrage arbitrage.
 */
export function calculateAccruedUniversalIssuance({
  fromEpoch,
  throughEpoch,
  amountPerEpoch,
  demurragePpmPerEpoch,
  eligibleAtEpoch,
}) {
  assertEpoch(fromEpoch, 'fromEpoch');
  assertEpoch(throughEpoch, 'throughEpoch');
  assertNonNegative(amountPerEpoch, 'amountPerEpoch');
  if (typeof eligibleAtEpoch !== 'function') {
    throw new TypeError('eligibleAtEpoch must be a function');
  }
  if (!Number.isInteger(demurragePpmPerEpoch) || demurragePpmPerEpoch < 0 || demurragePpmPerEpoch >= 1_000_000) {
    throw new RangeError('demurragePpmPerEpoch must be an integer in [0, 1000000)');
  }
  if (fromEpoch > throughEpoch) {
    return { gross: 0n, net: 0n, retired: 0n, eligibleEpochs: 0 };
  }

  let gross = 0n;
  let net = 0n;
  let eligibleEpochs = 0;

  for (let epoch = fromEpoch; epoch <= throughEpoch; epoch += 1) {
    if (eligibleAtEpoch(epoch)) {
      gross += amountPerEpoch;
      net += amountPerEpoch;
      eligibleEpochs += 1;
    }

    if (epoch < throughEpoch) {
      net = applyDemurrage(net, demurragePpmPerEpoch);
    }
  }

  return {
    gross,
    net,
    retired: gross - net,
    eligibleEpochs,
  };
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
  connectivityRequiredToPreserveBaselineEntitlement: false,
});
