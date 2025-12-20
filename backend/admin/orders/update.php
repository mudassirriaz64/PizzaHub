<?php
require_once '../config.php';
requireAdminAuth();

$data = getJSONInput();

if (empty($data['id'])) {
    sendError('Order ID is required');
}

$id = intval($data['id']);
$status = isset($data['status']) ? trim($data['status']) : null;
$paymentStatus = isset($data['paymentStatus']) ? trim($data['paymentStatus']) : null;

$validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
$validPaymentStatuses = ['pending', 'paid', 'failed'];

if ($status !== null && !in_array($status, $validStatuses)) {
    sendError('Invalid status value');
}

if ($paymentStatus !== null && !in_array($paymentStatus, $validPaymentStatuses)) {
    sendError('Invalid payment status value');
}

try {
    $pdo = getDBConnection();
    
    // Check if order exists and get current status
    $stmt = $pdo->prepare("SELECT id, status, payment_status FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) {
        sendError('Order not found', 404);
    }
    
    // Prevent marking order as completed if payment is pending
    if ($status === 'completed' && $order['payment_status'] === 'pending') {
        sendError('Cannot complete order with pending payment. Please confirm payment first.');
    }
    
    // Build update query
    $updates = [];
    $params = [];
    
    if ($status !== null) {
        $updates[] = "status = ?";
        $params[] = $status;
    }
    
    if ($paymentStatus !== null) {
        $updates[] = "payment_status = ?";
        $params[] = $paymentStatus;
        
        // Auto-complete order when payment is confirmed (if order is not cancelled)
        if ($paymentStatus === 'paid' && $order['status'] !== 'cancelled') {
            $updates[] = "status = 'completed'";
        }
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $id;
    $sql = "UPDATE orders SET " . implode(", ", $updates) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Get updated stats for dashboard refresh
    $statsStmt = $pdo->query("SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE payment_status = 'paid' AND status = 'completed'");
    $newRevenue = $statsStmt->fetch()['total'];
    
    $ordersStmt = $pdo->query("SELECT COUNT(*) as count FROM orders");
    $totalOrders = $ordersStmt->fetch()['count'];
    
    // Log the action and create notification
    require_once '../notifications/helper.php';
    $orderNumber = 'ORD-' . str_pad($id, 3, '0', STR_PAD_LEFT);
    if ($status !== null) {
        $statusText = ucfirst(str_replace('_', ' ', $status));
        logAuditAction($pdo, $_SESSION['admin_id'], 'update', "Updated order $orderNumber status to: $statusText");
    }
    if ($paymentStatus !== null) {
        logAuditAction($pdo, $_SESSION['admin_id'], 'update', "Updated order $orderNumber payment status to: $paymentStatus");
    }
    
    // Fetch the updated order to return
    $orderStmt = $pdo->prepare("
        SELECT 
            o.id,
            o.status,
            o.payment_status,
            o.updated_at
        FROM orders o
        WHERE o.id = ?
    ");
    $orderStmt->execute([$id]);
    $updatedOrder = $orderStmt->fetch();
    
    sendResponse([
        'success' => true,
        'message' => 'Order updated successfully',
        'order' => [
            'id' => intval($updatedOrder['id']),
            'status' => $updatedOrder['status'],
            'paymentStatus' => $updatedOrder['payment_status'],
            'updatedAt' => $updatedOrder['updated_at']
        ],
        'updatedStats' => [
            'totalRevenue' => floatval($newRevenue),
            'totalOrders' => intval($totalOrders)
        ]
    ]);
    
} catch (Exception $e) {
    sendError('Failed to update order', 500);
}
?>
