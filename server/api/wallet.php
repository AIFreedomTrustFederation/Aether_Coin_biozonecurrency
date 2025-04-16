<?php
/**
 * Wallet API Endpoint for CPanel Hosting
 * 
 * This file implements API endpoints for wallet functionality when
 * deployed to a CPanel hosting environment. It provides a compatible
 * interface to replace the Node.js Express API.
 */

// Include the database adapter
require_once '../cpanel-db-adapter.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('/^\/api\/wallet/', '', $path);

// Extract request data
$data = json_decode(file_get_contents('php://input'), true) ?: [];

// Get authenticated user or return error
$userId = getAuthenticatedUserId();
if (!$userId && $path !== '/public-info') {
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
        handleDeleteRequests($path, $userId);
        break;
    default:
        sendErrorResponse('Method not allowed', 405);
}

// Handle GET requests
function handleGetRequests($path, $userId) {
    if ($path === '/balance') {
        // Get wallet balance
        $balance = getWalletBalance($userId);
        if ($balance !== null) {
            sendJsonResponse([
                'balance' => $balance,
                'currency' => 'ATC'
            ]);
        } else {
            sendErrorResponse('Failed to retrieve balance', 500);
        }
    } 
    else if ($path === '/transactions') {
        // Get transaction history
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            $stmt = $db->prepare("
                SELECT * FROM wallet_transactions 
                WHERE user_id = ? 
                ORDER BY created_at DESC
                LIMIT 20
            ");
            $stmt->execute([$userId]);
            $transactions = $stmt->fetchAll();
            sendJsonResponse(['transactions' => $transactions]);
        } catch (PDOException $e) {
            sendErrorResponse('Failed to retrieve transactions: ' . $e->getMessage(), 500);
        }
    }
    else if ($path === '/public-info') {
        // Public wallet info (no authentication required)
        sendJsonResponse([
            'name' => 'Aetherion Wallet',
            'version' => '1.0.0',
            'network' => 'Mainnet',
            'status' => 'operational'
        ]);
    }
    else {
        sendErrorResponse('Endpoint not found', 404);
    }
}

// Handle POST requests
function handlePostRequests($path, $userId, $data) {
    if ($path === '/transfer') {
        // Validate required fields
        if (empty($data['recipient']) || empty($data['amount'])) {
            sendErrorResponse('Missing required fields', 400);
        }
        
        // Validate transfer amount
        $amount = floatval($data['amount']);
        if ($amount <= 0) {
            sendErrorResponse('Invalid amount', 400);
        }
        
        // Check balance
        $balance = getWalletBalance($userId);
        if ($balance < $amount) {
            sendErrorResponse('Insufficient balance', 400);
        }
        
        // Process transfer
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            // Start transaction
            $db->beginTransaction();
            
            // Create withdrawal transaction
            $withdrawalStmt = $db->prepare("
                INSERT INTO wallet_transactions 
                (user_id, transaction_hash, amount, transaction_type, status) 
                VALUES (?, ?, ?, 'transfer', 'completed')
            ");
            
            // Generate transaction hash
            $txHash = 'tx_' . bin2hex(random_bytes(16));
            
            // Execute withdrawal
            $withdrawalStmt->execute([
                $userId,
                $txHash,
                -$amount
            ]);
            
            // Commit transaction
            $db->commit();
            
            sendJsonResponse([
                'success' => true,
                'transaction' => [
                    'hash' => $txHash,
                    'amount' => $amount,
                    'recipient' => $data['recipient'],
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ]);
        } catch (PDOException $e) {
            $db->rollBack();
            sendErrorResponse('Transfer failed: ' . $e->getMessage(), 500);
        }
    }
    else {
        sendErrorResponse('Endpoint not found', 404);
    }
}

// Handle PUT requests
function handlePutRequests($path, $userId, $data) {
    sendErrorResponse('Endpoint not found', 404);
}

// Handle DELETE requests
function handleDeleteRequests($path, $userId) {
    sendErrorResponse('Endpoint not found', 404);
}