<?php
/**
 * Medical Record Model
 * Handles patient medical history and treatment records
 */
class MedicalRecord {
    private $conn;
    private $table_name = "medical_records";

    public function __construct($db) { $this->conn = $db; }

    /**
     * Get all medical records with patient and doctor names
     */
    public function read() {
        $query = "SELECT m.id, m.rec_id_display, m.patient_id, m.doctor_id,
                         m.diagnosis, m.treatment_plan, m.care_type, m.created_at,
                         CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         p.patient_id_display,
                         CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
                         e.emp_id_display AS doctor_id_display
                  FROM " . $this->table_name . " m
                  LEFT JOIN patients p ON m.patient_id = p.id
                  LEFT JOIN employees e ON m.doctor_id = e.id
                  ORDER BY m.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Get medical records for a specific patient
     */
    public function getByPatient($patient_id) {
        $query = "SELECT m.id, m.rec_id_display, m.patient_id, m.doctor_id,
                         m.diagnosis, m.treatment_plan, m.care_type, m.created_at,
                         CONCAT(e.first_name, ' ', e.last_name) AS doctor_name
                  FROM " . $this->table_name . " m
                  LEFT JOIN employees e ON m.doctor_id = e.id
                  WHERE m.patient_id = ? ORDER BY m.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id]);
        return $stmt;
    }

    /**
     * Get medical records by doctor
     */
    public function getByDoctor($doctor_id) {
        $query = "SELECT m.id, m.rec_id_display, m.patient_id, m.doctor_id,
                         m.diagnosis, m.treatment_plan, m.care_type, m.created_at,
                         CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         p.patient_id_display
                  FROM " . $this->table_name . " m
                  LEFT JOIN patients p ON m.patient_id = p.id
                  WHERE m.doctor_id = ? ORDER BY m.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$doctor_id]);
        return $stmt;
    }

    /**
     * Get a single medical record by ID
     */
    public function getById($id) {
        $query = "SELECT m.*, 
                         CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         p.patient_id_display,
                         CONCAT(e.first_name, ' ', e.last_name) AS doctor_name
                  FROM " . $this->table_name . " m
                  LEFT JOIN patients p ON m.patient_id = p.id
                  LEFT JOIN employees e ON m.doctor_id = e.id
                  WHERE m.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new medical record
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (patient_id, doctor_id, diagnosis, treatment_plan, care_type)
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['patient_id'] ?? null,
            $data['doctor_id'] ?? null,
            $data['diagnosis'] ?? '',
            $data['treatment_plan'] ?? $data['treatment'] ?? '',
            $data['care_type'] ?? 'Outpatient',
        ]);
    }

    /**
     * Update a medical record
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET diagnosis = ?, treatment_plan = ?, care_type = ?, doctor_id = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['diagnosis'] ?? '',
            $data['treatment_plan'] ?? $data['treatment'] ?? '',
            $data['care_type'] ?? 'Outpatient',
            $data['doctor_id'] ?? null,
            $id
        ]);
    }

    /**
     * Delete a medical record
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>