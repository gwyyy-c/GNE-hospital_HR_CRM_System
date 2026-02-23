<?php
$host = "localhost";
$port = "3309";
$db_name = "hr_pms_erp";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4", $username, $password);
    echo "Database Connected successfully on port 3309!<br><br>";
} catch(PDOException $e) {
    die("❌ Connection failed: " . $e->getMessage());
}

// THE TEST DATA
$test_email = "hr@hospital.com";
$test_pass  = "password123";

echo "Testing login for: <b>$test_email</b> with password: <b>$test_pass</b><br><hr>";

$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$test_email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "❌ ERROR: User not found in 'users' table. Check if 'username' column matches exactly.";
} else {
    echo "✅ User found! Checking password hash...<br>";
    echo "Stored Hash: " . $user['password_hash'] . "<br>";
    
    if (password_verify($test_pass, $user['password_hash'])) {
        echo "✅ SUCCESS: Password matches!<br>";
        if ($user['is_active'] == 1) {
            echo "✅ SUCCESS: Account is active. Role is: " . $user['access_role'];
        } else {
            echo "❌ ERROR: Account is marked as INACTIVE (is_active = 0).";
        }
    } else {
        echo "❌ ERROR: Password verification failed. The hash in the DB does not match 'password123'.";
    }
}
?>