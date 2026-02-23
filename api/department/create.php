<?php
// department/create.php — Create a new department
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Department.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(["error" => "Department name is required"]);
        exit;
    }

    $dept = new Department($conn);
    if ($dept->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Department created successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create department"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
