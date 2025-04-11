/**
 * fractal-network-routes.ts
 * 
 * API routes for the FractalCoin network functionality.
 * Handles node registration, status updates, and network information.
 */

import express from 'express';
import { networkOrchestrator, NodeStatus } from '../services/fractal-network/NetworkOrchestrator';

const router = express.Router();

/**
 * GET /api/fractal-network/shards
 * Get all network shards
 */
router.get('/shards', async (req, res) => {
  try {
    const shards = networkOrchestrator.getAllShards();
    
    res.json({
      success: true,
      shards
    });
  } catch (error) {
    console.error('Error getting shards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network shards',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/fractal-network/statistics
 * Get network statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const statistics = networkOrchestrator.getNetworkStatistics();
    
    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting network statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network statistics',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/fractal-network/nodes/register
 * Register a new node in the network
 */
router.post('/nodes/register', async (req, res) => {
  try {
    const result = await networkOrchestrator.registerNode(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error registering node:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register node',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/fractal-network/nodes/:nodeId
 * Get node status
 */
router.get('/nodes/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const status = networkOrchestrator.getNodeStatus(nodeId);
    
    if (status.exists) {
      res.json({
        success: true,
        node: status
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Node not found'
      });
    }
  } catch (error) {
    console.error('Error getting node status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get node status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PUT /api/fractal-network/nodes/:nodeId/status
 * Update node status
 */
router.put('/nodes/:nodeId/status', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { status, ...additionalData } = req.body;
    
    if (!status || !Object.values(NodeStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const result = networkOrchestrator.updateNodeStatus(nodeId, status, additionalData);
    
    if (result) {
      res.json({
        success: true,
        message: 'Node status updated'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Node not found'
      });
    }
  } catch (error) {
    console.error('Error updating node status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update node status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PUT /api/fractal-network/nodes/:nodeId/high-availability
 * Enable or disable high availability for a node
 */
router.put('/nodes/:nodeId/high-availability', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: enabled'
      });
    }
    
    // Get current node status first
    const nodeInfo = networkOrchestrator.getNodeStatus(nodeId);
    if (!nodeInfo.exists) {
      return res.status(404).json({
        success: false,
        message: 'Node not found'
      });
    }
    
    const result = networkOrchestrator.updateNodeStatus(nodeId, nodeInfo.status as NodeStatus, {
      highAvailability: enabled
    });
    
    if (result) {
      res.json({
        success: true,
        message: `High availability ${enabled ? 'enabled' : 'disabled'}`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Node not found'
      });
    }
  } catch (error) {
    console.error('Error updating high availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update high availability',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;