<?php
/**
 * BillingController
 * Business logic layer for billing operations.
 * Called by API endpoints to interact with the Billing model.
 */
require_once __DIR__ . '/../model/Billing.php';

class BillingController {
    
    /** Get bills for a specific patient */
    public function getBills($db, $patientId) {
        $billing = new Billing($db);
        echo json_encode($billing->getPatientBills($patientId)->fetchAll(PDO::FETCH_ASSOC));
    }
    
    /** Get all billing records */
    public function getAllBills($db) {
        $billing = new Billing($db);
        echo json_encode($billing->read()->fetchAll(PDO::FETCH_ASSOC));
    }
    
    /** Create a new billing record */
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
    
    /** Update billing payment status */
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