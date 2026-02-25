<?php
// billing/get_all.php — Get all billing records
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Billing.php';

header('Content-Type: application/json');

try {
    $billing = new Billing($conn);
    $result = $billing->read();
    echo json_encode($result->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
