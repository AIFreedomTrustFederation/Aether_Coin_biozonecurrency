#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const oldTitle = 'Bio' + 'zone';
const oldLower = 'bio' + 'zone';
const oldUpper = 'BIO' + 'ZONE';
const newTitle = 'Biozoe';
const newLower = 'biozoe';
const newUpper = 'BIOZOE';
const protectedRepoSlug = `Aether_Coin_${oldLower}currency`;
const protectedRepoSlugToken = '__AETHER_REPO_SLUG_PROTECTED__';
const skipFragments = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'attached_assets',
  'package-lock.json',
  'reports',
  'scripts/fix-biozoecurrency-terminology.mjs',
  'scripts/verify-biozoecurrency-terminology.mjs',
];
const textExtensions = ['.md', '.ts', '.tsx', '.js', '.mjs', '.json', '.yml', '.yaml', '.sh', '.ps1', '.txt'];

let changedFiles = 0;
let replacements = 0;

function shouldSkip(relativePath) {
  return skipFragments.some((fragment) => relativePath.includes(fragment));
}

function countOccurrences(text, term) {
  return text.split(term).length - 1;
}

function replaceTerms(content) {
  let protectedContent = content.split(protectedRepoSlug).join(protectedRepoSlugToken);
  const before = protectedContent;

  const localReplacementCount =
    countOccurrences(before, oldUpper) +
    countOccurrences(before, oldTitle) +
    countOccurrences(before, oldLower);

  protectedContent = protectedContent
    .split(oldUpper).join(newUpper)
    .split(oldTitle).join(newTitle)
    .split(oldLower).join(newLower);

  replacements += localReplacementCount;
  return protectedContent.split(protectedRepoSlugToken).join(protectedRepoSlug);
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
    if (!textExtensions.includes(path.extname(entry.name))) continue;

    const original = fs.readFileSync(absolutePath, 'utf8');
    const updated = replaceTerms(original);

    if (updated !== original) {
      fs.writeFileSync(absolutePath, updated);
      changedFiles += 1;
      console.log(`GREEN updated ${relativePath}`);
    }
  }
}

function main() {
  console.log('AETHER BIOZOECURRENCY TERMINOLOGY FIX');
  walk(root);
  console.log(`GREEN changed files: ${changedFiles}`);
  console.log(`GREEN replacements: ${replacements}`);
  console.log('Protected repo slug and verifier scripts remained unchanged.');
}

main();
