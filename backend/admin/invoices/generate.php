<?php
require_once '../config.php';
requireAdminAuth();

$orderId = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

if (!$orderId) {
    sendError('Order ID is required');
}

try {
    $pdo = getDBConnection();
    
    // Get order with invoice
    $stmt = $pdo->prepare("
        SELECT 
            o.*,
            i.invoice_number,
            i.invoice_date,
            COALESCE(u.name, 'Guest') as customer_name,
            COALESCE(u.phone, '-') as customer_phone,
            COALESCE(u.email, '-') as customer_email,
            COALESCE(u.address, '-') as customer_address
        FROM orders o
        LEFT JOIN invoices i ON o.id = i.order_id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        sendError('Order not found', 404);
    }
    
    // Get order items
    $stmt = $pdo->prepare("
        SELECT 
            oi.*,
            p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$orderId]);
    $items = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'invoice' => [
            'invoiceNumber' => $order['invoice_number'] ?: 'N/A',
            'invoiceDate' => $order['invoice_date'] ?: $order['created_at'],
            'orderNumber' => 'ORD-' . str_pad($order['id'], 3, '0', STR_PAD_LEFT),
            'orderDate' => $order['created_at'],
            'customer' => [
                'name' => $order['customer_name'],
                'phone' => $order['customer_phone'],
                'email' => $order['customer_email'],
                'address' => $order['customer_address']
            ],
            'orderType' => $order['order_type'],
            'paymentMethod' => $order['payment_method'],
            'paymentStatus' => $order['payment_status'],
            'items' => array_map(function($item) {
                return [
                    'name' => $item['product_name'],
                    'quantity' => intval($item['quantity']),
                    'price' => floatval($item['price']),
                    'subtotal' => floatval($item['subtotal'])
                ];
            }, $items),
            'subtotal' => floatval($order['subtotal']),
            'discount' => floatval($order['discount']),
            'tax' => floatval($order['tax']),
            'total' => floatval($order['total'])
        ]
    ]);
    
} catch (Exception $e) {
    sendError('Failed to generate invoice', 500);
}
?>
