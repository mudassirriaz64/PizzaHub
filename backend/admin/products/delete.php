<?php
require_once '../config.php';
requireAdminAuth();

$data = getJSONInput();

if (empty($data['id'])) {
    sendError('Product ID is required');
}

$id = intval($data['id']);

try {
    $pdo = getDBConnection();
    
    // Check if product exists
    $stmt = $pdo->prepare("SELECT id, name FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        sendError('Product not found', 404);
    }
    
    // Delete product
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    
    // Log the action
    logAuditAction($pdo, $_SESSION['admin_id'], 'delete', "Deleted product: {$product['name']} (ID: $id)");
    
    sendResponse([
        'success' => true,
        'message' => "Product '{$product['name']}' deleted successfully"
    ]);
    
} catch (Exception $e) {
    sendError('Failed to delete product', 500);
}
?>
