/**
 * CompletionService: Provides AI-powered code completion and suggestions
 * Analyzes code context to suggest secure patterns and optimizations.
 */
import { securityAnalysisService } from '../security/security-analysis-service';

/**
 * Completion suggestion
 */
export interface CompletionSuggestion {
  text: string;
  displayText: string;
  documentation?: string;
  securityImpact?: string;
  replacementRange?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

/**
 * Common security patterns with documentation
 */
const SECURITY_PATTERNS = [
  {
    pattern: 'require(msg.sender == owner',
    description: 'Basic ownership check',
    example: 'require(msg.sender == owner, "Not owner");',
    securityImpact: 'Restricts function access to the contract owner'
  },
  {
    pattern: 'modifier onlyOwner',
    description: 'Ownership modifier',
    example: 'modifier onlyOwner() {\n  require(msg.sender == owner, "Not owner");\n  _;\n}',
    securityImpact: 'Creates a reusable access control modifier'
  },
  {
    pattern: 'nonReentrant',
    description: 'Reentrancy guard',
    example: 'modifier nonReentrant() {\n  require(!locked, "Reentrant call");\n  locked = true;\n  _;\n  locked = false;\n}',
    securityImpact: 'Prevents reentrancy attacks by blocking recursive calls'
  },
  {
    pattern: 'SafeMath',
    description: 'Safe arithmetic operations',
    example: 'using SafeMath for uint256;\nuint256 total = a.add(b);',
    securityImpact: 'Prevents integer overflow/underflow'
  },
  {
    pattern: 'transfer',
    description: 'Safe ETH transfer',
    example: 'payable(msg.sender).transfer(amount);',
    securityImpact: 'Safely transfers ETH with built-in revert on failure'
  },
  {
    pattern: 'using SafeERC20',
    description: 'Safe ERC20 token operations',
    example: 'using SafeERC20 for IERC20;\ntoken.safeTransfer(recipient, amount);',
    securityImpact: 'Handles non-compliant ERC20 tokens safely'
  },
  {
    pattern: 'address(this).balance',
    description: 'Contract balance check',
    example: 'require(address(this).balance >= amount, "Insufficient balance");',
    securityImpact: 'Ensures contract has sufficient ETH before operations'
  },
  {
    pattern: 'block.timestamp',
    description: 'Timestamp-based logic',
    example: 'require(block.timestamp >= unlockTime, "Too early");',
    securityImpact: 'Moderate - Miners can manipulate timestamps slightly'
  }
];

export class CompletionService {
  /**
   * Gets code completion suggestions based on current context
   * @param code Current code
   * @param position Cursor position (line and character)
   * @param prefix Text before cursor on current line
   * @returns List of completion suggestions
   */
  getCompletionSuggestions(
    code: string,
    position: { line: number; character: number },
    prefix: string
  ): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = [];
    
    // Determine context by looking at code around the cursor
    const lines = code.split('\n');
    const currentLine = lines[position.line] || '';
    const prevLine = position.line > 0 ? lines[position.line - 1] || '' : '';
    
    // Determine the current scope (function, modifier, contract, etc.)
    const scope = this.determineScope(code, position);
    
    // Add basic language suggestions based on context
    this.addContextualSuggestions(suggestions, scope, prefix, currentLine, prevLine);
    
    // Add security pattern suggestions
    this.addSecurityPatternSuggestions(suggestions, scope, prefix);
    
    // Add common contract patterns based on context
    this.addContractPatternSuggestions(suggestions, scope, code);
    
    return suggestions;
  }

  /**
   * Gets detailed documentation for a completion item
   * @param item Completion item
   * @returns Detailed documentation
   */
  getCompletionDocumentation(item: string): string {
    // Look for the item in security patterns
    const securityPattern = SECURITY_PATTERNS.find(p => 
      p.pattern === item || p.example.includes(item));
    
    if (securityPattern) {
      return `${securityPattern.description}\n\nExample:\n${securityPattern.example}\n\nSecurity Impact: ${securityPattern.securityImpact}`;
    }
    
    // If not found, return generic documentation
    return `Documentation for ${item}. In a production environment, this would provide detailed information about this pattern or function.`;
  }

