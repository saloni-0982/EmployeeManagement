<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/../config/db.php";
require_login();

if ($_SERVER["REQUEST_METHOD"] !== "GET") fail(405, "Method not allowed");

function valid_date($d) {
    $dt = DateTime::createFromFormat("Y-m-d", (string)$d);
    return $dt && $dt->format("Y-m-d") === $d;
}

$from = $_GET["from"] ?? "";
$to   = $_GET["to"] ?? "";
$emp  = (int)($_GET["employee_id"] ?? 0);

if (!valid_date($from) || !valid_date($to)) fail(400, "Invalid dates");
if ($to < $from) fail(400, "To date cannot be before From date");
if ((strtotime($to) - strtotime($from)) / 86400 > 366) fail(400, "Period cannot be longer than one year");

try {
    // 1) Summary: one row per employee
    $sql = "SELECT e.id, e.emp_code, e.name, e.department,
                   COALESCE(SUM(a.status = 'present'), 0) AS present_days,
                   COALESCE(SUM(a.status = 'absent'), 0)  AS absent_days,
                   COALESCE(SUM(a.status = 'leave'), 0)   AS leave_days
            FROM employees e
            LEFT JOIN attendance a
                   ON a.employee_id = e.id AND a.attendance_date BETWEEN :f AND :t
            WHERE e.status = 'active'";
    $params = [":f" => $from, ":t" => $to];
    if ($emp > 0) { $sql .= " AND e.id = :e"; $params[":e"] = $emp; }
    $sql .= " GROUP BY e.id, e.emp_code, e.name, e.department ORDER BY e.name";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2) Daily records
    $sql = "SELECT a.attendance_date, e.emp_code, e.name, e.department, a.status
            FROM attendance a JOIN employees e ON e.id = a.employee_id
            WHERE a.attendance_date BETWEEN :f AND :t";
    $params = [":f" => $from, ":t" => $to];
    if ($emp > 0) { $sql .= " AND e.id = :e"; $params[":e"] = $emp; }
    $sql .= " ORDER BY a.attendance_date DESC, e.name";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "summary" => $summary, "records" => $records]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    fail(500, "Database error");
}