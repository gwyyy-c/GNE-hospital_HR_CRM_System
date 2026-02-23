<?php
// patient/get_all.php — List all patients
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Patient.php';

try {
    $patient = new Patient($conn);
    $data = $patient->read()->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
