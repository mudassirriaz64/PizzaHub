<?php
require_once 'admin/config.php';
try {
    $pdo = getDBConnection();
    echo "=== Columns in 'users' table ===\n";
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "{$col['Field']} - {$col['Type']} (Null: {$col['Null']}, Key: {$col['Key']})\n";
    }

    echo "\n=== First 3 rows in 'users' table ===\n";
    $stmt = $pdo->query("SELECT * FROM users LIMIT 3");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
