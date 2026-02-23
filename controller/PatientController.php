<?php
include_once '../config/db_connection.php';
include_once '../model/Patient.php';

class PatientController {
    public function listAll($db) {
        $patient = new Patient($db);
        $stmt = $patient->read();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function register($db, $data) {
        $patient = new Patient($db);
        if ($patient->create($data)) {
            http_response_code(201);
            echo json_encode(["message" => "Patient registered successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Registration failed"]);
        }
    }
}
?>