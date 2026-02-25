<?php
/**
 * Billing Controller
 * Handles patient billing and invoice operations
 */
require_once __DIR__ . '/../model/Billing.php';

class BillingController {
    public function getBills($db, $patient_id) {
        $billing = new Billing($db);
        echo json_encode($billing->getPatientBills($patient_id)->fetchAll(PDO::FETCH_ASSOC));
    }
    
    public function getAllBills($db) {
        $billing = new Billing($db);
        echo json_encode($billing->read()->fetchAll(PDO::FETCH_ASSOC));
    }
    
    public function createBill($db, $data) {
        $billing = new Billing($db);
        if ($billing->create($data)) {
            http_response_code(201);
            echo json_encode(["message" => "Billing record created", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create billing record"]);
        }
    }
    
    public function updateBillStatus($db, $billId, $status) {
        $billing = new Billing($db);
        if ($billing->updateStatus($billId, $status)) {
            echo json_encode(["message" => "Billing status updated"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update billing status"]);
        }
    }
}