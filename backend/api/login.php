<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

$allowed_origins = [
    // "http://localhost:5173",
    // "http://127.0.0.1:5173"
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

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

session_set_cookie_params([
    "lifetime" => 0,
    "path"     => "/",
    "secure"   => false,
    "httponly" => true,
    "samesite" => "Lax"
]);
session_start();

require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id       = trim($data["userId"] ?? "");
$user_password = $data["password"] ?? "";

if ($user_id === "" || $user_password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User ID and password are required"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([":user_id" => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // if (
    //     $user &&
    //     $user["status"] === "active" &&
    //     password_verify($user_password, $user["password"])
    // ) 
    
    if (
    $user &&
    $user["status"] === "active" &&
    hash_equals($user["password"], $user_password)
)
    {
        session_regenerate_id(true);

        $_SESSION["user_id"] = $user["user_id"];
        $_SESSION["role"]    = $user["role"];

        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "userId" => $user["user_id"],
                "role"   => $user["role"]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid User ID or password"
        ]);
    }

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Something went wrong"
    ]);
}