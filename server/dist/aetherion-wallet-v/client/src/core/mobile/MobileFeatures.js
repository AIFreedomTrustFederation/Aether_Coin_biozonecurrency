"use strict";
/**
 * MobileFeatures.ts
 * Utility for detecting and managing mobile device features and capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class for detecting and managing mobile device features and capabilities
 */
class MobileFeatures {
    constructor() {
        this.changeCallbacks = [];
        // Initialize with default values
        this.capabilities = this.initCapabilities();
        // Setup listeners for changes
        this.setupListeners();
    }
    /**
     * Initialize device capabilities
     */
    initCapabilities() {
        const isClient = typeof window !== 'undefined' && typeof navigator !== 'undefined';
        if (!isClient) {
            // Server-side rendering fallback
            return this.getDefaultCapabilities();
        }
        // Detect mobile/tablet
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipod|android|blackberry|opera mini|opera mobi|iemobile/i.test(userAgent);
        const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) ||
            (window.innerWidth > 640 && window.innerWidth <= 1024 && window.innerHeight > 480);
        const isDesktop = !isMobile && !isTablet;
        // Detect touchscreen
        const hasTouchscreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // Detect camera
        const hasCamera = isClient &&
            ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
        // Detect vibration
        const hasVibration = isClient && 'vibrate' in navigator;
        // Detect geolocation
        const hasGeolocation = isClient && 'geolocation' in navigator;
        // Detect NFC (approximate - not reliable)
        const hasNfc = isClient &&
            (isMobile || isTablet) &&
            ('NDEFReader' in window || 'nfc' in navigator);
        // Detect biometric capabilities (approximate - not reliable)
        const hasBiometrics = isClient &&
            ((('FaceID' in window) || ('TouchID' in window)) ||
                ('credentials' in navigator && 'PublicKeyCredential' in window));
        // Detect AR support (approximate - not reliable)
        const hasArSupport = isClient &&
            (('xr' in navigator) ||
                ('ARKit' in window) ||
                ('ARCore' in window) ||
                (isMobile && /arcore|arkit/i.test(userAgent)));
        // Detect notifications
        const hasNotifications = isClient && 'Notification' in window;
        // Detect battery API
        const hasBatteryApi = isClient && 'getBattery' in navigator;
        // Detect offline support capabilities
        const hasOfflineSupport = isClient &&
            ('serviceWorker' in navigator && 'caches' in window);
        // Estimate CPU units
        let cpuUnits = 5; // Default middle value
        if (isClient && 'hardwareConcurrency' in navigator) {
            const cores = navigator.hardwareConcurrency || 2;
            cpuUnits = Math.min(10, Math.max(1, Math.ceil(cores / 2)));
        }
        // Detect Web Share API
        const hasShareApi = isClient && 'share' in navigator;
        // Get screen size
        const screenSize = {
            width: isClient ? window.innerWidth : 0,
            height: isClient ? window.innerHeight : 0,
            pixelRatio: isClient ? (window.devicePixelRatio || 1) : 1
        };
        // Detect orientation
        let deviceOrientation = 'unknown';
        if (isClient) {
            deviceOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        }
        // Get connection info
        const connection = {
            type: 'unknown',
            downlinkSpeed: 0,
            rtt: 0
        };
        if (isClient && 'connection' in navigator) {
            const conn = navigator.connection;
            if (conn) {
                connection.type = conn.effectiveType || 'unknown';
                connection.downlinkSpeed = conn.downlink || 0;
                connection.rtt = conn.rtt || 0;
            }
        }
        return {
            isAvailable: isClient && (isMobile || isTablet),
            isMobile,
            isTablet,
            isDesktop,
            hasTouchscreen,
            hasCamera,
            hasVibration,
            hasGeolocation,
            hasNfc,
            hasBiometrics,
            hasArSupport,
            hasNotifications,
            hasBatteryApi,
            hasOfflineSupport,
            hasCPUnits: cpuUnits,
            hasShareApi,
            screenSize,
            deviceOrientation,
            connection
        };
    }
    /**
     * Get default capabilities for server-side rendering
     */
    getDefaultCapabilities() {
        return {
            isAvailable: false,
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            hasTouchscreen: false,
            hasCamera: false,
            hasVibration: false,
            hasGeolocation: false,
            hasNfc: false,
            hasBiometrics: false,
            hasArSupport: false,
            hasNotifications: false,
            hasBatteryApi: false,
            hasOfflineSupport: false,
            hasCPUnits: 5,
            hasShareApi: false,
            screenSize: {
                width: 1920,
                height: 1080,
                pixelRatio: 1
            },
            deviceOrientation: 'landscape',
            connection: {
                type: 'unknown',
                downlinkSpeed: 0,
                rtt: 0
            }
        };
    }
    /**
     * Setup event listeners for device changes
     */
    setupListeners() {
        if (typeof window === 'undefined')
            return;
        // Listen for resize events to update screen size and orientation
        window.addEventListener('resize', () => {
            this.capabilities.screenSize.width = window.innerWidth;
            this.capabilities.screenSize.height = window.innerHeight;
            this.capabilities.deviceOrientation =
                window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
            this.notifyChanges();
        });
        // Listen for connection changes
        if ('connection' in navigator && navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                const conn = navigator.connection;
                this.capabilities.connection.type = conn.effectiveType || 'unknown';
                this.capabilities.connection.downlinkSpeed = conn.downlink || 0;
                this.capabilities.connection.rtt = conn.rtt || 0;
                this.notifyChanges();
            });
        }
        // Listen for online/offline events
        window.addEventListener('online', () => {
            if (this.capabilities.connection.type === 'none') {
                this.capabilities.connection.type = 'unknown';
                this.notifyChanges();
            }
        });
        window.addEventListener('offline', () => {
            this.capabilities.connection.type = 'none';
            this.notifyChanges();
        });
    }
    /**
     * Notify all registered callbacks of capability changes
     */
    notifyChanges() {
        this.changeCallbacks.forEach(callback => {
            try {
                callback();
            }
            catch (error) {
                console.error('Error in capability change callback:', error);
            }
        });
    }
    /**
     * Register a callback for capability changes
     * @param callback Function to call when capabilities change
     * @returns Function to unregister the callback
     */
    onCapabilitiesChanged(callback) {
        this.changeCallbacks.push(callback);
        // Return a function to remove the callback
        return () => {
            this.changeCallbacks = this.changeCallbacks.filter(cb => cb !== callback);
        };
    }
    /**
     * Force a refresh of the device capabilities
     */
    refreshCapabilities() {
        this.capabilities = this.initCapabilities();
        this.notifyChanges();
        return this.getAllCapabilities();
    }
    /**
     * Get the current device capabilities
     */
    getAllCapabilities() {
        return { ...this.capabilities };
    }
    /**
     * Check if running on a mobile device
     */
    get isMobile() {
        return this.capabilities.isMobile;
    }
    /**
     * Check if running on a tablet device
     */
    get isTablet() {
        return this.capabilities.isTablet;
    }
    /**
     * Check if running on a desktop device
     */
    get isDesktop() {
        return this.capabilities.isDesktop;
    }
    /**
     * Check if mobile features are available
     */
    get isAvailable() {
        return this.capabilities.isAvailable;
    }
    /**
     * Check if the device has a touchscreen
     */
    get hasTouchscreen() {
        return this.capabilities.hasTouchscreen;
    }
    /**
     * Check if the device has a camera
     */
    get hasCamera() {
        return this.capabilities.hasCamera;
    }
    /**
     * Check if the device has vibration capabilities
     */
    get hasVibration() {
        return this.capabilities.hasVibration;
    }
    /**
     * Check if the device has geolocation capabilities
     */
    get hasGeolocation() {
        return this.capabilities.hasGeolocation;
    }
    /**
     * Check if the device has NFC capabilities
     */
    get isNfcAvailable() {
        return this.capabilities.hasNfc;
    }
    /**
     * Check if the device has biometric capabilities
     */
    get isBiometricsAvailable() {
        return this.capabilities.hasBiometrics;
    }
    /**
     * Check if the device has AR support
     */
    get isArSupported() {
        return this.capabilities.hasArSupport;
    }
    /**
     * Check if the device supports notifications
     */
    get hasNotifications() {
        return this.capabilities.hasNotifications;
    }
    /**
     * Check if the device has a battery API
     */
    get hasBatteryApi() {
        return this.capabilities.hasBatteryApi;
    }
    /**
     * Check if the device has offline support
     */
    get hasOfflineSupport() {
        return this.capabilities.hasOfflineSupport;
    }
    /**
     * Get the device's CPU units (1-10 scale)
     */
    get cpuUnits() {
        return this.capabilities.hasCPUnits;
    }
    /**
     * Check if the device has Web Share API
     */
    get hasShareApi() {
        return this.capabilities.hasShareApi;
    }
    /**
     * Get the device's screen size
     */
    get screenSize() {
        return { ...this.capabilities.screenSize };
    }
    /**
     * Get the device's orientation
     */
    get deviceOrientation() {
        return this.capabilities.deviceOrientation;
    }
    /**
     * Get the device's connection info
     */
    get connection() {
        return { ...this.capabilities.connection };
    }
    /**
     * Trigger device vibration if available
     * @param pattern Vibration pattern in milliseconds
     * @returns Boolean indicating if vibration was triggered
     */
    vibrate(pattern) {
        if (!this.capabilities.hasVibration) {
            return false;
        }
        try {
            navigator.vibrate(pattern);
            return true;
        }
        catch (error) {
            console.error('Vibration error:', error);
            return false;
        }
    }
    /**
     * Share content using the Web Share API if available
     * @param data Share data (title, text, url)
     * @returns Promise resolving to a boolean indicating success
     */
    async share(data) {
        if (!this.capabilities.hasShareApi) {
            return false;
        }
        try {
            await navigator.share(data);
            return true;
        }
        catch (error) {
            console.error('Share error:', error);
            return false;
        }
    }
    /**
     * Request device wake lock to prevent screen from turning off
     * @returns Promise resolving to a function to release the wake lock, or null if not supported
     */
    async requestWakeLock() {
        if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
            return null;
        }
        try {
            const wakeLock = await navigator.wakeLock.request('screen');
            return () => {
                try {
                    wakeLock.release();
                }
                catch (error) {
                    console.error('Wake lock release error:', error);
                }
            };
        }
        catch (error) {
            console.error('Wake lock request error:', error);
            return null;
        }
    }
}
// Export a singleton instance
const mobileFeatures = new MobileFeatures();
exports.default = mobileFeatures;
