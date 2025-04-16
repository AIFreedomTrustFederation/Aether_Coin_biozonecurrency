<?php
/**
 * Aetherion Wallet API - Node Marketplace Endpoint
 * 
 * This file handles node marketplace API requests including:
 * - Listing available nodes
 * - Node details
 * - Node purchase
 * - Node listing/selling
 * 
 * Part of the Aetherion Wallet system
 */

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration
$configFile = __DIR__ . '/../config/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server configuration not found'
    ]);
    exit();
}

$config = require_once $configFile;

// Connect to database
try {
    $dsn = "mysql:host={$config['database']['host']};dbname={$config['database']['dbname']}";
    $pdo = new PDO($dsn, $config['database']['username'], $config['database']['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => 'Service temporarily unavailable'
    ]);
    exit();
}

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api/node-marketplace.php';
$path = str_replace($basePath, '', $requestUri);
$path = trim($path, '/');
$pathParts = explode('/', $path);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get request body
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

// Handle different endpoints
switch ($pathParts[0]) {
    case 'list':
        handleListNodesRequest($pdo, $method, $requestData);
        break;
    case 'node':
        handleNodeDetailsRequest($pdo, $method, $pathParts, $requestData);
        break;
    case 'purchase':
        handleNodePurchaseRequest($pdo, $method, $requestData);
        break;
    case 'sell':
        handleNodeSellRequest($pdo, $method, $requestData);
        break;
    default:
        // Return API info if no specific endpoint
        handleApiInfo();
        break;
}

/**
 * Handle node listing requests
 */
function handleListNodesRequest($pdo, $method, $requestData) {
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Get pagination parameters
    $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Get filter parameters
    $nodeType = isset($_GET['nodeType']) ? $_GET['nodeType'] : null;
    $maxPrice = isset($_GET['maxPrice']) ? (float) $_GET['maxPrice'] : null;
    
    // Build query
    $query = 'SELECT * FROM fractalnode_marketplace WHERE status = :status';
    $params = ['status' => 'active'];
    
    if ($nodeType) {
        $query .= ' AND node_type = :nodeType';
        $params['nodeType'] = $nodeType;
    }
    
    if ($maxPrice) {
        $query .= ' AND price <= :maxPrice';
        $params['maxPrice'] = $maxPrice;
    }
    
    $query .= ' ORDER BY price ASC LIMIT :limit OFFSET :offset';

    // Fetch nodes
    try {
        $stmt = $pdo->prepare($query);
        
        // Bind parameters
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $nodes = $stmt->fetchAll();

        // Get total count for pagination
        $countQuery = str_replace('SELECT *', 'SELECT COUNT(*)', $query);
        $countQuery = preg_replace('/LIMIT.*$/i', '', $countQuery);
        
        $countStmt = $pdo->prepare($countQuery);
        
        // Bind parameters
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->fetchColumn();
        
        echo json_encode([
            'status' => 'success',
            'data' => [
                'nodes' => $nodes,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'totalCount' => $totalCount,
                    'totalPages' => ceil($totalCount / $limit)
                ]
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to retrieve nodes'
        ]);
    }
}

/**
 * Handle node details requests
 */
function handleNodeDetailsRequest($pdo, $method, $pathParts, $requestData) {
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Get node ID from path
    $nodeId = isset($pathParts[1]) ? $pathParts[1] : null;
    
    if (!$nodeId) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Node ID is required'
        ]);
        return;
    }

    // Fetch node details
    try {
        $stmt = $pdo->prepare('SELECT * FROM fractalnode_marketplace WHERE node_id = :nodeId');
        $stmt->execute(['nodeId' => $nodeId]);
        $node = $stmt->fetch();

        if (!$node) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Node not found'
            ]);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $node
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to retrieve node details'
        ]);
    }
}

/**
 * Handle node purchase requests
 */
