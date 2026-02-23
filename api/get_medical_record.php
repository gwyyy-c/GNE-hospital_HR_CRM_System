<?php
include_once '../config/db_connection.php';
include_once '../controller/MedicalRecordController.php';

$records = new MedicalRecordController();
$patient_id = isset($_GET['patient_id']) ? $_GET['patient_id'] : die();
$records->getHistory($conn, $patient_id);