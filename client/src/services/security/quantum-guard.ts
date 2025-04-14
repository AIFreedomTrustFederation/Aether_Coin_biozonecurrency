/**
 * QuantumGuard™ Identity Verification System
 * 
 * A multi-factor authentication system that continuously verifies user identity
 * and implements dynamic access control based on context and risk assessment.
 * Inspired by quantum principles and zero-trust architecture.
 */

import { toast } from "sonner";
import { generateSecureId, generateTOTP, sha256 } from "@/services/security/crypto-utils";

// Types for authentication and verification
export interface AuthFactor {
  type: 'password' | 'totp' | 'biometric' | 'device' | 'location' | 'behavior';
  value: string;
  metadata?: Record<string, any>;
}

export interface AuthToken {
  token: string;
  userId: string;
  issuedAt: number;
  expiresAt: number;
  permissions: string[];
  metadata: Record<string, any>;
}

export interface UserContext {
  token: AuthToken;
  verificationInterval?: NodeJS.Timeout;
  lastVerified: number;
  riskScore?: number;
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;
  behavioralMetrics?: BehavioralMetrics;
}

export interface VerificationResponse {
  valid: boolean;
  reason?: string;
  newToken?: AuthToken;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeviceInfo {
  deviceId?: string;
  userAgent?: string;
  platform?: string;
  screenResolution?: string;
  languages?: string[];
  timezone?: string;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: number;
  ipAddress?: string;
}

export interface BehavioralMetrics {
  typingPattern?: number[];
  mouseMovements?: number[];
  touchDynamics?: number[];
  interactionFrequency?: number;
  lastActivity?: number;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    deviceTrust: number;
    locationTrust: number;
    behaviorTrust: number;
    timeTrust: number;
  };
  timestamp: number;
}

/**
 * Main QuantumGuard class providing zero-trust authentication and continuous verification
 */
export class QuantumGuard {
  private userContext: Map<string, UserContext> = new Map();
  private riskEngine: RiskAssessmentEngine;
  private continuousVerification: boolean = true;
  private verificationInterval: number = 60000; // 1 minute
  
  constructor() {
    this.riskEngine = new RiskAssessmentEngine();
  }
  
  /**
   * Initialize the QuantumGuard system
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log("Initializing QuantumGuard identity verification system...");
      
      // Initialize the risk assessment engine
      await this.riskEngine.initialize();
      
      return true;
    } catch (error) {
      console.error("Failed to initialize QuantumGuard:", error);
      return false;
    }
  }
  
  /**
   * Authenticate a user with multiple factors
   */
  public async authenticateUser(
    userId: string, 
    primaryCredential: string, 
    secondaryFactors: AuthFactor[] = []
  ): Promise<AuthToken> {
    console.log(`Authenticating user ${userId} with QuantumGuard...`);
    
    // Verify primary credential
    const primaryValid = await this.verifyPrimaryCredential(userId, primaryCredential);
    
    if (!primaryValid) {
      throw new Error('Primary authentication failed');
    }
    
    // Verify all required secondary factors using zero-trust approach
    const secondaryValid = await this.verifySecondaryFactors(userId, secondaryFactors);
    
    if (!secondaryValid) {
      throw new Error('Secondary authentication failed');
    }
    
    // Collect device, location, and behavioral information
    const deviceInfo = await this.collectDeviceInfo();
    const locationInfo = await this.getSecureLocation();
    const behavioralMetrics = await this.collectBehavioralData();
    
    // Assess risk level for this authentication
    const riskAssessment = await this.riskEngine.assessAuthenticationRisk(userId, {
      deviceInfo,
      locationInfo,
      behavioralMetrics
    });
    
    // Generate context-aware JWT with appropriate permissions
    const token = this.generateContextAwareToken(userId, riskAssessment);
    
    // Store user context for continuous verification
    this.userContext.set(userId, {
      token,
      lastVerified: Date.now(),
      riskScore: riskAssessment.score,
      deviceInfo,
      locationInfo,
      behavioralMetrics
    });
    
    // Start continuous verification if enabled
    if (this.continuousVerification) {
      this.startContinuousVerification(userId, token);
    }
    
    return token;
  }
  
