#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

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

export function scrubAllowedPhrases(line) {
  // Exact repository identifier, not a blanket exemption for a whole line.
  const repositoriesScrubbed = line.replace(/(?<![A-Za-z0-9_-])biozone-harmony-boost(?![A-Za-z0-9_-])/g, '');
  return allowedInlinePhrases.reduce((current, phrase) => current.split(phrase).join(''), repositoriesScrubbed);
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
