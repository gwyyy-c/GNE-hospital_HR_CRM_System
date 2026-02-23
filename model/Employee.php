<?php
class Employee {
    private $conn;
    private $table_name = "employees";

    public function __construct($db) { $this->conn = $db; }

    public function readAll() {
        // Correct columns: id, first_name, middle_name, last_name, role,
        // prc_license_no, hire_date, dept_id, email, contact_no, address, status
        $query = "SELECT e.id, e.emp_id_display,
                         CONCAT(e.first_name, ' ', e.last_name) AS name,
                         e.first_name, e.middle_name, e.last_name,
                         e.email, e.contact_no, e.address,
                         e.role, e.status, e.hire_date, e.prc_license_no,
                         e.dept_id, d.dept_name AS department
                  FROM " . $this->table_name . " e
                  LEFT JOIN departments d ON e.dept_id = d.dept_id
                  ORDER BY e.last_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT e.id, e.emp_id_display,
                         CONCAT(e.first_name, ' ', e.last_name) AS name,
                         e.first_name, e.middle_name, e.last_name,
                         e.email, e.contact_no, e.address,
                         e.role, e.status, e.hire_date, e.prc_license_no,
                         e.dept_id, d.dept_name AS department
                  FROM " . $this->table_name . " e
                  LEFT JOIN departments d ON e.dept_id = d.dept_id
                  WHERE e.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getDoctors() {
        $query = "SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS name,
                         e.email, e.contact_no, e.role, e.status,
                         e.dept_id, d.dept_name AS department,
                         e.hire_date
                  FROM " . $this->table_name . " e
                  LEFT JOIN departments d ON e.dept_id = d.dept_id
                  WHERE e.role = 'Doctor' AND e.status = 'Active'
                  ORDER BY e.last_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (first_name, last_name, middle_name, email, contact_no,
                   address, role, dept_id, status, hire_date, prc_license_no)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['first_name'] ?? ($data['name'] ?? ''),
            $data['last_name']  ?? '',
            $data['middle_name'] ?? null,
            $data['email']      ?? '',
            $data['contact_no'] ?? ($data['phone'] ?? ''),
            $data['address']    ?? '',
            $data['role']       ?? 'HR',
            $data['dept_id']    ?? null,
            $data['status']     ?? 'Active',
            $data['hire_date']  ?? ($data['joined'] ?? date('Y-m-d')),
            $data['prc_license_no'] ?? null,
        ]);
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET first_name = ?, last_name = ?, middle_name = ?,
                      email = ?, contact_no = ?, address = ?,
                      role = ?, dept_id = ?, status = ?,
                      hire_date = ?, prc_license_no = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['first_name']  ?? '',
            $data['last_name']   ?? '',
            $data['middle_name'] ?? null,
            $data['email']       ?? '',
            $data['contact_no']  ?? '',
            $data['address']     ?? '',
            $data['role']        ?? 'HR',
            $data['dept_id']     ?? null,
            $data['status']      ?? 'Active',
            $data['hire_date']   ?? date('Y-m-d'),
            $data['prc_license_no'] ?? null,
            $id
        ]);
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>