  /**
   * Start continuous verification for a user
   */
  public startContinuousVerification(userId: string, authToken: AuthToken): void {
    const context = this.userContext.get(userId);
    if (!context) {
      console.warn(`No context found for user ${userId}, cannot start continuous verification`);
      return;
    }
    
    // Clear any existing interval
    if (context.verificationInterval) {
      clearInterval(context.verificationInterval);
    }
    
    // Set up continuous verification interval
    const verificationInterval = setInterval(async () => {
      try {
        // Gather current user context
        const currentContext = await this.gatherUserContext(userId);
        if (!currentContext) {
          console.warn(`Failed to gather context for user ${userId}`);
          return;
        }
        
        // Verify user context against the token
        const verificationResult = await this.verifyUserContext(userId, authToken, currentContext);
        
        if (!verificationResult.valid) {
          // Take appropriate action based on verification failure
          this.handleVerificationFailure(userId, verificationResult.reason || 'Unknown reason');
        } else {
          // Update last verified timestamp
          const updatedContext = this.userContext.get(userId);
          if (updatedContext) {
            updatedContext.lastVerified = Date.now();
            this.userContext.set(userId, updatedContext);
          }
        }
      } catch (error) {
        console.error(`Error during continuous verification for user ${userId}:`, error);
      }
    }, this.verificationInterval);
    
    // Update the context with the verification interval
    context.verificationInterval = verificationInterval;
    this.userContext.set(userId, context);
  }
  
  /**
   * Stop continuous verification for a user
   */
  public stopContinuousVerification(userId: string): void {
    const context = this.userContext.get(userId);
    if (!context || !context.verificationInterval) {
      return;
    }
    
    clearInterval(context.verificationInterval);
    context.verificationInterval = undefined;
    this.userContext.set(userId, context);
  }
  
  /**
   * Verify a user's identity based on their current token
   */
  public async verifyIdentity(authToken: AuthToken): Promise<VerificationResponse> {
    const userId = authToken.userId;
    const storedContext = this.userContext.get(userId);
    
    if (!storedContext) {
      return {
        valid: false,
        reason: 'No stored context for this user'
      };
    }
    
    // Check token expiration
    if (Date.now() > authToken.expiresAt) {
      return {
        valid: false,
        reason: 'Token expired'
      };
    }
    
    // Gather current context for verification
    const currentContext = await this.gatherUserContext(userId);
    if (!currentContext) {
      return {
        valid: false,
        reason: 'Failed to gather current context'
      };
    }
    
    // Verify the user context
    return this.verifyUserContext(userId, authToken, currentContext);
  }
  
  /**
   * Get the current risk assessment for a user
   */
  public async getUserRiskAssessment(userId: string): Promise<RiskAssessment | null> {
    const context = this.userContext.get(userId);
    if (!context) {
      return null;
    }
    
    const assessment = await this.riskEngine.assessRisk(userId, {
      deviceInfo: context.deviceInfo,
      locationInfo: context.locationInfo,
      behavioralMetrics: context.behavioralMetrics
    });
    
    return assessment;
  }
  
  /**
   * Logout a user and clean up their verification context
   */
  public logout(userId: string): void {
    // Stop continuous verification
    this.stopContinuousVerification(userId);
    
    // Remove user context
    this.userContext.delete(userId);
    
    console.log(`User ${userId} logged out from QuantumGuard`);
  }
  
  // Private methods
  
  /**
   * Verify the primary credential for a user
   */
  private async verifyPrimaryCredential(userId: string, credential: string): Promise<boolean> {
    // In a real implementation, this would verify against stored credentials
    // For the prototype, we'll accept any non-empty credential
    
    return credential && credential.length > 0;
  }
  
