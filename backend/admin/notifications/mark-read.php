<?php
require_once '../config.php';
requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$adminId = $_SESSION['admin_id'];

try {
    $pdo = getDBConnection();
    
    if (isset($data['notificationId'])) {
        // Mark single notification as read
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = ? 
            AND (admin_id = ? OR admin_id IS NULL)
        ");
        $stmt->execute([$data['notificationId'], $adminId]);
    } else {
        // Mark all as read
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1 
            WHERE (admin_id = ? OR admin_id IS NULL)
        ");
        $stmt->execute([$adminId]);
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Notification(s) marked as read'
    ]);
    
} catch (Exception $e) {
    sendError('Failed to update notifications: ' . $e->getMessage(), 500);
}
?>
