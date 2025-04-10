import { PhishingDetectionResult } from '../types';

/**
 * PhishingDetector utility for detecting phishing attempts
 * Uses a combination of URL analysis, domain reputation, and content analysis
 */
class PhishingDetector {
  private apiEndpoint: string = '/api/security/phishing-detection';
  private isInitialized: boolean = false;
  private knownPhishingPatterns: RegExp[] = [
    /wallet.*verify/i,
    /connect.*wallet.*urgently/i,
    /sync.*wallet/i,
    /validate.*account/i,
    /airdrop.*claim/i,
    /free.*nft/i,
    /token.*claim/i,
    /urgent.*transfer/i,
    /password.*reset/i,
    /support.*ticket/i
  ];
  
  // Common cryptocurrency project names often used in phishing
  private cryptocurrencyKeywords: string[] = [
    'bitcoin', 'ethereum', 'tether', 'bnb', 'cardano', 'solana', 'polygon',
    'polkadot', 'dogecoin', 'tron', 'metamask', 'ledger', 'trezor',
    'wallet', 'exchange', 'token', 'crypto', 'blockchain', 'defi', 'nft'
  ];
  
  // List of whitelisted domains
  private whitelistedDomains: string[] = [
    'ethereum.org',
    'bitcoin.org',
    'metamask.io',
    'ledger.com',
    'trezor.io',
    'coinbase.com',
    'binance.com',
    'kraken.com',
    'gemini.com',
    'opensea.io',
    'uniswap.org'
  ];

  /**
   * Initialize the phishing detector
   * @param apiEndpoint - Optional custom API endpoint
   * @param additionalPatterns - Optional additional phishing patterns
   */
  initialize(apiEndpoint?: string, additionalPatterns?: RegExp[]): void {
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint;
    }
    
    if (additionalPatterns && additionalPatterns.length > 0) {
      this.knownPhishingPatterns = [
        ...this.knownPhishingPatterns,
        ...additionalPatterns
      ];
    }
    
