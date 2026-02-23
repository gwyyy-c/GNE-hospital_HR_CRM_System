<?php
/**
 * POST /api/appointment/book
 * ==========================
 * 
 * Creates a new appointment linking a patient to a doctor.
 * Required fields: patient_id, doctor_id
 * Optional fields: appt_date (defaults to now), visit_reason
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint (Controller action in MVC)
 * @method    POST
 * @request   JSON { patient_id, doctor_id, appt_date?, visit_reason? }
 * @response  JSON { message: "Appointment booked successfully" }
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Appointment.php';

try {
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    // Parse JSON request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!$data || !isset($data['patient_id'], $data['doctor_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "patient_id and doctor_id are required"]);
        exit;
    }

    // Create appointment using model
    $appointment = new Appointment($conn);
    if ($appointment->create(
        $data['patient_id'],
        $data['doctor_id'],
        $data['appt_date'] ?? $data['appointment_date'] ?? date('Y-m-d H:i:s'),
        $data['visit_reason'] ?? $data['notes'] ?? null
    )) {
        http_response_code(201);
        echo json_encode(["message" => "Appointment booked successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Booking failed"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
