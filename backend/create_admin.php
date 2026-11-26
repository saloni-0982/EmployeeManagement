
<?php

require_once "config/db.php";

$user_id = "ADMIN001";
$plain_password = "Admin@123";

$hashed_password = password_hash(
    $plain_password,
    PASSWORD_DEFAULT
);

try {

    $sql = "INSERT INTO users (user_id, password, role)
            VALUES (:user_id, :password, :role)";

    $stmt = $conn->prepare($sql);

    $stmt->execute([
        ":user_id" => $user_id,
        ":password" => $hashed_password,
        ":role" => "admin"
    ]);

    echo "Admin account created successfully!";

} catch (PDOException $e) {
    echo "Could not create account. The User ID may already exist.";
}

?>
