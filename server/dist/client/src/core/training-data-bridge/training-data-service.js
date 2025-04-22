"use strict";
/**
 * Training Data Bridge Service
 * Connects the AI Freedom Trust Framework to Filecoin for decentralized
 * storage and processing of LLM training data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingDataService = exports.TrainingDataService = void 0;
/**
 * Implementation of the Training Data Bridge Service
 */
class TrainingDataService {
    constructor(apiBaseUrl = '/api/training-data') {
        this.apiBaseUrl = apiBaseUrl;
    }
    // Dataset Management
    async createDataset(data) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Failed to create dataset: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error creating dataset:', error);
            throw error;
        }
    }
    async getDataset(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get dataset: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching dataset ${id}:`, error);
            return null;
        }
    }
    async updateDataset(id, updates) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to update dataset: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error updating dataset ${id}:`, error);
            return null;
        }
    }
    async listDatasets(dataType, status) {
        try {
            let url = `${this.apiBaseUrl}/datasets`;
            const params = new URLSearchParams();
            if (dataType) {
                params.append('dataType', dataType);
            }
            if (status) {
                params.append('status', status);
            }
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to list datasets: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error listing datasets:', error);
            return [];
        }
    }
    // Fragment Management
    async addFragmentToDataset(datasetId, data) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/fragments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Failed to add fragment to dataset: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error adding fragment to dataset ${datasetId}:`, error);
            throw error;
        }
    }
    async getFragment(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/fragments/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get fragment: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching fragment ${id}:`, error);
            return null;
        }
    }
    async listDatasetFragments(datasetId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/fragments`);
            if (!response.ok) {
                throw new Error(`Failed to list dataset fragments: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error listing fragments for dataset ${datasetId}:`, error);
            return [];
        }
    }
    // Filecoin Integration
    async storeDatasetOnFilecoin(datasetId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/store-filecoin`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error(`Failed to store dataset on Filecoin: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error storing dataset ${datasetId} on Filecoin:`, error);
            throw error;
        }
    }
    async storeFragmentOnFilecoin(fragmentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/fragments/${fragmentId}/store-filecoin`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error(`Failed to store fragment on Filecoin: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error storing fragment ${fragmentId} on Filecoin:`, error);
            throw error;
        }
    }
    async retrieveDatasetFromFilecoin(datasetId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/retrieve-filecoin`);
            if (!response.ok) {
                throw new Error(`Failed to retrieve dataset from Filecoin: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error retrieving dataset ${datasetId} from Filecoin:`, error);
            throw error;
        }
    }
    async retrieveFragmentFromFilecoin(fragmentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/fragments/${fragmentId}/retrieve-filecoin`);
            if (!response.ok) {
                throw new Error(`Failed to retrieve fragment from Filecoin: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error retrieving fragment ${fragmentId} from Filecoin:`, error);
            throw error;
        }
    }
    async verifyFilecoinStorage(cid) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/filecoin/verify?cid=${encodeURIComponent(cid)}`);
            if (!response.ok) {
                throw new Error(`Failed to verify Filecoin storage: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error verifying Filecoin storage for CID ${cid}:`, error);
            throw error;
        }
    }
    // FractalCoin Integration
    async shardFragmentOnFractalChain(fragmentId, shardCount) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/fragments/${fragmentId}/shard-fractal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shardCount })
            });
            if (!response.ok) {
                throw new Error(`Failed to shard fragment on FractalChain: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error sharding fragment ${fragmentId} on FractalChain:`, error);
            throw error;
        }
    }
    async retrieveFragmentFromFractalChain(shardIds) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/fractal/retrieve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shardIds })
            });
            if (!response.ok) {
                throw new Error(`Failed to retrieve fragment from FractalChain: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error retrieving fragment from FractalChain:', error);
            throw error;
        }
    }
    // Data Processing
    async preprocessTrainingData(datasetId, options) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/preprocess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });
            if (!response.ok) {
                throw new Error(`Failed to preprocess training data: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error preprocessing training data for dataset ${datasetId}:`, error);
            throw error;
        }
    }
    async validateDataQuality(datasetId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/validate`);
            if (!response.ok) {
                throw new Error(`Failed to validate data quality: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error validating data quality for dataset ${datasetId}:`, error);
            throw error;
        }
    }
    async extractMetadataFromDataset(datasetId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/${datasetId}/metadata`);
            if (!response.ok) {
                throw new Error(`Failed to extract metadata from dataset: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error extracting metadata from dataset ${datasetId}:`, error);
            throw error;
        }
    }
}
exports.TrainingDataService = TrainingDataService;
// Singleton instance
exports.trainingDataService = new TrainingDataService();
exports.default = exports.trainingDataService;
