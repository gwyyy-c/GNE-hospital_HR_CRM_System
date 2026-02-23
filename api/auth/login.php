<?php
// auth/login.php — proxy to the main login handler
// This file exists so the .htaccess route "auth/login" resolves correctly.
require_once __DIR__ . '/../../api/login.php';
