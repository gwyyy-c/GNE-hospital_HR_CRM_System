<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Schedule.php';

try {
    $schedule = new Schedule($conn);
    
    // Check if filtering by employee
    $emp_id = $_GET['emp_id'] ?? null;
    
    if ($emp_id) {
        $stmt = $schedule->getByEmployee($emp_id);
    } else {
        $stmt = $schedule->read();
    }
    
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($schedules ?: []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
