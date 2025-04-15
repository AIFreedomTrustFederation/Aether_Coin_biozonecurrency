import { lazy } from 'react';
import { eventBus } from './EventBus';
import { createFractalNetworkService } from '../services/FractalNetworkService';

// Define app configuration type
export interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  routes?: string[];
  visible?: boolean;
}

// Define service configuration type
export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  instance: any;
  autoStart?: boolean;
}

/**
 * App Registry for managing micro-apps and services
 * 
 * This class handles the registration and access of micro-apps and services
 * in the Aetherion ecosystem, enabling the Enumerator-like architecture.
 */
class AppRegistryClass {
  private apps: Record<string, AppConfig> = {};
  private services: Record<string, ServiceConfig> = {};
  
  constructor() {
    // Register default apps and services
    this.registerDefaultApps();
    this.registerDefaultServices();
    
    // Listen for system events
    eventBus.subscribe('system:ready', () => {
      this.startAutoStartServices();
    });
  }
  
  /**
   * Register a new app
   * @param appConfig App configuration
   */
  registerApp(appConfig: AppConfig): void {
    if (this.apps[appConfig.id]) {
      console.warn(`App with ID ${appConfig.id} is already registered. Overwriting.`);
    }
    
    this.apps[appConfig.id] = appConfig;
    
    // Notify that a new app has been registered
    eventBus.publish('app:registered', appConfig);
  }
  
  /**
   * Register a new service
   * @param serviceConfig Service configuration
   */
  registerService(serviceConfig: ServiceConfig): void {
    if (this.services[serviceConfig.id]) {
      console.warn(`Service with ID ${serviceConfig.id} is already registered. Overwriting.`);
    }
    
    this.services[serviceConfig.id] = serviceConfig;
    
    // Notify that a new service has been registered
    eventBus.publish('service:registered', serviceConfig);
    
    // Auto-start service if configured
    if (serviceConfig.autoStart) {
      if (typeof serviceConfig.instance.start === 'function') {
        serviceConfig.instance.start();
      } else {
        console.warn(`Service ${serviceConfig.id} has autoStart=true but no start() method`);
      }
    }
  }
  
  /**
   * Get an app by ID
   * @param id App ID
   * @returns App configuration or undefined if not found
   */
  getApp(id: string): AppConfig | undefined {
    return this.apps[id];
  }
  
  /**
   * Get a service by ID
   * @param id Service ID
   * @returns Service configuration or undefined if not found
   */
  getService(id: string): ServiceConfig | undefined {
    return this.services[id];
  }
  
  /**
   * Get all registered apps
   * @param includeHidden Include apps marked as not visible
   * @returns Array of app configurations
   */
  getAllApps(includeHidden: boolean = false): AppConfig[] {
    return Object.values(this.apps).filter(app => includeHidden || app.visible !== false);
  }
  
  /**
   * Get all registered services
   * @returns Array of service configurations
   */
  getAllServices(): ServiceConfig[] {
    return Object.values(this.services);
  }
  
  /**
   * Unregister an app
   * @param id App ID
   */
  unregisterApp(id: string): void {
    if (!this.apps[id]) {
      console.warn(`App with ID ${id} not found.`);
      return;
    }
    
    const app = this.apps[id];
    delete this.apps[id];
    
    // Notify that an app has been unregistered
    eventBus.publish('app:unregistered', app);
  }
  
  /**
   * Unregister a service
   * @param id Service ID
   */
  unregisterService(id: string): void {
    if (!this.services[id]) {
      console.warn(`Service with ID ${id} not found.`);
      return;
    }
    
    const service = this.services[id];
    
    // Stop service if it has a stop method
    if (typeof service.instance.stop === 'function') {
      service.instance.stop();
    }
    
    delete this.services[id];
    
    // Notify that a service has been unregistered
    eventBus.publish('service:unregistered', service);
  }
  
  /**
   * Start all auto-start services
   */
  private startAutoStartServices(): void {
    Object.values(this.services).forEach(service => {
      if (service.autoStart && typeof service.instance.start === 'function') {
        service.instance.start();
      }
    });
  }
  
  /**
   * Register default apps
   */
  private registerDefaultApps(): void {
    // Dashboard App
    this.registerApp({
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Overview of your assets and network status',
      icon: 'layout-dashboard',
      component: lazy(() => import('../apps/dashboard/DashboardApp')),
      visible: true
    });
    
    // Wallet App
    this.registerApp({
      id: 'wallet',
      name: 'Wallet',
      description: 'Manage your digital assets',
      icon: 'wallet',
      component: lazy(() => import('../apps/wallet/WalletApp')),
      visible: true
    });
    
    // Node Marketplace App
    this.registerApp({
      id: 'node-marketplace',
      name: 'Node Marketplace',
      description: 'Deploy services on the FractalCoin network',
      icon: 'server',
      component: lazy(() => import('../apps/node-marketplace/NodeMarketplaceApp')),
      visible: true
    });
    
    // Tokenomics App
    this.registerApp({
      id: 'tokenomics',
      name: 'Tokenomics',
      description: 'Explore FractalCoin economic mechanisms',
      icon: 'bar-chart-3',
      component: lazy(() => import('../apps/tokenomics/TokenomicsApp')),
      visible: true
    });
    
    // AICoin App
    this.registerApp({
      id: 'aicoin',
      name: 'AICoin',
      description: 'AI resource allocation network',
      icon: 'cpu',
      component: lazy(() => import('../apps/aicoin/AICoinApp')),
      visible: true
    });
  }
  
  /**
   * Register default services
   */
  private registerDefaultServices(): void {
    // FractalNetworkService - manages network communications
    const networkService = createFractalNetworkService(eventBus);
    this.registerService({
      id: 'fractalNetwork',
      name: 'Fractal Network Service',
      description: 'Manages node communications and network health',
      instance: networkService,
      autoStart: true
    });
  }
}

// Export singleton instance
export const AppRegistry = new AppRegistryClass();