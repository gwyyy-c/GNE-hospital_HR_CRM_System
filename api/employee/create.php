<?php
// employee/create.php — Create a new employee
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Employee.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON body"]);
        exit;
    }

    // If the form sent a department name instead of dept_id, resolve the ID
    if (!isset($data['dept_id']) && isset($data['department'])) {
        $stmt = $conn->prepare("SELECT dept_id FROM departments WHERE dept_name = ? LIMIT 1");
        $stmt->execute([$data['department']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $data['dept_id'] = (int) $row['dept_id'];
        }
    }

    // Normalize status: DB enum uses 'On-Leave' but frontend may send 'On Leave'
    if (isset($data['status']) && $data['status'] === 'On Leave') {
        $data['status'] = 'On-Leave';
    }

    $employee = new Employee($conn);
    if ($employee->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Employee created successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create employee"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
