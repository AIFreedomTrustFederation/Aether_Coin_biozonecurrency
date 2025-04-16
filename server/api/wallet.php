<?php
/**
 * Aetherion Wallet API - Wallet Endpoint
 * 
 * This file handles wallet-related API requests including:
 * - Wallet creation
 * - Balance retrieval
 * - Transaction history
 * - Sending transactions
 * 
 * Part of the Aetherion Wallet system
 */

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
$basePath = '/api/wallet.php';
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
    case 'balance':
        handleBalanceRequest($pdo, $method, $pathParts, $requestData);
        break;
    case 'create':
        handleCreateWalletRequest($pdo, $method, $requestData);
        break;
    case 'transactions':
        handleTransactionsRequest($pdo, $method, $pathParts, $requestData);
        break;
    case 'send':
        handleSendTransactionRequest($pdo, $method, $requestData);
        break;
    default:
        // Return API info if no specific endpoint
        handleApiInfo();
        break;
}

/**
 * Handle wallet balance requests
 */
function handleBalanceRequest($pdo, $method, $pathParts, $requestData) {
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Get address from path
    $address = isset($pathParts[1]) ? $pathParts[1] : null;
    
    if (!$address) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Wallet address is required'
        ]);
        return;
    }

    // Fetch wallet balance
    try {
        $stmt = $pdo->prepare('SELECT balance FROM wallets WHERE address = :address');
        $stmt->execute(['address' => $address]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Wallet not found'
            ]);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'data' => [
                'address' => $address,
                'balance' => (float) $wallet['balance']
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to retrieve wallet balance'
        ]);
    }
}

/**
 * Handle wallet creation requests
 */
function handleCreateWalletRequest($pdo, $method, $requestData) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Validate request data
    if (!isset($requestData['userId']) || !isset($requestData['publicKey']) || !isset($requestData['encryptedPrivateKey'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields'
        ]);
        return;
    }

    // Generate a new wallet address (in a real implementation, this would use proper crypto)
    $address = 'atc' . bin2hex(random_bytes(20));
    
    // Create wallet in database
    try {
        $stmt = $pdo->prepare('INSERT INTO wallets (user_id, address, public_key, encrypted_private_key, balance) 
                               VALUES (:userId, :address, :publicKey, :encryptedPrivateKey, 0)');
        
        $stmt->execute([
            'userId' => $requestData['userId'],
            'address' => $address,
            'publicKey' => $requestData['publicKey'],
            'encryptedPrivateKey' => $requestData['encryptedPrivateKey']
        ]);
        
        echo json_encode([
            'status' => 'success',
            'data' => [
                'address' => $address,
                'balance' => 0
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to create wallet'
        ]);
    }
}

/**
 * Handle transaction history requests
 */
function handleTransactionsRequest($pdo, $method, $pathParts, $requestData) {
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Get address from path
    $address = isset($pathParts[1]) ? $pathParts[1] : null;
    
    if (!$address) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Wallet address is required'
        ]);
        return;
    }

    // Fetch transactions
    try {
        $stmt = $pdo->prepare('SELECT * FROM transactions 
                               WHERE from_address = :address OR to_address = :address 
                               ORDER BY timestamp DESC');
        $stmt->execute(['address' => $address]);
        $transactions = $stmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'data' => $transactions
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to retrieve transaction history'
        ]);
    }
}

/**
 * Handle send transaction requests
 */
function handleSendTransactionRequest($pdo, $method, $requestData) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        return;
    }

    // Validate request data
    if (!isset($requestData['fromAddress']) || 
        !isset($requestData['toAddress']) || 
        !isset($requestData['amount'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields'
        ]);
        return;
    }

    $fromAddress = $requestData['fromAddress'];
    $toAddress = $requestData['toAddress'];
    $amount = (float) $requestData['amount'];
    $fee = 0.001; // Fixed transaction fee
    
    if ($amount <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Amount must be greater than zero'
        ]);
        return;
    }

    // Start transaction
    try {
        $pdo->beginTransaction();
        
        // Check sender balance
        $stmt = $pdo->prepare('SELECT balance FROM wallets WHERE address = :address FOR UPDATE');
        $stmt->execute(['address' => $fromAddress]);
        $senderWallet = $stmt->fetch();
        
        if (!$senderWallet) {
            throw new Exception('Sender wallet not found');
        }
        
        $senderBalance = (float) $senderWallet['balance'];
        $totalAmount = $amount + $fee;
        
        if ($senderBalance < $totalAmount) {
            throw new Exception('Insufficient balance');
        }
        
        // Check receiver wallet exists
        $stmt = $pdo->prepare('SELECT id FROM wallets WHERE address = :address');
        $stmt->execute(['address' => $toAddress]);
        $receiverWallet = $stmt->fetch();
        
        if (!$receiverWallet) {
            throw new Exception('Receiver wallet not found');
        }
        
        // Generate transaction hash
        $txHash = 'tx' . bin2hex(random_bytes(16));
        
        // Update sender balance
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance - :amount WHERE address = :address');
        $stmt->execute([
            'amount' => $totalAmount,
            'address' => $fromAddress
        ]);
        
        // Update receiver balance
        $stmt = $pdo->prepare('UPDATE wallets SET balance = balance + :amount WHERE address = :address');
        $stmt->execute([
            'amount' => $amount,
            'address' => $toAddress
        ]);
        
        // Record transaction
        $stmt = $pdo->prepare('INSERT INTO transactions 
                              (tx_hash, from_address, to_address, amount, fee, status) 
                              VALUES (:txHash, :fromAddress, :toAddress, :amount, :fee, :status)');
        
        $stmt->execute([
            'txHash' => $txHash,
            'fromAddress' => $fromAddress,
            'toAddress' => $toAddress,
            'amount' => $amount,
            'fee' => $fee,
            'status' => 'confirmed'
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'status' => 'success',
            'data' => [
                'txHash' => $txHash,
                'fromAddress' => $fromAddress,
                'toAddress' => $toAddress,
                'amount' => $amount,
                'fee' => $fee,
                'status' => 'confirmed'
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
 * Handle API info request
 */
function handleApiInfo() {
    echo json_encode([
        'status' => 'success',
        'data' => [
            'name' => 'Aetherion Wallet API',
            'version' => '1.0.0',
            'endpoints' => [
                '/balance/{address}' => 'Get wallet balance',
                '/create' => 'Create a new wallet',
                '/transactions/{address}' => 'Get transaction history',
                '/send' => 'Send a transaction'
            ]
        ]
    ]);
}