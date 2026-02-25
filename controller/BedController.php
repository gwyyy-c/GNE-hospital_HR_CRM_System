<?php
/**
 * Bed Controller
 * Handles hospital bed availability and status
 */
require_once __DIR__ . '/../model/Bed.php';

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