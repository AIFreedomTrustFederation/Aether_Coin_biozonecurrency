<?php
/**
 * CPanel Database Adapter for Aetherion Wallet
 * 
 * This script provides a bridge between the Aetherion Wallet's Node.js API
 * and CPanel's PHP/MySQL environment. It is used when the application is
 * deployed to a standard CPanel hosting environment without Node.js support.
 * 
 * Usage: 
 * 1. Include this file in your PHP API endpoints
 * 2. Use the provided functions to interact with the database
 */

// Enable CORS for API requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables from .env.production
function loadEnv($path = '.env.production') {
    if (file_exists($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '#') === 0) continue; // Skip comments
            list($name, $value) = explode('=', $line, 2);
            if (!empty($name)) {
                putenv("$name=$value");
                $_ENV[$name] = $value;
            }
        }
    }
}

// Load environment variables
loadEnv();

// Database connection
function getDbConnection() {
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'aetherion_db';
    $username = getenv('DB_USER') ?: 'db_user';
    $password = getenv('DB_PASS') ?: 'db_password';

    try {
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, $username, $password, $options);
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}

// Function to validate JWT tokens (simplified)
function validateToken($token) {
    // This is a simplified validation, replace with proper JWT validation
    // using a library like firebase/php-jwt in production
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    // In a real implementation, verify signature and expiration
    return true;
}

// Get authenticated user ID from token
function getAuthenticatedUserId() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    if (!validateToken($token)) {
        return null;
    }
    
    // In a real implementation, extract user ID from token
    // This is just a placeholder
    return 1;
}

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Helper function to send error response
function sendErrorResponse($message, $statusCode = 400) {
    sendJsonResponse(['error' => $message], $statusCode);
}

// Example function to get wallet balance
function getWalletBalance($userId) {
    $db = getDbConnection();
    if (!$db) {
        return null;
    }
    
    try {
        $stmt = $db->prepare("
            SELECT SUM(amount) as balance 
            FROM wallet_transactions 
            WHERE user_id = ? AND status = 'completed'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        return $result['balance'] ?: 0;
    } catch (PDOException $e) {
        error_log("Database query error: " . $e->getMessage());
        return null;
    }
}

// Example function to get user nodes
function getUserNodes($userId) {
    $db = getDbConnection();
    if (!$db) {
        return null;
    }
    
    try {
        $stmt = $db->prepare("
            SELECT * FROM node_devices 
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("Database query error: " . $e->getMessage());
        return null;
    }
}

// Example function to create a new node
function createNode($userId, $deviceName, $resourceType, $resourceAmount) {
    $db = getDbConnection();
    if (!$db) {
        return false;
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO node_devices 
            (user_id, device_name, resource_type, resource_amount, status) 
            VALUES (?, ?, ?, ?, 'pending')
        ");
        return $stmt->execute([$userId, $deviceName, $resourceType, $resourceAmount]);
    } catch (PDOException $e) {
        error_log("Database query error: " . $e->getMessage());
        return false;
    }
}

// Add more database functions as needed for your application