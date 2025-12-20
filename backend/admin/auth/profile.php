<?php
require_once '../config.php';
requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['username'])) {
    sendError('Name and username are required', 400);
}

$name = trim($data['name']);
$username = trim($data['username']);
$adminId = $_SESSION['admin_id'];

try {
    $pdo = getDBConnection();
    
    // Check if username is already taken by another admin
    $stmt = $pdo->prepare("SELECT id FROM admin WHERE username = ? AND id != ?");
    $stmt->execute([$username, $adminId]);
    if ($stmt->fetch()) {
        sendError('Username already taken', 400);
    }
    
    // Update admin profile
    $stmt = $pdo->prepare("UPDATE admin SET name = ?, username = ? WHERE id = ?");
    $stmt->execute([$name, $username, $adminId]);
    
    // Get updated admin data
    $stmt = $pdo->prepare("SELECT id, username, name FROM admin WHERE id = ?");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch();
    
    // Log the action
    logAuditAction($pdo, $adminId, 'update', 'Updated profile information');
    
    sendResponse([
        'success' => true,
        'message' => 'Profile updated successfully',
        'admin' => $admin
    ]);
    
} catch (Exception $e) {
    sendError('Failed to update profile', 500);
}
?>