  /**
   * Verify secondary authentication factors
   */
  private async verifySecondaryFactors(userId: string, factors: AuthFactor[]): Promise<boolean> {
    // If no factors provided, assume success (would be stricter in production)
    if (!factors || factors.length === 0) {
      return true;
    }
    
    // Process each factor
    for (const factor of factors) {
      let factorValid = false;
      
      switch (factor.type) {
        case 'totp':
          // Verify TOTP code
          factorValid = this.verifyTOTPFactor(userId, factor.value);
          break;
          
        case 'biometric':
          // Simulate biometric verification
          factorValid = true;
          break;
          
        case 'device':
          // Verify device trust
          factorValid = this.verifyDeviceFactor(factor);
          break;
          
        case 'location':
          // Verify location trust
          factorValid = this.verifyLocationFactor(factor);
          break;
          
        case 'behavior':
          // Verify behavioral patterns
          factorValid = this.verifyBehavioralFactor(factor);
          break;
          
        default:
          console.warn(`Unknown factor type: ${factor.type}`);
          factorValid = false;
      }
      
      if (!factorValid) {
        console.warn(`Factor verification failed for type: ${factor.type}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Verify a TOTP (Time-based One-Time Password) factor
   */
  private verifyTOTPFactor(userId: string, code: string): boolean {
    // In a real implementation, this would verify against a stored secret
    // For the prototype, we'll accept any 6-digit code
    
    return /^\d{6}$/.test(code);
  }
  
  /**
   * Verify a device trust factor
   */
  private verifyDeviceFactor(factor: AuthFactor): boolean {
    // In a real implementation, this would check device fingerprints
    return true;
  }
  
  /**
   * Verify a location trust factor
   */
  private verifyLocationFactor(factor: AuthFactor): boolean {
    // In a real implementation, this would check location against known safe locations
    return true;
  }
  
  /**
   * Verify a behavioral factor
   */
  private verifyBehavioralFactor(factor: AuthFactor): boolean {
    // In a real implementation, this would check behavioral biometrics
    return true;
  }
  
  /**
   * Generate a context-aware authentication token
   */
  private generateContextAwareToken(userId: string, riskAssessment: RiskAssessment): AuthToken {
    // Calculate permissions based on risk level
    const permissions = this.calculatePermissionsForRisk(riskAssessment.level);
    
    // Calculate expiration time based on risk level
    const expiryTime = this.calculateExpiryForRisk(riskAssessment.level);
    
    // Generate token
    return {
      token: `qg_${generateSecureId()}`,
      userId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + expiryTime,
      permissions,
      metadata: {
        riskLevel: riskAssessment.level,
        riskScore: riskAssessment.score,
        authFactors: ['primary'] // Would include secondary factors in real implementation
      }
    };
  }
  
  /**
   * Calculate permissions based on risk level
   */
  private calculatePermissionForRisk(riskLevel: 'low' | 'medium' | 'high' | 'critical'): string[] {
    const basePermissions = ['view:profile', 'read:basic'];
    
    switch (riskLevel) {
      case 'low':
        return [
          ...basePermissions,
          'transaction:create',
          'settings:edit',
          'wallet:full',
          'admin:basic'
        ];
        
      case 'medium':
        return [
          ...basePermissions,
          'transaction:create',
          'settings:edit',
          'wallet:basic'
        ];
        
      case 'high':
        return [
          ...basePermissions,
          'transaction:view',
          'settings:view'
        ];
        
      case 'critical':
        return [
          ...basePermissions
        ];
        
      default:
        return basePermissions;
    }
  }
  
  /**
   * Calculate expiry time based on risk level
   */
  private calculateExpiryForRisk(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
    // Define expiry times in milliseconds
    const HOUR = 3600000;
    
    switch (riskLevel) {
      case 'low':
        return 24 * HOUR; // 24 hours
        
      case 'medium':
        return 8 * HOUR; // 8 hours
        
      case 'high':
        return 2 * HOUR; // 2 hours
        
      case 'critical':
        return 0.5 * HOUR; // 30 minutes
        
      default:
        return 4 * HOUR; // 4 hours default
    }
  }
  
  /**
   * Gather current context information for a user
   */
  private async gatherUserContext(userId: string): Promise<any> {
    try {
      // Collect current device, location, and behavioral information
      const deviceInfo = await this.collectDeviceInfo();
      const locationInfo = await this.getSecureLocation();
      const behavioralMetrics = await this.collectBehavioralData();
      
      return {
        userId,
        deviceInfo,
        locationInfo,
        behavioralMetrics,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error gathering user context for ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Verify current user context against stored context
   */
  private async verifyUserContext(
    userId: string,
    authToken: AuthToken,
    currentContext: any
  ): Promise<VerificationResponse> {
    const storedContext = this.userContext.get(userId);
    if (!storedContext) {
      return {
        valid: false,
        reason: 'No stored context available'
      };
    }
    
    // Perform risk assessment with current context
    const riskAssessment = await this.riskEngine.assessRisk(userId, currentContext);
    
    // If risk level has increased significantly, trigger re-authentication
    if (this.isRiskLevelIncreased(storedContext.riskScore || 0, riskAssessment.score)) {
      return {
        valid: false,
        reason: 'Risk level increased significantly',
        riskLevel: riskAssessment.level
      };
    }
    
    // Check if the device has changed drastically
    if (this.hasDeviceChanged(storedContext.deviceInfo, currentContext.deviceInfo)) {
      return {
        valid: false,
        reason: 'Device characteristics changed significantly',
        riskLevel: riskAssessment.level
      };
    }
    
    // Check if location has changed drastically
    if (this.hasLocationChanged(storedContext.locationInfo, currentContext.locationInfo)) {
      // For demo purposes, we'll allow location changes but note it
      console.log('Location changed significantly, but allowing for demo');
    }
    
    // Context verified successfully
    return {
      valid: true,
      riskLevel: riskAssessment.level
    };
  }
  
  /**
   * Handle verification failures appropriately
   */
  private handleVerificationFailure(userId: string, reason: string): void {
    console.warn(`Verification failed for user ${userId}: ${reason}`);
    
    // In a real implementation, we would take appropriate actions based on the failure reason
    // For now, we'll just display a notification
    toast.warning('Your security context has changed. Please re-authenticate for security.');
    
    // Clean up the user context
    this.stopContinuousVerification(userId);
    this.userContext.delete(userId);
  }
  
  /**
   * Check if risk level has increased significantly
   */
  private isRiskLevelIncreased(previousScore: number, currentScore: number): boolean {
    // Consider a 25% increase in risk score significant
    return currentScore > previousScore * 1.25;
  }
  
  /**
   * Check if device characteristics have changed significantly
   */
  private hasDeviceChanged(storedDevice?: DeviceInfo, currentDevice?: DeviceInfo): boolean {
    if (!storedDevice || !currentDevice) return false;
    
    // Check critical device characteristics
    if (storedDevice.userAgent !== currentDevice.userAgent) return true;
    if (storedDevice.platform !== currentDevice.platform) return true;
    
    return false;
  }
  
  /**
   * Check if location has changed significantly
   */
  private hasLocationChanged(storedLocation?: LocationInfo, currentLocation?: LocationInfo): boolean {
    if (!storedLocation || !currentLocation) return false;
    if (!storedLocation.latitude || !storedLocation.longitude || 
        !currentLocation.latitude || !currentLocation.longitude) {
      return false;
    }
    
    // Calculate distance between locations
    const distance = this.calculateDistance(
      storedLocation.latitude, storedLocation.longitude,
      currentLocation.latitude, currentLocation.longitude
    );
    
    // Consider a distance greater than 50km significant
    return distance > 50;
  }
  
  /**
   * Calculate distance between two coordinates in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * Collect device information
   */
  private async collectDeviceInfo(): Promise<DeviceInfo> {
    // In a real implementation, this would collect actual device information
    // For the prototype, we'll return simulated data
    
    return {
      deviceId: 'browser_' + Math.random().toString(36).substring(2),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
      screenResolution: typeof window !== 'undefined' ? 
        `${window.screen.width}x${window.screen.height}` : '1920x1080',
      languages: typeof navigator !== 'undefined' ? 
        Array.from(navigator.languages || [navigator.language]) : ['en-US'],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
  
  /**
   * Get secure location information
   */
  private async getSecureLocation(): Promise<LocationInfo> {
    // In a real implementation, this would use the Geolocation API
    // For the prototype, we'll return simulated data
    
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
      timestamp: Date.now(),
      ipAddress: '192.168.1.1'
    };
  }
  
  /**
   * Collect behavioral metrics
   */
  private async collectBehavioralData(): Promise<BehavioralMetrics> {
    // In a real implementation, this would collect actual behavioral data
    // For the prototype, we'll return simulated data
    
    return {
      typingPattern: [150, 200, 180, 220, 170],
      mouseMovements: [5, 10, 15, 20, 25],
      touchDynamics: [],
      interactionFrequency: 0.5,
      lastActivity: Date.now()
    };
  }
  
  /**
   * Calculate permissions based on risk level
   */
  private calculatePermissionsForRisk(riskLevel: 'low' | 'medium' | 'high' | 'critical'): string[] {
    const basePermissions = ['view:profile', 'read:basic'];
    
    switch (riskLevel) {
      case 'low':
        return [
          ...basePermissions,
          'transaction:create',
          'settings:edit',
          'wallet:full',
          'admin:basic'
        ];
        
      case 'medium':
        return [
          ...basePermissions,
          'transaction:create',
          'settings:edit',
          'wallet:basic'
        ];
        
      case 'high':
        return [
          ...basePermissions,
          'transaction:view',
          'settings:view'
        ];
        
      case 'critical':
        return [
          ...basePermissions
        ];
        
      default:
        return basePermissions;
    }
  }
}

/**
 * Risk assessment engine for evaluating security risks
 */
class RiskAssessmentEngine {
  private riskThresholds = {
    low: 25,
    medium: 50,
    high: 75
  };
  
  /**
   * Initialize the risk engine
   */
  public async initialize(): Promise<boolean> {
    // In a real implementation, this would load risk models
    return true;
  }
  
  /**
   * Assess authentication risk for a user
   */
  public async assessAuthenticationRisk(
    userId: string,
    context: {
      deviceInfo?: DeviceInfo;
      locationInfo?: LocationInfo;
      behavioralMetrics?: BehavioralMetrics;
    }
  ): Promise<RiskAssessment> {
    return this.assessRisk(userId, context);
  }
  
  /**
   * Assess security risk for a user
   */
  public async assessRisk(
    userId: string,
    context: {
      deviceInfo?: DeviceInfo;
      locationInfo?: LocationInfo;
      behavioralMetrics?: BehavioralMetrics;
    }
  ): Promise<RiskAssessment> {
    // Calculate individual risk factors
    const deviceTrust = this.calculateDeviceTrust(context.deviceInfo);
    const locationTrust = this.calculateLocationTrust(context.locationInfo);
    const behaviorTrust = this.calculateBehaviorTrust(context.behavioralMetrics);
    const timeTrust = this.calculateTimeTrust();
    
    // Calculate overall risk score (0-100, higher is riskier)
    const score = Math.round(
      (deviceTrust * 0.3) +
      (locationTrust * 0.3) +
      (behaviorTrust * 0.3) +
      (timeTrust * 0.1)
    );
    
    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score < this.riskThresholds.low) {
      level = 'low';
    } else if (score < this.riskThresholds.medium) {
      level = 'medium';
    } else if (score < this.riskThresholds.high) {
      level = 'high';
    } else {
      level = 'critical';
    }
    
    return {
      score,
      level,
      factors: {
        deviceTrust,
        locationTrust,
        behaviorTrust,
        timeTrust
      },
      timestamp: Date.now()
    };
  }
  
  /**
   * Calculate device trust score (0-100)
   */
  private calculateDeviceTrust(deviceInfo?: DeviceInfo): number {
    if (!deviceInfo) return 50; // Neutral
    
    // In a real implementation, this would evaluate device characteristics
    // For the prototype, return a random but consistent score based on user agent
    
    const hash = this.simpleHash(deviceInfo.userAgent || '');
    return Math.min(90, Math.max(10, hash % 40 + 30)); // Between 30-70
  }
  
  /**
   * Calculate location trust score (0-100)
   */
  private calculateLocationTrust(locationInfo?: LocationInfo): number {
    if (!locationInfo) return 50; // Neutral
    
    // In a real implementation, this would evaluate location against known patterns
    // For the prototype, return a random but consistent score based on coordinates
    
    const coordStr = `${locationInfo.latitude || 0},${locationInfo.longitude || 0}`;
    const hash = this.simpleHash(coordStr);
    return Math.min(90, Math.max(10, hash % 40 + 30)); // Between 30-70
  }
  
  /**
   * Calculate behavior trust score (0-100)
   */
  private calculateBehaviorTrust(behavioralMetrics?: BehavioralMetrics): number {
    if (!behavioralMetrics) return 50; // Neutral
    
    // In a real implementation, this would evaluate behavioral patterns
    // For the prototype, return a random but consistent score
    
    const hash = this.simpleHash(JSON.stringify(behavioralMetrics));
    return Math.min(90, Math.max(10, hash % 40 + 30)); // Between 30-70
  }
  
  /**
   * Calculate time-based trust score (0-100)
   */
  private calculateTimeTrust(): number {
    // In a real implementation, this would evaluate time patterns
    // For the prototype, base it on the hour of day
    
    const hour = new Date().getHours();
    
    // Business hours (9am-5pm) are lower risk
    if (hour >= 9 && hour <= 17) {
      return 30; // Low risk during business hours
    } else if (hour >= 6 && hour <= 22) {
      return 50; // Medium risk during evening
    } else {
      return 80; // High risk during night
    }
  }
  
  /**
   * Simple hash function for generating consistent values
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export default QuantumGuard;