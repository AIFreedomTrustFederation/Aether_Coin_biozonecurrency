import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { eq, and, gte } from 'drizzle-orm';
import {
  domainConfigurations,
  filecoinStorageAllocations,
  domainDeployments,
  domainActivityLogs,
  storageProviderNodes,
  nodeAllocationMapping,
  type DomainConfiguration,
  type FilecoinStorageAllocation,
  type DomainDeployment,
  type InsertDomainConfiguration
} from '../../shared/schema';
import { getFilecoinBridge } from './filecoin-bridge-service';

// Environment variables
const DOMAIN_DEFAULT_STORAGE = parseInt(process.env.DOMAIN_DEFAULT_STORAGE || '104857600', 10); // 100MB default
const DOMAIN_DEFAULT_NODES = parseInt(process.env.DOMAIN_DEFAULT_NODES || '3', 10);
const DEBUG = process.env.DEBUG === 'true';

// Debug logging
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[Domain Hosting Service]', ...args);
  }
}

/**
 * Create a new domain configuration in the database
 */
export async function createDomain(
  userId: number,
  domainData: InsertDomainConfiguration
): Promise<DomainConfiguration> {
  try {
    const [domain] = await db.insert(domainConfigurations)
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
  } catch (error) {
    console.error('Error creating domain:', error);
    throw error;
  }
}

/**
 * Allocate storage for a domain using FractalCoin-Filecoin bridge
 */
export async function allocateStorage(
  domainId: number,
  userId: number,
  storageBytes: number = DOMAIN_DEFAULT_STORAGE,
  nodeCount: number = DOMAIN_DEFAULT_NODES
): Promise<FilecoinStorageAllocation> {
  try {
    // Get the domain
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Get Filecoin bridge service
    const bridge = getFilecoinBridge();
    
    // Allocate storage from FractalCoin network
    const allocation = await bridge.allocateFractalCoinStorage(storageBytes);
    
    // Register with Filecoin
    const bridgeCid = await bridge.registerWithFilecoin(allocation);
    
    // Calculate cost (simple formula, can be made more complex)
    const storageGB = storageBytes / (1024 * 1024 * 1024);
    const costPerGB = 0.05; // Cost in FractalCoin per GB
    const cost = storageGB * costPerGB * nodeCount;
    
    // Create allocation record
    const [storageAllocation] = await db.insert(filecoinStorageAllocations)
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
  } catch (error) {
    console.error('Error allocating storage:', error);
    throw error;
  }
}

/**
 * Deploy website content to IPFS/Filecoin
 */
export async function deployWebsite(
  domainId: number,
  userId: number,
  contentPath: string,
  config: any = {}
): Promise<DomainDeployment> {
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
    const [deployment] = await db.insert(domainDeployments)
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
    await db.update(domainConfigurations)
      .set({ contentCid: cid })
      .where(eq(domainConfigurations.id, domainId));
    
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
  } catch (error) {
    console.error('Error deploying website:', error);
    
    // Log the failure
    try {
      await logDomainActivity(domainId, userId, 'deploy-failed', {
        error: error.message
      });
    } catch (logError) {
      console.error('Failed to log deployment failure:', logError);
    }
    
    throw error;
  }
}

/**
 * Get all domains owned by a user
 */
export async function getUserDomains(userId: number): Promise<DomainConfiguration[]> {
  try {
    const domains = await db.select()
      .from(domainConfigurations)
      .where(eq(domainConfigurations.userId, userId));
    
    return domains;
  } catch (error) {
    console.error('Error fetching user domains:', error);
    throw error;
  }
}

/**
 * Get a domain by its ID
 */
export async function getDomainById(domainId: number): Promise<DomainConfiguration | null> {
  try {
    const [domain] = await db.select()
      .from(domainConfigurations)
      .where(eq(domainConfigurations.id, domainId))
      .limit(1);
    
    return domain || null;
  } catch (error) {
    console.error('Error fetching domain by ID:', error);
    throw error;
  }
}

/**
 * Get active storage allocation for a domain
 */
export async function getActiveAllocation(domainId: number): Promise<FilecoinStorageAllocation | null> {
  try {
    const [allocation] = await db.select()
      .from(filecoinStorageAllocations)
      .where(
        and(
          eq(filecoinStorageAllocations.domainId, domainId),
          eq(filecoinStorageAllocations.status, 'active'),
          gte(filecoinStorageAllocations.expirationDate, new Date())
        )
      )
      .limit(1);
    
    return allocation || null;
  } catch (error) {
    console.error('Error fetching active allocation:', error);
    throw error;
  }
}

