<?php
require_once '../config.php';
requireAdminAuth();

$data = getJSONInput();

// Validate required fields
if (empty($data['id'])) {
    sendError('Product ID is required');
}

$id = intval($data['id']);
$name = isset($data['name']) ? trim($data['name']) : null;
$description = isset($data['description']) ? trim($data['description']) : null;
$categoryId = isset($data['categoryId']) ? intval($data['categoryId']) : null;
$price = isset($data['price']) ? intval($data['price']) : null;
$image = isset($data['image']) ? trim($data['image']) : null;
$isAvailable = isset($data['isAvailable']) ? (bool)$data['isAvailable'] : null;
$sizes = isset($data['sizes']) ? $data['sizes'] : null;

try {
    $pdo = getDBConnection();
    
    // Check if product exists and get category info
    $stmt = $pdo->prepare("
        SELECT p.id, p.category_id, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        sendError('Product not found', 404);
    }
    
    $pdo->beginTransaction();
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    if ($name !== null) {
        $updates[] = "name = ?";
        $params[] = $name;
    }
    if ($description !== null) {
        $updates[] = "description = ?";
        $params[] = $description;
    }
    if ($categoryId !== null) {
        // Verify category exists
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
        $stmt->execute([$categoryId]);
        if (!$stmt->fetch()) {
            sendError('Invalid category');
        }
        $updates[] = "category_id = ?";
        $params[] = $categoryId;
    }
    if ($price !== null) {
        $updates[] = "price = ?";
        $params[] = $price;
    }
    if ($image !== null) {
        $updates[] = "image = ?";
        $params[] = $image;
    }
    if ($isAvailable !== null) {
        $updates[] = "is_available = ?";
        $params[] = $isAvailable ? 1 : 0;
    }
    
    if (!empty($updates)) {
        $params[] = $id;
        $sql = "UPDATE products SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    
    // Handle sizes update if provided
    if ($sizes !== null) {
        // Delete existing sizes
        $stmt = $pdo->prepare("DELETE FROM product_sizes WHERE product_id = ?");
        $stmt->execute([$id]);
        
        // Insert new sizes
        if (!empty($sizes)) {
            $sizeStmt = $pdo->prepare("INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)");
            foreach ($sizes as $size) {
                if (!empty($size['name']) && isset($size['price'])) {
                    $sizeStmt->execute([$id, $size['name'], intval($size['price'])]);
                }
            }
        }
    }
    
    $pdo->commit();
    
    // Log the action
    logAuditAction($pdo, $_SESSION['admin_id'], 'update', "Updated product: $name (ID: $productId)");

    // Fetch updated product
    $stmt = $pdo->prepare("
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    $categoryName = strtolower($product['category_name'] ?? '');
    $hasSizes = in_array($categoryName, ['pizza', 'drinks']);
    
    // Fetch sizes
    $productSizes = [];
    if ($hasSizes) {
        $sizeStmt = $pdo->prepare("SELECT id, size_name, price FROM product_sizes WHERE product_id = ? ORDER BY price DESC");
        $sizeStmt->execute([$id]);
        $sizesData = $sizeStmt->fetchAll();
        foreach ($sizesData as $s) {
            $productSizes[] = [
                'id' => intval($s['id']),
                'name' => $s['size_name'],
                'price' => intval($s['price'])
            ];
        }
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Product updated successfully',
        'product' => [
            'id' => intval($product['id']),
            'name' => $product['name'],
            'description' => $product['description'],
            'categoryId' => intval($product['category_id']),
            'categoryName' => $product['category_name'],
            'price' => intval($product['price']),
            'image' => $product['image'],
            'isAvailable' => (bool)$product['is_available'],
            'hasSizes' => $hasSizes,
            'sizes' => $productSizes
        ]
    ]);
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError('Failed to update product: ' . $e->getMessage(), 500);
}
?>
