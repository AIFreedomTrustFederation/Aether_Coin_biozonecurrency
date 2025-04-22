"use strict";
/**
 * Computational Rewards Service
 * Manages and distributes rewards for computational contributions
 * to the AI Freedom Trust Framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardService = exports.RewardService = void 0;
/**
 * Implementation of the Computational Rewards Service
 */
class RewardService {
    constructor(apiBaseUrl = '/api/rewards') {
        this.apiBaseUrl = apiBaseUrl;
    }
    // Contribution Management
    async registerContribution(contribution) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contributions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contribution)
            });
            if (!response.ok) {
                throw new Error(`Failed to register contribution: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error registering contribution:', error);
            throw error;
        }
    }
    async updateContribution(id, endTime, resourceAmount, quality) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contributions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endTime,
                    resourceAmount,
                    quality
                })
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to update contribution: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error updating contribution ${id}:`, error);
            return null;
        }
    }
    async verifyContribution(id, verified, method) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contributions/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verified,
                    verificationMethod: method
                })
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to verify contribution: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error verifying contribution ${id}:`, error);
            return null;
        }
    }
    async getContribution(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contributions/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get contribution: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching contribution ${id}:`, error);
            return null;
        }
    }
    async listUserContributions(userId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contributions?userId=${encodeURIComponent(userId)}`);
            if (!response.ok) {
                throw new Error(`Failed to list user contributions: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error listing contributions for user ${userId}:`, error);
            return [];
        }
    }
    async listNodeContributions(nodeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contributions?nodeId=${encodeURIComponent(nodeId)}`);
            if (!response.ok) {
                throw new Error(`Failed to list node contributions: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error listing contributions for node ${nodeId}:`, error);
            return [];
        }
    }
    // Reward Distribution
    async distributeFractalCoinRewards(contributionId, amount) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/distributions/fractal-coin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contributionId,
                    fractalCoinAmount: amount,
                    aiCoinAmount: 0,
                    computeCredits: 0
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to distribute FractalCoin rewards: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error distributing FractalCoin rewards for contribution ${contributionId}:`, error);
            throw error;
        }
    }
    async distributeAICoinRewards(contributionId, amount) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/distributions/ai-coin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contributionId,
                    fractalCoinAmount: 0,
                    aiCoinAmount: amount,
                    computeCredits: 0
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to distribute AICoin rewards: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error distributing AICoin rewards for contribution ${contributionId}:`, error);
            throw error;
        }
    }
    async getRewardDistribution(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/distributions/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get reward distribution: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching reward distribution ${id}:`, error);
            return null;
        }
    }
    async updateDistributionStatus(id, status, transactionHash) {
        try {
            const body = { status };
            if (transactionHash) {
                body.transactionHash = transactionHash;
            }
            const response = await fetch(`${this.apiBaseUrl}/distributions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to update distribution status: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error updating distribution ${id} status:`, error);
            return null;
        }
    }
    async listContributionRewards(contributionId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/distributions?contributionId=${contributionId}`);
            if (!response.ok) {
                throw new Error(`Failed to list contribution rewards: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error listing rewards for contribution ${contributionId}:`, error);
            return [];
        }
    }
    // Reward Calculation
    async calculateReward(contributionType, resourceAmount, quality, duration) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contributionType,
                    resourceAmount,
                    quality,
                    duration
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to calculate reward: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error calculating reward:', error);
            throw error;
        }
    }
    async estimateRewardForResource(resourceType, amount, duration) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/estimate?resourceType=${encodeURIComponent(resourceType)}&amount=${amount}&duration=${duration}`);
            if (!response.ok) {
                throw new Error(`Failed to estimate reward: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error estimating reward:', error);
            throw error;
        }
    }
    // Incentive Management
    async getCurrentIncentiveRates() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/incentives/rates`);
            if (!response.ok) {
                throw new Error(`Failed to get current incentive rates: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching incentive rates:', error);
            throw error;
        }
    }
    async getIncentivizedResourceTypes() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/incentives/resource-types`);
            if (!response.ok) {
                throw new Error(`Failed to get incentivized resource types: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching incentivized resource types:', error);
            throw error;
        }
    }
    async updateIncentiveRates(rates) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/incentives/rates`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rates)
            });
            if (!response.ok) {
                throw new Error(`Failed to update incentive rates: ${response.statusText}`);
            }
            return true;
        }
        catch (error) {
            console.error('Error updating incentive rates:', error);
            return false;
        }
    }
}
exports.RewardService = RewardService;
// Singleton instance
exports.rewardService = new RewardService();
exports.default = exports.rewardService;
