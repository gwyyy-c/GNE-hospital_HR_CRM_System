<?php
/**
 * GET /api/bed/get_all
 * ====================
 * 
 * Returns all beds with their status.
 * 
 * @package   hr-pms-backend
 * @category  API Endpoint
 * @method    GET
 */

require_once __DIR__ . '/../../config/db_connection.php';
require_once __DIR__ . '/../../model/Bed.php';

try {
    $bed = new Bed($conn);
    $data = $bed->read()->fetchAll(PDO::FETCH_ASSOC);
    
    // Map is_occupied to status string for frontend
    $data = array_map(function($b) {
        $b['status'] = $b['is_occupied'] ? 'Occupied' : 'Available';
        return $b;
    }, $data);
    
    http_response_code(200);
    echo json_encode($data ?: []);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
