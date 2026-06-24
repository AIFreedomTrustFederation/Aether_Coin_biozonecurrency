#!/usr/bin/env node
import { spawnSync } from 'child_process';

const commands = [
  ['node', ['scripts/verify-federation-contracts.mjs']],
  ['node', ['scripts/verify-biozoecurrency-terminology.mjs']],
  ['npm', ['run', 'qa:local']],
];

let failed = false;

for (const [command, args] of commands) {
  const label = [command, ...args].join(' ');
  console.log(`\nRUN ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });

  if (result.status !== 0) {
    failed = true;
    console.error(`RED ${label} failed with exit code ${result.status}`);
    break;
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('\nGREEN Local Federation checks passed.');
}
