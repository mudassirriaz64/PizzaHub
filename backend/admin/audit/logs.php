<?php
require_once '../config.php';
requireAdminAuth();

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 20;
$offset = ($page - 1) * $limit;
$type = isset($_GET['type']) ? trim($_GET['type']) : 'all';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    $pdo = getDBConnection();
    
    // Build query
    $where = [];
    $params = [];
    
    if ($type !== 'all') {
        $where[] = "al.action = ?";
        $params[] = $type;
    }
    
    if ($search) {
        $where[] = "(al.description LIKE ? OR a.name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Get total count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM audit_logs al 
        JOIN admin a ON al.admin_id = a.id 
        $whereClause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch()['count'];
    $totalPages = ceil($total / $limit);
    
    // Get logs
    $stmt = $pdo->prepare("
        SELECT 
            al.id,
            al.admin_id,
            al.action,
            al.description,
            al.ip_address,
            al.created_at,
            a.name as user_name
        FROM audit_logs al
        JOIN admin a ON al.admin_id = a.id
        $whereClause
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $logs = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'logs' => array_map(function($log) {
            return [
                'id' => intval($log['id']),
                'adminId' => intval($log['admin_id']),
                'userName' => $log['user_name'],
                'action' => $log['action'],
                'description' => $log['description'],
                'ipAddress' => $log['ip_address'],
                'createdAt' => $log['created_at']
            ];
        }, $logs),
        'page' => $page,
        'totalPages' => $totalPages,
        'total' => $total
    ]);
    
} catch (Exception $e) {
    sendError('Failed to fetch audit logs: ' . $e->getMessage(), 500);
}
?>
