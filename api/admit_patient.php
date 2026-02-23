<?php
include_once '../config/db_connection.php';
include_once '../controller/AdmissionController.php';

$adm = new AdmissionController();
$data = json_decode(file_get_contents("php://input"), true);
$adm->admit($conn, $data);