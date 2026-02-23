<?php
// department/get_all.php — List all departments
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Department.php';

try {
    $dept = new Department($conn);
    $data = $dept->read()->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
