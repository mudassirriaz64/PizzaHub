<?php
require_once '../config.php';
requireAdminAuth();

try {
    $pdo = getDBConnection();
    
    // Check if customer_name column exists
    $columnCheck = $pdo->query("SHOW COLUMNS FROM orders LIKE 'customer_name'");
    $hasCustomerName = $columnCheck->rowCount() > 0;
    
    // Get query parameters
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $type = isset($_GET['type']) ? trim($_GET['type']) : '';
    $date = isset($_GET['date']) ? trim($_GET['date']) : '';
    
    // Build query - adapt based on column existence
    $customerNameField = $hasCustomerName 
        ? "COALESCE(u.name, o.customer_name, 'Guest') as customer_name"
        : "COALESCE(u.name, 'Guest') as customer_name";
    
    // Build query
    $sql = "
        SELECT 
            o.id,
            CONCAT('ORD-', LPAD(o.id, 3, '0')) as order_number,
            o.user_id,
            $customerNameField,
            COALESCE(u.phone, '-') as customer_phone,
            o.order_type,
            o.status,
            o.delivery_type,
            o.delivery_address,
            o.subtotal,
            o.discount,
            o.tax,
            o.total,
            o.payment_status,
            o.payment_method,
            o.created_at,
            o.updated_at
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 1=1
    ";
    
    $params = [];
    
    if (!empty($status)) {
        $sql .= " AND o.status = ?";
        $params[] = $status;
    }
    
    if (!empty($type)) {
        $sql .= " AND o.order_type = ?";
        $params[] = $type;
    }
    
    if (!empty($date)) {
        $sql .= " AND DATE(o.created_at) = ?";
        $params[] = $date;
    }
    
    // Payment status filter
    $paymentStatus = isset($_GET['payment_status']) ? trim($_GET['payment_status']) : '';
    if (!empty($paymentStatus)) {
        $sql .= " AND o.payment_status = ?";
        $params[] = $paymentStatus;
    }
    
    // Customer type filter (registered/guest)
    $customerType = isset($_GET['customer_type']) ? trim($_GET['customer_type']) : '';
    if ($customerType === 'registered') {
        $sql .= " AND o.user_id IS NOT NULL";
    } elseif ($customerType === 'guest') {
        $sql .= " AND o.user_id IS NULL";
    }
    
    $sql .= " ORDER BY o.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    
    // Fetch items for each order separately (more compatible)
    $itemStmt = $pdo->prepare("
        SELECT 
            oi.id,
            oi.product_id as productId,
            p.name as productName,
            oi.size_name as sizeName,
            oi.quantity,
            oi.price,
            oi.subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    
    sendResponse([
        'success' => true,
        'orders' => array_map(function($o) use ($itemStmt) {
            // Fetch items for this order
            $itemStmt->execute([intval($o['id'])]);
            $items = $itemStmt->fetchAll();
            
            return [
                'id' => intval($o['id']),
                'orderNumber' => $o['order_number'],
                'invoiceNumber' => 'INV-' . str_pad($o['id'], 5, '0', STR_PAD_LEFT),
                'userId' => $o['user_id'] ? intval($o['user_id']) : null,
                'customerName' => $o['customer_name'],
                'customerPhone' => $o['customer_phone'],
                'isGuest' => is_null($o['user_id']),
                'orderType' => $o['order_type'],
                'status' => $o['status'],
                'deliveryType' => $o['delivery_type'],
                'deliveryAddress' => $o['delivery_address'],
                'subtotal' => floatval($o['subtotal']),
                'discount' => floatval($o['discount']),
                'tax' => floatval($o['tax']),
                'total' => floatval($o['total']),
                'paymentStatus' => $o['payment_status'],
                'paymentMethod' => $o['payment_method'],
                'items' => $items,
                'createdAt' => $o['created_at'],
                'updatedAt' => $o['updated_at']
            ];
        }, $orders)
    ]);
    
} catch (Exception $e) {
    sendError('Failed to fetch orders: ' . $e->getMessage(), 500);
}
?>
