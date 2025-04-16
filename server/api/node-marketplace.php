<?php
/**
 * Node Marketplace API Endpoint for CPanel Hosting
 * 
 * This file implements API endpoints for node marketplace functionality when
 * deployed to a CPanel hosting environment. It provides a compatible
 * interface to replace the Node.js Express API.
 */

// Include the database adapter
require_once '../cpanel-db-adapter.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('/^\/api\/node-marketplace/', '', $path);

// Extract request data
$data = json_decode(file_get_contents('php://input'), true) ?: [];

// Get authenticated user or return error for protected routes
$userId = getAuthenticatedUserId();
if (!$userId && $path !== '/available-nodes' && $path !== '/stats') {
    sendErrorResponse('Unauthorized', 401);
}

// Route handling based on method and path
switch ($method) {
    case 'GET':
        handleGetRequests($path, $userId);
        break;
    case 'POST':
        handlePostRequests($path, $userId, $data);
        break;
    case 'PUT':
        handlePutRequests($path, $userId, $data);
        break;
    case 'DELETE':
        handleDeleteRequests($path, $userId, $data);
        break;
    default:
        sendErrorResponse('Method not allowed', 405);
}

// Handle GET requests
function handleGetRequests($path, $userId) {
    if ($path === '/my-nodes') {
        // Get user's nodes
        $nodes = getUserNodes($userId);
        if ($nodes !== null) {
            sendJsonResponse([
                'nodes' => $nodes
            ]);
        } else {
            sendErrorResponse('Failed to retrieve nodes', 500);
        }
    }
    else if ($path === '/available-nodes') {
        // Get available node templates (public endpoint)
        sendJsonResponse([
            'availableNodes' => [
                [
                    'id' => 'storage-small',
                    'name' => 'Storage Node (Small)',
                    'description' => 'Basic storage node with 100GB capacity',
                    'resourceType' => 'storage',
                    'resourceAmount' => 100,
                    'initialCost' => 10,
                    'earningsRate' => 0.5,
                    'requirements' => [
                        'minUptime' => '95%',
                        'minBandwidth' => '10Mbps',
                        'minCpu' => '1 core'
                    ]
                ],
                [
                    'id' => 'storage-medium',
                    'name' => 'Storage Node (Medium)',
                    'description' => 'Enhanced storage node with 500GB capacity',
                    'resourceType' => 'storage',
                    'resourceAmount' => 500,
                    'initialCost' => 40,
                    'earningsRate' => 2.5,
                    'requirements' => [
                        'minUptime' => '97%',
                        'minBandwidth' => '50Mbps',
                        'minCpu' => '2 cores'
                    ]
                ],
                [
                    'id' => 'computation-small',
                    'name' => 'Computation Node (Small)',
                    'description' => 'Basic computation node with 2 CPU cores',
                    'resourceType' => 'computation',
                    'resourceAmount' => 2,
                    'initialCost' => 15,
                    'earningsRate' => 0.8,
                    'requirements' => [
                        'minUptime' => '98%',
                        'minBandwidth' => '20Mbps',
                        'minRam' => '4GB'
                    ]
                ],
                [
                    'id' => 'computation-medium',
                    'name' => 'Computation Node (Medium)',
                    'description' => 'Enhanced computation node with 4 CPU cores',
                    'resourceType' => 'computation',
                    'resourceAmount' => 4,
                    'initialCost' => 35,
                    'earningsRate' => 1.8,
                    'requirements' => [
                        'minUptime' => '99%',
                        'minBandwidth' => '50Mbps',
                        'minRam' => '8GB'
                    ]
                ],
                [
                    'id' => 'bandwidth-small',
                    'name' => 'Bandwidth Node (Small)',
                    'description' => 'Basic bandwidth node with 100Mbps capacity',
                    'resourceType' => 'bandwidth',
                    'resourceAmount' => 100,
                    'initialCost' => 12,
                    'earningsRate' => 0.6,
                    'requirements' => [
                        'minUptime' => '96%',
                        'minStorage' => '50GB'
                    ]
                ]
            ]
        ]);
    }
    else if ($path === '/stats') {
        // Get network statistics (public endpoint)
        sendJsonResponse([
            'stats' => [
                'totalNodes' => 1247,
                'activeNodes' => 1185,
                'totalStorage' => 524000, // GB
                'totalComputation' => 5280, // CPU cores
                'totalBandwidth' => 245000, // Mbps
                'averageUptime' => 98.7, // percentage
                'totalRewardsDistributed' => 1245780.45,
                'lastUpdated' => date('Y-m-d H:i:s')
            ]
        ]);
    }
    else if (preg_match('/^\/node\/(\d+)$/', $path, $matches)) {
        $nodeId = $matches[1];
        
        // Get detailed info for a specific node
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            $stmt = $db->prepare("
                SELECT * FROM node_devices 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$nodeId, $userId]);
            $node = $stmt->fetch();
            
            if (!$node) {
                sendErrorResponse('Node not found or not owned by user', 404);
            }
            
            // Enhance node data with performance metrics
            $node['metrics'] = [
                'uptime' => rand(95, 100),
                'latency' => rand(10, 100),
                'earningsLast24h' => round(rand(10, 50) / 10, 2),
                'storageUsed' => $node['resource_type'] === 'storage' ? rand(10, $node['resource_amount']) : null,
                'cpuUsage' => $node['resource_type'] === 'computation' ? rand(10, 90) : null,
                'bandwidthUsage' => $node['resource_type'] === 'bandwidth' ? rand(10, 90) : null,
            ];
            
            sendJsonResponse(['node' => $node]);
        } catch (PDOException $e) {
            sendErrorResponse('Failed to retrieve node: ' . $e->getMessage(), 500);
        }
    }
    else {
        sendErrorResponse('Endpoint not found', 404);
    }
}

