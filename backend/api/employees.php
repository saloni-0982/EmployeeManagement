<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/../config/db.php";
require_login();

$method = $_SERVER["REQUEST_METHOD"];
$in = json_decode(file_get_contents("php://input"), true) ?? [];

function clean($in) {
    $d = [
        "emp_code"     => trim($in["emp_code"] ?? ""),
        "name"         => trim($in["name"] ?? ""),
        "email"        => trim($in["email"] ?? ""),
        "phone"        => trim($in["phone"] ?? ""),
        "department"   => trim($in["department"] ?? ""),
        "designation"  => trim($in["designation"] ?? ""),
        "joining_date" => trim($in["joining_date"] ?? ""),
        "status"       => $in["status"] ?? "active",
    ];
    if ($d["emp_code"] === "" || $d["name"] === "") fail(400, "Employee ID and name are required");
    if ($d["email"] !== "" && !filter_var($d["email"], FILTER_VALIDATE_EMAIL)) fail(400, "Invalid email address");
    if ($d["phone"] !== "" && !preg_match('/^[0-9+\- ]{7,15}$/', $d["phone"])) fail(400, "Invalid phone number");
    if (!in_array($d["status"], ["active", "inactive"], true)) fail(400, "Invalid status");
    $d["joining_date"] = $d["joining_date"] === "" ? null : $d["joining_date"];
    return $d;
}

try {
    if ($method === "GET") {
        $s = "%" . trim($_GET["search"] ?? "") . "%";
        $stmt = $conn->prepare(
            "SELECT * FROM employees
             WHERE name LIKE :a OR emp_code LIKE :b OR department LIKE :c
             ORDER BY id DESC"
        );
        $stmt->execute([":a" => $s, ":b" => $s, ":c" => $s]);
        echo json_encode(["success" => true, "employees" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($method === "POST") {
        $d = clean($in);
        $stmt = $conn->prepare(
            "INSERT INTO employees (emp_code, name, email, phone, department, designation, joining_date, status)
             VALUES (:emp_code, :name, :email, :phone, :department, :designation, :joining_date, :status)"
        );
        $stmt->execute([
            ":emp_code" => $d["emp_code"], ":name" => $d["name"], ":email" => $d["email"],
            ":phone" => $d["phone"], ":department" => $d["department"],
            ":designation" => $d["designation"], ":joining_date" => $d["joining_date"],
            ":status" => $d["status"],
        ]);
        echo json_encode(["success" => true, "message" => "Employee added"]);

    } elseif ($method === "PUT") {
        $id = (int)($in["id"] ?? 0);
        if ($id <= 0) fail(400, "Invalid employee id");
        $d = clean($in);
        $stmt = $conn->prepare(
            "UPDATE employees SET emp_code=:emp_code, name=:name, email=:email, phone=:phone,
             department=:department, designation=:designation, joining_date=:joining_date, status=:status
             WHERE id=:id"
        );
        $stmt->execute([
            ":emp_code" => $d["emp_code"], ":name" => $d["name"], ":email" => $d["email"],
            ":phone" => $d["phone"], ":department" => $d["department"],
            ":designation" => $d["designation"], ":joining_date" => $d["joining_date"],
            ":status" => $d["status"], ":id" => $id,
        ]);
        echo json_encode(["success" => true, "message" => "Employee updated"]);

    } elseif ($method === "DELETE") {
        $id = (int)($_GET["id"] ?? 0);
        if ($id <= 0) fail(400, "Invalid employee id");
        $stmt = $conn->prepare("DELETE FROM employees WHERE id = :id");
        $stmt->execute([":id" => $id]);
        echo json_encode(["success" => true, "message" => "Employee deleted"]);

    } else {
        fail(405, "Method not allowed");
    }
} catch (PDOException $e) {
    if ($e->getCode() == 23000) fail(409, "This Employee ID already exists");
    error_log($e->getMessage());
    fail(500, "Database error");
}