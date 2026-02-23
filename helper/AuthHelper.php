<?php
class AuthHelper {
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function checkPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
?>