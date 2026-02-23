<?php
include_once '../config/db_connection.php';
include_once '../controller/EmployeeController.php';

$emp = new EmployeeController();
$emp->listAll($conn);