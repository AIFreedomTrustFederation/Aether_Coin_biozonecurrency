"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
// Create in-memory storage for widgets (will be replaced with DB storage in phase 2)
// These are demo widgets to show the concept
let demoWidgets = [
    {
        id: 1,
        userId: 1,
        type: 'price-chart',
        name: 'Bitcoin Price Chart',
        position: { x: 0, y: 0, width: 6, height: 4 },
        config: {
            token: 'bitcoin',
            timeframe: '1d',
            source: 'coinbase'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        userId: 1,
        type: 'wallet-balance',
        name: 'Main Wallet Balance',
        position: { x: 6, y: 0, width: 6, height: 2 },
        config: {
            walletId: 1,
            showGraph: true,
            showHistory: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        userId: 1,
        type: 'transaction-feed',
        name: 'Recent Transactions',
        position: { x: 6, y: 2, width: 6, height: 5 },
        config: {
            limit: 10,
            showDetails: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 4,
        userId: 1,
        type: 'ai-monitor',
        name: 'AI Security Monitor',
        position: { x: 0, y: 4, width: 6, height: 3 },
        config: {
            showAlerts: true,
            sensitivity: 'medium'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
// Demo widget templates for marketplace
let demoWidgetTemplates = [
    {
        id: 1,
        type: 'price-chart',
        name: 'Price Chart',
        description: 'Real-time price chart for cryptocurrencies',
        thumbnail: '/assets/widgets/price-chart.png',
        defaultConfig: {
            token: 'bitcoin',
            timeframe: '1d',
            source: 'coinbase'
        },
        defaultPosition: { width: 6, height: 4 },
        category: 'Market Data',
        isSystem: true,
        createdAt: new Date()
    },
    {
        id: 2,
        type: 'wallet-balance',
        name: 'Wallet Balance',
        description: 'Display wallet balance with chart trends',
        thumbnail: '/assets/widgets/wallet-balance.png',
        defaultConfig: {
            showGraph: true,
            showHistory: true
        },
        defaultPosition: { width: 6, height: 2 },
        category: 'Wallet',
        isSystem: true,
        createdAt: new Date()
    },
    {
        id: 3,
        type: 'transaction-feed',
        name: 'Transaction Feed',
        description: 'Live feed of recent transactions',
        thumbnail: '/assets/widgets/transaction-feed.png',
        defaultConfig: {
            limit: 10,
            showDetails: true
        },
        defaultPosition: { width: 6, height: 5 },
        category: 'Wallet',
        isSystem: true,
        createdAt: new Date()
    },
    {
        id: 4,
        type: 'ai-monitor',
        name: 'AI Security Monitor',
        description: 'AI-powered security monitoring for wallets',
        thumbnail: '/assets/widgets/ai-monitor.png',
        defaultConfig: {
            showAlerts: true,
            sensitivity: 'medium'
        },
        defaultPosition: { width: 6, height: 3 },
        category: 'Security',
        isSystem: true,
        createdAt: new Date()
    },
    {
        id: 5,
        type: 'news-feed',
        name: 'Crypto News',
        description: 'Latest cryptocurrency news and updates',
        thumbnail: '/assets/widgets/news-feed.png',
        defaultConfig: {
            sources: ['coindesk', 'cointelegraph'],
            refreshInterval: 30
        },
        defaultPosition: { width: 4, height: 4 },
        category: 'News',
        isSystem: true,
        createdAt: new Date()
    },
    {
        id: 6,
        type: 'gas-tracker',
        name: 'Gas Fee Tracker',
        description: 'Track Ethereum gas fees for optimal transaction timing',
        thumbnail: '/assets/widgets/gas-tracker.png',
        defaultConfig: {
            network: 'ethereum',
            refreshInterval: 60
        },
        defaultPosition: { width: 4, height: 2 },
        category: 'Utilities',
        isSystem: true,
        createdAt: new Date()
    },
    {
        id: 7,
        type: 'quantum-validator',
        name: 'Quantum Security Status',
        description: 'Monitor quantum resistance of your wallet security',
        thumbnail: '/assets/widgets/quantum-validator.png',
        defaultConfig: {
            showDetailedMetrics: true,
            monitoringInterval: 300
        },
        defaultPosition: { width: 6, height: 3 },
        category: 'Security',
        isSystem: true,
        createdAt: new Date()
    }
];
// Demo dashboards for in-memory storage
let demoDashboards = [
    {
        id: 1,
        userId: 1,
        name: 'Main Dashboard',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: demoWidgets.filter(w => w.userId === 1)
    }
];
const router = (0, express_1.Router)();
// Get all widget templates
router.get("/templates", async (req, res) => {
    try {
        // Use in-memory demo data
        return res.json(demoWidgetTemplates);
    }
    catch (error) {
        console.error('Error fetching widget templates:', error);
        return res.status(500).json({ error: 'Failed to fetch widget templates' });
    }
});
// Get dashboard by ID or get default dashboard for user
router.get("/dashboards/:dashboardId?", async (req, res) => {
    try {
        const userId = parseInt(req.query.userId);
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        let dashboard;
        if (req.params.dashboardId) {
            const dashboardId = parseInt(req.params.dashboardId);
            dashboard = demoDashboards.find(d => d.id === dashboardId && d.userId === userId);
        }
        else {
            // Get default dashboard for user
            dashboard = demoDashboards.find(d => d.userId === userId && d.isDefault);
            if (!dashboard) {
                // If no default dashboard exists, get the first available dashboard
                dashboard = demoDashboards.find(d => d.userId === userId);
            }
        }
        if (!dashboard) {
            return res.status(404).json({ error: 'Dashboard not found' });
        }
        return res.json(dashboard);
    }
    catch (error) {
        console.error('Error fetching dashboard:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});
// Create a new dashboard
router.post("/dashboards", async (req, res) => {
    try {
        const dashboardSchema = zod_1.z.object({
            userId: zod_1.z.number(),
            name: zod_1.z.string(),
            isDefault: zod_1.z.boolean().optional()
        });
        const validatedData = dashboardSchema.parse(req.body);
        // If creating default dashboard, update any existing default dashboards
        if (validatedData.isDefault) {
            demoDashboards.forEach(d => {
                if (d.userId === validatedData.userId) {
                    d.isDefault = false;
                }
            });
        }
        const newDashboard = {
            id: demoDashboards.length > 0 ? Math.max(...demoDashboards.map(d => d.id)) + 1 : 1,
            userId: validatedData.userId,
            name: validatedData.name,
            isDefault: validatedData.isDefault || false,
            createdAt: new Date(),
            updatedAt: new Date(),
            widgets: []
        };
        demoDashboards.push(newDashboard);
        return res.status(201).json(newDashboard);
    }
    catch (error) {
        console.error('Error creating dashboard:', error);
        return res.status(500).json({ error: 'Failed to create dashboard' });
    }
});
// Get all widgets for a dashboard or user
router.get("/widgets", async (req, res) => {
    try {
        const dashboardId = parseInt(req.query.dashboardId);
        const userId = parseInt(req.query.userId);
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        let widgetList;
        if (dashboardId) {
            // Get widgets for specific dashboard
            const dashboard = demoDashboards.find(d => d.id === dashboardId);
            widgetList = dashboard?.widgets || [];
        }
        else {
            // Get all widgets for user
            widgetList = demoWidgets.filter(w => w.userId === userId);
        }
        return res.json(widgetList);
    }
    catch (error) {
        console.error('Error fetching widgets:', error);
        return res.status(500).json({ error: 'Failed to fetch widgets' });
    }
});
// Create a new widget
router.post("/widgets", async (req, res) => {
    try {
        const widgetSchema = zod_1.z.object({
            userId: zod_1.z.number(),
            type: zod_1.z.string(),
            name: zod_1.z.string(),
            position: zod_1.z.object({
                x: zod_1.z.number(),
                y: zod_1.z.number(),
                width: zod_1.z.number(),
                height: zod_1.z.number()
            }),
            config: zod_1.z.record(zod_1.z.any()),
            dashboardId: zod_1.z.number().optional()
        });
        const validatedData = widgetSchema.parse(req.body);
        const newWidget = {
            id: demoWidgets.length > 0 ? Math.max(...demoWidgets.map(w => w.id)) + 1 : 1,
            userId: validatedData.userId,
            type: validatedData.type,
            name: validatedData.name,
            position: validatedData.position,
            config: validatedData.config,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        demoWidgets.push(newWidget);
        // Add to dashboard if dashboardId is provided
        if (validatedData.dashboardId) {
            const dashboard = demoDashboards.find(d => d.id === validatedData.dashboardId);
            if (dashboard) {
                dashboard.widgets = dashboard.widgets || [];
                dashboard.widgets.push(newWidget);
            }
        }
        return res.status(201).json(newWidget);
    }
    catch (error) {
        console.error('Error creating widget:', error);
        return res.status(500).json({ error: 'Failed to create widget' });
    }
});
// Update widget
router.patch("/widgets/:widgetId", async (req, res) => {
    try {
        const widgetId = parseInt(req.params.widgetId);
        const updateSchema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            position: zod_1.z.object({
                x: zod_1.z.number(),
                y: zod_1.z.number(),
                width: zod_1.z.number(),
                height: zod_1.z.number()
            }).optional(),
            config: zod_1.z.record(zod_1.z.any()).optional(),
            isActive: zod_1.z.boolean().optional()
        });
        const validatedData = updateSchema.parse(req.body);
        const widgetIndex = demoWidgets.findIndex(w => w.id === widgetId);
        if (widgetIndex === -1) {
            return res.status(404).json({ error: 'Widget not found' });
        }
        const updatedWidget = {
            ...demoWidgets[widgetIndex],
            ...validatedData,
            updatedAt: new Date()
        };
        demoWidgets[widgetIndex] = updatedWidget;
        // Update widget in any dashboards
        demoDashboards.forEach(dashboard => {
            if (dashboard.widgets) {
                const dashboardWidgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
                if (dashboardWidgetIndex !== -1) {
                    dashboard.widgets[dashboardWidgetIndex] = updatedWidget;
                }
            }
        });
        return res.json(updatedWidget);
    }
    catch (error) {
        console.error('Error updating widget:', error);
        return res.status(500).json({ error: 'Failed to update widget' });
    }
});
// Delete widget
router.delete("/widgets/:widgetId", async (req, res) => {
    try {
        const widgetId = parseInt(req.params.widgetId);
        const widgetIndex = demoWidgets.findIndex(w => w.id === widgetId);
        if (widgetIndex === -1) {
            return res.status(404).json({ error: 'Widget not found' });
        }
        const deletedWidget = demoWidgets[widgetIndex];
        demoWidgets.splice(widgetIndex, 1);
        // Remove widget from any dashboards
        demoDashboards.forEach(dashboard => {
            if (dashboard.widgets) {
                dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
            }
        });
        return res.json({ success: true, message: 'Widget deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting widget:', error);
        return res.status(500).json({ error: 'Failed to delete widget' });
    }
});
// Add template widget APIs for marketplace
router.get("/templates/categories", async (req, res) => {
    try {
        // Get unique categories from templates
        const categoriesSet = new Set(demoWidgetTemplates.map(t => t.category));
        const categories = Array.from(categoriesSet);
        return res.json(categories);
    }
    catch (error) {
        console.error('Error fetching widget template categories:', error);
        return res.status(500).json({ error: 'Failed to fetch widget template categories' });
    }
});
router.get("/templates/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const templates = demoWidgetTemplates.filter(t => t.category === category);
        return res.json(templates);
    }
    catch (error) {
        console.error('Error fetching widget templates by category:', error);
        return res.status(500).json({ error: 'Failed to fetch widget templates by category' });
    }
});
exports.default = router;
