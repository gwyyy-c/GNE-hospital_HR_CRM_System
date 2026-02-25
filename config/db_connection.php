<?php
/**
 * Database Connection
 * Establishes PDO connection with CORS headers for the API.
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = "127.0.0.1";
$port = "3307";
$db_name = "hr_pms_erp";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $exception->getMessage()]);
    exit;
}
?>