<?php
require_once '../../admin/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$userId = $_SESSION['user_id'] ?? null;

$orderId = $_GET['id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order ID required']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Fetch order details ensuring it belongs to user
    $stmt = $pdo->prepare("
        SELECT * FROM orders WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$orderId, $userId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }

    // Fetch items
    $stmtItems = $pdo->prepare("
        SELECT 
            oi.*, 
            p.name as product_name, 
            p.image as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $stmtItems->execute([$orderId]);
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'order' => array_merge($order, ['items' => $items])
    ]);

} catch (Exception $e) {
    error_log("Order details error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch order details']);
}
?>
