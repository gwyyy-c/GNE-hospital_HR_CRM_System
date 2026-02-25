<?php
// employee/create.php — Create a new employee
require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Employee.php';
require_once __DIR__ . '/../../model/Schedule.php';
require_once __DIR__ . '/../../model/User.php';

/**
 * Generate corporate email based on role
 */
function generateCorporateEmail($firstName, $lastName, $role) {
    if (!$firstName || !$lastName) return "";
    $name = strtolower($firstName) . '.' . strtolower($lastName);
    $name = preg_replace('/\s+/', '', $name);
    
    $domainMap = [
        'Doctor' => 'medical.gnehospital.com',
        'HR' => 'hr.gnehospital.com',
        'FrontDesk' => 'frontdesk.gnehospital.com',
        'Nurse' => 'nursing.gnehospital.com',
        'Admin' => 'admin.gnehospital.com',
    ];
    $domain = $domainMap[$role] ?? 'staff.gnehospital.com';
    
    return "{$name}@{$domain}";
}

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
        $empId = $conn->lastInsertId();
        
        // Create schedules for selected work days (or default weekdays)
        $workDays = $data['workDays'] ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $shiftStart = $data['shiftStart'] ?? '08:00';
        $shiftEnd = $data['shiftEnd'] ?? '17:00';
        
        $schedule = new Schedule($conn);
        foreach ($workDays as $day) {
            $schedule->create([
                'emp_id' => $empId,
                'day_of_week' => $day,
                'shift_start' => $shiftStart,
                'shift_end' => $shiftEnd,
            ]);
        }
        
        // Generate corporate email and create user account
        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';
        $role = $data['role'] ?? 'FrontDesk';
        $corporateEmail = generateCorporateEmail($firstName, $lastName, $role);
        
        if ($corporateEmail) {
            $user = new User($conn);
            $user->createFromEmployee($empId, $corporateEmail, $role);
        }
        
        http_response_code(201);
        echo json_encode([
            "message" => "Employee created successfully",
            "id" => $empId,
            "corporateEmail" => $corporateEmail
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create employee"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
