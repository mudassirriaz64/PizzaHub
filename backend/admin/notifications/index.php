<?php
require_once '../config.php';
requireAdminAuth();

try {
    $pdo = getDBConnection();
    $adminId = $_SESSION['admin_id'];
    
    // Get unread count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE (admin_id = ? OR admin_id IS NULL) 
        AND is_read = 0
    ");
    $stmt->execute([$adminId]);
    $unreadCount = $stmt->fetch()['count'];
    
    // Get recent notifications (last 10)
    $stmt = $pdo->prepare("
        SELECT 
            id,
            type,
            title,
            message,
            is_read,
            related_id,
            created_at,
            CASE 
                WHEN TIMESTAMPDIFF(MINUTE, created_at, NOW()) < 1 
                    THEN 'Just now'
                WHEN TIMESTAMPDIFF(MINUTE, created_at, NOW()) < 60 
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' min ago')
                WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) < 24 
                    THEN CONCAT(TIMESTAMPDIFF(HOUR, created_at, NOW()), ' hour', IF(TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1, 's', ''), ' ago')
                ELSE CONCAT(TIMESTAMPDIFF(DAY, created_at, NOW()), ' day', IF(TIMESTAMPDIFF(DAY, created_at, NOW()) > 1, 's', ''), ' ago')
            END as time_ago
        FROM notifications
        WHERE admin_id = ? OR admin_id IS NULL
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$adminId]);
    $notifications = $stmt->fetchAll();
    
    sendResponse([
        'success' => true,
        'notifications' => array_map(function($n) {
            return [
                'id' => intval($n['id']),
                'type' => $n['type'],
                'title' => $n['title'],
                'message' => $n['message'],
                'isRead' => (bool)$n['is_read'],
                'relatedId' => $n['related_id'] ? intval($n['related_id']) : null,
                'time' => $n['time_ago'],
                'createdAt' => $n['created_at']
            ];
        }, $notifications),
        'unreadCount' => intval($unreadCount)
    ]);
    
} catch (Exception $e) {
    sendError('Failed to fetch notifications: ' . $e->getMessage(), 500);
}
?>
