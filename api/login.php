<?php
// Include database connection (This file handles the headers for us)
$backend_path = __DIR__ . '/../config/db_connection.php';
if (!file_exists($backend_path)) {
    $backend_path = __DIR__ . '/../../config/db_connection.php';
}
require_once $backend_path;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $identifier = $data['email'] ?? $data['username'] ?? null;
    $password = $data['password'] ?? null;

    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Credentials required"]);
        exit;
    }

    // Query users table
    $query = "SELECT u.emp_id, u.username, u.password_hash, u.access_role, u.is_active,
                     e.email, CONCAT(e.first_name, ' ', e.last_name) as name
              FROM users u
              LEFT JOIN employees e ON u.emp_id = e.id
              WHERE u.username = ? OR e.email = ?
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        exit;
    }

    if (!$user['is_active']) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Account inactive"]);
        exit;
    }

    // JWT Generation (Simplified for your project)
    $secret = 'your-secret-key-hospital-2024';
    $payload = [
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60),
        'emp_id' => (int)$user['emp_id'],
        'role' => $user['access_role']
    ];
    
    $token = base64_encode(json_encode(['alg' => 'HS256'])) . '.' . base64_encode(json_encode($payload)) . '.signature';

    echo json_encode([
        "success" => true,
        "token" => $token,
        "user" => $user
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>