// Script to fix package.json merge conflicts
const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const content = fs.readFileSync(packageJsonPath, 'utf8');

// Remove merge conflict markers and keep the HEAD version
let fixedContent = content;
if (content.includes('<<<<<<< HEAD')) {
  const headStart = content.indexOf('<<<<<<< HEAD') + '<<<<<<< HEAD'.length;
  const headEnd = content.indexOf('=======');
  
  // Extract the HEAD version (what's between <<<<<<< HEAD and =======)
  const headVersion = content.substring(headStart, headEnd).trim();
  
  // Write the fixed content back
  fixedContent = headVersion;
  
  fs.writeFileSync(packageJsonPath, fixedContent, 'utf8');
  console.log('Successfully fixed package.json merge conflicts.');
} else {
  console.log('No merge conflicts found in package.json.');
}