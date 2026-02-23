<?php
/**
 * Appointment Model
 * =================
 * 
 * Handles all database operations for the appointments table.
 * Uses JOINs to fetch linked patient and doctor names.
 * 
 * @package   hr-pms-backend
 * @category  Model
 * @author    GNE Hospital IT Department
 */
class Appointment {
    private $conn;
    private $table_name = "appointments";

    /**
     * Constructor - accepts database connection
     * @param PDO $db Database connection object
     */
    public function __construct($db) { $this->conn = $db; }

    /**
     * Fetch all appointments with patient and doctor names
     * Uses LEFT JOIN to include names even if references are missing
     * @return PDOStatement Result set
     */
    public function read() {
        $query = "SELECT a.id, a.appt_id_display, a.patient_id, a.doctor_id,
                         a.appt_date, a.visit_reason, a.status,
                         p.patient_id_display, CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         e.emp_id_display AS doctor_id_display, CONCAT(e.first_name, ' ', e.last_name) AS doctor_name
                  FROM " . $this->table_name . " a
                  LEFT JOIN patients p ON a.patient_id = p.id
                  LEFT JOIN employees e ON a.doctor_id = e.id
                  ORDER BY a.appt_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Get a single appointment by ID with linked names
     * @param int $id Appointment ID
     * @return array|false Appointment data or false if not found
     */
    public function getById($id) {
        $query = "SELECT a.*, p.patient_id_display, CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         e.emp_id_display AS doctor_id_display, CONCAT(e.first_name, ' ', e.last_name) AS doctor_name
                  FROM " . $this->table_name . " a
                  LEFT JOIN patients p ON a.patient_id = p.id
                  LEFT JOIN employees e ON a.doctor_id = e.id
                  WHERE a.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all appointments for a specific patient
     * @param int $patient_id Patient ID
     * @return PDOStatement Result set
     */
    public function getByPatient($patient_id) {
        $query = "SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) AS doctor_name
                  FROM " . $this->table_name . " a
                  LEFT JOIN employees e ON a.doctor_id = e.id
                  WHERE a.patient_id = ? ORDER BY a.appt_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id]);
        return $stmt;
    }

    /**
     * Get all appointments for a specific doctor
     * @param int $doctor_id Doctor (employee) ID
     * @return PDOStatement Result set
     */
    public function getByDoctor($doctor_id) {
        $query = "SELECT a.*, CONCAT(p.first_name, ' ', p.last_name) AS patient_name
                  FROM " . $this->table_name . " a
                  LEFT JOIN patients p ON a.patient_id = p.id
                  WHERE a.doctor_id = ? ORDER BY a.appt_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$doctor_id]);
        return $stmt;
    }

    /**
     * Create a new appointment
     * @param int    $patient_id   Patient ID
     * @param int    $doctor_id    Doctor (employee) ID
     * @param string $appt_date    Appointment date/time (YYYY-MM-DD HH:MM:SS)
     * @param string $visit_reason Reason for the visit
     * @return bool Success status
     */
    public function create($patient_id, $doctor_id, $appt_date, $visit_reason) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (patient_id, doctor_id, appt_date, status, visit_reason) 
                  VALUES (?, ?, ?, 'Pending', ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$patient_id, $doctor_id, $appt_date, $visit_reason]);
    }

    /**
     * Update an existing appointment
     * @param int   $id   Appointment ID
     * @param array $data Updated appointment data
     * @return bool Success status
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET appt_date = ?, doctor_id = ?, status = ?, visit_reason = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['appt_date'] ?? null,
            $data['doctor_id'] ?? null,
            $data['status'] ?? 'Pending',
            $data['visit_reason'] ?? '',
            $id
        ]);
    }

    /**
     * Delete an appointment
     * @param int $id Appointment ID
     * @return bool Success status
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>