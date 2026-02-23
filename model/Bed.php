<?php
class Bed {
    private $conn;
    private $table_name = "beds";

    public function __construct($db) { $this->conn = $db; }

    public function read() {
        // Correct columns: id, bed_number, ward_type, price_per_day, is_occupied
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY bed_number ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getAvailable() {
        // is_occupied = 0 means available
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_occupied = 0 ORDER BY bed_number ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getByWard($ward) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE ward_type = ? ORDER BY bed_number ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$ward]);
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET is_occupied = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['is_occupied'] ?? ($data['status'] === 'Available' ? 0 : 1),
            $id
        ]);
    }
}
?>