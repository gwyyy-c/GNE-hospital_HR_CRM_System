<?php
/**
 * Bed Model
 * Handles hospital bed inventory and availability
 */
class Bed {
    private $conn;
    private $table_name = "beds";

    public function __construct($db) { $this->conn = $db; }

    public function read() {
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
        // Map status string to is_occupied boolean
        $status = $data['status'] ?? null;
        $is_occupied = $data['is_occupied'] ?? null;
        
        if ($status !== null && $is_occupied === null) {
            // Map status string to boolean
            $statusMap = [
                'empty' => 0,
                'available' => 0,
                'occupied' => 1,
                'reserved' => 1,
                'maintenance' => 0,
            ];
            $is_occupied = $statusMap[$status] ?? 0;
        } else if ($is_occupied === null) {
            $is_occupied = 0;
        }
        
        $query = "UPDATE " . $this->table_name . "
                  SET is_occupied = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$is_occupied, $id]);
    }
    
    /**
     * Free a bed (set to empty/available)
     */
    public function freeBed($id) {
        return $this->update($id, ['is_occupied' => 0, 'status' => 'empty']);
    }
    
    /**
     * Occupy a bed
     */
    public function occupyBed($id) {
        return $this->update($id, ['is_occupied' => 1, 'status' => 'occupied']);
    }
}
?>