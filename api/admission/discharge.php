<?php
/**
 * POST /api/admission/discharge/:id
 * ==================================
 * 
 * Discharges a patient from their admission and frees the bed.
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint
 * @method    POST
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Admission.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    // Extract ID from URL path
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);

    if (!is_numeric($id)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid admission ID"]);
        exit;
    }

    $admission = new Admission($conn);
    
    // Check if admission exists
    $existing = $admission->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(["error" => "Admission not found"]);
        exit;
    }

    if ($admission->dischargePatient($id)) {
        echo json_encode(["message" => "Patient discharged successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to discharge patient"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
