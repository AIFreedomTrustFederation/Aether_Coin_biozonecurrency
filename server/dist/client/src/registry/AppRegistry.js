"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRegistry = void 0;
const react_1 = require("react");
const EventBus_1 = require("./EventBus");
const FractalNetworkService_1 = require("../services/FractalNetworkService");
/**
 * App Registry for managing micro-apps and services
 *
 * This class handles the registration and access of micro-apps and services
 * in the Aetherion ecosystem, enabling the Enumerator-like architecture.
 */
class AppRegistryClass {
    constructor() {
        this.apps = {};
        this.services = {};
        // Register default apps and services
        this.registerDefaultApps();
        this.registerDefaultServices();
        // Listen for system events
        EventBus_1.eventBus.subscribe('system:ready', () => {
            this.startAutoStartServices();
        });
    }
    /**
     * Register a new app
     * @param appConfig App configuration
     */
    registerApp(appConfig) {
        if (this.apps[appConfig.id]) {
            console.warn(`App with ID ${appConfig.id} is already registered. Overwriting.`);
        }
        this.apps[appConfig.id] = appConfig;
        // Notify that a new app has been registered
        EventBus_1.eventBus.publish('app:registered', appConfig);
    }
    /**
     * Register a new service
     * @param serviceConfig Service configuration
     */
    registerService(serviceConfig) {
        if (this.services[serviceConfig.id]) {
            console.warn(`Service with ID ${serviceConfig.id} is already registered. Overwriting.`);
        }
        this.services[serviceConfig.id] = serviceConfig;
        // Notify that a new service has been registered
        EventBus_1.eventBus.publish('service:registered', serviceConfig);
        // Auto-start service if configured
        if (serviceConfig.autoStart) {
            if (typeof serviceConfig.instance.start === 'function') {
                serviceConfig.instance.start();
            }
            else {
                console.warn(`Service ${serviceConfig.id} has autoStart=true but no start() method`);
            }
        }
    }
    /**
     * Get an app by ID
     * @param id App ID
     * @returns App configuration or undefined if not found
     */
    getApp(id) {
        return this.apps[id];
    }
    /**
     * Get a service by ID
     * @param id Service ID
     * @returns Service configuration or undefined if not found
     */
    getService(id) {
        return this.services[id];
    }
    /**
     * Get all registered apps
     * @param includeHidden Include apps marked as not visible
     * @returns Array of app configurations
     */
    getAllApps(includeHidden = false) {
        return Object.values(this.apps).filter(app => includeHidden || app.visible !== false);
    }
    /**
     * Get all registered services
     * @returns Array of service configurations
     */
    getAllServices() {
        return Object.values(this.services);
    }
    /**
     * Unregister an app
     * @param id App ID
     */
    unregisterApp(id) {
        if (!this.apps[id]) {
            console.warn(`App with ID ${id} not found.`);
            return;
        }
        const app = this.apps[id];
        delete this.apps[id];
        // Notify that an app has been unregistered
        EventBus_1.eventBus.publish('app:unregistered', app);
    }
    /**
     * Unregister a service
     * @param id Service ID
     */
    unregisterService(id) {
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
        EventBus_1.eventBus.publish('service:unregistered', service);
    }
    /**
     * Start all auto-start services
     */
    startAutoStartServices() {
        Object.values(this.services).forEach(service => {
            if (service.autoStart && typeof service.instance.start === 'function') {
                service.instance.start();
            }
        });
    }
    /**
     * Register default apps
     */
    registerDefaultApps() {
        // Dashboard App
        this.registerApp({
            id: 'dashboard',
            name: 'Dashboard',
            description: 'Overview of your assets and network status',
            icon: 'layout-dashboard',
            component: (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../apps/dashboard/DashboardApp')))),
            visible: true
        });
        // Wallet App
        this.registerApp({
            id: 'wallet',
            name: 'Wallet',
            description: 'Manage your digital assets',
            icon: 'wallet',
            component: (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../apps/wallet/WalletApp')))),
            visible: true
        });
        // Node Marketplace App
        this.registerApp({
            id: 'node-marketplace',
            name: 'Node Marketplace',
            description: 'Deploy services on the FractalCoin network',
            icon: 'server',
            component: (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../apps/node-marketplace/NodeMarketplaceApp')))),
            visible: true
        });
        // Tokenomics App
        this.registerApp({
            id: 'tokenomics',
            name: 'Tokenomics',
            description: 'Explore FractalCoin economic mechanisms',
            icon: 'bar-chart-3',
            component: (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../apps/tokenomics/TokenomicsApp')))),
            visible: true
        });
        // AICoin App
        this.registerApp({
            id: 'aicoin',
            name: 'AICoin',
            description: 'AI resource allocation network',
            icon: 'cpu',
            component: (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../apps/aicoin/AICoinApp')))),
            visible: true
        });
    }
    /**
     * Register default services
     */
    registerDefaultServices() {
        // FractalNetworkService - manages network communications
        const networkService = (0, FractalNetworkService_1.createFractalNetworkService)(EventBus_1.eventBus);
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
exports.AppRegistry = new AppRegistryClass();
