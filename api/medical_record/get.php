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
require_once __DIR__ . '/../../model/MedicalRecord.php';

try {
    $medicalRecord = new MedicalRecord($conn);
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Medical record ID is required"]);
        exit();
    }
    
    $record = $medicalRecord->getById($id);
    
    if ($record) {
        http_response_code(200);
        echo json_encode($record);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Medical record not found"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
