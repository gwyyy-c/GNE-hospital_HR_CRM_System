<?php
/**
 * UserController (AuthController)
 * 
 * Provides user authentication helpers.
 * Note: The primary login flow is handled directly by api/auth/login.php
 * using token-based auth (bin2hex). This controller is kept for reference
 * and potential future use with JWT-based authentication.
 */
require_once __DIR__ . '/../model/User.php';

class AuthController {
    
    /**
     * Generate a simple hex token for session authentication.
     * @return string 64-character hex token
     */
    public function generateToken() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Authenticate a user by username/email and password.
     * 
     * @param PDO    $db       Database connection
     * @param string $username Email or username
     * @param string $password Plain-text password
     * @return void Outputs JSON response directly
     */
    public function login($db, $username, $password) {
        try {
            $userModel = new User($db);
            $user = $userModel->findByUsername($username);
            
            if (!$user) {
                http_response_code(401);
                echo json_encode(["message" => "Invalid credentials"]);
                return;
            }
            
            // Verify bcrypt password hash
            if (!password_verify($password, $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(["message" => "Invalid credentials"]);
                return;
            }
            
            // Check active status
            if (!$user['is_active']) {
                http_response_code(403);
                echo json_encode(["message" => "Account is inactive"]);
                return;
            }
            
            // Fetch employee details
            $empStmt = $db->prepare(
                "SELECT id, emp_id_display, first_name, last_name, role, dept_id
                 FROM employees WHERE id = ?"
            );
            $empStmt->execute([$user['emp_id']]);
            $employee = $empStmt->fetch(PDO::FETCH_ASSOC);
            
            $token = $this->generateToken();
            
            http_response_code(200);
            echo json_encode([
                "message" => "Login successful",
                "token"   => $token,
                "user"    => [
                    "id"             => $user['emp_id'],
                    "user_id"        => $user['user_id'],
                    "email"          => $user['username'],
                    "name"           => $employee ? $employee['first_name'] . ' ' . $employee['last_name'] : 'User',
                    "role"           => $user['access_role'],
                    "emp_id_display" => $employee['emp_id_display'] ?? null,
                    "department_id"  => $employee['dept_id'] ?? null,
                ]
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Server error: " . $e->getMessage()]);
        }
    }
}
?>