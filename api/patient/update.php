<?php
/**
 * PUT /api/patient/update/:id
 * ===========================
 * 
 * Updates a patient's information.
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint
 * @method    PUT
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Patient.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
        echo json_encode(["error" => "Invalid patient ID"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Request body is required"]);
        exit;
    }

    $patient = new Patient($conn);
    
    // Check if patient exists
    $existing = $patient->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(["error" => "Patient not found"]);
        exit;
    }

    // Merge existing data with updates
    $updateData = array_merge($existing, $data);

    if ($patient->update($id, $updateData)) {
        echo json_encode([
            "message" => "Patient updated successfully",
            "data" => $patient->getById($id)
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update patient"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
