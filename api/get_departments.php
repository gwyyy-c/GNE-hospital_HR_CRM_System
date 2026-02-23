<?php
include_once '../config/db_connection.php';
include_once '../controller/DepartmentController.php';

$dept = new DepartmentController();
$dept->listDepartments($conn);