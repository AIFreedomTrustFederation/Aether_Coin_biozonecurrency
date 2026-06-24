/**
 * Script to run the secure comparison tests
 * 
 * This script compiles and runs the secure comparison tests to demonstrate
 * how timing attacks work and how secure comparison prevents them.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const rootDir = path.resolve(__dirname, '..');
const testFile = path.join(rootDir, 'tests', 'secureCompare.test.ts');
const outDir = path.join(rootDir, 'dist');

// Ensure the output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Compile the test file
console.log('Compiling test file...');
try {
  execSync(`npx tsc ${testFile} --outDir ${outDir}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error compiling test file:', error);
  process.exit(1);
}

// Run the compiled test
console.log('\nRunning secure comparison tests...');
try {
  execSync(`node ${path.join(outDir, 'tests', 'secureCompare.test.js')}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}

console.log('\nTest completed successfully.');