<?php
// employee/get_doctors.php — List only active doctors (role = 'Doctor', status = 'Active')
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Employee.php';

try {
    $employee = new Employee($conn);
    $data = $employee->getDoctors()->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
