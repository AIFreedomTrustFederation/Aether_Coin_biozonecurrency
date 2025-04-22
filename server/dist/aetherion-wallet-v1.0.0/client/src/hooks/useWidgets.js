"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWidgetCatalog = useWidgetCatalog;
exports.useUserDashboards = useUserDashboards;
exports.useDashboard = useDashboard;
exports.useWidgets = useWidgets;
const react_query_1 = require("@tanstack/react-query");
const utils_1 = require("@/lib/utils");
const react_1 = __importDefault(require("react"));
// API paths
const API_PATHS = {
    templates: '/api/widget-templates',
    categories: '/api/widget-categories',
    dashboards: '/api/dashboards',
    widgets: '/api/widgets',
};
// Fetch widget templates
const fetchWidgetTemplates = async () => {
    const response = await fetch(API_PATHS.templates);
    if (!response.ok) {
        throw new Error('Failed to fetch widget templates');
    }
    return response.json();
};
// Fetch widget categories
const fetchWidgetCategories = async () => {
    const response = await fetch(API_PATHS.categories);
    if (!response.ok) {
        throw new Error('Failed to fetch widget categories');
    }
    return response.json();
};
// Fetch user dashboards
const fetchUserDashboards = async () => {
    const response = await fetch(`${API_PATHS.dashboards}/user`);
    if (!response.ok) {
        throw new Error('Failed to fetch user dashboards');
    }
    return response.json();
};
// Fetch a specific dashboard
const fetchDashboard = async (dashboardId) => {
    const response = await fetch(`${API_PATHS.dashboards}/${dashboardId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
    }
    return response.json();
};
// Create a new dashboard
const createDashboard = async (dashboard) => {
    const response = await fetch(API_PATHS.dashboards, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboard),
    });
    if (!response.ok) {
        throw new Error('Failed to create dashboard');
    }
    return response.json();
};
// Update a dashboard
const updateDashboard = async (dashboardId, data) => {
    const response = await fetch(`${API_PATHS.dashboards}/${dashboardId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update dashboard');
    }
    return response.json();
};
// Delete a dashboard
const deleteDashboard = async (dashboardId) => {
    const response = await fetch(`${API_PATHS.dashboards}/${dashboardId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete dashboard');
    }
};
// Update widget within a dashboard
const updateWidget = async ({ dashboardId, widgetId, data }) => {
    const response = await fetch(`${API_PATHS.dashboards}/${dashboardId}/widgets/${widgetId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update widget');
    }
    return response.json();
};
// Add a widget to a dashboard
const addWidget = async ({ dashboardId, templateId, position, }) => {
    const response = await fetch(`${API_PATHS.dashboards}/${dashboardId}/widgets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId, position }),
    });
    if (!response.ok) {
        throw new Error('Failed to add widget');
    }
    return response.json();
};
// Remove a widget from a dashboard
const removeWidget = async ({ dashboardId, widgetId, }) => {
    const response = await fetch(`${API_PATHS.dashboards}/${dashboardId}/widgets/${widgetId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to remove widget');
    }
};
// Hook for widget templates and categories
function useWidgetCatalog() {
    const templatesQuery = (0, react_query_1.useQuery)({
        queryKey: [API_PATHS.templates],
        queryFn: fetchWidgetTemplates,
    });
    const categoriesQuery = (0, react_query_1.useQuery)({
        queryKey: [API_PATHS.categories],
        queryFn: fetchWidgetCategories,
    });
    return {
        templates: templatesQuery.data || [],
        categories: categoriesQuery.data || [],
        isLoading: templatesQuery.isLoading || categoriesQuery.isLoading,
        isError: templatesQuery.isError || categoriesQuery.isError,
        error: templatesQuery.error || categoriesQuery.error,
    };
}
// Hook for user dashboards
function useUserDashboards() {
    const dashboardsQuery = (0, react_query_1.useQuery)({
        queryKey: [API_PATHS.dashboards, 'user'],
        queryFn: fetchUserDashboards,
    });
    const queryClient = (0, react_query_1.useQueryClient)();
    const createMutation = (0, react_query_1.useMutation)({
        mutationFn: createDashboard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_PATHS.dashboards, 'user'] });
        },
    });
    const deleteMutation = (0, react_query_1.useMutation)({
        mutationFn: deleteDashboard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_PATHS.dashboards, 'user'] });
        },
    });
    return {
        dashboards: dashboardsQuery.data || [],
        isLoading: dashboardsQuery.isLoading,
        isError: dashboardsQuery.isError,
        error: dashboardsQuery.error,
        createDashboard: createMutation.mutate,
        deleteDashboard: deleteMutation.mutate,
    };
}
// Hook for a specific dashboard and its widgets
function useDashboard(dashboardId) {
    const dashboardQuery = (0, react_query_1.useQuery)({
        queryKey: [API_PATHS.dashboards, dashboardId],
        queryFn: () => fetchDashboard(dashboardId),
        enabled: !!dashboardId,
    });
    const queryClient = (0, react_query_1.useQueryClient)();
    const updateMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => updateDashboard(dashboardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_PATHS.dashboards, dashboardId] });
        },
    });
    const updateWidgetMutation = (0, react_query_1.useMutation)({
        mutationFn: ({ widgetId, data }) => updateWidget({ dashboardId, widgetId, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_PATHS.dashboards, dashboardId] });
        },
    });
    const addWidgetMutation = (0, react_query_1.useMutation)({
        mutationFn: ({ templateId, position }) => addWidget({ dashboardId, templateId, position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_PATHS.dashboards, dashboardId] });
        },
    });
    const removeWidgetMutation = (0, react_query_1.useMutation)({
        mutationFn: (widgetId) => removeWidget({ dashboardId, widgetId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [API_PATHS.dashboards, dashboardId] });
        },
    });
    return {
        dashboard: dashboardQuery.data,
        widgets: dashboardQuery.data?.widgets || [],
        isLoading: dashboardQuery.isLoading,
        isError: dashboardQuery.isError,
        error: dashboardQuery.error,
        updateDashboard: updateMutation.mutate,
        updateWidget: updateWidgetMutation.mutate,
        addWidget: addWidgetMutation.mutate,
        removeWidget: removeWidgetMutation.mutate,
    };
}
// Hook for widget data without backend (demo mode)
function useWidgets() {
    // Mock widget templates
    const widgetTemplates = [
        {
            id: 'price-chart',
            name: 'Price Chart',
            description: 'Display real-time price charts for various cryptocurrencies',
            type: 'price-chart',
            category: 'markets',
            defaultConfig: {
                symbol: 'BTC',
                timeframe: '1d'
            },
            defaultSize: { w: 4, h: 2 }
        },
        {
            id: 'wallet-balance',
            name: 'Wallet Balance',
            description: 'View your crypto wallet balances and their value',
            type: 'wallet-balance',
            category: 'portfolio',
            defaultConfig: {
                showFiat: true,
                showChange: true
            },
            defaultSize: { w: 2, h: 2 }
        },
        {
            id: 'transaction-feed',
            name: 'Transaction History',
            description: 'Track your recent transactions across all your wallets',
            type: 'transaction-feed',
            category: 'portfolio',
            defaultConfig: {
                limit: 5,
                showDetails: true
            },
            defaultSize: { w: 3, h: 3 }
        },
        {
            id: 'ai-monitor',
            name: 'AI Security Monitor',
            description: 'Proactively monitor your wallet for security threats with AI',
            type: 'ai-monitor',
            category: 'security',
            defaultConfig: {
                alertLevel: 'medium',
                showRecommendations: true
            },
            defaultSize: { w: 3, h: 3 }
        },
        {
            id: 'news-feed',
            name: 'Crypto News',
            description: 'Stay updated with latest cryptocurrency news from various sources',
            type: 'news-feed',
            category: 'news',
            defaultConfig: {
                sources: ['coindesk', 'cointelegraph'],
                limit: 5,
                refreshInterval: 30
            },
            defaultSize: { w: 3, h: 3 }
        },
        {
            id: 'gas-tracker',
            name: 'Gas Price Tracker',
            description: 'Monitor gas prices across different blockchain networks',
            type: 'gas-tracker',
            category: 'network',
            defaultConfig: {
                networks: ['ethereum'],
                refreshInterval: 60
            },
            defaultSize: { w: 2, h: 2 }
        },
        {
            id: 'quantum-validator',
            name: 'Quantum Security Validator',
            description: 'Verify the quantum resistance of your wallet security setup',
            type: 'quantum-validator',
            category: 'security',
            defaultConfig: {
                scanInterval: 3600,
                alertThreshold: 'medium'
            },
            defaultSize: { w: 2, h: 3 }
        }
    ];
    // Mock widget categories
    const widgetCategories = [
        { id: 'markets', name: 'Markets', description: 'Market data and analytics' },
        { id: 'portfolio', name: 'Portfolio', description: 'Wallet and asset management' },
        { id: 'security', name: 'Security', description: 'Security and monitoring tools' },
        { id: 'news', name: 'News', description: 'Latest crypto news and events' },
        { id: 'network', name: 'Network', description: 'Blockchain network stats and information' }
    ];
    // Mock dashboard with some default widgets
    const defaultDashboard = {
        id: 'default',
        name: 'My Dashboard',
        userId: 'user123',
        widgets: [
            {
                id: 'w1',
                type: 'price-chart',
                name: 'Bitcoin Price',
                position: { x: 0, y: 0, w: 4, h: 2 },
                config: {
                    symbol: 'BTC',
                    timeframe: '1d'
                }
            },
            {
                id: 'w2',
                type: 'wallet-balance',
                name: 'My Wallets',
                position: { x: 4, y: 0, w: 2, h: 2 },
                config: {
                    showFiat: true,
                    showChange: true
                }
            },
            {
                id: 'w3',
                type: 'ai-monitor',
                name: 'Security Monitor',
                position: { x: 0, y: 2, w: 3, h: 3 },
                config: {
                    alertLevel: 'medium',
                    showRecommendations: true
                }
            },
            {
                id: 'w4',
                type: 'news-feed',
                name: 'Crypto News',
                position: { x: 3, y: 2, w: 3, h: 3 },
                config: {
                    sources: ['coindesk', 'cointelegraph'],
                    limit: 5,
                    refreshInterval: 30
                }
            }
        ],
        layout: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const [dashboard, setDashboard] = react_1.default.useState(defaultDashboard);
    // "Add" widget - creates a new widget based on a template
    const addWidgetToDemo = (templateId) => {
        const template = widgetTemplates.find(t => t.id === templateId);
        if (!template)
            return;
        const newWidget = {
            id: `widget-${(0, utils_1.nanoid)()}`,
            type: template.type,
            name: template.name,
            position: {
                x: 0,
                y: 0,
                ...template.defaultSize
            },
            config: { ...template.defaultConfig }
        };
        setDashboard(current => ({
            ...current,
            widgets: [...current.widgets, newWidget],
            updatedAt: new Date().toISOString()
        }));
        return newWidget;
    };
    // "Update" widget
    const updateWidgetInDemo = (widgetId, data) => {
        setDashboard(current => {
            const widgetIndex = current.widgets.findIndex(w => w.id === widgetId);
            if (widgetIndex === -1)
                return current;
            const updatedWidgets = [...current.widgets];
            updatedWidgets[widgetIndex] = {
                ...updatedWidgets[widgetIndex],
                ...data,
                config: {
                    ...updatedWidgets[widgetIndex].config,
                    ...(data.config || {})
                }
            };
            return {
                ...current,
                widgets: updatedWidgets,
                updatedAt: new Date().toISOString()
            };
        });
    };
    // "Remove" widget
    const removeWidgetFromDemo = (widgetId) => {
        setDashboard(current => ({
            ...current,
            widgets: current.widgets.filter(w => w.id !== widgetId),
            updatedAt: new Date().toISOString()
        }));
    };
    return {
        widgetTemplates,
        widgetCategories,
        dashboard,
        widgets: dashboard.widgets,
        addWidget: addWidgetToDemo,
        updateWidget: updateWidgetInDemo,
        removeWidget: removeWidgetFromDemo
    };
}
