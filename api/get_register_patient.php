<?php
include_once '../config/db_connection.php';
include_once '../controller/PatientController.php';

$patient = new PatientController();
$data = json_decode(file_get_contents("php://input"), true);

if($data){
    $patient->register($conn, $data);
} else {
    http_response_code(400);
    echo json_encode(["message" => "Invalid data format."]);
}