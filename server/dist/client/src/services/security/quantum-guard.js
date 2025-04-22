"use strict";
/**
 * QuantumGuard™ Identity Verification System
 *
 * A multi-factor authentication system that continuously verifies user identity
 * and implements dynamic access control based on context and risk assessment.
 * Inspired by quantum principles and zero-trust architecture.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumGuard = void 0;
const sonner_1 = require("sonner");
const crypto_utils_1 = require("@/services/security/crypto-utils");
/**
 * Main QuantumGuard class providing zero-trust authentication and continuous verification
 */
class QuantumGuard {
    constructor() {
        this.userContext = new Map();
        this.continuousVerification = true;
        this.verificationInterval = 60000; // 1 minute
        this.riskEngine = new RiskAssessmentEngine();
    }
    /**
     * Initialize the QuantumGuard system
     */
    async initialize() {
        try {
            console.log("Initializing QuantumGuard identity verification system...");
            // Initialize the risk assessment engine
            await this.riskEngine.initialize();
            return true;
        }
        catch (error) {
            console.error("Failed to initialize QuantumGuard:", error);
            return false;
        }
    }
    /**
     * Authenticate a user with multiple factors
     */
    async authenticateUser(userId, primaryCredential, secondaryFactors = []) {
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
    startContinuousVerification(userId, authToken) {
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
                }
                else {
                    // Update last verified timestamp
                    const updatedContext = this.userContext.get(userId);
                    if (updatedContext) {
                        updatedContext.lastVerified = Date.now();
                        this.userContext.set(userId, updatedContext);
                    }
                }
            }
            catch (error) {
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
    stopContinuousVerification(userId) {
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
    async verifyIdentity(authToken) {
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
    async getUserRiskAssessment(userId) {
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
    logout(userId) {
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
    async verifyPrimaryCredential(userId, credential) {
        // In a real implementation, this would verify against stored credentials
        // For the prototype, we'll accept any non-empty credential
        return credential && credential.length > 0;
    }
    /**
     * Verify secondary authentication factors
     */
    async verifySecondaryFactors(userId, factors) {
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
    verifyTOTPFactor(userId, code) {
        // In a real implementation, this would verify against a stored secret
        // For the prototype, we'll accept any 6-digit code
        return /^\d{6}$/.test(code);
    }
    /**
     * Verify a device trust factor
     */
    verifyDeviceFactor(factor) {
        // In a real implementation, this would check device fingerprints
        return true;
    }
    /**
     * Verify a location trust factor
     */
    verifyLocationFactor(factor) {
        // In a real implementation, this would check location against known safe locations
        return true;
    }
    /**
     * Verify a behavioral factor
     */
    verifyBehavioralFactor(factor) {
        // In a real implementation, this would check behavioral biometrics
        return true;
    }
    /**
     * Generate a context-aware authentication token
     */
    generateContextAwareToken(userId, riskAssessment) {
        // Calculate permissions based on risk level
        const permissions = this.calculatePermissionsForRisk(riskAssessment.level);
        // Calculate expiration time based on risk level
        const expiryTime = this.calculateExpiryForRisk(riskAssessment.level);
        // Generate token
        return {
            token: `qg_${(0, crypto_utils_1.generateSecureId)()}`,
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
    calculatePermissionForRisk(riskLevel) {
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
    calculateExpiryForRisk(riskLevel) {
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
    async gatherUserContext(userId) {
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
        }
        catch (error) {
            console.error(`Error gathering user context for ${userId}:`, error);
            return null;
        }
    }
    /**
     * Verify current user context against stored context
     */
    async verifyUserContext(userId, authToken, currentContext) {
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
    handleVerificationFailure(userId, reason) {
        console.warn(`Verification failed for user ${userId}: ${reason}`);
        // In a real implementation, we would take appropriate actions based on the failure reason
        // For now, we'll just display a notification
        sonner_1.toast.warning('Your security context has changed. Please re-authenticate for security.');
        // Clean up the user context
        this.stopContinuousVerification(userId);
        this.userContext.delete(userId);
    }
    /**
     * Check if risk level has increased significantly
     */
    isRiskLevelIncreased(previousScore, currentScore) {
        // Consider a 25% increase in risk score significant
        return currentScore > previousScore * 1.25;
    }
    /**
     * Check if device characteristics have changed significantly
     */
    hasDeviceChanged(storedDevice, currentDevice) {
        if (!storedDevice || !currentDevice)
            return false;
        // Check critical device characteristics
        if (storedDevice.userAgent !== currentDevice.userAgent)
            return true;
        if (storedDevice.platform !== currentDevice.platform)
            return true;
        return false;
    }
    /**
     * Check if location has changed significantly
     */
    hasLocationChanged(storedLocation, currentLocation) {
        if (!storedLocation || !currentLocation)
            return false;
        if (!storedLocation.latitude || !storedLocation.longitude ||
            !currentLocation.latitude || !currentLocation.longitude) {
            return false;
        }
        // Calculate distance between locations
        const distance = this.calculateDistance(storedLocation.latitude, storedLocation.longitude, currentLocation.latitude, currentLocation.longitude);
        // Consider a distance greater than 50km significant
        return distance > 50;
    }
    /**
     * Calculate distance between two coordinates in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    /**
     * Collect device information
     */
    async collectDeviceInfo() {
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
    async getSecureLocation() {
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
    async collectBehavioralData() {
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
    calculatePermissionsForRisk(riskLevel) {
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
exports.QuantumGuard = QuantumGuard;
/**
 * Risk assessment engine for evaluating security risks
 */
class RiskAssessmentEngine {
    constructor() {
        this.riskThresholds = {
            low: 25,
            medium: 50,
            high: 75
        };
    }
    /**
     * Initialize the risk engine
     */
    async initialize() {
        // In a real implementation, this would load risk models
        return true;
    }
    /**
     * Assess authentication risk for a user
     */
    async assessAuthenticationRisk(userId, context) {
        return this.assessRisk(userId, context);
    }
    /**
     * Assess security risk for a user
     */
    async assessRisk(userId, context) {
        // Calculate individual risk factors
        const deviceTrust = this.calculateDeviceTrust(context.deviceInfo);
        const locationTrust = this.calculateLocationTrust(context.locationInfo);
        const behaviorTrust = this.calculateBehaviorTrust(context.behavioralMetrics);
        const timeTrust = this.calculateTimeTrust();
        // Calculate overall risk score (0-100, higher is riskier)
        const score = Math.round((deviceTrust * 0.3) +
            (locationTrust * 0.3) +
            (behaviorTrust * 0.3) +
            (timeTrust * 0.1));
        // Determine risk level
        let level;
        if (score < this.riskThresholds.low) {
            level = 'low';
        }
        else if (score < this.riskThresholds.medium) {
            level = 'medium';
        }
        else if (score < this.riskThresholds.high) {
            level = 'high';
        }
        else {
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
    calculateDeviceTrust(deviceInfo) {
        if (!deviceInfo)
            return 50; // Neutral
        // In a real implementation, this would evaluate device characteristics
        // For the prototype, return a random but consistent score based on user agent
        const hash = this.simpleHash(deviceInfo.userAgent || '');
        return Math.min(90, Math.max(10, hash % 40 + 30)); // Between 30-70
    }
    /**
     * Calculate location trust score (0-100)
     */
    calculateLocationTrust(locationInfo) {
        if (!locationInfo)
            return 50; // Neutral
        // In a real implementation, this would evaluate location against known patterns
        // For the prototype, return a random but consistent score based on coordinates
        const coordStr = `${locationInfo.latitude || 0},${locationInfo.longitude || 0}`;
        const hash = this.simpleHash(coordStr);
        return Math.min(90, Math.max(10, hash % 40 + 30)); // Between 30-70
    }
    /**
     * Calculate behavior trust score (0-100)
     */
    calculateBehaviorTrust(behavioralMetrics) {
        if (!behavioralMetrics)
            return 50; // Neutral
        // In a real implementation, this would evaluate behavioral patterns
        // For the prototype, return a random but consistent score
        const hash = this.simpleHash(JSON.stringify(behavioralMetrics));
        return Math.min(90, Math.max(10, hash % 40 + 30)); // Between 30-70
    }
    /**
     * Calculate time-based trust score (0-100)
     */
    calculateTimeTrust() {
        // In a real implementation, this would evaluate time patterns
        // For the prototype, base it on the hour of day
        const hour = new Date().getHours();
        // Business hours (9am-5pm) are lower risk
        if (hour >= 9 && hour <= 17) {
            return 30; // Low risk during business hours
        }
        else if (hour >= 6 && hour <= 22) {
            return 50; // Medium risk during evening
        }
        else {
            return 80; // High risk during night
        }
    }
    /**
     * Simple hash function for generating consistent values
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}
exports.default = QuantumGuard;