    this.isInitialized = true;
  }

  /**
   * Check if a URL is a potential phishing attempt
   * @param url - The URL to check
   * @returns Promise resolving to phishing detection result
   */
  async checkUrl(url: string): Promise<PhishingDetectionResult> {
    if (!this.isInitialized) {
      console.warn('Phishing detector not initialized, using default settings');
      this.isInitialized = true;
    }

    try {
      // In production, this would call the backend API
      // For now, we'll simulate the detection process
      return this.simulatePhishingCheck(url);
    } catch (error) {
      console.error('Phishing detection failed:', error);
      
      // Return a default result with low confidence
      return {
        url,
        isPhishing: false,
        confidence: 20,
        reasons: ['Detection service error'],
        detectedAt: new Date(),
        reportUrl: undefined
      };
    }
  }

  /**
   * Analyze text content for potential phishing indicators
   * @param content - The text content to analyze
   * @returns Promise resolving to phishing detection result
   */
  async analyzeContent(content: string): Promise<PhishingDetectionResult> {
    if (!this.isInitialized) {
      console.warn('Phishing detector not initialized, using default settings');
      this.isInitialized = true;
    }

    try {
      // Create a mock URL from content for analysis
      const mockUrl = 'https://content-analysis.example.com';
      
      // In production, this would call the backend API
      // For now, we'll simulate the content analysis
      return this.simulateContentAnalysis(content, mockUrl);
    } catch (error) {
      console.error('Content analysis failed:', error);
      
      // Return a default result with low confidence
      return {
        url: 'content-analysis',
        isPhishing: false,
        confidence: 20,
        reasons: ['Content analysis service error'],
        detectedAt: new Date(),
        reportUrl: undefined
      };
    }
  }

  /**
   * Check if a domain is in the whitelist
   * @param domain - The domain to check
   * @returns boolean indicating if domain is whitelisted
   */
  isWhitelisted(domain: string): boolean {
    return this.whitelistedDomains.some(whitelist => 
      domain === whitelist || domain.endsWith('.' + whitelist)
    );
  }

  /**
   * Add a domain to the whitelist
   * @param domain - The domain to whitelist
   */
  addToWhitelist(domain: string): void {
    if (!this.whitelistedDomains.includes(domain)) {
      this.whitelistedDomains.push(domain);
    }
  }

  /**
   * Remove a domain from the whitelist
   * @param domain - The domain to remove from whitelist
   * @returns boolean indicating success
   */
  removeFromWhitelist(domain: string): boolean {
    const initialLength = this.whitelistedDomains.length;
    this.whitelistedDomains = this.whitelistedDomains.filter(d => d !== domain);
    return this.whitelistedDomains.length !== initialLength;
  }

  /**
   * Simulate phishing URL check (for demo purposes)
   * Will be replaced with actual API calls in production
   */
  private simulatePhishingCheck(url: string): PhishingDetectionResult {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    const queryParams = urlObj.search;
    
    // Check if domain is whitelisted
    if (this.isWhitelisted(domain)) {
      return {
        url,
        isPhishing: false,
        confidence: 95,
        reasons: ['Domain is in trusted whitelist'],
        detectedAt: new Date()
      };
    }
    
    // Check for suspicious domain patterns (typosquatting common crypto sites)
    const typosquatting = this.cryptocurrencyKeywords.some(keyword => {
      // Check for domain containing keyword with slight modifications
      const domainWithoutTld = domain.split('.')[0];
      return domainWithoutTld.includes(keyword) && domainWithoutTld !== keyword;
    });
    
    // Check for suspicious URL patterns
    const hasPhishingPattern = this.knownPhishingPatterns.some(pattern => 
      pattern.test(url)
    );
    
    // Check for excessive subdomains
    const subdomainCount = (domain.match(/\./g) || []).length;
    const hasExcessiveSubdomains = subdomainCount > 3;
    
    // Check for suspicious URL parameters
    const hasSuspiciousParams = queryParams.includes('wallet') || 
                                queryParams.includes('key') || 
                                queryParams.includes('seed') || 
                                queryParams.includes('private');
    
    // Check for misleading path
    const hasMisleadingPath = path.includes('/wallet') || 
                              path.includes('/connect') || 
                              path.includes('/verify') || 
                              path.includes('/claim');
    
    // Aggregate the results
    const reasons: string[] = [];
    let confidence = 0;
    
    if (typosquatting) {
      reasons.push('Domain appears to be imitating a legitimate cryptocurrency service');
      confidence += 30;
    }
    
    if (hasPhishingPattern) {
      reasons.push('URL contains known phishing patterns');
      confidence += 40;
    }
    
    if (hasExcessiveSubdomains) {
      reasons.push('URL has an unusual number of subdomains');
      confidence += 15;
    }
    
    if (hasSuspiciousParams) {
      reasons.push('URL contains suspicious query parameters');
      confidence += 20;
    }
    
    if (hasMisleadingPath) {
      reasons.push('URL path contains misleading cryptocurrency terms');
      confidence += 25;
    }
    
    // Cap confidence at 100
    confidence = Math.min(confidence, 100);
    
    // Determine if it's phishing based on confidence threshold
    const isPhishing = confidence >= 50;
    
    return {
      url,
      isPhishing,
      confidence,
      reasons: reasons.length > 0 ? reasons : ['No suspicious patterns detected'],
      detectedAt: new Date(),
      reportUrl: isPhishing ? 'https://report.example.com?url=' + encodeURIComponent(url) : undefined
    };
  }

  /**
   * Simulate content analysis (for demo purposes)
   * Will be replaced with actual API calls in production
   */
  private simulateContentAnalysis(content: string, mockUrl: string): PhishingDetectionResult {
    // Check for phishing indicators in content
    const hasUrgencyLanguage = /urgent|immediate|act now|limited time/i.test(content);
    const hasPrivateKeyRequest = /private key|seed phrase|recovery phrase|secret key/i.test(content);
    const hasPasswordRequest = /password|login details|credentials/i.test(content);
    const hasWalletRequest = /connect wallet|sync wallet|verify wallet/i.test(content);
    const hasRewardClaim = /claim reward|claim airdrop|free token|bonus/i.test(content);
    
    // Check for cryptocurrency keywords
    const cryptoKeywordCount = this.cryptocurrencyKeywords.filter(keyword => 
      new RegExp('\\b' + keyword + '\\b', 'i').test(content)
    ).length;
    
    // Aggregate the results
    const reasons: string[] = [];
    let confidence = 0;
    
    if (hasUrgencyLanguage) {
      reasons.push('Content contains urgent language to pressure immediate action');
      confidence += 25;
    }
    
    if (hasPrivateKeyRequest) {
      reasons.push('Content requests private keys or seed phrases');
      confidence += 50;
    }
    
    if (hasPasswordRequest) {
      reasons.push('Content requests passwords or login credentials');
      confidence += 35;
    }
    
    if (hasWalletRequest) {
      reasons.push('Content requests wallet connection or verification');
      confidence += 40;
    }
    
    if (hasRewardClaim) {
      reasons.push('Content mentions suspicious reward claims or free tokens');
      confidence += 30;
    }
    
    if (cryptoKeywordCount > 5) {
      reasons.push('Content contains multiple cryptocurrency terms');
      confidence += 15;
    }
    
    // Cap confidence at 100
    confidence = Math.min(confidence, 100);
    
    // Determine if it's phishing based on confidence threshold
    const isPhishing = confidence >= 50;
    
    return {
      url: mockUrl,
      isPhishing,
      confidence,
      reasons: reasons.length > 0 ? reasons : ['No suspicious content detected'],
      detectedAt: new Date(),
      reportUrl: isPhishing ? 'https://report.example.com?content=analysis' : undefined
    };
  }
}

// Export singleton instance
export default new PhishingDetector();