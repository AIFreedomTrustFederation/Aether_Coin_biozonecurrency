#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const protectedRepoSlug = 'Aether_Coin_biozonecurrency';
const protectedRepoSlugToken = '__AETHER_REPO_SLUG_PROTECTED__';
const skipFragments = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'attached_assets',
  'package-lock.json',
];
const textExtensions = ['.md', '.ts', '.tsx', '.js', '.mjs', '.json', '.yml', '.yaml', '.sh', '.ps1', '.txt'];

let changedFiles = 0;
let replacements = 0;

function shouldSkip(relativePath) {
  return skipFragments.some((fragment) => relativePath.includes(fragment));
}

function replaceTerms(content) {
  let protectedContent = content.split(protectedRepoSlug).join(protectedRepoSlugToken);
  const before = protectedContent;

  protectedContent = protectedContent
    .replace(/BIOZONE/g, 'BIOZOE')
    .replace(/Biozone/g, 'Biozoe')
    .replace(/biozone/g, 'biozoe');

  const after = protectedContent.split(protectedRepoSlugToken).join(protectedRepoSlug);
  const beforeRestored = before.split(protectedRepoSlugToken).join(protectedRepoSlug);

  if (after !== beforeRestored) {
    const matches = beforeRestored.match(/BIOZONE|Biozone|biozone/g) || [];
    replacements += matches.length;
  }

  return after;
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
  console.log('Protected repo slug remained unchanged.');
}

main();
