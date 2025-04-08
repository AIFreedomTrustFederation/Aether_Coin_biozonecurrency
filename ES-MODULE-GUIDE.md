# ES Module Compatibility Guide for Aetherion Project

This guide explains how to write JavaScript files that are compatible with the ES module system used in this project.

## Background

The Aetherion project is configured to use ES modules rather than CommonJS. This is defined in the `package.json` file with the setting `"type": "module"`.

## Key Differences Between CommonJS and ES Modules

1. **Import/Export Syntax**
   - ES Modules: `import` and `export` statements
   - CommonJS: `require()` and `module.exports`

2. **File Extensions**
   - ES Modules: Import statements should include the `.js` extension
   - CommonJS: Extensions are optional in require statements

3. **Top-level Variables**
   - ES Modules: No access to `__dirname` or `__filename`
   - CommonJS: `__dirname` and `__filename` are available

## How to Write ES Module Compatible Code

### 1. Use Proper Import/Export Syntax

```javascript
// Instead of CommonJS:
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use ES Modules:
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
```

### 2. Include File Extensions in Imports

```javascript
// Instead of:
import { validateBlock } from './blockchain/consensus-validator';

// Use:
import { validateBlock } from './blockchain/consensus-validator.js';
```

### 3. Get `__dirname` and `__filename` Equivalents

```javascript
import { fileURLToPath } from 'url';
import * as path from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### 4. Dynamic Imports

When you need to dynamically import modules:

```javascript
// Instead of:
const someModule = require(modulePath);

// Use:
const someModule = await import(modulePath);
```

## Verifying Module Type

If you're unsure whether a script is using ES modules or CommonJS, check the package.json:

```json
{
  "name": "your-project",
  "version": "1.0.0",
  "type": "module"
}
```

- If `"type": "module"` is present, the project uses ES modules by default
- If this field is absent or set to `"commonjs"`, it uses CommonJS

## Converting CommonJS to ES Modules

When converting existing CommonJS code to ES modules:

1. Replace `require()` with `import`
2. Replace `module.exports` with `export` statements
3. Add the `.js` extension to all relative imports
4. Add `__dirname` and `__filename` equivalents using fileURLToPath

## Troubleshooting Common Errors

### "require is not defined in ES module scope"

This means you're using the CommonJS `require()` function in an ES module. Convert it to:

```javascript
import * as moduleName from 'module-name';
```

### "Cannot use import statement outside a module"

Ensure your package.json has `"type": "module"` or use the `.mjs` extension for the file.

### "ERR_MODULE_NOT_FOUND"

- Check that the imported module exists
- Make sure you're including the `.js` extension for local files
- Ensure the package is installed with npm/yarn

## Resources

- [Node.js ECMAScript Modules Documentation](https://nodejs.org/api/esm.html)
- [MDN JavaScript Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
