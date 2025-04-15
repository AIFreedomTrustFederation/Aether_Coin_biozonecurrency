import { lazy, LazyExoticComponent } from "react";
import { IconType } from "../types/common";

// Import icons needed for app tiles
import { 
  LayoutDashboard, 
  Wallet, 
  Server, 
  BarChart3, 
  Cpu, 
  Globe, 
  Shield, 
  Cog, 
  Terminal,
  Layers
} from "lucide-react";

// Lazy load micro-apps
const DashboardApp = lazy(() => import("../apps/dashboard/DashboardApp"));
const WalletApp = lazy(() => import("../apps/wallet/WalletApp"));
const NodeMarketplaceApp = lazy(() => import("../apps/node-marketplace/NodeMarketplaceApp"));
const TokenomicsApp = lazy(() => import("../apps/tokenomics/TokenomicsApp"));
const AICoinApp = lazy(() => import("../apps/aicoin/AICoinApp"));
const DAppApp = lazy(() => import("../apps/dapp/DAppApp"));
const SecurityApp = lazy(() => import("../apps/security/SecurityApp"));
const SettingsApp = lazy(() => import("../apps/settings/SettingsApp"));

/**
 * App Definition interface for registry
 */
export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  component: LazyExoticComponent<any>;
  apiNamespace: string;
  category: 'main' | 'tools' | 'system';
  navPriority: number;
}

/**
 * Application Registry Service
 * 
 * Manages all available micro-apps in the ecosystem and handles
 * rendering them through the app shell.
 */
class AppRegistryService {
  private apps: Record<string, AppDefinition> = {
    dashboard: {
      id: "dashboard",
      name: "Dashboard",
      description: "Overview of your Aetherion ecosystem",
      icon: LayoutDashboard,
      component: DashboardApp,
      apiNamespace: "dashboard",
      category: 'main',
      navPriority: 1
    },
    wallet: {
      id: "wallet",
      name: "Wallet",
      description: "Manage your digital assets and transactions",
      icon: Wallet,
      component: WalletApp,
      apiNamespace: "wallet",
      category: 'main',
      navPriority: 2
    },
    nodeMarketplace: {
      id: "node-marketplace",
      name: "Node Marketplace",
      description: "Deploy and earn from the FractalCoin network",
      icon: Server,
      component: NodeMarketplaceApp,
      apiNamespace: "node",
      category: 'main',
      navPriority: 3
    },
    tokenomics: {
      id: "tokenomics",
      name: "Tokenomics",
      description: "Explore FractalCoin economic mechanisms",
      icon: BarChart3,
      component: TokenomicsApp,
      apiNamespace: "tokenomics",
      category: 'main',
      navPriority: 4
    },
    aicoin: {
      id: "aicoin",
      name: "AICoin",
      description: "AI resource allocation network",
      icon: Cpu,
      component: AICoinApp,
      apiNamespace: "aicoin",
      category: 'main',
      navPriority: 5
    },
    dapp: {
      id: "dapp",
      name: "DApp Browser",
      description: "Access the decentralized app ecosystem",
      icon: Globe,
      component: DAppApp,
      apiNamespace: "dapp",
      category: 'tools',
      navPriority: 1
    },
    security: {
      id: "security",
      name: "Security Center",
      description: "Manage quantum security settings",
      icon: Shield,
      component: SecurityApp,
      apiNamespace: "security",
      category: 'system',
      navPriority: 1
    },
    settings: {
      id: "settings",
      name: "Settings",
      description: "Configure your Aetherion experience",
      icon: Cog,
      component: SettingsApp,
      apiNamespace: "settings",
      category: 'system',
      navPriority: 2
    }
  };
  
  /**
   * Get all available apps
   */
  getAvailableApps(): AppDefinition[] {
    return Object.values(this.apps);
  }
  
  /**
   * Get apps by category
   */
  getAppsByCategory(category: 'main' | 'tools' | 'system'): AppDefinition[] {
    return Object.values(this.apps)
      .filter(app => app.category === category)
      .sort((a, b) => a.navPriority - b.navPriority);
  }
  
  /**
   * Get an app by ID
   */
  getApp(id: string): AppDefinition | undefined {
    return this.apps[id];
  }
  
  /**
   * Check if app exists
   */
  hasApp(id: string): boolean {
    return !!this.apps[id];
  }
  
  /**
   * Register a new app (used for runtime extensions)
   */
  registerApp(app: AppDefinition): void {
    if (this.apps[app.id]) {
      console.warn(`App with ID ${app.id} already exists. Overwriting.`);
    }
    this.apps[app.id] = app;
  }
  
  /**
   * Unregister an app by ID
   */
  unregisterApp(id: string): boolean {
    if (this.apps[id]) {
      delete this.apps[id];
      return true;
    }
    return false;
  }
}

export const AppRegistry = new AppRegistryService();