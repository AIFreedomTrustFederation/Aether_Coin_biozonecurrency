"use strict";
/**
 * MobileMining.ts
 * Implements mobile-optimized cryptocurrency mining controls
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileMining = void 0;
/**
 * Class for handling mobile-optimized cryptocurrency mining
 * Includes power/battery optimization and thermal management
 */
class MobileMining {
    /**
     * Private constructor for singleton pattern
     */
    constructor() {
        this.worker = null;
        this.workerURL = '';
        this.batteryManager = null;
        this.statsInterval = null;
        this.hasBatteryApi = false;
        // Default mining options
        this.options = {
            algorithm: 'eco',
            threads: 1,
            throttle: 50,
            maxBatteryUsage: 80,
            pauseOnBatteryLow: true,
            pauseOnOverheat: true,
            mineOnlyWhenCharging: true,
            maxTemperature: 40,
            minHashRate: 10
        };
        // Initial stats
        this.stats = {
            status: 'idle',
            algorithm: 'eco',
            hashRate: 0,
            activeThreads: 0,
            targetThreads: 1,
            throttle: 50,
            totalHashes: 0,
            validShares: 0,
            rejectedShares: 0,
            blocksFound: 0,
            earnings: 0,
            startTime: null,
            duration: 0,
            batteryStatus: 'unknown',
            batteryLevel: 100,
            temperature: 25,
            lastError: null
        };
        this.initBatteryMonitoring();
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!MobileMining.instance) {
            MobileMining.instance = new MobileMining();
        }
        return MobileMining.instance;
    }
    /**
     * Initialize battery monitoring
     */
    async initBatteryMonitoring() {
        if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
            try {
                this.batteryManager = await navigator.getBattery();
                this.hasBatteryApi = true;
                // Update battery status
                this.updateBatteryStatus();
                // Add event listeners
                this.batteryManager.addEventListener('levelchange', this.updateBatteryStatus.bind(this));
                this.batteryManager.addEventListener('chargingchange', this.updateBatteryStatus.bind(this));
            }
            catch (error) {
                console.error('Failed to initialize battery monitoring:', error);
                this.hasBatteryApi = false;
            }
        }
        else {
            this.hasBatteryApi = false;
        }
    }
    /**
     * Update battery status from the battery manager
     */
    updateBatteryStatus() {
        if (!this.hasBatteryApi || !this.batteryManager) {
            return;
        }
        // Update battery level
        this.stats.batteryLevel = Math.floor(this.batteryManager.level * 100);
        // Update battery status
        if (this.batteryManager.charging) {
            this.stats.batteryStatus = 'charging';
        }
        else if (this.stats.batteryLevel <= 15) {
            this.stats.batteryStatus = 'critical';
        }
        else if (this.stats.batteryLevel <= 30) {
            this.stats.batteryStatus = 'low';
        }
        else {
            this.stats.batteryStatus = 'normal';
        }
        // Pause mining if battery is low and pauseOnBatteryLow is true
        if (this.stats.status === 'mining' &&
            this.options.pauseOnBatteryLow &&
            this.stats.batteryStatus === 'critical') {
            this.pauseMining('Battery level critical');
        }
        // Pause mining if mineOnlyWhenCharging is true and not charging
        if (this.stats.status === 'mining' &&
            this.options.mineOnlyWhenCharging &&
            !this.batteryManager.charging) {
            this.pauseMining('Device is not charging');
        }
        // Resume mining if conditions are met
        if (this.stats.status === 'paused') {
            const canResume = ((!this.options.pauseOnBatteryLow || this.stats.batteryStatus !== 'critical') &&
                (!this.options.mineOnlyWhenCharging || this.batteryManager.charging));
            if (canResume) {
                this.resumeMining();
            }
        }
    }
    /**
     * Start mining with the current options
     * @returns Promise resolving to a boolean indicating success
     */
    async startMining() {
        if (this.stats.status === 'mining' || this.stats.status === 'starting') {
            return false;
        }
        this.stats.status = 'starting';
        this.stats.lastError = null;
        try {
            // Check battery conditions
            if (this.hasBatteryApi && this.batteryManager) {
                if (this.options.mineOnlyWhenCharging && !this.batteryManager.charging) {
                    throw new Error('Mining is set to only run when charging');
                }
                if (this.options.pauseOnBatteryLow && this.stats.batteryStatus === 'critical') {
                    throw new Error('Battery level is too low for mining');
                }
            }
            // In a real implementation, this would create a Web Worker for mining
            // For our simulation, we'll just update the status
            // Simulate starting the mining process
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.stats.status = 'mining';
            this.stats.startTime = Date.now();
            this.stats.algorithm = this.options.algorithm;
            this.stats.activeThreads = this.options.threads;
            this.stats.targetThreads = this.options.threads;
            this.stats.throttle = this.options.throttle;
            // Start stats update interval
            this.startStatsInterval();
            return true;
        }
        catch (error) {
            console.error('Failed to start mining:', error);
            this.stats.status = 'error';
            this.stats.lastError = error instanceof Error ? error.message : 'Unknown error starting mining';
            return false;
        }
    }
    /**
     * Stop mining
     * @returns Promise resolving to a boolean indicating success
     */
    async stopMining() {
        if (this.stats.status === 'idle' || this.stats.status === 'stopping') {
            return false;
        }
        this.stats.status = 'stopping';
        try {
            // In a real implementation, this would terminate the Web Worker
            // Simulate stopping the mining process
            await new Promise(resolve => setTimeout(resolve, 500));
            // Stop stats update interval
            this.stopStatsInterval();
            // Reset mining stats but keep totals
            this.stats.status = 'idle';
            this.stats.hashRate = 0;
            this.stats.activeThreads = 0;
            this.stats.duration = this.stats.startTime ? Math.floor((Date.now() - this.stats.startTime) / 1000) : 0;
            this.stats.startTime = null;
            return true;
        }
        catch (error) {
            console.error('Failed to stop mining:', error);
            // Force stop in case of error
            this.stopStatsInterval();
            this.stats.status = 'idle';
            this.stats.lastError = error instanceof Error ? error.message : 'Unknown error stopping mining';
            return false;
        }
    }
    /**
     * Pause mining temporarily
     * @param reason Optional reason for pausing
     * @returns Boolean indicating if pausing was successful
     */
    pauseMining(reason) {
        if (this.stats.status !== 'mining') {
            return false;
        }
        try {
            // In a real implementation, this would pause the Web Worker
            this.stats.status = 'paused';
            if (reason) {
                this.stats.lastError = `Mining paused: ${reason}`;
            }
            return true;
        }
        catch (error) {
            console.error('Failed to pause mining:', error);
            return false;
        }
    }
    /**
     * Resume mining after being paused
     * @returns Boolean indicating if resuming was successful
     */
    resumeMining() {
        if (this.stats.status !== 'paused') {
            return false;
        }
        try {
            // Check conditions before resuming
            if (this.hasBatteryApi && this.batteryManager) {
                if (this.options.mineOnlyWhenCharging && !this.batteryManager.charging) {
                    return false;
                }
                if (this.options.pauseOnBatteryLow && this.stats.batteryStatus === 'critical') {
                    return false;
                }
            }
            // In a real implementation, this would resume the Web Worker
            this.stats.status = 'mining';
            this.stats.lastError = null;
            return true;
        }
        catch (error) {
            console.error('Failed to resume mining:', error);
            return false;
        }
    }
    /**
     * Update mining options
     * @param options New options to apply
     * @returns Boolean indicating if update was successful
     */
    updateOptions(options) {
        try {
            // Update options
            this.options = {
                ...this.options,
                ...options
            };
            // If mining is active, apply changes immediately
            if (this.stats.status === 'mining' || this.stats.status === 'paused') {
                // In a real implementation, this would update the Web Worker configuration
                // Update relevant stats
                this.stats.algorithm = this.options.algorithm;
                this.stats.targetThreads = this.options.threads;
                this.stats.throttle = this.options.throttle;
                // If we're mining, gradually adjust activeThreads to match targetThreads
                if (this.stats.status === 'mining') {
                    // This would be handled more gracefully in a real implementation
                    this.stats.activeThreads = this.options.threads;
                }
            }
            return true;
        }
        catch (error) {
            console.error('Failed to update mining options:', error);
            return false;
        }
    }
    /**
     * Get current mining stats
     * @returns Current mining statistics
     */
    getStats() {
        // Update duration if mining is active
        if ((this.stats.status === 'mining' || this.stats.status === 'paused') && this.stats.startTime) {
            this.stats.duration = Math.floor((Date.now() - this.stats.startTime) / 1000);
        }
        return { ...this.stats };
    }
    /**
     * Get current mining options
     * @returns Current mining options
     */
    getOptions() {
        return { ...this.options };
    }
    /**
     * Start the stats update interval
     */
    startStatsInterval() {
        // Stop existing interval if any
        this.stopStatsInterval();
        // Create new interval
        this.statsInterval = setInterval(() => {
            if (this.stats.status === 'mining') {
                // In a real implementation, this would get actual stats from the Web Worker
                // For our simulation, we'll generate realistic-looking stats
                // Simulate hash rate based on threads and throttle
                const baseHashRate = 100; // base hashes per second per thread
                const threadFactor = this.stats.activeThreads;
                const throttleFactor = this.stats.throttle / 100;
                // Randomize hash rate a bit to simulate real-world fluctuations
                const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
                this.stats.hashRate = Math.floor(baseHashRate * threadFactor * throttleFactor * randomFactor);
                // Increment total hashes
                this.stats.totalHashes += this.stats.hashRate;
                // Simulate finding shares occasionally
                if (Math.random() < 0.05) { // 5% chance each update
                    this.stats.validShares += 1;
                }
                // Simulate rejected shares very rarely
                if (Math.random() < 0.01) { // 1% chance each update
                    this.stats.rejectedShares += 1;
                }
                // Simulate finding blocks extremely rarely
                if (Math.random() < 0.001) { // 0.1% chance each update
                    this.stats.blocksFound += 1;
                    this.stats.earnings += 50; // Simulate reward
                }
                // Simulate temperature fluctuations
                const baseTempIncrease = this.stats.activeThreads * 0.5; // 0.5°C per thread
                const throttleEffect = 1 - (this.stats.throttle / 200); // Throttle reduces temperature
                const tempIncrease = baseTempIncrease * throttleEffect;
                // Ambient temp (25°C) + increase from mining
                this.stats.temperature = 25 + tempIncrease;
                // Simulate overheating protection
                if (this.options.pauseOnOverheat && this.stats.temperature >= this.options.maxTemperature) {
                    this.pauseMining('Device temperature too high');
                }
                // Update battery status
                this.updateBatteryStatus();
            }
        }, 1000); // Update every second
    }
    /**
     * Stop the stats update interval
     */
    stopStatsInterval() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
    }
    /**
     * Get the available mining algorithms
     */
    getAvailableAlgorithms() {
        return ['quantum-resistant', 'standard', 'eco'];
    }
    /**
     * Get algorithm-specific statistics
     * @param algorithm The mining algorithm
     * @returns Algorithm-specific stats or null if unavailable
     */
    getAlgorithmStats(algorithm) {
        switch (algorithm) {
            case 'quantum-resistant':
                return {
                    name: 'Quantum-Resistant Algorithm',
                    description: 'Advanced algorithm resistant to quantum computing attacks',
                    efficiency: 70,
                    reward: 2.5,
                    difficulty: 85,
                    powerUsage: 90
                };
            case 'standard':
                return {
                    name: 'Standard Algorithm',
                    description: 'Balanced algorithm for normal mining operations',
                    efficiency: 85,
                    reward: 1.0,
                    difficulty: 50,
                    powerUsage: 70
                };
            case 'eco':
                return {
                    name: 'Eco-Friendly Algorithm',
                    description: 'Low-power algorithm optimized for mobile devices',
                    efficiency: 95,
                    reward: 0.5,
                    difficulty: 30,
                    powerUsage: 40
                };
            default:
                return null;
        }
    }
    /**
     * Get optimal mining settings based on device capabilities
     * @returns Recommended mining options for this device
     */
    getOptimalSettings() {
        // In a real implementation, this would analyze device capabilities
        // and determine the most efficient mining settings
        // For our simulation, we'll provide reasonable defaults based on device type
        const isHighEndDevice = typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 4;
        const isMidRangeDevice = typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 2;
        if (isHighEndDevice) {
            return {
                ...this.options,
                algorithm: 'standard',
                threads: Math.min(4, typeof navigator !== 'undefined' ? navigator.hardwareConcurrency - 2 : 2),
                throttle: 70
            };
        }
        else if (isMidRangeDevice) {
            return {
                ...this.options,
                algorithm: 'eco',
                threads: 2,
                throttle: 60
            };
        }
        else {
            return {
                ...this.options,
                algorithm: 'eco',
                threads: 1,
                throttle: 50
            };
        }
    }
}
exports.MobileMining = MobileMining;
exports.default = MobileMining.getInstance();
