<?php
require_once 'admin/config.php';
try {
    $pdo = getDBConnection();
    echo "Checking 'order_items' table:\n";
    $stmt = $pdo->query("DESCRIBE order_items");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "{$col['Field']} - {$col['Type']} (Null: {$col['Null']}, Key: {$col['Key']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
