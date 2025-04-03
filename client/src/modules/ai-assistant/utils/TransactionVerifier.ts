import { Transaction, SecurityScan, SecurityIssue, SecurityCategory } from '../types';

/**
 * TransactionVerifier provides utilities for analyzing blockchain transactions
 * for potential security issues or optimizations
 */
class TransactionVerifier {
  // Known phishing addresses (in a real implementation, this would be sourced from an API)
  private knownPhishingAddresses: Set<string> = new Set([
    '0x4d224452801aced8b2f0aebe155379bb5d594381',
    '0x7f367cc41522ce07553e823bf3be79a889debe1b',
    '0x0e5069514a3dd613350bab01b58fd850058e5ca4'
  ]);
  
  // Known malicious domains and contract addresses
  private maliciousPatterns: Set<string> = new Set([
    'cryptosteal',
    'walletsync',
    'connectweb3',
    'validate-wallet',
    'airdrop',
    'free-nft',
    'claim-token'
  ]);
  
  /**
   * Verify a transaction for security issues
   * 
   * @param transaction The transaction to verify
   * @returns A security scan with analysis results
   */
  public async verifyTransaction(transaction: Transaction): Promise<SecurityScan> {
    const startTime = performance.now();
    
    // Create a scan object
    const scan: SecurityScan = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'transaction',
      status: 'completed',
      focus: transaction.txHash,
      durationMs: 0,
      issues: []
    };
    
    // Run various checks
    await Promise.all([
      this.checkForPhishingAddress(transaction, scan),
      this.checkForUnusualAmount(transaction, scan),
      this.checkForGasOptimization(transaction, scan),
      this.checkForSmartContractRisks(transaction, scan),
      this.checkForPrivacyIssues(transaction, scan),
      this.checkForNetworkIssues(transaction, scan)
    ]);
    
    // Calculate duration
    const endTime = performance.now();
    scan.durationMs = Math.round(endTime - startTime);
    
