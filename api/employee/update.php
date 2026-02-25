<?php
/**
 * PUT /api/employee/update/:id
 * ============================
 * 
 * Updates an employee's information.
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint
 * @method    PUT
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Employee.php';

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

    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);

    if (!is_numeric($id)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid employee ID"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Request body is required"]);
        exit;
    }

    $employee = new Employee($conn);
    
    $existing = $employee->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(["error" => "Employee not found"]);
        exit;
    }

    $updateData = array_merge($existing, $data);

    if ($employee->update($id, $updateData)) {
        echo json_encode([
            "message" => "Employee updated successfully",
            "data" => $employee->getById($id)
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update employee"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
