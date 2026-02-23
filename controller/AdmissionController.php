<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/db_connection.php';
include_once '../model/Admission.php';

class AdmissionController {
    public function listAll($db) {
        $admission = new Admission($db);
        $data = $admission->read()->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($data ?: []);
    }

    public function admit($db, $data) {
        $admission = new Admission($db);
        try {
            $admission->admitPatient(
                $data['patient_id'],
                $data['doctor_id']  ?? null,
                $data['bed_id'],
                $data['diagnosis']  ?? null
            );
            http_response_code(201);
            echo json_encode(["message" => "Patient admitted and bed marked as occupied"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Admission process failed: " . $e->getMessage()]);
        }
    }
}
?>