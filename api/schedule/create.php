<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Schedule.php';

try {
    $schedule = new Schedule($conn);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['emp_id']) || !isset($data['day_of_week'])) {
        http_response_code(400);
        echo json_encode(["error" => "Employee ID and day of week are required"]);
        exit();
    }
    
    if ($schedule->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Schedule created successfully", "id" => $conn->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create schedule"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
