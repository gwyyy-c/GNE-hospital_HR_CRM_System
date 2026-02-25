<?php
/**
 * Billing Model
 * Handles patient invoice CRUD operations.
 * 
 * Table: billing
 * Fields: bill_id, patient_id, admission_id, net_amount, payment_status, created_at
 */
class Billing {
    private $conn;
    private $table = "billing";

    public function __construct($db) { 
        $this->conn = $db; 
    }

    /** Get all bills with patient details, sorted by newest first */
    public function read() {
        $sql = "SELECT b.bill_id, b.patient_id, b.admission_id,
                       b.net_amount, b.payment_status, b.created_at,
                       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                       p.patient_id_display
                FROM {$this->table} b
                LEFT JOIN patients p ON b.patient_id = p.id
                ORDER BY b.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt;
    }

    /** Get all bills for a specific patient */
    public function getPatientBills($patientId) {
        $sql = "SELECT * FROM {$this->table} WHERE patient_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$patientId]);
        return $stmt;
    }

    /** Get single bill by ID */
    public function getById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE bill_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /** Create new billing record */
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (patient_id, admission_id, net_amount, payment_status)
                VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            $data['patient_id'] ?? null,
            $data['admission_id'] ?? null,
            $data['net_amount'] ?? ($data['amount'] ?? 0),
            $data['payment_status'] ?? 'Pending',
        ]);
    }

    /** Update payment status (Pending, Paid, Partial, Waived) */
    public function updateStatus($id, $status) {
        $sql = "UPDATE {$this->table} SET payment_status = ? WHERE bill_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$status, $id]);
    }
}
?>