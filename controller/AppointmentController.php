<?php
include_once '../config/db_connection.php';
include_once '../model/Appointment.php';

class AppointmentController {
    public function book($db, $data) {
        $appointment = new Appointment($db);
        if ($appointment->create($data['patient_id'], $data['doctor_id'], $data['appt_date'], $data['visit_reason'])) {
            http_response_code(201);
            echo json_encode(["message" => "Appointment booked"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Booking failed"]);
        }
    }
}
?>