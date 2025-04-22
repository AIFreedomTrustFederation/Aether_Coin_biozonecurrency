"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDomain = createDomain;
exports.allocateStorage = allocateStorage;
exports.deployWebsite = deployWebsite;
exports.getUserDomains = getUserDomains;
exports.getDomainById = getDomainById;
exports.getActiveAllocation = getActiveAllocation;
exports.getDomainDeployments = getDomainDeployments;
exports.logDomainActivity = logDomainActivity;
exports.getDomainAnalytics = getDomainAnalytics;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../shared/schema");
const filecoin_bridge_service_1 = require("./filecoin-bridge-service");
// Environment variables
const DOMAIN_DEFAULT_STORAGE = parseInt(process.env.DOMAIN_DEFAULT_STORAGE || '104857600', 10); // 100MB default
const DOMAIN_DEFAULT_NODES = parseInt(process.env.DOMAIN_DEFAULT_NODES || '3', 10);
const DEBUG = process.env.DEBUG === 'true';
// Debug logging
function log(...args) {
    if (DEBUG) {
        console.log('[Domain Hosting Service]', ...args);
    }
}
/**
 * Create a new domain configuration in the database
 */
async function createDomain(userId, domainData) {
    try {
        const [domain] = await db_1.db.insert(schema_1.domainConfigurations)
            .values({
            ...domainData,
            userId
        })
            .returning();
        if (!domain) {
            throw new Error('Failed to create domain configuration');
        }
        log('Domain created:', domain.domainName);
        // Log the domain creation activity
        await logDomainActivity(domain.id, userId, 'create', {
            domainName: domain.domainName,
            domainType: domain.domainType
        });
        return domain;
    }
    catch (error) {
        console.error('Error creating domain:', error);
        throw error;
    }
}
/**
 * Allocate storage for a domain using FractalCoin-Filecoin bridge
 */
async function allocateStorage(domainId, userId, storageBytes = DOMAIN_DEFAULT_STORAGE, nodeCount = DOMAIN_DEFAULT_NODES) {
    try {
        // Get the domain
        const domain = await getDomainById(domainId);
        if (!domain) {
            throw new Error(`Domain with ID ${domainId} not found`);
        }
        // Get Filecoin bridge service
        const bridge = (0, filecoin_bridge_service_1.getFilecoinBridge)();
        // Allocate storage from FractalCoin network
        const allocation = await bridge.allocateFractalCoinStorage(storageBytes);
        // Register with Filecoin
        const bridgeCid = await bridge.registerWithFilecoin(allocation);
        // Calculate cost (simple formula, can be made more complex)
        const storageGB = storageBytes / (1024 * 1024 * 1024);
        const costPerGB = 0.05; // Cost in FractalCoin per GB
        const cost = storageGB * costPerGB * nodeCount;
        // Create allocation record
        const [storageAllocation] = await db_1.db.insert(schema_1.filecoinStorageAllocations)
            .values({
            domainId,
            storageBytes,
            nodeCount,
            bridgeCid,
            bridgeConfig: allocation,
            cost,
            status: 'active',
            // Calculate expiration (1 year from now)
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        })
            .returning();
        if (!storageAllocation) {
            throw new Error('Failed to create storage allocation');
        }
        // Log the allocation activity
        await logDomainActivity(domainId, userId, 'allocate-storage', {
            storageBytes,
            nodeCount,
            bridgeCid,
            cost
        });
        // Assign nodes to this allocation
        await assignNodesToAllocation(storageAllocation.id, nodeCount, storageBytes);
        return storageAllocation;
    }
    catch (error) {
        console.error('Error allocating storage:', error);
        throw error;
    }
}
/**
 * Deploy website content to IPFS/Filecoin
 */
