<?php
/**
 * Login API Endpoint
 * Authenticates user and returns session data
 */
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/User.php';
require_once __DIR__ . '/../../helper/AuthHelper.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["message" => "Email and password are required"]);
        exit();
    }
    
    $user = new User($conn);
    $userData = $user->findByUsername($data['email']);
    
    if (!$userData) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid credentials"]);
        exit();
    }
    
    // Verify password
    if (!password_verify($data['password'], $userData['password_hash'])) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid credentials"]);
        exit();
    }
    
    // Check if user is active
    if (!$userData['is_active']) {
        http_response_code(403);
        echo json_encode(["message" => "Account is inactive"]);
        exit();
    }
    
    // Get employee info for the user
    $empQuery = "SELECT id, emp_id_display, first_name, last_name, role, dept_id 
                 FROM employees WHERE id = ?";
    $empStmt = $conn->prepare($empQuery);
    $empStmt->execute([$userData['emp_id']]);
    $employee = $empStmt->fetch(PDO::FETCH_ASSOC);
    
    // Generate simple token (in production, use JWT)
    $token = bin2hex(random_bytes(32));
    
    http_response_code(200);
    echo json_encode([
        "message" => "Login successful",
        "token" => $token,
        "user" => [
            "id" => $userData['emp_id'],  // Use emp_id as the user id for foreign key relations
            "user_id" => $userData['user_id'],
            "email" => $userData['username'],
            "name" => $employee ? $employee['first_name'] . ' ' . $employee['last_name'] : 'User',
            "role" => $userData['access_role'],
            "emp_id_display" => $employee['emp_id_display'] ?? null,
            "department_id" => $employee['dept_id'] ?? null
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>