import { SecurityScan, Transaction, SecurityCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * TransactionVerifier utility
 * Provides methods for analyzing and verifying blockchain transactions
 * for security risks and issues.
 */
class TransactionVerifier {
  /**
   * Verifies a transaction for security issues
   * 
   * @param tx The transaction to verify
   * @returns A security scan result with any detected issues
   */
  async verifyTransaction(tx: Transaction): Promise<SecurityScan> {
    // In a real implementation, this would connect to backend services
    // to analyze the transaction for security risks
    
    // Simple mock for demo purposes
    // This would be replaced with actual verification logic
    const startTime = performance.now();
    
    // Create a placeholder scan
    const scan: SecurityScan = {
      id: uuidv4(),
      timestamp: new Date(),
      type: 'transaction_verification',
      status: 'complete',
      focus: tx.txHash || '',
      durationMs: 0,
      issues: []
    };
    
    // Dummy verification logic
    if (tx.toAddress && !this.isKnownAddress(tx.toAddress)) {
      scan.issues.push({
        id: uuidv4(),
        title: 'New Recipient Address',
        description: 'This is the first time you are sending funds to this address.',
        category: 'transaction' as SecurityCategory,
        severity: 'low',
        recommendation: 'Double-check the recipient address to ensure it is correct.',
        resolved: false
      });
    }
    
    // Add gas fee issue simulation
    if (tx.amount && parseFloat(tx.amount) > 1.0) {
      scan.issues.push({
        id: uuidv4(),
        title: 'Unusual Transaction Amount',
        description: 'This transaction is for a larger amount than your typical transactions.',
        category: 'gas_optimization' as SecurityCategory,
        severity: 'medium',
        recommendation: 'Consider verifying the transaction amount before proceeding.',
        resolved: false
      });
    }
    
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Calculate duration
    scan.durationMs = Math.round(performance.now() - startTime);
    
    return scan;
  }
  
  /**
   * Calculates a risk score from 0-100 based on scan issues
   * Higher score = higher risk
   * 
   * @param scan The security scan to calculate risk for
   * @returns A risk score from 0-100
   */
  calculateRiskScore(scan: SecurityScan): number {
    if (!scan.issues || scan.issues.length === 0) return 0;
    
    // Calculate score based on severity and number of issues
    const weights = {
      critical: 100,
      high: 70,
      medium: 40,
      low: 20,
      info: 5
    };
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // Calculate weighted score
    scan.issues.forEach(issue => {
      const severityScore = weights[issue.severity] || 0;
      if (!issue.resolved) {
        totalScore += severityScore;
      }
      maxPossibleScore += 100;
    });
    
    // No issues = 0 risk
    if (maxPossibleScore === 0) return 0;
    
    // Normalize to 0-100 scale with enhanced weighting for critical/high issues
    return Math.min(100, Math.round((totalScore / maxPossibleScore) * 100 * 1.5));
  }
  
  /**
   * Determines if a transaction should be held based on security scan
   * 
   * @param scan The security scan to evaluate
   * @returns True if the transaction should be held
   */
  shouldHoldTransaction(scan: SecurityScan): boolean {
    // Hold transaction if:
    // 1. Contains any critical issues
    // 2. Contains 2+ high severity issues
    // 3. Risk score is over 75
    
    const hasCritical = scan.issues.some(issue => 
      issue.severity === 'critical' && !issue.resolved
    );
    
    const highSeverityCount = scan.issues.filter(issue => 
      issue.severity === 'high' && !issue.resolved
    ).length;
    
    const riskScore = this.calculateRiskScore(scan);
    
    return hasCritical || highSeverityCount >= 2 || riskScore > 75;
  }
  
  /**
   * Gets a user-friendly reason for why a transaction was held
   * 
   * @param scan The security scan that triggered the hold
   * @returns A human-readable explanation
   */
  getHoldReason(scan: SecurityScan): string {
    const criticalIssues = scan.issues.filter(issue => 
      issue.severity === 'critical' && !issue.resolved
    );
    
    const highIssues = scan.issues.filter(issue => 
      issue.severity === 'high' && !issue.resolved
    );
    
    if (criticalIssues.length > 0) {
      return `Critical security concern: ${criticalIssues[0].title}`;
    }
    
    if (highIssues.length > 0) {
      return `Multiple high-severity issues detected, including: ${highIssues[0].title}`;
    }
    
    return "Multiple security concerns have triggered an automatic hold";
  }
  
  // Helper methods
  private isKnownAddress(address: string): boolean {
    // In a real implementation, this would check a database of known addresses
    // For demo purposes, let's just return based on a pattern
    return address.startsWith('0x1') || address.startsWith('0x2');
  }
  
  private isHighGasPrice(gasPrice: string): boolean {
    // In a real implementation, this would check current network gas prices
    // For demo purposes, let's consider anything above 50 gwei as high
    const gwei = parseFloat(gasPrice);
    return !isNaN(gwei) && gwei > 50;
  }
}

// Create and export a singleton instance
export const transactionVerifier = new TransactionVerifier();