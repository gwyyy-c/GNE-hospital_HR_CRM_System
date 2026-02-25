<?php
/**
 * Medical Record Controller
 * Handles patient medical history operations
 */
require_once __DIR__ . '/../model/MedicalRecord.php';

class MedicalRecordController {
    public function getHistory($db, $patient_id) {
        $record = new MedicalRecord($db);
        echo json_encode($record->getByPatient($patient_id)->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>