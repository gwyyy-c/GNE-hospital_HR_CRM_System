<?php
/**
 * GET /api/billing/get_by_patient?patient_id=X
 * Returns all billing records for a specific patient.
 * Query param: patient_id (required)
 */
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
    echo json_encode($billing->getPatientBills($patientId)->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
