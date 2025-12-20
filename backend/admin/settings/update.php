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
    
    // Try to update existing settings
    $stmt = $pdo->prepare("
        UPDATE admin_settings SET
            notifications_enabled = ?,
            email_notifications = ?,
            order_notifications = ?,
            product_notifications = ?,
            system_notifications = ?,
            auto_backup = ?,
            backup_frequency = ?,
            maintenance_mode = ?
        WHERE admin_id = ?
    ");
    
    $result = $stmt->execute([
        $data['notificationsEnabled'] ? 1 : 0,
        $data['emailNotifications'] ? 1 : 0,
        $data['orderNotifications'] ? 1 : 0,
        $data['productNotifications'] ? 1 : 0,
        $data['systemNotifications'] ? 1 : 0,
        $data['autoBackup'] ? 1 : 0,
        $data['backupFrequency'],
        $data['maintenanceMode'] ? 1 : 0,
        $adminId
    ]);
    
    // If no rows affected, insert new settings
    if ($stmt->rowCount() === 0) {
        $stmt = $pdo->prepare("
            INSERT INTO admin_settings (admin_id, notifications_enabled, email_notifications,
                order_notifications, product_notifications, system_notifications,
                auto_backup, backup_frequency, maintenance_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $adminId,
            $data['notificationsEnabled'] ? 1 : 0,
            $data['emailNotifications'] ? 1 : 0,
            $data['orderNotifications'] ? 1 : 0,
            $data['productNotifications'] ? 1 : 0,
            $data['systemNotifications'] ? 1 : 0,
            $data['autoBackup'] ? 1 : 0,
            $data['backupFrequency'],
            $data['maintenanceMode'] ? 1 : 0
        ]);
    }
    
    // Log the action
    logAuditAction($pdo, $adminId, 'update', 'Updated system settings');
    
    sendResponse([
        'success' => true,
        'message' => 'Settings updated successfully'
    ]);
    
} catch (Exception $e) {
    sendError('Failed to update settings: ' . $e->getMessage(), 500);
}
?>
