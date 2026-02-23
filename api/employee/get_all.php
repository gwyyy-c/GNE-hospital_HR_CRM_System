<?php
// employee/get_all.php — List all employees
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Employee.php';

try {
    $employee = new Employee($conn);
    $data = $employee->readAll()->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
