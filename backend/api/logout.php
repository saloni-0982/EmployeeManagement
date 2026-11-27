<?php
header("Content-Type: application/json");

$allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
];
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "secure" => false,
    "httponly" => true, "samesite" => "Lax"
]);
session_start();

// clear session data
$_SESSION = [];

// delete the session cookie in the browser
$p = session_get_cookie_params();
setcookie(session_name(), "", time() - 42000, $p["path"], $p["domain"], $p["secure"], $p["httponly"]);

// destroy the session on the server
session_destroy();

echo json_encode(["success" => true, "message" => "Logged out"]);