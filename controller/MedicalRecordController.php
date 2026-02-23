<?php
include_once '../config/db_connection.php';
include_once '../model/MedicalRecord.php';

class MedicalRecordController {
    public function getHistory($db, $patient_id) {
        $record = new MedicalRecord($db);
        echo json_encode($record->getByPatient($patient_id)->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>