    // Update transaction with verification status
    return scan;
  }
  
  /**
   * Check if the transaction involves a known phishing address
   */
  private async checkForPhishingAddress(transaction: Transaction, scan: SecurityScan): Promise<void> {
    const toAddressLower = transaction.toAddress.toLowerCase();
    const fromAddressLower = transaction.fromAddress.toLowerCase();
    
    if (this.knownPhishingAddresses.has(toAddressLower)) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'Known Phishing Address Detected',
        description: `The recipient address (${transaction.toAddress}) is associated with known phishing activities.`,
        severity: 'critical',
        category: SecurityCategory.PHISHING,
        recommendation: 'Cancel this transaction immediately and report the address to your wallet provider.',
        detectedAt: new Date(),
        resolved: false
      });
    }
    
    // Check for potential phishing by examining transaction metadata
    if (transaction.type.toLowerCase().includes('approve') && parseFloat(transaction.amount) > 1000) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'Suspicious Token Approval',
        description: 'This transaction approves a large amount of tokens to be spent by another address.',
        severity: 'high',
        category: SecurityCategory.PHISHING,
        recommendation: 'Verify that you intended to approve this amount and that the recipient is trusted.',
        detectedAt: new Date(),
        resolved: false
      });
    }
  }
  
  /**
   * Check if transaction amount is unusually high or exhibits other anomalies
   */
  private async checkForUnusualAmount(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // Example threshold checks
    const amount = parseFloat(transaction.amount);
    
    // High-value transaction check
    if (amount > 10000) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'High Value Transaction',
        description: `This transaction involves a large amount (${amount} ${transaction.tokenSymbol}).`,
        severity: 'medium',
        category: SecurityCategory.UNUSUAL_ACTIVITY,
        recommendation: 'Verify the recipient address and amount before proceeding.',
        detectedAt: new Date(),
        resolved: false
      });
    }
    
    // Round number check (often used in scams)
    if (amount === Math.round(amount) && amount > 100) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'Round-Number Transaction',
        description: 'This transaction uses a large, round number which is sometimes associated with scams.',
        severity: 'low',
        category: SecurityCategory.UNUSUAL_ACTIVITY,
        recommendation: 'Verify that this transaction was intended and not a result of a scam request.',
        detectedAt: new Date(),
        resolved: false
      });
    }
  }
  
  /**
   * Check for potential gas fee optimizations
   */
  private async checkForGasOptimization(transaction: Transaction, scan: SecurityScan): Promise<void> {
    if (!transaction.fee) return;
    
    const feeValue = parseFloat(transaction.fee);
    
    // High gas fee check
    if (feeValue > 0.01) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'High Gas Fee',
        description: `This transaction has a relatively high gas fee (${transaction.fee}).`,
        severity: 'info',
        category: SecurityCategory.GAS_OPTIMIZATION,
        recommendation: 'Consider waiting for lower network congestion or using a gas optimization tool.',
        detectedAt: new Date(),
        resolved: false
      });
    }
  }
  
  /**
   * Check for smart contract security risks
   */
  private async checkForSmartContractRisks(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // In a real implementation, this would call an API to check the contract
    // For now, we'll just do a basic simulation
    if (transaction.type.toLowerCase().includes('contract')) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'Smart Contract Interaction',
        description: 'This transaction interacts with a smart contract that has not been verified.',
        severity: 'medium',
        category: SecurityCategory.SMART_CONTRACT,
        recommendation: 'Ensure the contract is verified and audited before proceeding.',
        detectedAt: new Date(),
        resolved: false
      });
    }
  }
  
  /**
   * Check for privacy issues in the transaction
   */
  private async checkForPrivacyIssues(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // Check if transaction might expose user's activity
    // This is simplified - in reality, privacy analysis is more complex
    if (transaction.type.toLowerCase().includes('transfer') && parseFloat(transaction.amount) > 0) {
      scan.issues.push({
        id: scan.issues.length + 1,
        title: 'Privacy Consideration',
        description: 'This public transaction may reveal your financial activity to blockchain observers.',
        severity: 'info',
        category: SecurityCategory.PRIVACY,
        recommendation: 'For privacy-sensitive transactions, consider using a privacy-focused solution.',
        detectedAt: new Date(),
        resolved: false
      });
    }
  }
  
  /**
   * Check for network-related issues
   */
  private async checkForNetworkIssues(transaction: Transaction, scan: SecurityScan): Promise<void> {
    // Check if network is congested or has known issues
    // This would typically query a network status API
    if (transaction.network && transaction.network.toLowerCase() === 'ethereum') {
      // Just an example - in real life, we'd check actual network conditions
      if (Math.random() > 0.7) {
        scan.issues.push({
          id: scan.issues.length + 1,
          title: 'Network Congestion',
          description: 'The Ethereum network currently has high congestion.',
          severity: 'info',
          category: SecurityCategory.NETWORK,
          recommendation: 'Consider delaying non-urgent transactions for lower fees.',
          detectedAt: new Date(),
          resolved: false
        });
      }
    }
  }
  
  /**
   * Calculate the overall risk score for a transaction
   * 
   * @param issues List of security issues detected
   * @returns Risk score from 0-100
   */
  public calculateRiskScore(issues: SecurityIssue[]): number {
    if (!issues.length) return 0;
    
    // Severity weights
    const weights = {
      critical: 100,
      high: 70,
      medium: 40,
      low: 20,
      info: 5
    };
    
    // Calculate weighted score
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const issue of issues) {
      const weight = weights[issue.severity];
      totalWeight += weight;
      weightedSum += weight * 1; // Multiply by 1 to convert to number
    }
    
    // Normalize to 0-100 scale with exponential curve to emphasize critical issues
    const baseScore = (weightedSum / (totalWeight || 1)) * 100;
    
    // Count critical and high severity issues
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    // Apply multipliers for critical and high issues
    let finalScore = baseScore;
    if (criticalCount > 0) {
      finalScore = Math.min(100, finalScore * (1 + (criticalCount * 0.5)));
    }
    if (highCount > 0) {
      finalScore = Math.min(100, finalScore * (1 + (highCount * 0.2)));
    }
    
    return Math.round(finalScore);
  }
}

// Export a singleton instance
export const transactionVerifier = new TransactionVerifier();