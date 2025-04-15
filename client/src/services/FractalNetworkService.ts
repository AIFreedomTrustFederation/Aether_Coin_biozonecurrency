import { eventBus, EventBus } from "../registry/EventBus";

/**
 * FractalNetworkService
 * 
 * A non-UI service that manages network communications,
 * node health status, and network analytics.
 */
export class FractalNetworkService {
  private eventBus: EventBus;
  private isRunning: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private networkStats = {
    activeNodes: 0,
    averageLatency: 0,
    throughputPerSecond: 0,
    lastUpdated: new Date()
  };

  constructor(eventBus: EventBus) {
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
  public start(): void {
    if (this.isRunning) return;
    
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
  public stop(): void {
    if (!this.isRunning) return;
    
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
  private publishStats(): void {
    this.eventBus.publish('network:stats', {
      ...this.networkStats,
      lastUpdated: new Date()
    });
  }

  /**
   * Handle a node being added to the network
   */
  private handleNodeAdded(nodeData: any): void {
    console.log(`Node added: ${nodeData.id}`);
    this.networkStats.activeNodes++;
    this.publishStats();
  }

  /**
   * Handle a node being removed from the network
   */
  private handleNodeRemoved(nodeId: string): void {
    console.log(`Node removed: ${nodeId}`);
    this.networkStats.activeNodes = Math.max(0, this.networkStats.activeNodes - 1);
    this.publishStats();
  }

  /**
   * Perform network health check
   */
  private performHealthCheck(): void {
    console.log('Performing network health check');
    
    // Simulate some network activity
    this.simulateNetworkActivity();
    
    // Publish updated stats
    this.publishStats();
  }

  /**
   * Simulate network activity with random values
   */
  private simulateNetworkActivity(): void {
    // In a real implementation, this would query actual node statuses
    this.networkStats = {
      activeNodes: Math.floor(30 + Math.random() * 20), // 30-50 nodes
      averageLatency: Math.floor(50 + Math.random() * 100), // 50-150ms
      throughputPerSecond: Math.floor(1000 + Math.random() * 4000), // 1000-5000 tx/s
      lastUpdated: new Date()
    };
  }
}

// Factory function to create the service
export const createFractalNetworkService = (eventBus: EventBus): FractalNetworkService => {
  const service = new FractalNetworkService(eventBus);
  return service;
};