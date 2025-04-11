/**
 * Certificate Service for HTTPS and HTTQS Security
 * 
 * Provides functionality for creating, managing, and validating security certificates
 * for both traditional HTTPS and quantum-secure HTTQS protocols.
 */

import { QuantumEncryptionAlgorithm } from '../../types/quantum';

// Certificate types
export type CertificateType = 'https' | 'httqs' | 'hybrid';

// Certificate status
export type CertificateStatus = 'valid' | 'expired' | 'revoked' | 'pending';

// Certificate interface
export interface Certificate {
  id: string;
  domain: string;
  type: CertificateType;
  algorithm: QuantumEncryptionAlgorithm | 'rsa' | 'ecdsa';
  issuedAt: string;
  expiresAt: string;
  issuer: string;
  status: CertificateStatus;
  publicKey: string;
  signedBy: string;
  fingerprint: string;
  quantumResistant: boolean;
}

// Certificate request interface
export interface CertificateRequest {
  domain: string;
  type: CertificateType;
  algorithm: QuantumEncryptionAlgorithm | 'rsa' | 'ecdsa';
  validityDays: number;
  quantumResistant: boolean;
}

// Certificate validation result
export interface CertificateValidationResult {
  valid: boolean;
  certificate: Certificate | null;
  issues: string[];
  quantumSafe: boolean;
  expiresIn: number; // days
}

/**
 * Certificate Service Class
 */
class CertificateService {
  private static instance: CertificateService;
  private certificates: Map<string, Certificate> = new Map();
  
