<?php
require_once '../config.php';
requireAdminAuth();

try {
    $pdo = getDBConnection();
    
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    $sql = "
        SELECT 
            u.id,
            u.name,
            u.email,
            u.phone,
            u.address,
            u.created_at,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
        WHERE 1=1
    ";
    
    $params = [];
    
    if (!empty($search)) {
        $sql .= " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $sql .= " GROUP BY u.id ORDER BY u.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'customers' => array_map(function($u) {
            return [
                'id' => intval($u['id']),
                'name' => $u['name'],
                'email' => $u['email'],
                'phone' => $u['phone'],
                'address' => $u['address'],
                'totalOrders' => intval($u['total_orders']),
                'totalSpent' => floatval($u['total_spent']),
                'createdAt' => $u['created_at']
            ];
        }, $users)
    ]);
    
} catch (Exception $e) {
    sendError('Failed to fetch customers', 500);
}
?>