  /**
   * Gets secure code patterns recommended for specific vulnerabilities
   * @param vulnerabilities List of vulnerability IDs
   * @returns Recommended patterns
   */
  getSecurePatterns(vulnerabilities: string[]): Record<string, string> {
    const patterns: Record<string, string> = {};
    
    for (const vulnId of vulnerabilities) {
      switch (vulnId) {
        case 'REENTRANCY':
          patterns['nonReentrant'] = 'modifier nonReentrant() {\n  require(!locked, "Reentrant call");\n  locked = true;\n  _;\n  locked = false;\n}';
          break;
          
        case 'INTEGER_OVERFLOW':
          patterns['SafeMath'] = 'using SafeMath for uint256;\n// Then use: a.add(b) instead of a + b';
          break;
          
        case 'UNCHECKED_LOW_LEVEL_CALLS':
          patterns['SafeCall'] = 'function safeCall(address target, bytes memory data) internal returns (bytes memory) {\n  (bool success, bytes memory result) = target.call(data);\n  require(success, "Call failed");\n  return result;\n}';
          break;
          
        case 'TX_ORIGIN':
          patterns['OwnerCheck'] = 'require(msg.sender == owner, "Not owner"); // Use msg.sender instead of tx.origin';
          break;
          
        default:
          patterns[vulnId] = 'No specific pattern available for this vulnerability.';
      }
    }
    
    return patterns;
  }

  /**
   * Analyzes context to suggest improvements
   * @param code Contract code
   * @returns Suggested improvements
   */
  async suggestCodeImprovements(code: string) {
    // Use the security analysis service to identify vulnerabilities
    const analysis = await securityAnalysisService.analyzeContract(code);
    
    // Extract vulnerability IDs
    const vulnerabilityIds = analysis.vulnerabilities.map(v => v.id);
    
    // Get secure patterns for these vulnerabilities
    const securePatterns = this.getSecurePatterns(vulnerabilityIds);
    
    // Analyze code structure to suggest general improvements
    const generalImprovements = this.analyzeCodeStructure(code);
    
    return {
      securityImprovements: securePatterns,
      generalImprovements,
      gasOptimizations: analysis.gasAnalysis?.optimizationSuggestions || []
    };
  }

  /**
   * Determines the current scope based on cursor position
   * @param code Contract code
   * @param position Cursor position
   * @returns Current scope
   */
  private determineScope(
    code: string,
    position: { line: number; character: number }
  ): 'contract' | 'function' | 'modifier' | 'global' {
    // This is a simplified implementation
    // In a real implementation, this would parse the code structure
    
    const lines = code.split('\n');
    const linesBefore = lines.slice(0, position.line + 1);
    
    // Check for function scope
    const functionMatch = linesBefore.join('\n').match(/function\s+[a-zA-Z0-9_]+\s*\(.*?\)\s*.*?\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*$/s);
    if (functionMatch) {
      return 'function';
    }
    
    // Check for modifier scope
    const modifierMatch = linesBefore.join('\n').match(/modifier\s+[a-zA-Z0-9_]+\s*\(.*?\)\s*.*?\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*$/s);
    if (modifierMatch) {
      return 'modifier';
    }
    
    // Check for contract scope
    const contractMatch = linesBefore.join('\n').match(/contract\s+[a-zA-Z0-9_]+\s*.*?\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*$/s);
    if (contractMatch) {
      return 'contract';
    }
    
    return 'global';
  }

  /**
   * Adds context-specific completion suggestions
   * @param suggestions Suggestions array
   * @param scope Current scope
   * @param prefix Text before cursor
   * @param currentLine Current line text
   * @param prevLine Previous line text
   */
  private addContextualSuggestions(
    suggestions: CompletionSuggestion[],
    scope: string,
    prefix: string,
    currentLine: string,
    prevLine: string
  ) {
    // Function scope suggestions
    if (scope === 'function') {
      suggestions.push(
        {
          text: 'require(condition, "Error message");',
          displayText: 'require(...)',
          documentation: 'Checks a condition and reverts if false'
        },
        {
          text: 'emit EventName(param1, param2);',
          displayText: 'emit Event(...)',
          documentation: 'Emits an event'
        },
        {
          text: 'return value;',
          displayText: 'return',
          documentation: 'Returns a value from the function'
        }
      );
      
      // If this looks like a transfer function
      if (currentLine.includes('transfer') || prevLine.includes('transfer')) {
        suggestions.push({
          text: 'require(address(this).balance >= amount, "Insufficient balance");',
          displayText: 'require(balance check)',
          documentation: 'Checks if contract has sufficient balance',
          securityImpact: 'Prevents failed transfers due to insufficient funds'
        });
      }
    }
    
    // Contract scope suggestions
    if (scope === 'contract') {
      suggestions.push(
        {
          text: 'function functionName(param1Type param1Name) public returns (returnType) {\n    // Function body\n}',
          displayText: 'function',
          documentation: 'Defines a new function'
        },
        {
          text: 'event EventName(param1Type indexed param1Name, param2Type param2Name);',
          displayText: 'event',
          documentation: 'Defines a new event'
        },
        {
          text: 'modifier modifierName() {\n    // Modifier checks\n    _;\n}',
          displayText: 'modifier',
          documentation: 'Defines a new modifier'
        }
      );
    }
    
    // Global scope suggestions
    if (scope === 'global') {
      suggestions.push(
        {
          text: 'contract ContractName {\n    // Contract body\n}',
          displayText: 'contract',
          documentation: 'Defines a new contract'
        },
        {
          text: 'interface InterfaceName {\n    // Interface methods\n}',
          displayText: 'interface',
          documentation: 'Defines a new interface'
        },
        {
          text: 'library LibraryName {\n    // Library functions\n}',
          displayText: 'library',
          documentation: 'Defines a new library'
        }
      );
    }
  }

