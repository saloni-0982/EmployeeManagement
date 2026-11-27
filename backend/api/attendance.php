<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/../config/db.php";
require_login();

$method = $_SERVER["REQUEST_METHOD"];

function valid_date($d) {
    $dt = DateTime::createFromFormat("Y-m-d", $d);
    return $dt && $dt->format("Y-m-d") === $d;
}

try {
    if ($method === "GET") {
        $date = $_GET["date"] ?? date("Y-m-d");
        if (!valid_date($date)) fail(400, "Invalid date");

        // every active employee, with their attendance for that date (NULL if not marked yet)
        $stmt = $conn->prepare(
            "SELECT e.id, e.emp_code, e.name, e.department, a.status
             FROM employees e
             LEFT JOIN attendance a
                    ON a.employee_id = e.id AND a.attendance_date = :d
             WHERE e.status = 'active'
             ORDER BY e.name"
        );
        $stmt->execute([":d" => $date]);
        echo json_encode(["success" => true, "date" => $date, "records" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($method === "POST") {
        $in = json_decode(file_get_contents("php://input"), true) ?? [];
        $date = $in["date"] ?? "";
        $records = $in["records"] ?? [];

        if (!valid_date($date)) fail(400, "Invalid date");
        if ($date > date("Y-m-d")) fail(400, "Cannot mark attendance for a future date");
        if (!is_array($records) || count($records) === 0) fail(400, "No attendance to save");

        $stmt = $conn->prepare(
            "INSERT INTO attendance (employee_id, attendance_date, status)
             VALUES (:emp, :d, :s)
             ON DUPLICATE KEY UPDATE status = VALUES(status)"
        );

        $conn->beginTransaction();
        foreach ($records as $r) {
            $emp = (int)($r["employee_id"] ?? 0);
            $s   = $r["status"] ?? "";
            if ($emp <= 0 || !in_array($s, ["present", "absent", "leave"], true)) {
                $conn->rollBack();
                fail(400, "Invalid attendance data");
            }
            $stmt->execute([":emp" => $emp, ":d" => $date, ":s" => $s]);
        }
        $conn->commit();

        echo json_encode(["success" => true, "message" => "Attendance saved"]);

    } else {
        fail(405, "Method not allowed");
    }
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    error_log($e->getMessage());
    fail(500, "Database error");
}