<?php
// Enable error display for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/MedicalRecord.php';

try {
    $medicalRecord = new MedicalRecord($conn);
    
    // Check for filters
    $patient_id = $_GET['patient_id'] ?? null;
    $doctor_id = $_GET['doctor_id'] ?? null;
    
    if ($patient_id) {
        $stmt = $medicalRecord->getByPatient($patient_id);
    } elseif ($doctor_id) {
        $stmt = $medicalRecord->getByDoctor($doctor_id);
    } else {
        $stmt = $medicalRecord->read();
    }
    
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($records ?: []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
