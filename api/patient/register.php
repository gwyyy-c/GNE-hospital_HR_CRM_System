<?php
// patient/register.php — Register a new patient
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Patient.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON body"]);
        exit;
    }

    $patient = new Patient($conn);
    if ($patient->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Patient registered successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to register patient"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
