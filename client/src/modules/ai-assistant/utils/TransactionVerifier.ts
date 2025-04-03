import { Transaction, SecurityScan, SecurityIssue, SecurityCategory, SecuritySeverity } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility for verifying and analyzing blockchain transactions
 * Detects potential security issues and fraud patterns
 */
class TransactionVerifier {
  private readonly UNUSUAL_AMOUNT_THRESHOLD = 5000; // In USD equivalent
  private readonly HIGH_GAS_THRESHOLD = 100; // In Gwei
  private readonly COMMON_SCAM_DOMAINS = [
    'wallet-connect.io',
    'metamask-verify.com',
    'trustwallet-verify.com',
    'airdrop-crypto.net',
    'walletconnect-sync.com',
    'elon-crypto.com',
    'claim-tokens.net',
    'free-airdrop.xyz',
    'nft-giveaway.site',
  ];
  
  private readonly SUSPICIOUS_TOKEN_PREFIXES = [
    'FREE',
    'ELON',
    'NEW',
    'SAFE',
    'MOON',
    'MUSK',
    'REWARD',
    '100X',
    'AIRDROP',
  ];
  
  /**
   * Perform a security scan on a transaction
   */
  async verifyTransaction(transaction: Transaction): Promise<SecurityScan> {
    const startTime = Date.now();
    
    const scan: SecurityScan = {
      id: uuidv4(),
      timestamp: new Date(),
      type: 'transaction',
      status: 'pending',
      focus: transaction.txHash,
      issues: [],
      durationMs: 0
    };
    
    // Run all security checks
    await Promise.all([
      this.runPhishingCheck(transaction, scan),
      this.runContractSecurityCheck(transaction, scan),
      this.runUnusualActivityCheck(transaction, scan),
      this.runGasCheck(transaction, scan)
    ]);
    
    // Calculate duration
    scan.durationMs = Date.now() - startTime;
    scan.status = 'complete';
    
    return scan;
  }
  
  /**
   * Check if a transaction has critical security issues
   */
  hasCriticalIssues(scan: SecurityScan): boolean {
    return scan.issues.some(issue => issue.severity === 'critical');
  }
  
  /**
   * Check if a transaction should be held for review
   */
  shouldHoldTransaction(scan: SecurityScan): boolean {
    if (this.hasCriticalIssues(scan)) return true;
    
    const highCount = scan.issues.filter(issue => issue.severity === 'high').length;
    const mediumCount = scan.issues.filter(issue => issue.severity === 'medium').length;
    
    return highCount >= 2 || (highCount >= 1 && mediumCount >= 2);
  }
  
  /**
   * Get a human-readable reason why a transaction is held
   */
  getHoldReason(scan: SecurityScan): string {
    if (this.hasCriticalIssues(scan)) {
      const criticalIssue = scan.issues.find(issue => issue.severity === 'critical');
      return `Critical security risk: ${criticalIssue?.title}`;
    }
    
    const highIssues = scan.issues.filter(issue => issue.severity === 'high');
    
    if (highIssues.length > 0) {
      return `Multiple high-risk security issues detected (${highIssues.length})`;
    }
    
    return 'Suspicious transaction pattern detected';
  }
  
  /**
   * Calculate overall risk score from 0-100
   */
  getRiskScore(scan: SecurityScan): number {
    if (scan.issues.length === 0) return 0;
    
    // Weights for different severity levels
    const weights = {
      critical: 100,
      high: 70,
      medium: 40,
      low: 15,
      info: 5
    };
    
    // Sum up weighted scores
    const totalWeight = scan.issues.reduce((total, issue) => {
      return total + weights[issue.severity];
    }, 0);
    
    // Normalize to 0-100 with diminishing returns formula
    return Math.min(100, Math.round(100 * (1 - Math.exp(-totalWeight / 100))));
  }
  
  /**
   * Group issues by category
   */
  groupIssuesByCategory(scan: SecurityScan): Record<SecurityCategory, SecurityIssue[]> {
    const result = {} as Record<SecurityCategory, SecurityIssue[]>;
    
    // Initialize empty arrays for each category
    Object.values(SecurityCategory).forEach(category => {
      result[category as SecurityCategory] = [];
    });
    
    // Group issues
    scan.issues.forEach(issue => {
      result[issue.category].push(issue);
    });
    
    return result;
  }
  
  /**
   * Count issues by severity
   */
  countIssuesBySeverity(scan: SecurityScan): Record<SecuritySeverity, number> {
    const result = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
    
    scan.issues.forEach(issue => {
      result[issue.severity]++;
    });
    
    return result;
  }
  
  /**
   * Add an issue to the scan
   */
  private addIssue(scan: SecurityScan, issue: SecurityIssue): void {
    // Generate a unique ID if not provided
    if (!issue.id) {
      issue.id = uuidv4();
    }
    
    scan.issues.push(issue);
  }
  
