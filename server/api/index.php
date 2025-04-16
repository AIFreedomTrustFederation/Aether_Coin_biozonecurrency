<?php
/**
 * Aetherion Wallet API - Main Entry Point
 * 
 * This file serves as the main entry point for the Aetherion Wallet API
 * It handles routing to the appropriate endpoints based on the request path
 */

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';
$path = str_replace($basePath, '', $requestUri);
$path = trim($path, '/');
$pathParts = explode('/', $path);

// Route the request to the appropriate endpoint
switch ($pathParts[0]) {
    case 'wallet':
        // Remove 'wallet' from path and pass to wallet.php
        array_shift($pathParts);
        $walletPath = implode('/', $pathParts);
        include __DIR__ . '/wallet.php';
        break;
        
    case 'node-marketplace':
    case 'nodes':
        // Remove first part from path and pass to node-marketplace.php
        array_shift($pathParts);
        $nodePath = implode('/', $pathParts);
        include __DIR__ . '/node-marketplace.php';
        break;
        
    case 'health':
        include __DIR__ . '/health.php';
        break;
        
    default:
        // Default API info response
        $apiInfo = [
            'name' => 'Aetherion Wallet API',
            'version' => '1.0.0',
            'description' => 'API for Aetherion Wallet and FractalCoin integration',
            'endpoints' => [
                '/api/wallet' => 'Wallet operations',
                '/api/node-marketplace' => 'Node marketplace',
                '/api/health' => 'Health check'
            ],
            'documentation' => 'https://atc.aifreedomtrust.com/docs',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        echo json_encode($apiInfo, JSON_PRETTY_PRINT);
        break;
}