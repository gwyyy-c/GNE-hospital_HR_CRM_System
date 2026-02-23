<?php
include_once '../config/db_connection.php';
include_once '../controller/BillingController.php';

$bill = new BillingController();

// Check if patient_id is provided in the URL (e.g., get_billing.php?patient_id=1)
if(isset($_GET['patient_id'])) {
    $bill->getBills($conn, $_GET['patient_id']);
} else {
    http_response_code(400);
    echo json_encode(["message" => "Patient ID is required."]);
}
?>