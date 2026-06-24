#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
let failures = 0;

const requiredFiles = [
  'federation.manifest.json',
  'docs/federation-integration.md',
  'docs/biozoecurrency-token-taxonomy.md',
  'docs/consent-ledger.md',
  'docs/dynastylink-aetherion-bridge.md',
  'docs/federation-events.md',
  'docs/operations-dashboard.md',
  'docs/optional-integrations.md',
  'docs/local-first-runbook.md',
  'shared/types/biozoecurrency-token.ts',
  'shared/types/consent-ledger.ts',
  'shared/types/federation-events.ts',
  'shared/types/operational-status.ts',
  'shared/types/federation.ts',
];

function checkFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (fs.existsSync(absolutePath)) {
    console.log(`GREEN ${relativePath} present`);
    return;
  }

  failures += 1;
  console.error(`RED ${relativePath} missing`);
}

function checkJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    console.log(`GREEN ${relativePath} parses as JSON`);
  } catch (error) {
    failures += 1;
    console.error(`RED ${relativePath} invalid JSON: ${error.message}`);
  }
}

function main() {
  console.log('AETHER FEDERATION CONTRACT CHECK');

  for (const file of requiredFiles) checkFile(file);
  if (fs.existsSync(path.join(root, 'federation.manifest.json'))) checkJson('federation.manifest.json');

  if (failures > 0) {
    console.error(`RED Federation contract check failed with ${failures} issue(s).`);
    process.exitCode = 1;
    return;
  }

  console.log('GREEN Federation contract check passed.');
}

main();