  /**
   * Run phishing detection check
   */
  private async runPhishingCheck(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // Check for known scam addresses
    if (this.isKnownPhishingAddress(transaction.toAddress)) {
      this.addIssue(scan, {
        id: uuidv4(),
        title: 'Known phishing address detected',
        description: 'The recipient address has been identified as a known phishing or scam address in our security database.',
        severity: 'critical',
        category: SecurityCategory.PHISHING,
        recommendation: 'Immediately reject this transaction. Do not send funds to this address.',
        resolved: false
      });
    }
    
    // Check if this is a token with suspicious name
    if (this.hasSuspiciousTokenName(transaction.tokenSymbol)) {
      this.addIssue(scan, {
        id: uuidv4(),
        title: 'Suspicious token name',
        description: `The token symbol "${transaction.tokenSymbol}" matches patterns commonly used in scam tokens.`,
        severity: 'high',
        category: SecurityCategory.PHISHING,
        recommendation: 'Verify this token\'s authenticity before proceeding. Most tokens with these names are fraudulent.',
        resolved: false
      });
    }
  }
  
  /**
   * Run contract security check
   */
  private async runContractSecurityCheck(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // In a real implementation, this would connect to a blockchain node
    // and analyze the contract code or use a security API
    
    // For this example, we'll just simulate some checks
    if (transaction.type.toLowerCase().includes('approve') || 
        transaction.type.toLowerCase().includes('permission')) {
      this.addIssue(scan, {
        id: uuidv4(),
        title: 'Contract permission request',
        description: 'This transaction requests permission to access your tokens or funds. Make sure you trust this contract.',
        severity: 'medium',
        category: SecurityCategory.CONTRACT_SECURITY,
        recommendation: 'Verify the contract\'s purpose and reputation before approving. Consider limiting the approval amount.',
        resolved: false
      });
    }
  }
  
  /**
   * Run unusual activity check
   */
  private async runUnusualActivityCheck(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // Check for unusual transaction patterns
    if (this.isUnusualPattern(transaction)) {
      this.addIssue(scan, {
        id: uuidv4(),
        title: 'Unusual transaction pattern',
        description: 'This transaction follows patterns that differ from your typical activity.',
        severity: 'medium',
        category: SecurityCategory.UNUSUAL_ACTIVITY,
        recommendation: 'Verify that you intended to make this transaction, as it differs from your usual patterns.',
        resolved: false
      });
    }
    
    // Check for large amount
    const amountNumeric = parseFloat(transaction.amount);
    if (!isNaN(amountNumeric) && amountNumeric > this.UNUSUAL_AMOUNT_THRESHOLD) {
      this.addIssue(scan, {
        id: uuidv4(),
        title: 'Large transaction amount',
        description: `This transaction involves a large amount (${transaction.amount} ${transaction.tokenSymbol}).`,
        severity: 'low',
        category: SecurityCategory.UNUSUAL_ACTIVITY,
        recommendation: 'Double-check the amount and recipient for transactions involving large sums.',
        resolved: false
      });
    }
  }
  
  /**
   * Run gas optimization check
   */
  private async runGasCheck(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // Check for high gas fees (would normally get from transaction.fee)
    if (transaction.fee) {
      const gasFee = parseFloat(transaction.fee);
      if (!isNaN(gasFee) && gasFee > this.HIGH_GAS_THRESHOLD) {
        this.addIssue(scan, {
          id: uuidv4(),
          title: 'High network fee',
          description: `This transaction has a high gas fee (${transaction.fee}).`,
          severity: 'info',
          category: SecurityCategory.GAS_OPTIMIZATION,
          recommendation: 'Consider waiting for network congestion to decrease or use a gas optimization feature.',
          resolved: false
        });
      }
    }
  }
  
  /**
   * Check if an address is a known phishing address
   */
  private isKnownPhishingAddress(address: string | null | undefined): boolean {
    if (!address) return false;
    
    // This would normally check against a security database
    // For simulation, we'll just check if the address contains '1234'
    return address.includes('1234');
  }
  
  /**
   * Check if a token name has suspicious patterns
   */
  private hasSuspiciousTokenName(tokenSymbol: string): boolean {
    if (!tokenSymbol) return false;
    
    const symbolUpperCase = tokenSymbol.toUpperCase();
    
    return this.SUSPICIOUS_TOKEN_PREFIXES.some(prefix => 
      symbolUpperCase.includes(prefix) || 
      symbolUpperCase.startsWith(prefix)
    );
  }
  
  /**
   * Check if a transaction follows an unusual pattern
   */
  private isUnusualPattern(transaction: Transaction): boolean {
    // In a real implementation, this would use machine learning or pattern recognition
    // For simulation, we'll just check if the amount has repeating digits
    const amountStr = transaction.amount.toString();
    const hasRepeatingDigits = /(\d)\1{3,}/.test(amountStr);
    
    return hasRepeatingDigits;
  }
}

// Export a singleton instance
const transactionVerifier = new TransactionVerifier();
export default transactionVerifier;