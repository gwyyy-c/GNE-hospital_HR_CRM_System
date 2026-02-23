<?php
class MedicalRecord {
    private $conn;
    private $table_name = "medical_records";

    public function __construct($db) { $this->conn = $db; }

    public function read() {
        $query = "SELECT m.*, e.name as doctor_name 
                  FROM " . $this->table_name . " m
                  LEFT JOIN employees e ON m.doctor_id = e.id
                  ORDER BY m.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getByPatient($patient_id) {
        $query = "SELECT m.*, e.name as doctor_name 
                  FROM " . $this->table_name . " m
                  LEFT JOIN employees e ON m.doctor_id = e.id
                  WHERE m.patient_id = ? ORDER BY m.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id]);
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT m.*, e.name as doctor_name 
                  FROM " . $this->table_name . " m
                  LEFT JOIN employees e ON m.doctor_id = e.id
                  WHERE m.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (patient_id, doctor_id, diagnosis, treatment, medications, notes)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['patient_id'] ?? null,
            $data['doctor_id'] ?? null,
            $data['diagnosis'] ?? '',
            $data['treatment'] ?? '',
            $data['medications'] ?? '',
            $data['notes'] ?? ''
        ]);
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET diagnosis = ?, treatment = ?, medications = ?, notes = ?, doctor_id = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['diagnosis'] ?? '',
            $data['treatment'] ?? '',
            $data['medications'] ?? '',
            $data['notes'] ?? '',
            $data['doctor_id'] ?? null,
            $id
        ]);
    }
}
?>