/**
 * Get deployments for a domain
 */
export async function getDomainDeployments(domainId: number): Promise<DomainDeployment[]> {
  try {
    const deployments = await db.select()
      .from(domainDeployments)
      .where(eq(domainDeployments.domainId, domainId))
      .orderBy(domainDeployments.deploymentDate);
    
    return deployments;
  } catch (error) {
    console.error('Error fetching domain deployments:', error);
    throw error;
  }
}

/**
 * Log domain activity
 */
export async function logDomainActivity(
  domainId: number,
  userId: number,
  action: string,
  details: any = {}
): Promise<void> {
  try {
    await db.insert(domainActivityLogs)
      .values({
        domainId,
        performedBy: userId,
        action,
        details
      });
  } catch (error) {
    console.error('Error logging domain activity:', error);
    // Don't throw here, just log the error
  }
}

/**
 * Assign storage provider nodes to an allocation
 */
async function assignNodesToAllocation(
  allocationId: number,
  nodeCount: number,
  totalBytes: number
): Promise<void> {
  try {
    // Get available nodes
    const availableNodes = await db.select()
      .from(storageProviderNodes)
      .where(
        and(
          eq(storageProviderNodes.status, 'active'),
          gte(storageProviderNodes.availableBytes, Math.ceil(totalBytes / nodeCount))
        )
      )
      .limit(nodeCount);
    
    if (availableNodes.length < nodeCount) {
      throw new Error(`Not enough storage provider nodes available. Required: ${nodeCount}, Available: ${availableNodes.length}`);
    }
    
    // Calculate bytes per node (including redundancy)
    const bytesPerNode = Math.ceil(totalBytes / nodeCount);
    
    // Create node allocation mappings
    for (const node of availableNodes) {
      await db.insert(nodeAllocationMapping)
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
      await db.update(storageProviderNodes)
        .set({
          availableBytes: node.availableBytes - bytesPerNode
        })
        .where(eq(storageProviderNodes.id, node.id));
    }
  } catch (error) {
    console.error('Error assigning nodes to allocation:', error);
    throw error;
  }
}

/**
 * Get directory statistics
 */
async function getDirectoryStats(directory: string): Promise<{ 
  totalFiles: number, 
  totalSize: number, 
  fileCounts: Record<string, number> 
}> {
  try {
    let totalFiles = 0;
    let totalSize = 0;
    const fileCounts: Record<string, number> = {};
    
    function processDirectory(dirPath: string) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          processDirectory(filePath);
        } else {
          totalFiles++;
          totalSize += stats.size;
          
          // Count by file extension
          const ext = path.extname(file).toLowerCase() || 'unknown';
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
  } catch (error) {
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
export async function getDomainAnalytics(userId: number): Promise<any> {
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
    const allocations = await db.select()
      .from(filecoinStorageAllocations)
      .where(
        and(
          eq(filecoinStorageAllocations.status, 'active'),
          gte(filecoinStorageAllocations.expirationDate, new Date())
        )
      );
    
    // Get all deployments for these domains
    const deployments = await db.select()
      .from(domainDeployments)
      .where(eq(domainDeployments.status, 'success'));
    
    // Calculate totals
    const totalStorage = allocations.reduce((sum, a) => sum + Number(a.storageBytes), 0);
    
    // Get detailed analytics for each domain
    const domainStats = await Promise.all(domains.map(async (domain) => {
      const domainAllocations = allocations.filter(a => a.domainId === domain.id);
      const domainDeployments = deployments.filter(d => d.domainId === domain.id);
      
      // Get node mappings for allocations
      const allocationIds = domainAllocations.map(a => a.id);
      
      const nodes = allocationIds.length > 0 
        ? await db.select()
            .from(nodeAllocationMapping)
            .where(nodeAllocationMapping.allocationId.in(allocationIds))
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
          latest: domainDeployments.length > 0 ? domainDeployments.sort((a, b) => 
            new Date(b.deploymentDate).getTime() - new Date(a.deploymentDate).getTime()
          )[0] : null
        }
      };
    }));
    
    return {
      totalDomains: domains.length,
      totalStorage,
      totalDeployments: deployments.length,
      domains: domainStats
    };
  } catch (error) {
    console.error('Error getting domain analytics:', error);
    throw error;
  }
}