<?php
require_once '../../admin/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Debug: Log session info
error_log("Order Index - Session ID: " . session_id());
error_log("Order Index - Session user_id: " . ($_SESSION['user_id'] ?? 'null'));

$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Fetch orders for user
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            total, 
            status, 
            payment_status, 
            created_at, 
            (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id) as item_count
        FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);

} catch (Exception $e) {
    error_log("Order history error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch orders']);
}
?>
