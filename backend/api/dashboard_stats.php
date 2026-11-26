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
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

if (empty($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

require_once __DIR__ . "/../config/db.php";

try {
    $total   = $conn->query("SELECT COUNT(*) FROM employees WHERE status='active'")->fetchColumn();
    $pending = $conn->query("SELECT COUNT(*) FROM leaves WHERE status='pending'")->fetchColumn();

    $stats = ["present" => 0, "absent" => 0, "leave" => 0];
    $rows = $conn->query(
        "SELECT status, COUNT(*) AS c FROM attendance
         WHERE attendance_date = CURDATE() GROUP BY status"
    )->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $r) {
        $stats[$r["status"]] = (int)$r["c"];
    }

    echo json_encode([
        "success"        => true,
        "totalEmployees" => (int)$total,
        "pendingLeaves"  => (int)$pending,
        "today"          => $stats
    ]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}