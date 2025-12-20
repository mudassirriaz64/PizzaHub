<?php
require_once '../config.php';
requireAdminAuth();

try {
    $pdo = getDBConnection();
    $adminId = $_SESSION['admin_id'];
    
    // Get or create settings for this admin
    $stmt = $pdo->prepare("SELECT * FROM admin_settings WHERE admin_id = ?");
    $stmt->execute([$adminId]);
    $settings = $stmt->fetch();
    
    if (!$settings) {
        // Create default settings
        $stmt = $pdo->prepare("
            INSERT INTO admin_settings (admin_id, notifications_enabled, email_notifications, 
                order_notifications, product_notifications, system_notifications, 
                auto_backup, backup_frequency, maintenance_mode)
            VALUES (?, 1, 0, 1, 1, 1, 1, 'daily', 0)
        ");
        $stmt->execute([$adminId]);
        
        $stmt = $pdo->prepare("SELECT * FROM admin_settings WHERE admin_id = ?");
        $stmt->execute([$adminId]);
        $settings = $stmt->fetch();
    }
    
    sendResponse([
        'success' => true,
        'settings' => [
            'notificationsEnabled' => (bool)$settings['notifications_enabled'],
            'emailNotifications' => (bool)$settings['email_notifications'],
            'orderNotifications' => (bool)$settings['order_notifications'],
            'productNotifications' => (bool)$settings['product_notifications'],
            'systemNotifications' => (bool)$settings['system_notifications'],
            'autoBackup' => (bool)$settings['auto_backup'],
            'backupFrequency' => $settings['backup_frequency'],
            'maintenanceMode' => (bool)$settings['maintenance_mode']
        ]
    ]);
    
} catch (Exception $e) {
    // If table doesn't exist, return defaults
    sendResponse([
        'success' => true,
        'settings' => [
            'notificationsEnabled' => true,
            'emailNotifications' => false,
            'orderNotifications' => true,
            'productNotifications' => true,
            'systemNotifications' => true,
            'autoBackup' => true,
            'backupFrequency' => 'daily',
            'maintenanceMode' => false
        ]
    ]);
}
?>
