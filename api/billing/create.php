<?php
/**
 * POST /api/billing/create
 * Creates a new billing invoice for a patient.
 * 
 * Request body: { patient_id, admission_id?, net_amount?, payment_status? }
 * Returns: { message, id }
 */
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Billing.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['patient_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Patient ID is required"]);
        exit;
    }

    $billing = new Billing($conn);
    if ($billing->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Billing record created", "id" => $conn->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create billing record"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
