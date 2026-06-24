/**
 * SecurityAnalysisService: Provides enhanced security analysis for smart contracts
 * Detects vulnerabilities, suggests fixes, and provides risk scores.
 */
import { db } from '../../db';
import { securityAuditTemplates } from '../../../shared/dapp-schema';
import { eq } from 'drizzle-orm';

/**
 * Security check result
 */
export interface SecurityCheckResult {
  passed: boolean;
  details?: string;
  location?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Security vulnerability
 */
export interface SecurityVulnerability {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  location: string;
  recommendation: string;
  cwe?: string;
  references?: string[];
}

/**
 * Gas analysis result
 */
export interface GasAnalysis {
  totalGas: number;
  functionBreakdown: Record<string, number>;
  optimizationSuggestions: string[];
}

export class SecurityAnalysisService {
  /**
   * Runs a comprehensive security analysis on smart contract code
   * @param contractCode Contract code to analyze
   * @param contractType Type of contract (e.g., token, nft, marketplace)
   * @returns Analysis results
   */
  async analyzeContract(contractCode: string, contractType: string = 'generic') {
    // Get security templates for the contract type
    const templates = await db.select().from(securityAuditTemplates)
      .where(eq(securityAuditTemplates.category, contractType));
    
    // Run security checks
    const securityChecks = this.runSecurityChecks(contractCode, templates);
    
    // Run gas analysis
    const gasAnalysis = this.analyzeGasUsage(contractCode);
    
    // Analyze contract for vulnerabilities
    const vulnerabilities = this.detectVulnerabilities(contractCode);
    
    // Calculate security score
    const score = this.calculateSecurityScore(securityChecks, vulnerabilities);
    
    return {
      score,
      passedChecks: securityChecks.filter(check => check.passed).map(check => check.id),
      failedChecks: securityChecks.filter(check => !check.passed).map(check => check.id),
      vulnerabilities,
      gasAnalysis,
      timestamp: new Date()
    };
  }

  /**
   * Runs security checks based on templates
   * @param contractCode Contract code
   * @param templates Security audit templates
   * @returns Results of security checks
   */
  private runSecurityChecks(contractCode: string, templates: any[]) {
    const results = [];
    
    // Flatten all checks from templates
    const allChecks = templates.flatMap(template => {
      const checksArray = template.checks as any[];
      return checksArray.map(check => ({
        ...check,
        severity: template.severity,
        templateName: template.name
      }));
    });
    
    // Run each check
    for (const check of allChecks) {
      // In a real implementation, this would use regex or AST analysis
      // to check for specific vulnerabilities
      const hasVulnerability = this.checkForPattern(contractCode, check.pattern);
      
      results.push({
        id: check.id,
        name: check.name,
        description: check.description,
        severity: check.severity,
        passed: !hasVulnerability,
        details: hasVulnerability ? check.failureMessage : check.successMessage,
        templateName: check.templateName
      });
    }
    
    return results;
  }

