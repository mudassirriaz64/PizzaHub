<?php
require_once '../../admin/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Debug: Log session info
error_log("Order Create - Session ID: " . session_id());
error_log("Order Create - Session user_id: " . ($_SESSION['user_id'] ?? 'null'));

$userId = $_SESSION['user_id'] ?? null;

// Require user to be logged in for online orders
if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please log in to place an order']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// Validate required fields
if (empty($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Cart is empty']);
    exit;
}

if (empty($data['customer_name']) || empty($data['delivery_address'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name and address are required']);
    exit;
}

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();

    // Calculate totals
    $subtotal = 0;
    foreach ($data['items'] as $item) {
        $subtotal += ($item['price'] * $item['quantity']);
    }
    
    // Calculate tax (15% same as in-store cash orders)
    $discount = isset($data['discount']) ? floatval($data['discount']) : 0;
    $discountAmount = $subtotal * ($discount / 100);
    $tax = ($subtotal - $discountAmount) * 0.15; // 15% tax
    $deliveryFee = $subtotal > 1000 ? 0 : 150; // Free delivery over 1000
    $total = $subtotal - $discountAmount + $tax + $deliveryFee;

    // Insert Order
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            user_id, customer_name, order_type, status, 
            delivery_type, delivery_address, subtotal, discount, tax, 
            total, payment_status, payment_method, created_at, updated_at
        ) VALUES (
            ?, ?, 'online', 'pending', 
            'delivery', ?, ?, ?, ?, 
            ?, 'pending', ?, NOW(), NOW()
        )
    ");

    $stmt->execute([
        $userId,
        $data['customer_name'],
        $data['delivery_address'],
        $subtotal,
        $discountAmount,
        $tax,
        $total,
        $data['payment_method'] ?? 'cod'
    ]);

    $orderId = $pdo->lastInsertId();

    // Insert Order Items
    $itemStmt = $pdo->prepare("
        INSERT INTO order_items (
            order_id, product_id, size_name, quantity, price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");

    foreach ($data['items'] as $item) {
        $itemSubtotal = $item['price'] * $item['quantity'];
        $itemStmt->execute([
            $orderId,
            $item['id'],
            $item['size'] ?? null, // size_name
            $item['quantity'],
            $item['price'],
            $itemSubtotal
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully',
        'orderId' => $orderId
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Order creation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to place order']);
}
?>