async function deployWebsite(domainId, userId, contentPath, config = {}) {
    try {
        // Get the domain
        const domain = await getDomainById(domainId);
        if (!domain) {
            throw new Error(`Domain with ID ${domainId} not found`);
        }
        // Get the storage allocation for this domain
        const allocation = await getActiveAllocation(domainId);
        if (!allocation) {
            throw new Error(`No active storage allocation found for domain ${domain.domainName}`);
        }
        // Import the deploy-to-web3 script (importing directly to avoid path issues)
        const deployToWeb3 = require('../../scripts/deploy-to-web3');
        // Deploy the content to IPFS/Filecoin
        const cid = await deployToWeb3.deployToWeb3Storage(contentPath);
        // Get file stats
        const stats = await getDirectoryStats(contentPath);
        // Create deployment record
        const [deployment] = await db_1.db.insert(schema_1.domainDeployments)
            .values({
            domainId,
            deploymentCid: cid,
            status: 'success',
            ipfsGatewayUrl: `https://${cid}.ipfs.dweb.link/`,
            fileCounts: stats.fileCounts,
            totalSizeBytes: stats.totalSize,
            deploymentConfig: config
        })
            .returning();
        if (!deployment) {
            throw new Error('Failed to create deployment record');
        }
        // Update the domain with the new CID
        await db_1.db.update(schema_1.domainConfigurations)
            .set({ contentCid: cid })
            .where((0, drizzle_orm_1.eq)(schema_1.domainConfigurations.id, domainId));
        // Log the deployment activity
        await logDomainActivity(domainId, userId, 'deploy', {
            cid,
            fileCount: stats.totalFiles,
            totalSize: stats.totalSize
        });
        // Check if ENS domain should be updated
        if (domain.ensRegistered && process.env.ENS_PRIVATE_KEY && process.env.ENS_DOMAIN) {
            await deployToWeb3.updateENSRecord(cid);
            await logDomainActivity(domainId, userId, 'update-ens', {
                cid,
                ensDomain: process.env.ENS_DOMAIN
            });
        }
        return deployment;
    }
    catch (error) {
        console.error('Error deploying website:', error);
        // Log the failure
        try {
            await logDomainActivity(domainId, userId, 'deploy-failed', {
                error: error.message
            });
        }
        catch (logError) {
            console.error('Failed to log deployment failure:', logError);
        }
        throw error;
    }
}
/**
 * Get all domains owned by a user
 */
async function getUserDomains(userId) {
    try {
        const domains = await db_1.db.select()
            .from(schema_1.domainConfigurations)
            .where((0, drizzle_orm_1.eq)(schema_1.domainConfigurations.userId, userId));
        return domains;
    }
    catch (error) {
        console.error('Error fetching user domains:', error);
        throw error;
    }
}
/**
 * Get a domain by its ID
 */
async function getDomainById(domainId) {
    try {
        const [domain] = await db_1.db.select()
            .from(schema_1.domainConfigurations)
            .where((0, drizzle_orm_1.eq)(schema_1.domainConfigurations.id, domainId))
            .limit(1);
        return domain || null;
    }
    catch (error) {
        console.error('Error fetching domain by ID:', error);
        throw error;
    }
}
/**
 * Get active storage allocation for a domain
 */
async function getActiveAllocation(domainId) {
    try {
        const [allocation] = await db_1.db.select()
            .from(schema_1.filecoinStorageAllocations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.filecoinStorageAllocations.domainId, domainId), (0, drizzle_orm_1.eq)(schema_1.filecoinStorageAllocations.status, 'active'), (0, drizzle_orm_1.gte)(schema_1.filecoinStorageAllocations.expirationDate, new Date())))
            .limit(1);
        return allocation || null;
    }
    catch (error) {
        console.error('Error fetching active allocation:', error);
        throw error;
    }
}
/**
 * Get deployments for a domain
 */
async function getDomainDeployments(domainId) {
    try {
        const deployments = await db_1.db.select()
            .from(schema_1.domainDeployments)
            .where((0, drizzle_orm_1.eq)(schema_1.domainDeployments.domainId, domainId))
            .orderBy(schema_1.domainDeployments.deploymentDate);
        return deployments;
    }
    catch (error) {
        console.error('Error fetching domain deployments:', error);
        throw error;
    }
}
/**
 * Log domain activity
 */
async function logDomainActivity(domainId, userId, action, details = {}) {
    try {
        await db_1.db.insert(schema_1.domainActivityLogs)
            .values({
            domainId,
            performedBy: userId,
            action,
            details
        });
    }
    catch (error) {
        console.error('Error logging domain activity:', error);
        // Don't throw here, just log the error
    }
}
/**
 * Assign storage provider nodes to an allocation
 */
