<?php
require_once '../config.php';
requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
    sendError('Current password and new password are required', 400);
}

$currentPassword = $data['currentPassword'];
$newPassword = $data['newPassword'];
$adminId = $_SESSION['admin_id'];

if (strlen($newPassword) < 6) {
    sendError('New password must be at least 6 characters', 400);
}

try {
    $pdo = getDBConnection();
    
    // Get current admin data
    $stmt = $pdo->prepare("SELECT password FROM admin WHERE id = ?");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        sendError('Admin not found', 404);
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $admin['password'])) {
        sendError('Current password is incorrect', 401);
    }
    
    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password
    $stmt = $pdo->prepare("UPDATE admin SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $adminId]);
    
    // Log the action
    logAuditAction($pdo, $adminId, 'update', 'Changed account password');
    
    sendResponse([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);
    
} catch (Exception $e) {
    sendError('Failed to update password', 500);
}
?>
