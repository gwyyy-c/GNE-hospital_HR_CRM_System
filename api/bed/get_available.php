<?php
// bed/get_available.php — List available (unoccupied) beds
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Bed.php';

try {
    $bed = new Bed($conn);
    $data = $bed->getAvailable()->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