  /**
   * Adds security pattern suggestions
   * @param suggestions Suggestions array
   * @param scope Current scope
   * @param prefix Text before cursor
   */
  private addSecurityPatternSuggestions(
    suggestions: CompletionSuggestion[],
    scope: string,
    prefix: string
  ) {
    // Add relevant security patterns based on scope and prefix
    for (const pattern of SECURITY_PATTERNS) {
      // Skip patterns that don't match the current scope
      if (
        (pattern.pattern.includes('modifier') && scope !== 'contract') ||
        (pattern.pattern.includes('using') && scope !== 'contract')
      ) {
        continue;
      }
      
      suggestions.push({
        text: pattern.example,
        displayText: pattern.pattern,
        documentation: pattern.description,
        securityImpact: pattern.securityImpact
      });
    }
  }

  /**
   * Adds contract pattern suggestions
   * @param suggestions Suggestions array
   * @param scope Current scope
   * @param code Full contract code
   */
  private addContractPatternSuggestions(
    suggestions: CompletionSuggestion[],
    scope: string,
    code: string
  ) {
    // Only add contract patterns in contract scope
    if (scope !== 'contract') {
      return;
    }
    
    // If code looks like an ERC20 token
    if (code.includes('balanceOf') || code.includes('totalSupply')) {
      suggestions.push({
        text: 'function transfer(address recipient, uint256 amount) public returns (bool) {\n    _transfer(msg.sender, recipient, amount);\n    return true;\n}',
        displayText: 'ERC20: transfer',
        documentation: 'Standard ERC20 transfer function',
        securityImpact: 'Implements the ERC20 standard transfer function'
      });
    }
    
    // If code looks like it needs access control
    if (code.includes('owner') || code.includes('admin')) {
      suggestions.push({
        text: 'modifier onlyOwner() {\n    require(msg.sender == owner, "Not owner");\n    _;\n}',
        displayText: 'modifier: onlyOwner',
        documentation: 'Restricts function access to the contract owner',
        securityImpact: 'Implements basic access control'
      });
    }
    
    // If code looks like it handles ETH
    if (code.includes('payable') || code.includes('value')) {
      suggestions.push({
        text: 'receive() external payable {\n    // Handle incoming ETH\n}',
        displayText: 'receive function',
        documentation: 'Handles incoming ETH transfers',
        securityImpact: 'Required to receive ETH without calling a specific function'
      });
    }
  }

  /**
   * Analyzes code structure to suggest improvements
   * @param code Contract code
   * @returns Suggested improvements
   */
  private analyzeCodeStructure(code: string): string[] {
    const improvements: string[] = [];
    
    // Check for missing SPDX license
    if (!code.includes('SPDX-License-Identifier')) {
      improvements.push('Add SPDX license identifier (e.g., // SPDX-License-Identifier: MIT)');
    }
    
    // Check for missing NatSpec comments
    if (!code.includes('/// ') && !code.includes('/**')) {
      improvements.push('Add NatSpec comments to document functions and parameters');
    }
    
    // Check for hardcoded addresses
    if (code.match(/0x[a-fA-F0-9]{40}/)) {
      improvements.push('Avoid hardcoded addresses, use immutable state variables instead');
    }
    
    // Check for magic numbers
    if (code.match(/[^a-zA-Z0-9"']\d{2,}[^a-zA-Z0-9"']/)) {
      improvements.push('Replace magic numbers with named constants');
    }
    
    // Check for overly complex functions
    const functionMatches = code.match(/function\s+[a-zA-Z0-9_]+\s*\(.*?\)\s*.*?\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/gs);
    if (functionMatches) {
      for (const funcCode of functionMatches) {
        if (funcCode.split('\n').length > 50) {
          improvements.push('Consider breaking down large functions into smaller ones');
          break;
        }
      }
    }
    
    return improvements;
  }
}

export const completionService = new CompletionService();