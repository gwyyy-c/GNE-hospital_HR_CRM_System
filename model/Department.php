<?php
/**
 * Department Model
 * Handles hospital department data
 */
class Department {
    private $conn;
    private $table_name = "departments";

    public function __construct($db) { $this->conn = $db; }

    public function read() {
        // Correct columns: dept_id, dept_name
        $query = "SELECT dept_id AS id, dept_name AS name, dept_name
                  FROM " . $this->table_name . "
                  ORDER BY dept_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT dept_id AS id, dept_name AS name, dept_name
                  FROM " . $this->table_name . "
                  WHERE dept_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (dept_name)
                  VALUES (?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['dept_name'] ?? ($data['name'] ?? '')
        ]);
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET dept_name = ?
                  WHERE dept_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['dept_name'] ?? ($data['name'] ?? ''),
            $id
        ]);
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE dept_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>