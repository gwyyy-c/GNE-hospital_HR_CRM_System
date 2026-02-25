<?php
/**
 * PUT /api/appointment/update/:id
 * ================================
 * 
 * Updates an appointment's status or details.
 * Supports partial updates (status only or full update).
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint (Controller action in MVC)
 * @method    PUT
 * @request   JSON { status?: string, appt_date?: string, doctor_id?: int, visit_reason?: string }
 * @response  JSON { message: "Appointment updated successfully" }
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Appointment.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Only allow PUT requests
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    // Extract ID from URL path (e.g., /appointment/update/5)
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);

    if (!is_numeric($id)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid appointment ID"]);
        exit;
    }

    // Parse JSON request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Request body is required"]);
        exit;
    }

    $appointment = new Appointment($conn);

    // Check if appointment exists
    $existing = $appointment->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(["error" => "Appointment not found"]);
        exit;
    }

    // If only status is being updated, use the efficient updateStatus method
    if (isset($data['status']) && count(array_filter($data, fn($v) => $v !== null)) === 1) {
        $validStatuses = ['Pending', 'Completed', 'Cancelled', 'No-show'];
        if (!in_array($data['status'], $validStatuses)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid status. Must be one of: " . implode(', ', $validStatuses)]);
            exit;
        }

        if ($appointment->updateStatus($id, $data['status'])) {
            echo json_encode([
                "message" => "Appointment status updated successfully",
                "data" => $appointment->getById($id)
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update appointment status"]);
        }
    } else {
        // Full update - merge with existing data
        $updateData = [
            'appt_date' => $data['appt_date'] ?? $existing['appt_date'],
            'doctor_id' => $data['doctor_id'] ?? $existing['doctor_id'],
            'status' => $data['status'] ?? $existing['status'],
            'visit_reason' => $data['visit_reason'] ?? $existing['visit_reason']
        ];

        if ($appointment->update($id, $updateData)) {
            echo json_encode([
                "message" => "Appointment updated successfully",
                "data" => $appointment->getById($id)
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update appointment"]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
?>
