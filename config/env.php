<?php
/**
 * Env - Simple .env file loader
 * Parses KEY=VALUE pairs and makes them available via Env::get()
 */
class Env {
    private static $loaded = false;

    /** Load .env file into environment */
    public static function load($path = null) {
        if (self::$loaded) return;

        $path = $path ?? __DIR__ . '/../.env';
        if (!file_exists($path)) {
            throw new Exception(".env file not found: $path");
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') === false) continue;

            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim(trim($value), '"\'');

            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
        self::$loaded = true;
    }

    /** Get environment variable with optional default */
    public static function get($key, $default = null) {
        if (!self::$loaded) self::load();
        $value = getenv($key);
        return $value !== false ? $value : $default;
    }
}
