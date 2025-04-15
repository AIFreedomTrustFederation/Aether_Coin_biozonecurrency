import { lazy } from 'react';
import { eventBus } from './EventBus';

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

/**
 * App Registry for managing micro-apps
 * 
 * This class handles the registration and access of micro-apps
 * in the Aetherion ecosystem, enabling the Enumerator-like architecture.
 */
class AppRegistryClass {
  private apps: Record<string, AppConfig> = {};
  
  constructor() {
    // Register default apps
    this.registerDefaultApps();
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
   * Get an app by ID
   * @param id App ID
   * @returns App configuration or undefined if not found
   */
  getApp(id: string): AppConfig | undefined {
    return this.apps[id];
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
}

// Export singleton instance
export const AppRegistry = new AppRegistryClass();