<?php
class ResponseHelper {
    /**
     * Send a standardized JSON response
     * @param int $code HTTP Status Code (200, 400, 404, 500)
     * @param mixed $data Data to be sent to the frontend
     * @param string $message Optional success/error message
     */
    public static function send($code, $data = null, $message = "") {
        http_response_code($code);
        echo json_encode([
            "status" => ($code >= 200 && $code < 300) ? "success" : "error",
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    // Send a success response
    public static function success($data = null, $message = "Success", $code = 200) {
        self::send($code, $data, $message);
    }

    // Send an error response   
    public static function error($message = "Error", $code = 400) {
        self::send($code, null, $message);
    }
}
?>