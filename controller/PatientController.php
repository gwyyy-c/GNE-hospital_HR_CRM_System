<?php
/**
 * Patient Controller
 * Handles patient registration and management
 */
require_once __DIR__ . '/../model/Patient.php';

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
    
    public function update($db, $id, $data) {
        $patient = new Patient($db);
        
        // Check if patient exists
        $existing = $patient->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Patient not found"]);
            return;
        }
        
        if ($patient->update($id, $data)) {
            $updated = $patient->getById($id);
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Patient updated successfully",
                "data" => $updated
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Update failed"]);
        }
    }
    
    public function getById($db, $id) {
        $patient = new Patient($db);
        $data = $patient->getById($id);
        
        if ($data) {
            http_response_code(200);
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Patient not found"]);
        }
    }
}
?>