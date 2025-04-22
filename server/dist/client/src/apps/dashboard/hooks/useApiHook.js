"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApiHook = void 0;
const react_1 = require("react");
const useApiHook = () => {
    const [dashboardData, setDashboardData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Simulate API fetch with a timeout
        const timer = setTimeout(() => {
            // This would be a real API call in production
            setDashboardData({
                walletBalance: {
                    atc: 248.56,
                    usd: 2485.60,
                    change: 12.5
                },
                nodes: {
                    active: 37,
                    status: 'Good',
                    rewards: 58.2
                },
                security: {
                    level: 'High',
                    lastVerification: '5m ago',
                    resistance: '128-bit quantum resistance'
                },
                ai: {
                    utilization: 72
                },
                activity: [
                    {
                        type: 'reward',
                        title: 'Reward Received',
                        description: 'Received 3.2 ATC from node operations',
                        time: '2 hours ago',
                        icon: 'trending-up'
                    },
                    {
                        type: 'node',
                        title: 'Node Status Update',
                        description: 'Node #12 performance optimized, +8% efficiency',
                        time: '5 hours ago',
                        icon: 'server'
                    },
                    {
                        type: 'security',
                        title: 'Security Alert',
                        description: 'Quantum resistance audit completed successfully',
                        time: '8 hours ago',
                        icon: 'alert-triangle'
                    },
                    {
                        type: 'market',
                        title: 'Market Update',
                        description: 'ATC price increased by 3.2% in the last 24 hours',
                        time: '12 hours ago',
                        icon: 'bar-chart-3'
                    }
                ]
            });
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    return { dashboardData, isLoading, error };
};
exports.useApiHook = useApiHook;
