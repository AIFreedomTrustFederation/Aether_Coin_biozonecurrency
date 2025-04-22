"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNodeMarketplaceApi = useNodeMarketplaceApi;
const react_1 = require("react");
const ApiClientFactory_1 = require("../../../api/ApiClientFactory");
/**
 * Node Marketplace API Hook
 *
 * Custom hook for accessing Node Marketplace API endpoints
 */
function useNodeMarketplaceApi() {
    const [availableServices, setAvailableServices] = (0, react_1.useState)([]);
    const [userServices, setUserServices] = (0, react_1.useState)([]);
    const [userRewards, setUserRewards] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchMarketplaceData = async () => {
            try {
                setIsLoading(true);
                // Get the API client for the node marketplace app
                const client = ApiClientFactory_1.apiClientFactory.getClient("nodeMarketplace");
                // In a real implementation, this would fetch data from the server
                // For now, we'll simulate responses
                await new Promise(resolve => setTimeout(resolve, 500));
                // Simulated data
                const services = [
                    {
                        id: "webapp-standard",
                        name: "Web Application - Standard",
                        type: "webapp",
                        specs: {
                            cpu: 4,
                            memory: 8,
                            storage: 100
                        },
                        price: 45
                    },
                    {
                        id: "storage-basic",
                        name: "Storage Solution - Basic",
                        type: "storage",
                        specs: {
                            storage: 500
                        },
                        price: 25
                    },
                    {
                        id: "api-premium",
                        name: "API Service - Premium",
                        type: "api",
                        specs: {
                            cpu: 8,
                            memory: 16,
                            requests: 1000000
                        },
                        price: 85
                    }
                ];
                const rewards = {
                    filecoin: {
                        daily: 0.05,
                        weekly: 0.35,
                        monthly: 1.5
                    },
                    fractalcoin: {
                        daily: 2.4,
                        weekly: 16.8,
                        monthly: 72
                    },
                    aicoin: {
                        daily: 5.8,
                        weekly: 40.6,
                        monthly: 174
                    }
                };
                setAvailableServices(services);
                setUserServices([]);
                setUserRewards(rewards);
            }
            catch (err) {
                console.error("Error fetching Node Marketplace data:", err);
                setError(new Error(err.message || "Failed to fetch Node Marketplace data"));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchMarketplaceData();
    }, []);
    // Function to deploy a new service
    const deployService = async (serviceData) => {
        try {
            setIsLoading(true);
            // Get the API client for the node marketplace app
            const client = ApiClientFactory_1.apiClientFactory.getClient("nodeMarketplace");
            // In a real implementation, this would send data to the server
            // For now, we'll simulate a response
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Update local state
            setUserServices(prev => [...prev, {
                    id: `service-${Date.now()}`,
                    ...serviceData,
                    status: 'active',
                    deployedAt: new Date().toISOString()
                }]);
            return {
                success: true,
                data: {
                    id: `service-${Date.now()}`,
                    ...serviceData,
                }
            };
        }
        catch (err) {
            console.error("Error deploying service:", err);
            throw new Error(err.message || "Failed to deploy service");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Function to calculate estimated rewards based on resource contribution
    const calculateRewards = (resources) => {
        // In a real implementation, this would calculate based on actual formulas
        // For now, we'll use simplified calculations
        const filecoinDaily = resources.storage ? (resources.storage / 1000) * 0.05 : 0;
        const fractalcoinDaily = (resources.cpu ? resources.cpu * 0.3 : 0) +
            (resources.memory ? resources.memory * 0.1 : 0) +
            (resources.storage ? resources.storage * 0.001 : 0);
        const aicoinDaily = resources.cpu ? resources.cpu * 0.75 : 0;
        return {
            filecoin: {
                daily: parseFloat(filecoinDaily.toFixed(3)),
                weekly: parseFloat((filecoinDaily * 7).toFixed(3)),
                monthly: parseFloat((filecoinDaily * 30).toFixed(3)),
            },
            fractalcoin: {
                daily: parseFloat(fractalcoinDaily.toFixed(1)),
                weekly: parseFloat((fractalcoinDaily * 7).toFixed(1)),
                monthly: parseFloat((fractalcoinDaily * 30).toFixed(1)),
            },
            aicoin: {
                daily: parseFloat(aicoinDaily.toFixed(1)),
                weekly: parseFloat((aicoinDaily * 7).toFixed(1)),
                monthly: parseFloat((aicoinDaily * 30).toFixed(1)),
            }
        };
    };
    return {
        availableServices,
        userServices,
        userRewards,
        isLoading,
        error,
        deployService,
        calculateRewards
    };
}
