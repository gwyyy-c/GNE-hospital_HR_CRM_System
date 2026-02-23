<?php
include_once '../config/db_connection.php';
include_once '../model/Bed.php';

class BedController {
    /**
     * Fetch only beds where is_occupied = FALSE
     */
    public function getAvailableBeds($db) {
        $bed = new Bed($db);
        $stmt = $bed->getAvailable();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($data ?: []);
    }

    /**
     * Logic for discharging a patient and freeing a bed
     */
    public function updateBedStatus($db, $bed_id, $status) {
        $query = "UPDATE beds SET is_occupied = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        return $stmt->execute([$status, $bed_id]);
    }
}
?>