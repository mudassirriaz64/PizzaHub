<?php
require_once '../config.php';

if (isAdminAuthenticated()) {
    $pdo = getDBConnection();
    $adminId = $_SESSION['admin_id'];
    
    // Log the logout action before destroying session
    logAuditAction($pdo, $adminId, 'logout', 'Admin logged out of the system');
}

session_destroy();

sendResponse([
    'success' => true,
    'message' => 'Logged out successfully'
]);
?>
