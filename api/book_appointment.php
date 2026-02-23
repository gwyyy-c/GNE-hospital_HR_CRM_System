<?php
include_once '../config/db_connection.php';
include_once '../controller/AppointmentController.php';

$appt = new AppointmentController();
$data = json_decode(file_get_contents("php://input"), true);
$appt->book($conn, $data);