<?php
include_once '../config/db_connection.php';
include_once '../model/Employee.php';

class EmployeeController {
    public function listAll($db) {
        $employee = new Employee($db);
        echo json_encode($employee->readAll()->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getDoctors($db) {
        $employee = new Employee($db);
        echo json_encode($employee->getDoctors()->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>