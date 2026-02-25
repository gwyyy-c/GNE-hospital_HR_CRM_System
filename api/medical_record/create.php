<?php
/**
 * Creates a new medical record entry for a patient
 * POST /api/medical_record/create
 */
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/MedicalRecord.php';

try {
    $medicalRecord = new MedicalRecord($conn);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['patient_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Patient ID is required"]);
        exit();
    }
    
    if ($medicalRecord->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Medical record created successfully", "id" => $conn->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create medical record"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