// Handle POST requests
function handlePostRequests($path, $userId, $data) {
    if ($path === '/deploy') {
        // Validate required fields
        if (empty($data['nodeType']) || empty($data['name'])) {
            sendErrorResponse('Missing required fields', 400);
        }
        
        // Extract node template based on nodeType
        $nodeType = $data['nodeType'];
        $nodeName = $data['name'];
        
        // Simplified logic to determine node characteristics
        $resourceType = '';
        $resourceAmount = 0;
        
        if (strpos($nodeType, 'storage') === 0) {
            $resourceType = 'storage';
            $resourceAmount = strpos($nodeType, 'small') !== false ? 100 : 500;
        } else if (strpos($nodeType, 'computation') === 0) {
            $resourceType = 'computation';
            $resourceAmount = strpos($nodeType, 'small') !== false ? 2 : 4;
        } else if (strpos($nodeType, 'bandwidth') === 0) {
            $resourceType = 'bandwidth';
            $resourceAmount = strpos($nodeType, 'small') !== false ? 100 : 250;
        } else {
            sendErrorResponse('Invalid node type', 400);
        }
        
        // Create node
        $success = createNode($userId, $nodeName, $resourceType, $resourceAmount);
        
        if ($success) {
            sendJsonResponse([
                'success' => true,
                'message' => 'Node deployed successfully',
                'node' => [
                    'name' => $nodeName,
                    'resourceType' => $resourceType,
                    'resourceAmount' => $resourceAmount,
                    'status' => 'pending'
                ]
            ]);
        } else {
            sendErrorResponse('Failed to deploy node', 500);
        }
    }
    else {
        sendErrorResponse('Endpoint not found', 404);
    }
}

// Handle PUT requests
function handlePutRequests($path, $userId, $data) {
    if (preg_match('/^\/node\/(\d+)\/status$/', $path, $matches)) {
        $nodeId = $matches[1];
        
        // Validate required fields
        if (empty($data['status'])) {
            sendErrorResponse('Missing status field', 400);
        }
        
        $status = $data['status'];
        if (!in_array($status, ['active', 'inactive', 'pending'])) {
            sendErrorResponse('Invalid status value', 400);
        }
        
        // Update node status
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            // First verify the node belongs to the user
            $checkStmt = $db->prepare("
                SELECT id FROM node_devices 
                WHERE id = ? AND user_id = ?
            ");
            $checkStmt->execute([$nodeId, $userId]);
            if (!$checkStmt->fetch()) {
                sendErrorResponse('Node not found or not owned by user', 404);
            }
            
            // Update the status
            $updateStmt = $db->prepare("
                UPDATE node_devices 
                SET status = ? 
                WHERE id = ?
            ");
            $updateStmt->execute([$status, $nodeId]);
            
            sendJsonResponse([
                'success' => true,
                'message' => 'Node status updated successfully'
            ]);
        } catch (PDOException $e) {
            sendErrorResponse('Failed to update node: ' . $e->getMessage(), 500);
        }
    }
    else {
        sendErrorResponse('Endpoint not found', 404);
    }
}

// Handle DELETE requests
function handleDeleteRequests($path, $userId, $data) {
    if (preg_match('/^\/node\/(\d+)$/', $path, $matches)) {
        $nodeId = $matches[1];
        
        // Delete node
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            // First verify the node belongs to the user
            $checkStmt = $db->prepare("
                SELECT id FROM node_devices 
                WHERE id = ? AND user_id = ?
            ");
            $checkStmt->execute([$nodeId, $userId]);
            if (!$checkStmt->fetch()) {
                sendErrorResponse('Node not found or not owned by user', 404);
            }
            
            // Delete the node
            $deleteStmt = $db->prepare("
                DELETE FROM node_devices 
                WHERE id = ?
            ");
            $deleteStmt->execute([$nodeId]);
            
            sendJsonResponse([
                'success' => true,
                'message' => 'Node deleted successfully'
            ]);
        } catch (PDOException $e) {
            sendErrorResponse('Failed to delete node: ' . $e->getMessage(), 500);
        }
    }
    else {
        sendErrorResponse('Endpoint not found', 404);
    }
}