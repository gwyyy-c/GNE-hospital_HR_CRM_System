<?php
// billing/get_by_patient.php — Get billing records for a specific patient
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Billing.php';

header('Content-Type: application/json');

try {
    $patientId = $_GET['patient_id'] ?? null;
    
    if (!$patientId) {
        http_response_code(400);
        echo json_encode(["error" => "Patient ID is required"]);
        exit;
    }
    
    $billing = new Billing($conn);
    $result = $billing->getPatientBills($patientId);
    echo json_encode($result->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
