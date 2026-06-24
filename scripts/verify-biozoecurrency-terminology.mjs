#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const forbidden = ['Biozone', 'biozone', 'BIOZONE'];
const allowedPathFragments = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'attached_assets',
  'package-lock.json',
];

let failures = 0;

function shouldSkip(relativePath) {
  return allowedPathFragments.some((fragment) => relativePath.includes(fragment));
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

    if (!entry.isFile()) continue;

    const textExtensions = ['.md', '.ts', '.tsx', '.js', '.mjs', '.json', '.yml', '.yaml', '.sh', '.ps1', '.txt'];
    if (!textExtensions.includes(path.extname(entry.name))) continue;

    const content = fs.readFileSync(absolutePath, 'utf8');
    for (const term of forbidden) {
      if (content.includes(term)) {
        failures += 1;
        console.error(`RED forbidden term ${term} found in ${relativePath}`);
      }
    }
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