  private constructor() {
    // Initialize default certificates
    this.initializeDefaultCertificates();
    console.log('Certificate Service initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }
  
  /**
   * Initialize default certificates
   */
  private initializeDefaultCertificates(): void {
    const now = new Date();
    
    // Create default HTTPS certificate for AetherCore.trust
    const httpsAetherCore: Certificate = {
      id: this.generateCertificateId(),
      domain: 'www.AetherCore.trust',
      type: 'https',
      algorithm: 'ecdsa',
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      issuer: 'AetherCore Certificate Authority',
      status: 'valid',
      publicKey: this.generateMockPublicKey('ecdsa'),
      signedBy: 'AetherCore Root CA',
      fingerprint: this.generateFingerprint(),
      quantumResistant: false
    };
    
    // Create default HTTQS certificate for AetherCore.trust
    const httqsAetherCore: Certificate = {
      id: this.generateCertificateId(),
      domain: 'www.AetherCore.trust',
      type: 'httqs',
      algorithm: 'hybrid',
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      issuer: 'AetherCore Quantum Certificate Authority',
      status: 'valid',
      publicKey: this.generateMockPublicKey('hybrid'),
      signedBy: 'AetherCore Quantum Root CA',
      fingerprint: this.generateFingerprint(),
      quantumResistant: true
    };
    
    // Add certificates to store
    this.certificates.set(httpsAetherCore.id, httpsAetherCore);
    this.certificates.set(httqsAetherCore.id, httqsAetherCore);
  }
  
  /**
   * Generate a unique certificate ID
   */
  private generateCertificateId(): string {
    return 'cert_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Generate a mock public key for demo purposes
   */
  private generateMockPublicKey(algorithm: string): string {
    const prefix = algorithm === 'rsa' ? 'RSA-' : 
                  algorithm === 'ecdsa' ? 'EC-' : 
                  algorithm === 'hybrid' ? 'HYBRID-' :
                  algorithm + '-';
    
    // Generate a mock public key
    return prefix + 'PUBLIC-KEY-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  }
  
  /**
   * Generate a random fingerprint
   */
  private generateFingerprint(): string {
    // Generate a mock certificate fingerprint (SHA-256 format)
    const chunks = [];
    for (let i = 0; i < 16; i++) {
      chunks.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
    }
    return chunks.join(':').toUpperCase();
  }
  
  /**
   * Create a new certificate
   */
  public createCertificate(request: CertificateRequest): Certificate {
    const now = new Date();
    
    // Calculate expiration date
    const expirationDate = new Date(now.getTime() + request.validityDays * 24 * 60 * 60 * 1000);
    
    // Create the certificate
    const certificate: Certificate = {
      id: this.generateCertificateId(),
      domain: request.domain,
      type: request.type,
      algorithm: request.algorithm,
      issuedAt: now.toISOString(),
      expiresAt: expirationDate.toISOString(),
      issuer: request.quantumResistant ? 'AetherCore Quantum Certificate Authority' : 'AetherCore Certificate Authority',
      status: 'valid',
      publicKey: this.generateMockPublicKey(request.algorithm),
      signedBy: request.quantumResistant ? 'AetherCore Quantum Root CA' : 'AetherCore Root CA',
      fingerprint: this.generateFingerprint(),
      quantumResistant: request.quantumResistant
    };
    
    // Store the certificate
    this.certificates.set(certificate.id, certificate);
    
    console.log(`Certificate created for ${request.domain} using ${request.algorithm} algorithm`);
    return certificate;
  }
  
  /**
   * Get a certificate by ID
   */
  public getCertificate(id: string): Certificate | null {
    return this.certificates.get(id) || null;
  }
  
  /**
   * Get certificates for a domain
   */
  public getCertificatesForDomain(domain: string): Certificate[] {
    return Array.from(this.certificates.values())
      .filter(cert => cert.domain === domain);
  }
  
  /**
   * Get all certificates
   */
  public getAllCertificates(): Certificate[] {
    return Array.from(this.certificates.values());
  }
  
  /**
   * Validate a certificate
   */
  public validateCertificate(certificateId: string): CertificateValidationResult {
    const certificate = this.getCertificate(certificateId);
    
    if (!certificate) {
      return {
        valid: false,
        certificate: null,
        issues: ['Certificate not found'],
        quantumSafe: false,
        expiresIn: 0
      };
    }
    
    const now = new Date();
    const expirationDate = new Date(certificate.expiresAt);
    const issues = [];
    
    // Check if expired
    if (now > expirationDate) {
      issues.push('Certificate has expired');
    }
    
    // Check if revoked
    if (certificate.status === 'revoked') {
      issues.push('Certificate has been revoked');
    }
    
    // Calculate days until expiration
    const expiresIn = Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate quantum safety
    const quantumSafe = certificate.quantumResistant && 
                        (certificate.algorithm === 'kyber' || 
                         certificate.algorithm === 'sphincs' || 
                         certificate.algorithm === 'falcon' || 
                         certificate.algorithm === 'hybrid');
    
    return {
      valid: issues.length === 0,
      certificate,
      issues,
      quantumSafe,
      expiresIn
    };
  }
  
  /**
   * Revoke a certificate
   */
  public revokeCertificate(certificateId: string, reason: string): boolean {
    const certificate = this.getCertificate(certificateId);
    
    if (!certificate) {
      console.error(`Certificate ${certificateId} not found`);
      return false;
    }
    
    // Update the certificate status
    certificate.status = 'revoked';
    
    // Update the certificate in the store
    this.certificates.set(certificateId, certificate);
    
    console.log(`Certificate ${certificateId} revoked. Reason: ${reason}`);
    return true;
  }
  
  /**
   * Renew a certificate
   */
  public renewCertificate(certificateId: string, validityDays: number): Certificate | null {
    const certificate = this.getCertificate(certificateId);
    
    if (!certificate) {
      console.error(`Certificate ${certificateId} not found`);
      return null;
    }
    
    // Create a renewal request
    const request: CertificateRequest = {
      domain: certificate.domain,
      type: certificate.type,
      algorithm: certificate.algorithm as any,
      validityDays,
      quantumResistant: certificate.quantumResistant
    };
    
    // Create a new certificate
    const newCertificate = this.createCertificate(request);
    
    console.log(`Certificate ${certificateId} renewed as ${newCertificate.id}`);
    return newCertificate;
  }
  
  /**
   * Convert HTTPS certificate to HTTQS
   * Upgrades traditional certificates to quantum-resistant versions
   */
  public upgradeToQuantumResistant(certificateId: string): Certificate | null {
    const certificate = this.getCertificate(certificateId);
    
    if (!certificate) {
      console.error(`Certificate ${certificateId} not found`);
      return null;
    }
    
    // Check if already quantum resistant
    if (certificate.quantumResistant) {
      console.log(`Certificate ${certificateId} is already quantum resistant`);
      return certificate;
    }
    
    // Determine the quantum algorithm to use
    let algorithm: QuantumEncryptionAlgorithm = 'hybrid';
    
    // Create a quantum-resistant version
    const request: CertificateRequest = {
      domain: certificate.domain,
      type: 'hybrid', // Use both HTTPS and HTTQS
      algorithm,
      validityDays: 365, // 1 year
      quantumResistant: true
    };
    
    // Create the new certificate
    const newCertificate = this.createCertificate(request);
    
    console.log(`Certificate ${certificateId} upgraded to quantum-resistant as ${newCertificate.id}`);
    return newCertificate;
  }
}

// Export singleton instance
export const certificateService = CertificateService.getInstance();