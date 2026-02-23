<?php
include_once '../config/db_connection.php';
include_once '../model/Schedule.php';

class ScheduleController {
    /**
     * Get a specific employee's weekly shift schedule
     * Required for HR and Staff Portals
     */
    public function getEmployeeSchedule($db, $emp_id) {
        $schedule = new Schedule($db);
        $stmt = $schedule->getByEmployee($emp_id);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($data) {
            http_response_code(200);
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "No schedule found for this employee."]);
        }
    }

    /**
     * Check if a doctor is available on a specific day
     */
    public function checkAvailability($db, $emp_id, $day) {
        $query = "SELECT * FROM schedules WHERE emp_id = ? AND day_of_week = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$emp_id, $day]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode($data ? ["available" => true, "shift" => $data] : ["available" => false]);
    }
}
?>