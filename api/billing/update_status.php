<?php
/**
 * PUT /api/billing/update_status
 * Updates the payment status of a billing record.
 * 
 * Request body: { bill_id, payment_status } or { bill_id, status }
 * Valid statuses: Pending, Paid, Partial, Waived
 */
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Billing.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $billId = $data['bill_id'] ?? $_GET['id'] ?? null;
    $status = $data['payment_status'] ?? $data['status'] ?? null;

    if (!$billId || !$status) {
        http_response_code(400);
        echo json_encode(["error" => "Bill ID and status are required"]);
        exit;
    }

    $billing = new Billing($conn);
    if ($billing->updateStatus($billId, $status)) {
        echo json_encode(["message" => "Billing status updated"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update billing status"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
