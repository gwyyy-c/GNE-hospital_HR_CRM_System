<?php
/**
 * Schedule Model
 * Handles employee work schedules and shifts
 */
class Schedule {
    private $conn;
    private $table_name = "schedules";

    public function __construct($db) { $this->conn = $db; }

    /**
     * Get all schedules with employee names
     */
    public function read() {
        $query = "SELECT s.schedule_id, s.emp_id, s.day_of_week, s.shift_start, s.shift_end,
                         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                         e.role, e.emp_id_display
                  FROM " . $this->table_name . " s
                  LEFT JOIN employees e ON s.emp_id = e.id
                  ORDER BY e.last_name, FIELD(s.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Get schedules for a specific employee
     */
    public function getByEmployee($emp_id) {
        $query = "SELECT schedule_id, day_of_week, shift_start, shift_end 
                  FROM " . $this->table_name . " 
                  WHERE emp_id = ? 
                  ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$emp_id]);
        return $stmt;
    }

    /**
     * Get a single schedule by ID
     */
    public function getById($id) {
        $query = "SELECT s.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
                  FROM " . $this->table_name . " s
                  LEFT JOIN employees e ON s.emp_id = e.id
                  WHERE s.schedule_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new schedule entry
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  (emp_id, day_of_week, shift_start, shift_end)
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['emp_id'] ?? null,
            $data['day_of_week'] ?? 'Monday',
            $data['shift_start'] ?? '08:00:00',
            $data['shift_end'] ?? '17:00:00',
        ]);
    }

    /**
     * Update an existing schedule
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET emp_id = ?, day_of_week = ?, shift_start = ?, shift_end = ?
                  WHERE schedule_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['emp_id'] ?? null,
            $data['day_of_week'] ?? 'Monday',
            $data['shift_start'] ?? '08:00:00',
            $data['shift_end'] ?? '17:00:00',
            $id
        ]);
    }

    /**
     * Delete a schedule
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE schedule_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>