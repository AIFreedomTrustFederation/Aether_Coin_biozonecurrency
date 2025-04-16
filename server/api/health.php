<?php
/**
 * Aetherion Wallet API Health Check
 * 
 * This endpoint provides a health check for the Aetherion Wallet API
 * It returns basic information about the API status and configuration
 */

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration if available
$configFile = __DIR__ . '/../config/config.php';
$configExists = file_exists($configFile);
$databaseConnected = false;

// Prepare response
$response = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => '1.0.0',
    'environment' => 'production',
    'config_exists' => $configExists,
    'php_version' => phpversion(),
    'server' => 'aifreedomtrust',
    'api_endpoints' => [
        '/api/wallet.php' => 'Wallet operations',
        '/api/node-marketplace.php' => 'Node marketplace',
        '/api/health.php' => 'Health check'
    ]
];

// Check database connection if config exists
if ($configExists) {
    try {
        $config = require_once $configFile;
        $dsn = "mysql:host={$config['database']['host']};dbname={$config['database']['dbname']}";
        $pdo = new PDO($dsn, $config['database']['username'], $config['database']['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Perform a simple database query to check connection
        $stmt = $pdo->query('SELECT 1');
        $result = $stmt->fetchColumn();
        
        if ($result === 1) {
            $databaseConnected = true;
            $response['database'] = 'connected';
            
            // Check if required tables exist
            $tables = ['users', 'wallets', 'transactions', 'fractalnode_marketplace', 'api_keys'];
            $missingTables = [];
            
            foreach ($tables as $table) {
                $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
                if ($stmt->rowCount() === 0) {
                    $missingTables[] = $table;
                }
            }
            
            if (empty($missingTables)) {
                $response['database_tables'] = 'all_present';
            } else {
                $response['status'] = 'warning';
                $response['database_tables'] = 'incomplete';
                $response['missing_tables'] = $missingTables;
            }
        } else {
            $response['status'] = 'warning';
            $response['database'] = 'error';
            $response['database_message'] = 'Connection test failed';
        }
    } catch (PDOException $e) {
        $response['status'] = 'warning';
        $response['database'] = 'error';
        $response['database_message'] = 'Connection failed';
    }
} else {
    $response['status'] = 'warning';
    $response['database'] = 'unknown';
    $response['message'] = 'Configuration file not found';
}

// Check disk space
$diskFree = disk_free_space('/');
$diskTotal = disk_total_space('/');
$diskUsed = $diskTotal - $diskFree;
$diskPercent = ($diskUsed / $diskTotal) * 100;

$response['disk'] = [
    'free' => formatBytes($diskFree),
    'total' => formatBytes($diskTotal),
    'used' => formatBytes($diskUsed),
    'percent_used' => round($diskPercent, 2)
];

if ($diskPercent > 90) {
    $response['status'] = 'warning';
    $response['disk_warning'] = 'Low disk space';
}

// Check memory usage
$memoryLimit = ini_get('memory_limit');
$memoryUsage = memory_get_usage(true);

$response['memory'] = [
    'limit' => $memoryLimit,
    'usage' => formatBytes($memoryUsage)
];

// Check loaded PHP extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'openssl', 'mbstring'];
$missingExtensions = [];

foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

if (empty($missingExtensions)) {
    $response['extensions'] = 'all_required_loaded';
} else {
    $response['status'] = 'warning';
    $response['extensions'] = 'missing_required';
    $response['missing_extensions'] = $missingExtensions;
}

// Output response
echo json_encode($response, JSON_PRETTY_PRINT);

/**
 * Format bytes to human-readable format
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= (1 << (10 * $pow));
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}