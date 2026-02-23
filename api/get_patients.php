<?php
include_once '../config/db_connection.php';
include_once '../controller/PatientController.php';

$patient = new PatientController();
$patient->listAll($conn);