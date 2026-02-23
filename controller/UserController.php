<?php
// Enable CORS for React frontend on localhost:5173
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/db_connection.php';
include_once '../model/User.php';

class AuthController {
    
    // Simple JWT generation (without external library)
    private function generateJWT($userId, $email, $userName, $role, $department) {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        
        // Token claims
        $claims = [
            'sub' => (string)$userId,
            'id' => (int)$userId,
            'email' => $email,
            'name' => $userName,
            'role' => $role,
            'dept' => $department,
            'department' => $department,
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60) // 24 hour expiry
        ];
        
        $payload = json_encode($claims);
        
        // Simple HMAC-SHA256 signature (in production, use a proper JWT library)
        $secret = 'your-secret-key-change-this-in-production';
        $signature = hash_hmac(
            'sha256',
            base64_encode($header) . '.' . base64_encode($payload),
            $secret,
            true
        );
        
        return base64_encode($header) . '.' . 
               base64_encode($payload) . '.' . 
               base64_encode($signature);
    }
    
    public function login($db, $username, $password) {
        try {
            $userModel = new User($db);
            
            // Try to find by email first, then by username
            $user = null;
            if (filter_var($username, FILTER_VALIDATE_EMAIL)) {
                $user = $userModel->findByEmail($username);
            } else {
                $user = $userModel->findByUsername($username);
            }
            
            // If user not found or password doesn't match
            if (!$user) {
                http_response_code(401);
                echo json_encode([
                    "message" => "Invalid email/username or password",
                    "success" => false
                ]);
                return;
            }
            
            // Verify password (assuming it's plain text for now, in production hash it)
            if ($user['password'] !== $password && !password_verify($password, $user['password'] ?? '')) {
                http_response_code(401);
                echo json_encode([
                    "message" => "Invalid email/username or password",
                    "success" => false
                ]);
                return;
            }
            
            // Generate JWT token
            $token = $this->generateJWT(
                $user['id'],
                $user['email'],
                $user['name'] ?? $user['username'] ?? 'User',
                $user['role'] ?? 'User',
                $user['department'] ?? 'General'
            );
            
            // Return success response with token
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "id" => (int)$user['id'],
                    "email" => $user['email'],
                    "name" => $user['name'] ?? 'User',
                    "role" => $user['role'] ?? 'User',
                    "department" => $user['department'] ?? 'General'
                ]
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Server error: " . $e->getMessage()
            ]);
        }
    }
}
?>