function handleNodePurchaseRequest($pdo, $method, $requestData) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Validate request data
    if (!isset($requestData['nodeId']) || !isset($requestData['buyerAddress'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields'
        ]);
        return;
    }

    $nodeId = $requestData['nodeId'];
    $buyerAddress = $requestData['buyerAddress'];
    
    // Start transaction
    try {
        $pdo->beginTransaction();
        
        // Fetch node details
        $nodeStmt = $pdo->prepare('SELECT * FROM fractalnode_marketplace WHERE node_id = :nodeId AND status = :status FOR UPDATE');
        $nodeStmt->execute([
            'nodeId' => $nodeId,
            'status' => 'active'
        ]);
        
        $node = $nodeStmt->fetch();
        
        if (!$node) {
            throw new Exception('Node not found or not available for purchase');
        }
        
        $sellerAddress = $node['owner_address'];
        $price = (float) $node['price'];
        
        // Check buyer wallet exists and has sufficient balance
        $walletStmt = $pdo->prepare('SELECT balance FROM wallets WHERE address = :address FOR UPDATE');
        $walletStmt->execute(['address' => $buyerAddress]);
        $buyerWallet = $walletStmt->fetch();
        
        if (!$buyerWallet) {
            throw new Exception('Buyer wallet not found');
        }
        
        $buyerBalance = (float) $buyerWallet['balance'];
        
        if ($buyerBalance < $price) {
            throw new Exception('Insufficient balance to purchase node');
        }
        
        // Check seller wallet exists
        $walletStmt->execute(['address' => $sellerAddress]);
        $sellerWallet = $walletStmt->fetch();
        
        if (!$sellerWallet) {
            throw new Exception('Seller wallet not found');
        }
        
        // Update node ownership
        $updateStmt = $pdo->prepare('UPDATE fractalnode_marketplace SET owner_address = :newOwner, status = :status WHERE node_id = :nodeId');
        $updateStmt->execute([
            'newOwner' => $buyerAddress,
            'status' => 'sold', // Or 'active' if the node should remain listed
            'nodeId' => $nodeId
        ]);
        
        // Update buyer balance
        $updateBalanceStmt = $pdo->prepare('UPDATE wallets SET balance = balance - :amount WHERE address = :address');
        $updateBalanceStmt->execute([
            'amount' => $price,
            'address' => $buyerAddress
        ]);
        
        // Update seller balance
        $updateBalanceStmt = $pdo->prepare('UPDATE wallets SET balance = balance + :amount WHERE address = :address');
        $updateBalanceStmt->execute([
            'amount' => $price,
            'address' => $sellerAddress
        ]);
        
        // Record transaction
        $txHash = 'tx' . bin2hex(random_bytes(16));
        
        $txStmt = $pdo->prepare('INSERT INTO transactions 
                               (tx_hash, from_address, to_address, amount, fee, status) 
                               VALUES (:txHash, :fromAddress, :toAddress, :amount, :fee, :status)');
        
        $txStmt->execute([
            'txHash' => $txHash,
            'fromAddress' => $buyerAddress,
            'toAddress' => $sellerAddress,
            'amount' => $price,
            'fee' => 0,
            'status' => 'confirmed'
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'status' => 'success',
            'data' => [
                'nodeId' => $nodeId,
                'txHash' => $txHash,
                'buyerAddress' => $buyerAddress,
                'sellerAddress' => $sellerAddress,
                'price' => $price,
                'message' => 'Node purchased successfully'
            ]
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Handle node sell requests
 */
function handleNodeSellRequest($pdo, $method, $requestData) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Validate request data
    if (!isset($requestData['ownerAddress']) || 
        !isset($requestData['nodeType']) || 
        !isset($requestData['price']) || 
        !isset($requestData['description'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields'
        ]);
        return;
    }

    $ownerAddress = $requestData['ownerAddress'];
    $nodeType = $requestData['nodeType'];
    $price = (float) $requestData['price'];
    $description = $requestData['description'];
    
    if ($price <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Price must be greater than zero'
        ]);
        return;
    }
    
    // Check owner wallet exists
    try {
        $stmt = $pdo->prepare('SELECT id FROM wallets WHERE address = :address');
        $stmt->execute(['address' => $ownerAddress]);
        $wallet = $stmt->fetch();
        
        if (!$wallet) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Owner wallet not found'
            ]);
            return;
        }
        
        // Generate node ID
        $nodeId = 'node' . bin2hex(random_bytes(8));
        
        // Create node listing
        $stmt = $pdo->prepare('INSERT INTO fractalnode_marketplace 
                              (node_id, owner_address, node_type, price, description, status) 
                              VALUES (:nodeId, :ownerAddress, :nodeType, :price, :description, :status)');
        
        $stmt->execute([
            'nodeId' => $nodeId,
            'ownerAddress' => $ownerAddress,
            'nodeType' => $nodeType,
            'price' => $price,
            'description' => $description,
            'status' => 'active'
        ]);
        
        echo json_encode([
            'status' => 'success',
            'data' => [
                'nodeId' => $nodeId,
                'ownerAddress' => $ownerAddress,
                'nodeType' => $nodeType,
                'price' => $price,
                'description' => $description,
                'status' => 'active',
                'message' => 'Node listed successfully'
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to list node'
        ]);
    }
}

/**
 * Handle API info request
 */
function handleApiInfo() {
    echo json_encode([
        'status' => 'success',
        'data' => [
            'name' => 'Aetherion Node Marketplace API',
            'version' => '1.0.0',
            'endpoints' => [
                '/list' => 'List available nodes',
                '/node/{nodeId}' => 'Get node details',
                '/purchase' => 'Purchase a node',
                '/sell' => 'List a node for sale'
            ]
        ]
    ]);
}