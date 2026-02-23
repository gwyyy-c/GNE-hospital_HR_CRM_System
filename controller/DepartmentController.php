<?php
include_once '../config/db_connection.php';
include_once '../model/Department.php';

class DepartmentController {
    /**
     * Fetch all departments (e.g., ER, Pediatrics, Cardiology)
     */
    public function listDepartments($db) {
        $dept = new Department($db);
        $stmt = $dept->read();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($data) {
            http_response_code(200);
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "No departments found."]);
        }
    }
}
?>