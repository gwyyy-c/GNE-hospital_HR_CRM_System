<?php
class Billing {
    private $conn;
    // Correct table name: billing (not invoices)
    private $table_name = "billing";

    public function __construct($db) { $this->conn = $db; }

    public function read() {
        // Columns: bill_id, patient_id, admission_id, net_amount, payment_status, created_at
        $query = "SELECT b.bill_id, b.patient_id, b.admission_id,
                         b.net_amount, b.payment_status, b.created_at,
                         CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                         p.patient_id_display
                  FROM " . $this->table_name . " b
                  LEFT JOIN patients p ON b.patient_id = p.id
                  ORDER BY b.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getPatientBills($patient_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE patient_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id]);
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE bill_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (patient_id, admission_id, net_amount, payment_status)
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['patient_id']    ?? null,
            $data['admission_id']  ?? null,
            $data['net_amount']    ?? ($data['amount'] ?? 0),
            $data['payment_status'] ?? 'Pending',
        ]);
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET payment_status = ? WHERE bill_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$status, $id]);
    }
}
?>