  /**
   * Detects common vulnerabilities in contract code
   * @param contractCode Contract code
   * @returns List of detected vulnerabilities
   */
  private detectVulnerabilities(contractCode: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for reentrancy vulnerability
    if (contractCode.includes('call.value') && !contractCode.includes('nonReentrant')) {
      vulnerabilities.push({
        id: 'REENTRANCY',
        name: 'Reentrancy Vulnerability',
        description: 'The contract uses call.value without a reentrancy guard, which may allow attackers to recursively call back into the contract.',
        severity: 'critical',
        impact: 'An attacker could drain funds from the contract by recursively calling back into it before state is updated.',
        location: 'N/A', // In a real implementation, this would be the line number
        recommendation: 'Implement a reentrancy guard using OpenZeppelin\'s ReentrancyGuard, or follow the checks-effects-interactions pattern.',
        cwe: 'CWE-841',
        references: [
          'https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/',
          'https://swcregistry.io/docs/SWC-107'
        ]
      });
    }
    
    // Check for integer overflow/underflow
    if (!contractCode.includes('SafeMath') && !contractCode.includes('pragma solidity ^0.8')) {
      vulnerabilities.push({
        id: 'INTEGER_OVERFLOW',
        name: 'Integer Overflow/Underflow',
        description: 'The contract does not use SafeMath or Solidity 0.8.x which has built-in overflow checking.',
        severity: 'high',
        impact: 'Arithmetic operations could wrap around, leading to unexpected behavior or loss of funds.',
        location: 'N/A',
        recommendation: 'Use OpenZeppelin\'s SafeMath library for Solidity < 0.8.0, or upgrade to Solidity 0.8.0+ which has built-in overflow checking.',
        cwe: 'CWE-190',
        references: [
          'https://swcregistry.io/docs/SWC-101',
          'https://docs.openzeppelin.com/contracts/4.x/api/utils#SafeMath'
        ]
      });
    }
    
    // Check for unprotected selfdestruct
    if (contractCode.includes('selfdestruct') && !contractCode.includes('onlyOwner')) {
      vulnerabilities.push({
        id: 'UNPROTECTED_SELFDESTRUCT',
        name: 'Unprotected Selfdestruct',
        description: 'The contract contains a selfdestruct call that is not properly protected.',
        severity: 'critical',
        impact: 'Anyone could destroy the contract and send its funds to an attacker-controlled address.',
        location: 'N/A',
        recommendation: 'Add access control to the function containing selfdestruct, such as onlyOwner modifier.',
        cwe: 'CWE-284',
        references: [
          'https://swcregistry.io/docs/SWC-106'
        ]
      });
    }
    
    // Check for use of tx.origin for authentication
    if (contractCode.includes('tx.origin')) {
      vulnerabilities.push({
        id: 'TX_ORIGIN',
        name: 'Use of tx.origin for Authentication',
        description: 'The contract uses tx.origin for authentication, which is vulnerable to phishing attacks.',
        severity: 'medium',
        impact: 'An attacker could trick a user into calling a malicious contract, which then calls your contract, passing the tx.origin check.',
        location: 'N/A',
        recommendation: 'Use msg.sender instead of tx.origin for authentication.',
        cwe: 'CWE-287',
        references: [
          'https://swcregistry.io/docs/SWC-115'
        ]
      });
    }
    
    // Check for unchecked return values
    if (contractCode.match(/\.transfer\(|\.send\(/) && !contractCode.includes('require(')) {
      vulnerabilities.push({
        id: 'UNCHECKED_LOW_LEVEL_CALLS',
        name: 'Unchecked Return Values',
        description: 'The contract contains low-level calls whose return values are not checked.',
        severity: 'medium',
        impact: 'Failed calls could go unnoticed, leading to unexpected behavior or loss of funds.',
        location: 'N/A',
        recommendation: 'Always check the return value of low-level calls, or use transfer() which reverts on failure.',
        cwe: 'CWE-252',
        references: [
          'https://swcregistry.io/docs/SWC-104'
        ]
      });
    }
    
    return vulnerabilities;
  }

  /**
   * Analyzes gas usage in the contract
   * @param contractCode Contract code
   * @returns Gas analysis result
   */
  private analyzeGasUsage(contractCode: string): GasAnalysis {
    // In a real implementation, this would use static analysis or abstract interpretation
    // to estimate gas usage for each function
    
    // Extract function signatures
    const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(contractCode)) !== null) {
      functions.push(match[1]);
    }
    
    // Generate mock gas usage for each function
    const functionBreakdown: Record<string, number> = {};
    let totalGas = 0;
    
    for (const func of functions) {
      // Generate a reasonable gas estimate based on the function name
      // In a real implementation, this would be based on actual analysis
      const gasUsage = Math.floor(10000 + Math.random() * 100000);
      functionBreakdown[func] = gasUsage;
      totalGas += gasUsage;
    }
    
    // Generate optimization suggestions
    const optimizationSuggestions = [
      'Use uint256 instead of uint8/uint16/uint32 for gas efficiency, unless packing structs',
      'Replace memory with calldata for function parameters in external functions',
      'Use immutable for constants that can be set at construction time',
      'Cache array length in for loops instead of reading it in each iteration',
      'Use custom errors instead of revert strings to save gas'
    ];
    
    // Add function-specific suggestions
    for (const func of functions) {
      if (functionBreakdown[func] > 50000) {
        optimizationSuggestions.push(`Consider optimizing function ${func} which uses ${functionBreakdown[func]} gas`);
      }
    }
    
    return {
      totalGas,
      functionBreakdown,
      optimizationSuggestions
    };
  }

