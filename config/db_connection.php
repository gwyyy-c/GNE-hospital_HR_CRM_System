<?php
/**
 * This file establishes the PDO database connection used throughout the application.
 * It also sets up CORS headers and error handling for the API.
 */

// Suppress HTML error output to ensure clean JSON responses
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = "127.0.0.1";
$port = "3307";        // MariaDB port (default: 3306)
$db_name = "hr_pms_erp";
$username = "root";
$password = "";

// Establish PDO connection
try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $exception->getMessage()]);
    exit;
}
?>