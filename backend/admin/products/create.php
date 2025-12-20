<?php
require_once '../config.php';
requireAdminAuth();

$data = getJSONInput();

// Validate required fields
if (empty($data['name']) || empty($data['categoryId'])) {
    sendError('Name and category are required');
}

$name = trim($data['name']);
$description = trim($data['description'] ?? '');
$categoryId = intval($data['categoryId']);
$price = intval($data['price'] ?? 0);
$image = trim($data['image'] ?? '');
$isAvailable = isset($data['isAvailable']) ? (bool)$data['isAvailable'] : true;
$sizes = $data['sizes'] ?? [];

try {
    $pdo = getDBConnection();
    
    // Verify category exists and get category name
    $stmt = $pdo->prepare("SELECT id, name FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if (!$category) {
        sendError('Invalid category');
    }
    
    $categoryName = strtolower($category['name']);
    $isPizza = $categoryName === 'pizza';
    $isDrinks = $categoryName === 'drinks';
    
    // Validate: Pizza always requires sizes
    if ($isPizza && empty($sizes)) {
        sendError('Sizes with prices are required for Pizza');
    }
    
    // Validate: If no sizes provided, price is required
    if (empty($sizes) && $price <= 0) {
        sendError('Price is required');
    }
    
    $pdo->beginTransaction();
    
    // Insert product
    $stmt = $pdo->prepare("
        INSERT INTO products (name, description, category_id, price, image, is_available)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $description, $categoryId, $price, $image, $isAvailable ? 1 : 0]);
    
    $productId = $pdo->lastInsertId();
    
    // Insert sizes if applicable
    if ($hasSizes && !empty($sizes)) {
        $sizeStmt = $pdo->prepare("INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)");
        foreach ($sizes as $size) {
            if (!empty($size['name']) && isset($size['price'])) {
                $sizeStmt->execute([$productId, $size['name'], intval($size['price'])]);
            }
        }
    }
    
    $pdo->commit();
    
    // Log the action
    logAuditAction($pdo, $_SESSION['admin_id'], 'create', "Created new product: $name");
    
    // Fetch the created product with sizes
    $stmt = $pdo->prepare("
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    ");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    
    // Fetch sizes
    $productSizes = [];
    if ($hasSizes) {
        $sizeStmt = $pdo->prepare("SELECT id, size_name, price FROM product_sizes WHERE product_id = ? ORDER BY price DESC");
        $sizeStmt->execute([$productId]);
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
        'message' => 'Product created successfully',
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
    ], 201);
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError('Failed to create product: ' . $e->getMessage(), 500);
}
?>
