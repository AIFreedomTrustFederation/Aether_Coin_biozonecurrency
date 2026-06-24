#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const forbiddenTerms = ['Biozone', 'biozone', 'BIOZONE'];
const allowedPathFragments = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'attached_assets',
  'package-lock.json',
  'scripts/verify-biozoecurrency-terminology.mjs',
];
const allowedInlinePhrases = [
  'Aether_Coin_biozonecurrency',
  'github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency',
  'old Biozone spelling',
  'old `Biozone` spelling',
];

let failures = 0;

function shouldSkip(relativePath) {
  return allowedPathFragments.some((fragment) => relativePath.includes(fragment));
}

function scrubAllowedPhrases(line) {
  return allowedInlinePhrases.reduce((current, phrase) => current.split(phrase).join(''), line);
}

function checkFile(relativePath, absolutePath) {
  const textExtensions = ['.md', '.ts', '.tsx', '.js', '.mjs', '.json', '.yml', '.yaml', '.sh', '.ps1', '.txt'];
  if (!textExtensions.includes(path.extname(relativePath))) return;

  const content = fs.readFileSync(absolutePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const scrubbed = scrubAllowedPhrases(line);
    for (const term of forbiddenTerms) {
      if (scrubbed.includes(term)) {
        failures += 1;
        console.error(`RED forbidden term ${term} found in ${relativePath}:${index + 1}`);
      }
    }
  });
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath).replace(/\\/g, '/');

    if (shouldSkip(relativePath)) continue;

    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }

    if (entry.isFile()) checkFile(relativePath, absolutePath);
  }
}

function main() {
  console.log('AETHER BIOZOECURRENCY TERMINOLOGY CHECK');
  walk(root);

  if (failures > 0) {
    console.error(`RED Terminology check failed with ${failures} issue(s).`);
    process.exitCode = 1;
    return;
  }

  console.log('GREEN Biozoecurrency terminology check passed.');
}

main();
