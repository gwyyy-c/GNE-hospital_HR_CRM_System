<?php
class Schedule {
    private $conn;
    private $table_name = "schedules";

    public function __construct($db) { $this->conn = $db; }

    public function getByEmployee($emp_id) {
        $query = "SELECT day_of_week, shift_start, shift_end 
                  FROM " . $this->table_name . " 
                  WHERE emp_id = ? 
                  ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$emp_id]);
        return $stmt;
    }
}
?>