#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { applyDemurrage, passiveEquilibriumApprox } from '../reference/biozoe-policy.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.join(here, '..', 'genesis.seed.json'), 'utf8'));

const issuance = BigInt(seed.monetary_policy.universal_issuance_aatc_per_eligible_identity_per_epoch);
const demurragePpm = seed.monetary_policy.demurrage_ppm_per_epoch;
const exponent = seed.network.native_asset.display_exponent;
const unit = 10n ** BigInt(exponent);

function formatATC(value) {
  const whole = value / unit;
  const fraction = (value % unit).toString().padStart(exponent, '0').slice(0, 4);
  return `${whole}.${fraction} ATC`;
}

export function simulateParticipant({ joinEpoch, endEpoch }) {
  let balance = 0n;
  for (let epoch = joinEpoch; epoch < endEpoch; epoch += 1) {
    balance += issuance;
    balance = applyDemurrage(balance, demurragePpm);
  }
  return balance;
}

export function runScenario({ years = 10 } = {}) {
  const days = Math.round((years * 365.2425 * 86400) / seed.epochs.seconds);
  const joins = [
    { label: 'genesis-era participant', epoch: 0 },
    { label: 'participant joining after 2 years', epoch: Math.round(days * 0.2) },
    { label: 'participant joining halfway through scenario', epoch: Math.round(days * 0.5) },
    { label: 'participant joining with 2 years remaining', epoch: Math.max(0, days - Math.round((2 * 365.2425 * 86400) / seed.epochs.seconds)) },
  ];

  const results = joins.map((entry) => ({
    ...entry,
    balance: simulateParticipant({ joinEpoch: entry.epoch, endEpoch: days }),
    activeEpochs: days - entry.epoch,
  }));

  const equilibrium = passiveEquilibriumApprox({
    issuancePerEpoch: issuance,
    demurragePpmPerEpoch: demurragePpm,
  });

  return { days, years, results, equilibrium };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const yearsArg = Number.parseFloat(process.argv[2] ?? '10');
  const scenario = runScenario({ years: Number.isFinite(yearsArg) && yearsArg > 0 ? yearsArg : 10 });

  console.log(`Biozoe baseline cohort simulation: ${scenario.years} years (${scenario.days} epochs)`);
  console.log(`Universal issuance: ${formatATC(issuance)} per eligible participant per epoch`);
  console.log(`Demurrage: ${demurragePpm} ppm per epoch`);
  console.log('This simulation models baseline issuance only; it makes no price or purchasing-power claim.');
  console.log('');

  for (const result of scenario.results) {
    console.log(`${result.label}: ${formatATC(result.balance)} after ${result.activeEpochs} active epochs`);
  }

  if (scenario.equilibrium !== null) {
    console.log('');
    console.log(`Approximate passive baseline equilibrium under constant parameters: ${formatATC(scenario.equilibrium)}`);
    console.log('The equilibrium is an accounting result, not an economic-value guarantee.');
  }
}
