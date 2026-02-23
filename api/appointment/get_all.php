<?php
/**
 * GET /api/appointment/get_all
 * ============================
 * 
 * Returns all appointments with linked patient and doctor names.
 * Uses the Appointment model which performs JOINs to fetch related data.
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint (View in MVC)
 * @method    GET
 * @response  JSON array of appointments
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Appointment.php';

try {
    // Instantiate model and fetch all appointments
    $appointment = new Appointment($conn);
    $data = $appointment->read()->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    // Return error as JSON for frontend to handle
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
