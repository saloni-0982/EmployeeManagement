<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/../config/db.php";
require_login();

$method = $_SERVER["REQUEST_METHOD"];
$in = json_decode(file_get_contents("php://input"), true) ?? [];

function valid_date($d) {
    $dt = DateTime::createFromFormat("Y-m-d", (string)$d);
    return $dt && $dt->format("Y-m-d") === $d;
}

try {
    if ($method === "GET") {
        $status = $_GET["status"] ?? "";
        $sql = "SELECT l.*, e.emp_code, e.name
                FROM leaves l JOIN employees e ON e.id = l.employee_id";
        $params = [];
        if (in_array($status, ["pending", "approved", "rejected"], true)) {
            $sql .= " WHERE l.status = :s";
            $params[":s"] = $status;
        }
        $sql .= " ORDER BY l.id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["success" => true, "leaves" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($method === "POST") {
        $emp    = (int)($in["employee_id"] ?? 0);
        $type   = trim($in["leave_type"] ?? "");
        $from   = $in["from_date"] ?? "";
        $to     = $in["to_date"] ?? "";
        $reason = trim($in["reason"] ?? "");

        if ($emp <= 0) fail(400, "Select an employee");
        if (!in_array($type, ["Casual", "Sick", "Earned", "Other"], true)) fail(400, "Invalid leave type");
        if (!valid_date($from) || !valid_date($to)) fail(400, "Invalid dates");
        if ($to < $from) fail(400, "To date cannot be before From date");
        if ((strtotime($to) - strtotime($from)) / 86400 > 90) fail(400, "Leave cannot be longer than 90 days");
        if (strlen($reason) > 255) fail(400, "Reason is too long");

        // block overlapping pending/approved requests for the same employee
        $chk = $conn->prepare(
            "SELECT COUNT(*) FROM leaves
             WHERE employee_id = :e AND status IN ('pending','approved')
               AND from_date <= :t AND to_date >= :f"
        );
        $chk->execute([":e" => $emp, ":t" => $to, ":f" => $from]);
        if ($chk->fetchColumn() > 0) fail(409, "This employee already has a leave request on these dates");

        $stmt = $conn->prepare(
            "INSERT INTO leaves (employee_id, leave_type, from_date, to_date, reason)
             VALUES (:e, :type, :f, :t, :r)"
        );
        $stmt->execute([":e" => $emp, ":type" => $type, ":f" => $from, ":t" => $to, ":r" => $reason]);
        echo json_encode(["success" => true, "message" => "Leave request submitted"]);

    } elseif ($method === "PUT") {
        $id     = (int)($in["id"] ?? 0);
        $status = $in["status"] ?? "";
        if ($id <= 0 || !in_array($status, ["approved", "rejected"], true)) fail(400, "Invalid request");

        $stmt = $conn->prepare("SELECT * FROM leaves WHERE id = :id");
        $stmt->execute([":id" => $id]);
        $leave = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$leave) fail(404, "Leave request not found");
        if ($leave["status"] !== "pending") fail(409, "This request has already been " . $leave["status"]);

        $conn->beginTransaction();
        $up = $conn->prepare("UPDATE leaves SET status = :s WHERE id = :id");
        $up->execute([":s" => $status, ":id" => $id]);

        if ($status === "approved") {
            // mark every day in the range as 'leave' in attendance
            $att = $conn->prepare(
                "INSERT INTO attendance (employee_id, attendance_date, status)
                 VALUES (:e, :d, 'leave')
                 ON DUPLICATE KEY UPDATE status = 'leave'"
            );
            $period = new DatePeriod(
                new DateTime($leave["from_date"]),
                new DateInterval("P1D"),
                (new DateTime($leave["to_date"]))->modify("+1 day")
            );
            foreach ($period as $day) {
                $att->execute([":e" => $leave["employee_id"], ":d" => $day->format("Y-m-d")]);
            }
        }
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Leave " . $status]);

    } elseif ($method === "DELETE") {
        $id = (int)($_GET["id"] ?? 0);
        if ($id <= 0) fail(400, "Invalid id");
        $stmt = $conn->prepare("DELETE FROM leaves WHERE id = :id AND status = 'pending'");
        $stmt->execute([":id" => $id]);
        if ($stmt->rowCount() === 0) fail(409, "Only pending requests can be deleted");
        echo json_encode(["success" => true, "message" => "Request deleted"]);

    } else {
        fail(405, "Method not allowed");
    }
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    error_log($e->getMessage());
    fail(500, "Database error");
}