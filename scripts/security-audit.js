#!/usr/bin/env node

/**
 * Security Audit Script
 * 
 * This script performs a basic security audit of the codebase to identify potential security issues.
 * It checks for:
 * - Hardcoded secrets
 * - Insecure dependencies
 * - Missing security headers
 * - Insecure configurations
 * - Missing input validation
 * 
 * Usage: node scripts/security-audit.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Patterns to search for potential security issues
const securityPatterns = [
  {
    name: 'Hardcoded API Keys',
    pattern: /(api[_-]?key|apikey|api[_-]?secret|apisecret)[^a-zA-Z0-9]?[=:][^a-zA-Z0-9]?["\']([\w\d]{10,})["\']/gi,
    severity: 'HIGH',
  },
  {
    name: 'Hardcoded Passwords',
    pattern: /(password|passwd|pwd)[^a-zA-Z0-9]?[=:][^a-zA-Z0-9]?["\']([\w\d]{3,})["\']/gi,
    severity: 'HIGH',
  },
  {
    name: 'Hardcoded JWT Secrets',
    pattern: /(jwt[_-]?secret|jwtsecret)[^a-zA-Z0-9]?[=:][^a-zA-Z0-9]?["\']([\w\d]{8,})["\']/gi,
    severity: 'HIGH',
  },
  {
    name: 'Insecure Crypto',
    pattern: /crypto\.createCipher\(/g,
    severity: 'HIGH',
    description: 'Using deprecated and insecure createCipher. Use createCipheriv instead.',
  },
  {
    name: 'Insecure Hash',
    pattern: /createHash\(['"](md5|sha1)['"]\)/g,
    severity: 'MEDIUM',
    description: 'Using weak hash algorithm. Use SHA-256 or better.',
  },
  {
    name: 'Insecure Random',
    pattern: /Math\.random\(\)/g,
    severity: 'MEDIUM',
    description: 'Using Math.random() for security purposes. Use crypto.randomBytes() instead.',
  },
  {
    name: 'SQL Injection Risk',
    pattern: /execute\(\s*["\'](SELECT|INSERT|UPDATE|DELETE)[\w\s]*\$\{/gi,
    severity: 'HIGH',
    description: 'Potential SQL injection risk. Use parameterized queries.',
  },
  {
    name: 'XSS Risk',
    pattern: /dangerouslySetInnerHTML|innerHTML\s*=/g,
    severity: 'MEDIUM',
    description: 'Potential XSS risk. Ensure content is properly sanitized.',
  },
  {
    name: 'Insecure Cookie',
    pattern: /cookie.*secure:\s*false|cookie.*httpOnly:\s*false/g,
    severity: 'MEDIUM',
    description: 'Insecure cookie settings. Set secure and httpOnly to true.',
  },
  {
    name: 'Eval Usage',
    pattern: /eval\(/g,
    severity: 'HIGH',
    description: 'Using eval() is dangerous. Find an alternative approach.',
  },
  {
    name: 'Insecure Deserialization',
    pattern: /JSON\.parse\(\s*req\.body/g,
    severity: 'MEDIUM',
    description: 'Potential insecure deserialization. Validate input before parsing.',
  },
  {
    name: 'Hardcoded IP',
    pattern: /(['"])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(['"])/g,
    severity: 'LOW',
    description: 'Hardcoded IP address found. Consider using environment variables.',
  },
  {
    name: 'Insecure Redirect',
    pattern: /res\.redirect\(\s*req\.query|res\.redirect\(\s*req\.params|res\.redirect\(\s*req\.body/g,
    severity: 'HIGH',
    description: 'Potential open redirect vulnerability. Validate redirect URLs.',
  },
  {
    name: 'No Input Validation',
    pattern: /req\.body\.[a-zA-Z0-9_]+(?!\s*=)(?!\s*\|\|)(?!\s*\?\?)(?!\s*\?)(?!\s*&&)(?!\s*===)(?!\s*!==)(?!\s*==)(?!\s*!=)/g,
    severity: 'MEDIUM',
    description: 'Using request body without validation. Implement input validation.',
  },
  {
    name: 'Timing Attack Risk',
    pattern: /===\s*['"][a-zA-Z0-9_]+['"]|['"][a-zA-Z0-9_]+['"]===|==\s*['"][a-zA-Z0-9_]+['"]|['"][a-zA-Z0-9_]+['"]==/g,
    severity: 'LOW',
    description: 'Potential timing attack risk. Use constant-time comparison for sensitive values.',
  },
  {
    name: 'Prototype Pollution',
    pattern: /Object\.assign\(\{\},\s*req\.body\)|Object\.assign\(\{\},\s*req\.query\)|Object\.assign\(\{\},\s*req\.params\)/g,
    severity: 'MEDIUM',
    description: 'Potential prototype pollution risk. Sanitize input before using Object.assign.',
  },
  {
    name: 'Insecure File Operations',
    pattern: /fs\.(readFile|writeFile|appendFile|readFileSync|writeFileSync|appendFileSync)\(\s*(?!path\.join\(|path\.resolve\(|__dirname|__filename)(['"])[^'"]+\1/g,
    severity: 'MEDIUM',
    description: 'Using relative paths in file operations. Use path.join() or path.resolve() with __dirname.',
  },
];

// File extensions to scan
const fileExtensions = ['.js', '.ts', '.jsx', '.tsx'];

// Directories to exclude
const excludeDirs = ['node_modules', 'dist', 'build', '.git', '.github'];

// Function to recursively scan directories
function scanDirectory(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        results.push(...scanDirectory(filePath));
      }
    } else if (fileExtensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to scan a file for security issues
function scanFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf8');
  
  for (const pattern of securityPatterns) {
    const regex = pattern.pattern;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Get line number
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      issues.push({
        file: filePath,
        line: lineNumber,
        pattern: pattern.name,
        severity: pattern.severity,
        description: pattern.description || `Found potential ${pattern.name.toLowerCase()}`,
        match: match[0],
      });
    }
  }
  
  return issues;
}

// Function to check for outdated dependencies
function checkDependencies() {
  console.log(`${colors.blue}Checking for outdated dependencies...${colors.reset}`);
  
  try {
    const output = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(output);
    
    if (auditData.vulnerabilities) {
      const vulnCount = Object.values(auditData.vulnerabilities).reduce((acc, curr) => acc + curr.length, 0);
      
      if (vulnCount > 0) {
        console.log(`${colors.red}Found ${vulnCount} vulnerabilities in dependencies!${colors.reset}`);
        
        for (const [severity, vulns] of Object.entries(auditData.vulnerabilities)) {
          console.log(`${colors.yellow}${severity.toUpperCase()} severity issues: ${vulns.length}${colors.reset}`);
          
          for (const vuln of vulns) {
            console.log(`  - ${colors.cyan}${vuln.name}${colors.reset}: ${vuln.title}`);
            console.log(`    ${vuln.url}`);
          }
        }
      } else {
        console.log(`${colors.green}No vulnerabilities found in dependencies.${colors.reset}`);
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error checking dependencies:${colors.reset}`, error.message);
  }
}

// Function to check for security headers
function checkSecurityHeaders() {
  console.log(`${colors.blue}Checking for security headers...${colors.reset}`);
  
  const serverFiles = [
    path.join(rootDir, 'server', 'index.ts'),
    path.join(rootDir, 'server-redirect.js'),
  ];
  
  const requiredHeaders = [
    { name: 'Content-Security-Policy', pattern: /Content-Security-Policy|contentSecurityPolicy/ },
    { name: 'X-XSS-Protection', pattern: /X-XSS-Protection|xssProtection/ },
    { name: 'X-Frame-Options', pattern: /X-Frame-Options|frameGuard|frameguard/ },
    { name: 'X-Content-Type-Options', pattern: /X-Content-Type-Options|noSniff/ },
    { name: 'Strict-Transport-Security', pattern: /Strict-Transport-Security|hsts/ },
    { name: 'Referrer-Policy', pattern: /Referrer-Policy|referrerPolicy/ },
  ];
  
  for (const file of serverFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      console.log(`${colors.cyan}Checking ${path.relative(rootDir, file)}${colors.reset}`);
      
      for (const header of requiredHeaders) {
        if (header.pattern.test(content)) {
          console.log(`  ${colors.green}✓ ${header.name} is set${colors.reset}`);
        } else {
          console.log(`  ${colors.red}✗ ${header.name} is not set${colors.reset}`);
        }
      }
    }
  }
}

// Function to check for CSRF protection
function checkCsrfProtection() {
  console.log(`${colors.blue}Checking for CSRF protection...${colors.reset}`);
  
  const serverFiles = [
    path.join(rootDir, 'server', 'index.ts'),
    path.join(rootDir, 'server', 'middleware'),
  ];
  
  let csrfFound = false;
  
  for (const file of serverFiles) {
    if (fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory()) {
        const files = scanDirectory(file);
        
        for (const subFile of files) {
          const content = fs.readFileSync(subFile, 'utf8');
          
          if (/csrf|xsrf|csurf/.test(content)) {
            console.log(`${colors.green}✓ CSRF protection found in ${path.relative(rootDir, subFile)}${colors.reset}`);
            csrfFound = true;
          }
        }
      } else {
        const content = fs.readFileSync(file, 'utf8');
        
        if (/csrf|xsrf|csurf/.test(content)) {
          console.log(`${colors.green}✓ CSRF protection found in ${path.relative(rootDir, file)}${colors.reset}`);
          csrfFound = true;
        }
      }
    }
  }
  
  if (!csrfFound) {
    console.log(`${colors.red}✗ No CSRF protection found${colors.reset}`);
  }
}

// Function to check for rate limiting
function checkRateLimiting() {
  console.log(`${colors.blue}Checking for rate limiting...${colors.reset}`);
  
  const serverFiles = [
    path.join(rootDir, 'server', 'index.ts'),
    path.join(rootDir, 'server', 'middleware'),
  ];
  
  let rateLimitFound = false;
  
  for (const file of serverFiles) {
    if (fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory()) {
        const files = scanDirectory(file);
        
        for (const subFile of files) {
          const content = fs.readFileSync(subFile, 'utf8');
          
          if (/rateLimit|rate-limit|rateLimiter/.test(content)) {
            console.log(`${colors.green}✓ Rate limiting found in ${path.relative(rootDir, subFile)}${colors.reset}`);
            rateLimitFound = true;
          }
        }
      } else {
        const content = fs.readFileSync(file, 'utf8');
        
        if (/rateLimit|rate-limit|rateLimiter/.test(content)) {
          console.log(`${colors.green}✓ Rate limiting found in ${path.relative(rootDir, file)}${colors.reset}`);
          rateLimitFound = true;
        }
      }
    }
  }
  
  if (!rateLimitFound) {
    console.log(`${colors.red}✗ No rate limiting found${colors.reset}`);
  }
}

// Main function
async function main() {
  console.log(`${colors.magenta}=== Security Audit ====${colors.reset}`);
  console.log(`${colors.blue}Scanning codebase for security issues...${colors.reset}`);
  
  // Scan files
  const files = scanDirectory(rootDir);
  console.log(`Found ${files.length} files to scan.`);
  
  // Collect issues
  const allIssues = [];
  
  for (const file of files) {
    const issues = scanFile(file);
    allIssues.push(...issues);
  }
  
  // Group issues by severity
  const issuesBySeverity = {
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  };
  
  for (const issue of allIssues) {
    issuesBySeverity[issue.severity].push(issue);
  }
  
  // Print issues
  console.log(`\n${colors.magenta}=== Security Issues ====${colors.reset}`);
  
  if (allIssues.length === 0) {
    console.log(`${colors.green}No security issues found.${colors.reset}`);
  } else {
    console.log(`${colors.red}Found ${allIssues.length} potential security issues:${colors.reset}`);
    
    for (const severity of ['HIGH', 'MEDIUM', 'LOW']) {
      const issues = issuesBySeverity[severity];
      
      if (issues.length > 0) {
        console.log(`\n${colors.yellow}${severity} severity issues: ${issues.length}${colors.reset}`);
        
        for (const issue of issues) {
          const relativePath = path.relative(rootDir, issue.file);
          console.log(`\n  ${colors.cyan}${relativePath}:${issue.line}${colors.reset}`);
          console.log(`  ${colors.yellow}${issue.pattern}${colors.reset}: ${issue.description}`);
          console.log(`  ${colors.white}${issue.match}${colors.reset}`);
        }
      }
    }
  }
  
  // Check dependencies
  console.log(`\n${colors.magenta}=== Dependency Check ====${colors.reset}`);
  checkDependencies();
  
  // Check security headers
  console.log(`\n${colors.magenta}=== Security Headers ====${colors.reset}`);
  checkSecurityHeaders();
  
  // Check CSRF protection
  console.log(`\n${colors.magenta}=== CSRF Protection ====${colors.reset}`);
  checkCsrfProtection();
  
  // Check rate limiting
  console.log(`\n${colors.magenta}=== Rate Limiting ====${colors.reset}`);
  checkRateLimiting();
  
  console.log(`\n${colors.magenta}=== Security Audit Complete ====${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});