<?php
/**
 * User Model
 * Handles user authentication and account management
 */
class User {
    private $conn;
    private $table_name = "users";

    public function __construct($db) { 
        $this->conn = $db; 
    }

    public function findByUsername($username) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE username = :username
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByEmail($email) {
        // username column stores email
        return $this->findByUsername($email);
    }
    
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (emp_id, username, password_hash, access_role, is_active)
                  VALUES (:emp_id, :username, :password_hash, :access_role, :is_active)";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':emp_id', $data['emp_id']);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':password_hash', $data['password_hash']);
        $stmt->bindParam(':access_role', $data['access_role']);
        $isActive = $data['is_active'] ?? 1;
        $stmt->bindParam(':is_active', $isActive);
        
        return $stmt->execute();
    }
    
    /**
     * Create user from employee data with generated email as username
     */
    public function createFromEmployee($empId, $email, $role) {
        // Map employee roles to user access_role 
        $roleMap = [
            'Doctor' => 'Doctor',
            'HR' => 'HR',
            'FrontDesk' => 'FrontDesk',
            'Nurse' => 'FrontDesk',
            'Admin' => 'HR',
            'Pharmacist' => 'FrontDesk',
            'Radiologist' => 'Doctor',
            'Technician' => 'FrontDesk',
        ];
        $accessRole = $roleMap[$role] ?? 'FrontDesk';
        
        // Generate default password
        $defaultPassword = explode('@', $email)[0] . '123';
        $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
        
        return $this->create([
            'emp_id' => $empId,
            'username' => $email,
            'password_hash' => $hashedPassword,
            'access_role' => $accessRole,
            'is_active' => 1
        ]);
    }
}
?>