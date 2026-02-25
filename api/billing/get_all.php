<?php
/**
 * GET /api/billing/get_all
 * Returns all billing records with patient info.
 * Sorted by creation date (newest first).
 */
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Billing.php';

header('Content-Type: application/json');

try {
    $billing = new Billing($conn);
    echo json_encode($billing->read()->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
