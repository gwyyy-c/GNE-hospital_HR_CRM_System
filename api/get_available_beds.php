<?php
include_once '../config/db_connection.php';
include_once '../controller/BedController.php';

$beds = new BedController();
$beds->getAvailableBeds($conn);