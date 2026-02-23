<?php
// admission/admit.php — Admit a patient to a bed
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Admission.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['patient_id'], $data['bed_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "patient_id and bed_id are required"]);
        exit;
    }

    $admission = new Admission($conn);
    $admission->admitPatient(
        $data['patient_id'],
        $data['doctor_id'] ?? null,
        $data['bed_id'],
        $data['diagnosis'] ?? null
    );
    http_response_code(201);
    echo json_encode(["message" => "Patient admitted successfully"]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