async function assignNodesToAllocation(allocationId, nodeCount, totalBytes) {
    try {
        // Get available nodes
        const availableNodes = await db_1.db.select()
            .from(schema_1.storageProviderNodes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.storageProviderNodes.status, 'active'), (0, drizzle_orm_1.gte)(schema_1.storageProviderNodes.availableBytes, Math.ceil(totalBytes / nodeCount))))
            .limit(nodeCount);
        if (availableNodes.length < nodeCount) {
            throw new Error(`Not enough storage provider nodes available. Required: ${nodeCount}, Available: ${availableNodes.length}`);
        }
        // Calculate bytes per node (including redundancy)
        const bytesPerNode = Math.ceil(totalBytes / nodeCount);
        // Create node allocation mappings
        for (const node of availableNodes) {
            await db_1.db.insert(schema_1.nodeAllocationMapping)
                .values({
                nodeId: node.id,
                allocationId,
                bytesAllocated: bytesPerNode,
                status: 'active',
                shardInfo: {
                    shardCount: nodeCount,
                    redundancyFactor: 3,
                    encryptionType: 'aes-256-gcm'
                }
            });
            // Update node's available bytes
            await db_1.db.update(schema_1.storageProviderNodes)
                .set({
                availableBytes: node.availableBytes - bytesPerNode
            })
                .where((0, drizzle_orm_1.eq)(schema_1.storageProviderNodes.id, node.id));
        }
    }
    catch (error) {
        console.error('Error assigning nodes to allocation:', error);
        throw error;
    }
}
/**
 * Get directory statistics
 */
async function getDirectoryStats(directory) {
    try {
        let totalFiles = 0;
        let totalSize = 0;
        const fileCounts = {};
        function processDirectory(dirPath) {
            const files = fs_1.default.readdirSync(dirPath);
            for (const file of files) {
                const filePath = path_1.default.join(dirPath, file);
                const stats = fs_1.default.statSync(filePath);
                if (stats.isDirectory()) {
                    processDirectory(filePath);
                }
                else {
                    totalFiles++;
                    totalSize += stats.size;
                    // Count by file extension
                    const ext = path_1.default.extname(file).toLowerCase() || 'unknown';
                    fileCounts[ext] = (fileCounts[ext] || 0) + 1;
                }
            }
        }
        processDirectory(directory);
        return {
            totalFiles,
            totalSize,
            fileCounts
        };
    }
    catch (error) {
        console.error('Error getting directory stats:', error);
        return {
            totalFiles: 0,
            totalSize: 0,
            fileCounts: {}
        };
    }
}
/**
 * Get domain analysis and reporting data for Trust Portal
 */
async function getDomainAnalytics(userId) {
    try {
        // Get all domains for this user
        const domains = await getUserDomains(userId);
        // Get all allocations across all domains
        const domainIds = domains.map(d => d.id);
        // If no domains, return empty stats
        if (domainIds.length === 0) {
            return {
                totalDomains: 0,
                totalStorage: 0,
                totalDeployments: 0,
                domains: []
            };
        }
        // Get all active allocations for these domains
        const allocations = await db_1.db.select()
            .from(schema_1.filecoinStorageAllocations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.filecoinStorageAllocations.status, 'active'), (0, drizzle_orm_1.gte)(schema_1.filecoinStorageAllocations.expirationDate, new Date())));
        // Get all deployments for these domains
        const deployments = await db_1.db.select()
            .from(schema_1.domainDeployments)
            .where((0, drizzle_orm_1.eq)(schema_1.domainDeployments.status, 'success'));
        // Calculate totals
        const totalStorage = allocations.reduce((sum, a) => sum + Number(a.storageBytes), 0);
        // Get detailed analytics for each domain
        const domainStats = await Promise.all(domains.map(async (domain) => {
            const domainAllocations = allocations.filter(a => a.domainId === domain.id);
            const domainDeployments = deployments.filter(d => d.domainId === domain.id);
            // Get node mappings for allocations
            const allocationIds = domainAllocations.map(a => a.id);
            const nodes = allocationIds.length > 0
                ? await db_1.db.select()
                    .from(schema_1.nodeAllocationMapping)
                    .where(schema_1.nodeAllocationMapping.allocationId.in(allocationIds))
                : [];
            return {
                domainId: domain.id,
                domainName: domain.domainName,
                domainType: domain.domainType,
                status: domain.active ? 'active' : 'inactive',
                storage: {
                    total: domainAllocations.reduce((sum, a) => sum + Number(a.storageBytes), 0),
                    nodeCount: nodes.length,
                    cost: domainAllocations.reduce((sum, a) => sum + Number(a.cost), 0)
                },
                deployments: {
                    count: domainDeployments.length,
                    latest: domainDeployments.length > 0 ? domainDeployments.sort((a, b) => new Date(b.deploymentDate).getTime() - new Date(a.deploymentDate).getTime())[0] : null
                }
            };
        }));
        return {
            totalDomains: domains.length,
            totalStorage,
            totalDeployments: deployments.length,
            domains: domainStats
        };
    }
    catch (error) {
        console.error('Error getting domain analytics:', error);
        throw error;
    }
}
