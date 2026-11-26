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
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "secure" => false,
    "httponly" => true, "samesite" => "Lax"
]);
session_start();

function require_login() {
    if (empty($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Not logged in"]);
        exit;
    }
}

function fail($code, $msg) {
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $msg]);
    exit;
}