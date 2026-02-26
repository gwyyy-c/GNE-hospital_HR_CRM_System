<?php
/**
 * AuthHelper - JWT Authentication & Role-Based Access Control
 * Handles token generation, validation, and authorization.
 */
require_once __DIR__ . '/../config/env.php';

class AuthHelper {
    private static $algorithm = 'HS256';

    // Role constants
    const ROLE_DOCTOR = 'Doctor';
    const ROLE_HR = 'HR';
    const ROLE_FRONTDESK = 'FrontDesk';

    // Environment getters
    private static function getSecretKey() {
        return Env::get('JWT_SECRET_KEY', 'fallback_secret_key_change_this');
    }

    private static function getTokenExpiry() {
        return (int) Env::get('JWT_EXPIRY', 86400);
    }

    private static function getIssuer() {
        return Env::get('JWT_ISSUER', 'GNE-Hospital-System');
    }

    // Password utilities
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function checkPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Generate signed JWT token with user payload
     */
    public static function generateJWT($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        $payload['iat'] = time();
        $payload['exp'] = time() + self::getTokenExpiry();
        $payload['iss'] = self::getIssuer();

        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", self::getSecretKey(), true);

        return "$base64Header.$base64Payload." . self::base64UrlEncode($signature);
    }

    /**
     * Validate JWT token and return payload if valid
     */
    public static function validateJWT($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        // Verify signature
        $signature = self::base64UrlDecode($base64Signature);
        $expected = hash_hmac('sha256', "$base64Header.$base64Payload", self::getSecretKey(), true);
        if (!hash_equals($signature, $expected)) return false;

        // Decode and check expiration
        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        if (isset($payload['exp']) && $payload['exp'] < time()) return false;

        return $payload;
    }

    /**
     * Extract user from Authorization: Bearer <token> header
     */
    public static function getAuthenticatedUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) return null;
        return self::validateJWT($matches[1]);
    }

    /**
     * Require valid token - returns 401 if unauthorized
     */
    public static function requireAuth() {
        $user = self::getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized - Invalid or expired token']);
            exit();
        }
        return $user;
    }

    /**
     * Require specific role(s) - returns 403 if forbidden
     */
    public static function requireRole($allowedRoles) {
        $user = self::requireAuth();
        $allowedRoles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];

        if (!in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied', 'required' => $allowedRoles, 'your_role' => $user['role']]);
            exit();
        }
        return $user;
    }

    // Role shortcuts
    public static function requireDoctor() { return self::requireRole(self::ROLE_DOCTOR); }
    public static function requireHR() { return self::requireRole(self::ROLE_HR); }
    public static function requireFrontDesk() { return self::requireRole(self::ROLE_FRONTDESK); }
    public static function requireDoctorOrHR() { return self::requireRole([self::ROLE_DOCTOR, self::ROLE_HR]); }

    // Non-blocking role checks (returns bool)
    public static function hasRole($role) {
        $user = self::getAuthenticatedUser();
        return $user && $user['role'] === $role;
    }

    public static function hasAnyRole($roles) {
        $user = self::getAuthenticatedUser();
        return $user && in_array($user['role'], $roles);
    }

    // Base64 URL encoding utilities
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}