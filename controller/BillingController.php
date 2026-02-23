<?php
include_once '../config/db_connection.php';
include_once '../model/Billing.php';

class BillingController {
    public function getBills($db, $patient_id) {
        $billing = new Billing($db);
        echo json_encode($billing->getPatientBills($patient_id)->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>