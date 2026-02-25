<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
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
    $id = $data['id'] ?? $data['schedule_id'] ?? $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Schedule ID is required"]);
        exit();
    }
    
    // Check if schedule exists
    $existing = $schedule->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(["error" => "Schedule not found"]);
        exit();
    }
    
    if ($schedule->delete($id)) {
        http_response_code(200);
        echo json_encode(["message" => "Schedule deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete schedule"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
