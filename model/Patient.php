<?php
class Patient {
    private $conn;
    private $table_name = "patients";

    public function __construct($db) { $this->conn = $db; }

    public function read() {
        // Correct columns: id, first_name, last_name, email, address, dob,
        // gender, contact_no, blood_type, emergency_contact_name,
        // emergency_contact_number, date_registered
        $query = "SELECT p.id, p.patient_id_display,
                         CONCAT(p.first_name, ' ', p.last_name) AS name,
                         p.first_name, p.last_name,
                         p.email, p.contact_no, p.address,
                         p.dob, p.gender, p.blood_type,
                         p.emergency_contact_name, p.emergency_contact_number,
                         p.date_registered
                  FROM " . $this->table_name . " p
                  ORDER BY p.last_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT p.id, p.patient_id_display,
                         CONCAT(p.first_name, ' ', p.last_name) AS name,
                         p.first_name, p.last_name,
                         p.email, p.contact_no, p.address,
                         p.dob, p.gender, p.blood_type,
                         p.emergency_contact_name, p.emergency_contact_number,
                         p.date_registered
                  FROM " . $this->table_name . " p
                  WHERE p.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (first_name, last_name, email, address, dob, gender,
                   contact_no, blood_type, emergency_contact_name, emergency_contact_number)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['first_name'] ?? ($data['name'] ?? ''),
            $data['last_name']  ?? '',
            $data['email']      ?? '',
            $data['address']    ?? '',
            $data['dob']        ?? null,
            $data['gender']     ?? 'Prefer not to say',
            $data['contact_no'] ?? ($data['phone'] ?? ''),
            $data['blood_type'] ?? null,
            $data['emergency_contact_name']   ?? '',
            $data['emergency_contact_number'] ?? '',
        ]);
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET first_name = ?, last_name = ?, email = ?, address = ?,
                      dob = ?, gender = ?, contact_no = ?, blood_type = ?,
                      emergency_contact_name = ?, emergency_contact_number = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['first_name'] ?? '',
            $data['last_name']  ?? '',
            $data['email']      ?? '',
            $data['address']    ?? '',
            $data['dob']        ?? null,
            $data['gender']     ?? 'Prefer not to say',
            $data['contact_no'] ?? '',
            $data['blood_type'] ?? null,
            $data['emergency_contact_name']   ?? '',
            $data['emergency_contact_number'] ?? '',
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