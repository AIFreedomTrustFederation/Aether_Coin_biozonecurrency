"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFractalNetworkService = exports.FractalNetworkService = void 0;
/**
 * FractalNetworkService
 *
 * A non-UI service that manages network communications,
 * node health status, and network analytics.
 */
class FractalNetworkService {
    constructor(eventBus) {
        this.isRunning = false;
        this.healthCheckInterval = null;
        this.networkStats = {
            activeNodes: 0,
            averageLatency: 0,
            throughputPerSecond: 0,
            lastUpdated: new Date()
        };
        this.eventBus = eventBus;
        // Subscribe to events
        this.eventBus.subscribe('network:requestStats', () => {
            this.publishStats();
        });
        this.eventBus.subscribe('node:added', (nodeData) => {
            this.handleNodeAdded(nodeData);
        });
        this.eventBus.subscribe('node:removed', (nodeId) => {
            this.handleNodeRemoved(nodeId);
        });
        console.log('FractalNetworkService initialized');
    }
    /**
     * Start the service
     */
    start() {
        if (this.isRunning)
            return;
        console.log('Starting FractalNetworkService');
        this.isRunning = true;
        // Simulate network activity with periodic health checks
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Every 30 seconds
        // Initialize with dummy data
        this.simulateNetworkActivity();
        // Announce service started
        this.eventBus.publish('service:started', {
            serviceId: 'fractalNetwork',
            name: 'Fractal Network Service'
        });
    }
    /**
     * Stop the service
     */
    stop() {
        if (!this.isRunning)
            return;
        console.log('Stopping FractalNetworkService');
        this.isRunning = false;
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        // Announce service stopped
        this.eventBus.publish('service:stopped', {
            serviceId: 'fractalNetwork',
            name: 'Fractal Network Service'
        });
    }
    /**
     * Publish current network stats to the event bus
     */
    publishStats() {
        this.eventBus.publish('network:stats', {
            ...this.networkStats,
            lastUpdated: new Date()
        });
    }
    /**
     * Handle a node being added to the network
     */
    handleNodeAdded(nodeData) {
        console.log(`Node added: ${nodeData.id}`);
        this.networkStats.activeNodes++;
        this.publishStats();
    }
    /**
     * Handle a node being removed from the network
     */
    handleNodeRemoved(nodeId) {
        console.log(`Node removed: ${nodeId}`);
        this.networkStats.activeNodes = Math.max(0, this.networkStats.activeNodes - 1);
        this.publishStats();
    }
    /**
     * Perform network health check
     */
    performHealthCheck() {
        console.log('Performing network health check');
        // Simulate some network activity
        this.simulateNetworkActivity();
        // Publish updated stats
        this.publishStats();
    }
    /**
     * Simulate network activity with random values
     */
    simulateNetworkActivity() {
        // In a real implementation, this would query actual node statuses
        this.networkStats = {
            activeNodes: Math.floor(30 + Math.random() * 20), // 30-50 nodes
            averageLatency: Math.floor(50 + Math.random() * 100), // 50-150ms
            throughputPerSecond: Math.floor(1000 + Math.random() * 4000), // 1000-5000 tx/s
            lastUpdated: new Date()
        };
    }
}
exports.FractalNetworkService = FractalNetworkService;
// Factory function to create the service
const createFractalNetworkService = (eventBus) => {
    const service = new FractalNetworkService(eventBus);
    return service;
};
exports.createFractalNetworkService = createFractalNetworkService;
