<?php
// admission/get_all.php — List all admissions
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Admission.php';

try {
    $admission = new Admission($conn);
    $data = $admission->read()->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
