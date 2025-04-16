<?php
/**
 * Main API Router for CPanel Hosting
 * 
 * This file serves as the central router for API requests when deployed to a CPanel environment.
 * It handles all API endpoints not specifically handled by dedicated endpoint files.
 */

// Include the database adapter
require_once '../cpanel-db-adapter.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Extract request data
$data = json_decode(file_get_contents('php://input'), true) ?: [];

// Basic routing system
if (strpos($path, '/api/health') === 0) {
    // Health check endpoint
    sendJsonResponse([
        'status' => 'healthy',
        'version' => '1.0.0',
        'environment' => 'production',
        'timestamp' => date('c')
    ]);
} 
else if (strpos($path, '/api/auth') === 0) {
    // Authentication endpoints
    handleAuthRequests($method, $path, $data);
}
else if (strpos($path, '/api/user') === 0) {
    // User profile endpoints
    handleUserRequests($method, $path, $data);
}
else {
    // Default 404 response for unknown endpoints
    sendErrorResponse('API endpoint not found', 404);
}

// Handle authentication requests
function handleAuthRequests($method, $path, $data) {
    if ($method === 'POST' && $path === '/api/auth/login') {
        // Check required fields
        if (empty($data['username']) || empty($data['password'])) {
            sendErrorResponse('Username and password are required', 400);
        }
        
        // Simple authentication logic (replace with actual database lookup)
        $username = $data['username'];
        $password = $data['password'];
        
        // Get database connection
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            // Query for user
            $stmt = $db->prepare("SELECT id, password_hash FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($password, $user['password_hash'])) {
                sendErrorResponse('Invalid username or password', 401);
            }
            
            // Generate a simple JWT token (in production, use a proper JWT library)
            $token = generateSimpleToken($user['id'], $username);
            
            sendJsonResponse([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $username
                ]
            ]);
        } catch (PDOException $e) {
            sendErrorResponse('Login failed: ' . $e->getMessage(), 500);
        }
    }
    else if ($method === 'POST' && $path === '/api/auth/register') {
        // Check required fields
        if (empty($data['username']) || empty($data['password'])) {
            sendErrorResponse('Username and password are required', 400);
        }
        
        $username = $data['username'];
        $password = $data['password'];
        
        // Validate password strength
        if (strlen($password) < 8) {
            sendErrorResponse('Password must be at least 8 characters long', 400);
        }
        
        // Get database connection
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            // Check if username already exists
            $checkStmt = $db->prepare("SELECT id FROM users WHERE username = ?");
            $checkStmt->execute([$username]);
            if ($checkStmt->fetch()) {
                sendErrorResponse('Username already exists', 409);
            }
            
            // Hash password
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert new user
            $insertStmt = $db->prepare("
                INSERT INTO users (username, password_hash) 
                VALUES (?, ?)
            ");
            $insertStmt->execute([$username, $passwordHash]);
            
            $userId = $db->lastInsertId();
            
            // Generate a token
            $token = generateSimpleToken($userId, $username);
            
            sendJsonResponse([
                'success' => true,
                'message' => 'Registration successful',
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'username' => $username
                ]
            ]);
        } catch (PDOException $e) {
            sendErrorResponse('Registration failed: ' . $e->getMessage(), 500);
        }
    }
    else {
        sendErrorResponse('Auth endpoint not found', 404);
    }
}

// Handle user profile requests
function handleUserRequests($method, $path, $data) {
    // Check authentication
    $userId = getAuthenticatedUserId();
    if (!$userId) {
        sendErrorResponse('Unauthorized', 401);
    }
    
    if ($method === 'GET' && $path === '/api/user/profile') {
        // Get user profile
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            $stmt = $db->prepare("SELECT id, username, wallet_address, created_at FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                sendErrorResponse('User not found', 404);
            }
            
            sendJsonResponse(['user' => $user]);
        } catch (PDOException $e) {
            sendErrorResponse('Failed to retrieve profile: ' . $e->getMessage(), 500);
        }
    }
    else if ($method === 'PUT' && $path === '/api/user/profile') {
        // Update user profile (example: updating wallet address)
        if (empty($data['walletAddress'])) {
            sendErrorResponse('Wallet address is required', 400);
        }
        
        $walletAddress = $data['walletAddress'];
        
        $db = getDbConnection();
        if (!$db) {
            sendErrorResponse('Database connection failed', 500);
        }
        
        try {
            $stmt = $db->prepare("UPDATE users SET wallet_address = ? WHERE id = ?");
            $stmt->execute([$walletAddress, $userId]);
            
            sendJsonResponse([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } catch (PDOException $e) {
            sendErrorResponse('Failed to update profile: ' . $e->getMessage(), 500);
        }
    }
    else {
        sendErrorResponse('User endpoint not found', 404);
    }
}

// Generate a simple token (for demonstration purposes)
function generateSimpleToken($userId, $username) {
    // In production, use a proper JWT library
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'sub' => $userId,
        'name' => $username,
        'iat' => time(),
        'exp' => time() + 3600 // 1 hour expiration
    ]));
    
    $secretKey = getenv('JWT_SECRET') ?: 'your-secret-key';
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $secretKey, true));
    
    return "$header.$payload.$signature";
}