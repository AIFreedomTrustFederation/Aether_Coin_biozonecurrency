"use strict";
/**
 * Demo data for the widget API gateway
 * This will be replaced with actual database persistence in Phase 2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_WIDGETS = exports.DEFAULT_DASHBOARD = exports.WIDGET_TEMPLATES = void 0;
exports.getWidgetCategories = getWidgetCategories;
/**
 * Widget Templates - predefined types of widgets users can add to their dashboards
 */
exports.WIDGET_TEMPLATES = [
    {
        id: 1,
        type: 'price-chart',
        name: 'Price Chart',
        description: 'Real-time cryptocurrency price chart with customizable timeframes',
        category: 'Markets',
        defaultConfig: {
            symbol: 'BTC',
            timeframe: '1d',
            chartType: 'candlestick'
        },
        defaultPosition: {
            width: 2,
            height: 2
        }
    },
    {
        id: 2,
        type: 'wallet-balance',
        name: 'Wallet Balance',
        description: 'View your wallet balances across multiple cryptocurrencies',
        category: 'Wallet',
        defaultConfig: {
            showFiat: true,
            showChange: true
        },
        defaultPosition: {
            width: 1,
            height: 1
        }
    },
    {
        id: 3,
        type: 'transaction-feed',
        name: 'Transaction Feed',
        description: 'Live feed of your recent transactions',
        category: 'Wallet',
        defaultConfig: {
            limit: 5,
            showDetails: true
        },
        defaultPosition: {
            width: 1,
            height: 2
        }
    },
    {
        id: 4,
        type: 'ai-monitor',
        name: 'AI Transaction Monitor',
        description: 'AI-powered transaction monitoring alerts',
        category: 'Security',
        defaultConfig: {
            alertLevel: 'medium',
            showRecommendations: true
        },
        defaultPosition: {
            width: 1,
            height: 1
        }
    },
    {
        id: 5,
        type: 'news-feed',
        name: 'Crypto News Feed',
        description: 'Latest cryptocurrency news and updates',
        category: 'Information',
        defaultConfig: {
            sources: ['coindesk', 'cointelegraph'],
            refreshInterval: 30,
            limit: 5
        },
        defaultPosition: {
            width: 2,
            height: 1
        }
    },
    {
        id: 6,
        type: 'gas-tracker',
        name: 'Gas Fee Tracker',
        description: 'Real-time tracking of network gas fees',
        category: 'Markets',
        defaultConfig: {
            networks: ['ethereum', 'binance-smart-chain'],
            refreshInterval: 60
        },
        defaultPosition: {
            width: 1,
            height: 1
        }
    },
    {
        id: 7,
        type: 'quantum-validator',
        name: 'Quantum Security Validator',
        description: 'Quantum-resistant security status of your wallets',
        category: 'Security',
        defaultConfig: {
            scanInterval: 3600,
            alertThreshold: 'medium'
        },
        defaultPosition: {
            width: 1,
            height: 1
        }
    }
];
/**
 * Default dashboards created for new users
 */
exports.DEFAULT_DASHBOARD = {
    id: 1,
    userId: 1,
    name: 'Main Dashboard',
    isDefault: true,
    createdAt: new Date('2025-03-25T12:00:00Z'),
    updatedAt: new Date('2025-03-25T12:00:00Z')
};
/**
 * Demo widget data
 */
exports.DEMO_WIDGETS = [
    {
        id: 101,
        userId: 1,
        dashboardId: 1,
        type: 'price-chart',
        name: 'Bitcoin Price',
        position: {
            x: 0,
            y: 0,
            width: 2,
            height: 2
        },
        config: {
            symbol: 'BTC',
            timeframe: '1d',
            chartType: 'candlestick'
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    },
    {
        id: 102,
        userId: 1,
        dashboardId: 1,
        type: 'wallet-balance',
        name: 'My Wallet',
        position: {
            x: 2,
            y: 0,
            width: 1,
            height: 1
        },
        config: {
            showFiat: true,
            showChange: true
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    },
    {
        id: 103,
        userId: 1,
        dashboardId: 1,
        type: 'transaction-feed',
        name: 'Recent Transactions',
        position: {
            x: 2,
            y: 1,
            width: 1,
            height: 2
        },
        config: {
            limit: 5,
            showDetails: true
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    },
    {
        id: 104,
        userId: 1,
        dashboardId: 1,
        type: 'ai-monitor',
        name: 'AI Security Monitor',
        position: {
            x: 0,
            y: 2,
            width: 1,
            height: 1
        },
        config: {
            alertLevel: 'medium',
            showRecommendations: true
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    },
    {
        id: 105,
        userId: 1,
        dashboardId: 1,
        type: 'news-feed',
        name: 'Crypto News',
        position: {
            x: 1,
            y: 2,
            width: 1,
            height: 1
        },
        config: {
            sources: ['coindesk', 'cointelegraph'],
            refreshInterval: 30,
            limit: 5
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    },
    {
        id: 106,
        userId: 1,
        dashboardId: 1,
        type: 'gas-tracker',
        name: 'Ethereum Gas Fees',
        position: {
            x: 3,
            y: 0,
            width: 1,
            height: 1
        },
        config: {
            networks: ['ethereum'],
            refreshInterval: 60
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    },
    {
        id: 107,
        userId: 1,
        dashboardId: 1,
        type: 'quantum-validator',
        name: 'Quantum Security',
        position: {
            x: 3,
            y: 1,
            width: 1,
            height: 1
        },
        config: {
            scanInterval: 3600,
            alertThreshold: 'medium'
        },
        isActive: true,
        createdAt: new Date('2025-03-25T12:00:00Z'),
        updatedAt: new Date('2025-03-25T12:00:00Z')
    }
];
/**
 * Get unique widget categories
 */
function getWidgetCategories() {
    const categories = new Set();
    exports.WIDGET_TEMPLATES.forEach(template => categories.add(template.category));
    return Array.from(categories);
}
