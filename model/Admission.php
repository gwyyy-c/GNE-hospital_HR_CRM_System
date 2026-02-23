<?php
class Admission {
    private $conn;
    private $table_name = "admissions";

    public function __construct($db) { 
        $this->conn = $db; 
    }

    public function read() {
        // JOIN patients + beds so the frontend gets display IDs and readable names
        $query = "SELECT a.id, a.adm_id_display,
                         a.patient_id, a.bed_id,
                         a.admit_date, a.discharge_date, a.status,
                         p.patient_id_display,
                         CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         b.bed_number, b.ward_type
                  FROM " . $this->table_name . " a
                  LEFT JOIN patients p ON a.patient_id = p.id
                  LEFT JOIN beds b     ON a.bed_id = b.id
                  ORDER BY a.admit_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByPatient($patient_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE patient_id = ? ORDER BY admit_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id]);
        return $stmt;
    }

    public function admitPatient($patient_id, $doctor_id, $bed_id, $diagnosis) {
        $this->conn->beginTransaction();
        try {
            // Insert only the columns that actually exist in the admissions table
            $stmt = $this->conn->prepare("INSERT INTO " . $this->table_name . "
                                         (patient_id, bed_id, status)
                                         VALUES (?, ?, 'Active')");
            $stmt->execute([$patient_id, $bed_id]);

            // Mark the bed as occupied (beds table uses is_occupied tinyint, not a status column)
            $stmtBed = $this->conn->prepare("UPDATE beds SET is_occupied = 1 WHERE id = ?");
            $stmtBed->execute([$bed_id]);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function dischargePatient($admission_id) {
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("SELECT patient_id, bed_id FROM " . $this->table_name . " WHERE id = ?");
            $stmt->execute([$admission_id]);
            $admission = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmtAdm = $this->conn->prepare("UPDATE " . $this->table_name . "
                                            SET discharge_date = NOW(), status = 'Discharged'
                                            WHERE id = ?");
            $stmtAdm->execute([$admission_id]);

            // Free the bed (beds table uses is_occupied, not a status column)
            $stmtBed = $this->conn->prepare("UPDATE beds SET is_occupied = 0 WHERE id = ?");
            $stmtBed->execute([$admission['bed_id']]);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}
?>