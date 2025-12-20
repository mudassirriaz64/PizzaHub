<?php
require_once '../config.php';
requireAdminAuth();

try {
    $pdo = getDBConnection();
    
    // Get total revenue (only completed orders)
    $stmt = $pdo->query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = 'paid' AND status = 'completed'");
    $totalRevenue = $stmt->fetch()['total'];
    
    // Get total orders
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM orders");
    $totalOrders = $stmt->fetch()['count'];
    
    
    // Get order breakdown (completed orders must be paid)
    $stmt = $pdo->query("
        SELECT 
            CASE 
                WHEN status = 'completed' AND payment_status = 'paid' THEN 'completed'
                WHEN status = 'completed' AND payment_status != 'paid' THEN 'awaiting_payment'
                ELSE status 
            END as effective_status, 
            COUNT(*) as count 
        FROM orders 
        GROUP BY effective_status
    ");
    $orderBreakdown = $stmt->fetchAll();
    $completedOrders = 0;
    $cancelledOrders = 0;
    $pendingOrders = 0;
    $inProgressOrders = 0;
    $awaitingPaymentOrders = 0;
    
    foreach ($orderBreakdown as $item) {
        if ($item['effective_status'] === 'completed') {
            $completedOrders = intval($item['count']);
        } elseif ($item['effective_status'] === 'cancelled') {
            $cancelledOrders = intval($item['count']);
        } elseif ($item['effective_status'] === 'pending') {
            $pendingOrders = intval($item['count']);
        } elseif ($item['effective_status'] === 'in_progress') {
            $inProgressOrders = intval($item['count']);
        } elseif ($item['effective_status'] === 'awaiting_payment') {
            $awaitingPaymentOrders = intval($item['count']);
        }
    }
    
    // Get total products
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products WHERE is_available = 1");
    $totalProducts = $stmt->fetch()['count'];
    
    // Get total customers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $totalCustomers = $stmt->fetch()['count'];
    
    // Get previous week stats for percentage comparison
    $stmt = $pdo->query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = 'paid' AND status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $prevWeekRevenue = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $prevWeekOrders = $stmt->fetch()['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products WHERE is_available = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $prevWeekProducts = $stmt->fetch()['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $prevWeekCustomers = $stmt->fetch()['count'];
    
    // Calculate percentage changes
    $revenueChange = $prevWeekRevenue > 0 ? (($totalRevenue - $prevWeekRevenue) / $prevWeekRevenue * 100) : 0;
    $ordersChange = $prevWeekOrders > 0 ? (($totalOrders - $prevWeekOrders) / $prevWeekOrders * 100) : 0;
    $productsChange = $prevWeekProducts > 0 ? (($totalProducts - $prevWeekProducts) / $prevWeekProducts * 100) : ($totalProducts > 0 ? 100 : 0);
    $customersChange = $prevWeekCustomers > 0 ? (($totalCustomers - $prevWeekCustomers) / $prevWeekCustomers * 100) : ($totalCustomers > 0 ? 100 : 0);
    
    // Get sales data for last 7 days
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%a') as name,
            COALESCE(SUM(total), 0) as sales
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND payment_status = 'paid'
        GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%a')
        ORDER BY DATE(created_at)
    ");
    $salesData = $stmt->fetchAll();
    
    // Get top selling products this month
    $stmt = $pdo->query("
        SELECT 
            p.name,
            SUM(oi.quantity) as sales
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE MONTH(o.created_at) = MONTH(NOW())
        AND YEAR(o.created_at) = YEAR(NOW())
        AND o.payment_status = 'paid'
        GROUP BY p.id, p.name
        ORDER BY sales DESC
        LIMIT 5
    ");
    $topProducts = $stmt->fetchAll();
    
    // Get recent orders
    $stmt = $pdo->query("
        SELECT 
            o.id,
            CONCAT('ORD-', LPAD(o.id, 3, '0')) as order_id,
            o.user_id,
            COALESCE(o.customer_name, u.name, 'Guest User') as customer,
            o.total,
            o.status,
            CASE 
                WHEN TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) < 60 
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE, o.created_at, NOW()), ' min ago')
                WHEN TIMESTAMPDIFF(HOUR, o.created_at, NOW()) < 24 
                    THEN CONCAT(TIMESTAMPDIFF(HOUR, o.created_at, NOW()), ' hour ago')
                ELSE CONCAT(TIMESTAMPDIFF(DAY, o.created_at, NOW()), ' day ago')
            END as time
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ");
    $recentOrders = $stmt->fetchAll();
    
    sendResponse([
        'stats' => [
            'totalRevenue' => floatval($totalRevenue),
            'totalOrders' => intval($totalOrders),
            'completedOrders' => $completedOrders,
            'cancelledOrders' => $cancelledOrders,
            'pendingOrders' => $pendingOrders,
            'inProgressOrders' => $inProgressOrders,
            'awaitingPaymentOrders' => $awaitingPaymentOrders,
            'totalProducts' => intval($totalProducts),
            'totalCustomers' => intval($totalCustomers),
            'revenueChange' => round($revenueChange, 1),
            'ordersChange' => round($ordersChange, 1),
            'productsChange' => round($productsChange, 1),
            'customersChange' => round($customersChange, 1)
        ],
        'salesData' => array_map(function($row) {
            return [
                'name' => $row['name'],
                'sales' => floatval($row['sales'])
            ];
        }, $salesData),
        'topProducts' => array_map(function($row) {
            return [
                'name' => $row['name'],
                'sales' => intval($row['sales'])
            ];
        }, $topProducts),
        'recentOrders' => array_map(function($order) {
            return [
                'id' => $order['order_id'],
                'customer' => $order['customer'],
                'isGuest' => is_null($order['user_id']),
                'total' => floatval($order['total']),
                'status' => $order['status'],
                'time' => $order['time']
            ];
        }, $recentOrders)
    ]);
    
} catch (Exception $e) {
    sendError('Failed to fetch dashboard data', 500);
}
?>
