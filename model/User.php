<?php
class User {
    private $conn;
    private $table_name = "users";

    public function __construct($db) { 
        $this->conn = $db; 
    }

    public function findByUsername($username) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE (username = :username OR email = :email) 
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $username);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET email = :email, 
                      username = :username, 
                      password = :password, 
                      name = :name, 
                      role = :role";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':password', $data['password']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':role', $data['role']);
        
        return $stmt->execute();
    }
}
?>