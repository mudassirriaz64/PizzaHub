<?php
require_once '../config.php';

// Function to create a notification
function createNotification($pdo, $type, $title, $message, $adminId = null, $relatedId = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO notifications (admin_id, type, title, message, related_id)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$adminId, $type, $title, $message, $relatedId]);
        return true;
    } catch (Exception $e) {
        error_log('Failed to create notification: ' . $e->getMessage());
        return false;
    }
}
?>