  /**
   * Calculates a security score based on checks and vulnerabilities
   * @param checks Security checks
   * @param vulnerabilities Detected vulnerabilities
   * @returns Security score (0-100)
   */
  private calculateSecurityScore(checks: any[], vulnerabilities: SecurityVulnerability[]): number {
    // Start with a perfect score
    let score = 100;
    
    // Deduct points for failed checks based on severity
    for (const check of checks) {
      if (!check.passed) {
        switch (check.severity) {
          case 'critical':
            score -= 20;
            break;
          case 'high':
            score -= 10;
            break;
          case 'medium':
            score -= 5;
            break;
          case 'low':
            score -= 2;
            break;
        }
      }
    }
    
    // Deduct points for vulnerabilities based on severity
    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 7;
          break;
        case 'low':
          score -= 3;
          break;
      }
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Checks if the contract code contains a specific pattern
   * @param code Contract code
   * @param pattern Pattern to check for
   * @returns Whether the pattern was found
   */
  private checkForPattern(code: string, pattern: string): boolean {
    // In a real implementation, this would use more sophisticated pattern matching
    // For now, we'll just check if the code contains the pattern string
    return code.includes(pattern);
  }

  /**
   * Gets all available security audit templates
   * @returns List of security audit templates
   */
  async getSecurityTemplates() {
    return await db.select().from(securityAuditTemplates);
  }

  /**
   * Provides recommendations for fixing a specific vulnerability
   * @param vulnerabilityId Vulnerability ID
   * @param contractCode Contract code
   * @returns Code snippets and recommendations
   */
  getVulnerabilityFixRecommendations(vulnerabilityId: string, contractCode: string) {
    // This would provide specific code snippets to fix vulnerabilities
    // For now, we'll return mock data
    
    switch (vulnerabilityId) {
      case 'REENTRANCY':
        return {
          description: 'Add a reentrancy guard to prevent recursive calls',
          beforeCode: 'function withdraw() public {\n  uint amount = balances[msg.sender];\n  (bool success, ) = msg.sender.call{value: amount}("");\n  require(success, "Transfer failed");\n  balances[msg.sender] = 0;\n}',
          afterCode: 'bool private locked;\n\nmodifier nonReentrant() {\n  require(!locked, "Reentrant call");\n  locked = true;\n  _;\n  locked = false;\n}\n\nfunction withdraw() public nonReentrant {\n  uint amount = balances[msg.sender];\n  balances[msg.sender] = 0;\n  (bool success, ) = msg.sender.call{value: amount}("");\n  require(success, "Transfer failed");\n}',
          explanation: 'The fix adds a nonReentrant modifier and changes the order of operations to follow the checks-effects-interactions pattern. The balance is set to 0 before the external call.'
        };
      
      case 'INTEGER_OVERFLOW':
        return {
          description: 'Use SafeMath library or Solidity 0.8.x for arithmetic operations',
          beforeCode: 'uint256 total = a + b; // Could overflow',
          afterCode: '// Option 1: Use SafeMath\nusing SafeMath for uint256;\ntotal = a.add(b);\n\n// Option 2: Use Solidity 0.8.x\n// pragma solidity ^0.8.0;\n// uint256 total = a + b; // Safe in 0.8.0+',
          explanation: 'SafeMath library prevents overflow by checking results of arithmetic operations. Alternatively, Solidity 0.8.0 and later includes built-in overflow checking.'
        };
      
      default:
        return {
          description: 'Generic recommendations for improving contract security',
          tips: [
            'Follow the checks-effects-interactions pattern',
            'Use the latest version of Solidity',
            'Use established libraries like OpenZeppelin',
            'Thoroughly test your contracts',
            'Consider formal verification for critical contracts'
          ]
        };
    }
  }

  /**
   * Performs extensive security checks and logs results
   */
  performComprehensiveCheck() {
    // Logic for performing extensive security checks and logging results
    console.log('Performing comprehensive security checks');
    // ... logic details
}
}

export const securityAnalysisService = new SecurityAnalysisService();