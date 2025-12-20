<?php
require_once '../config.php';
requireAdminAuth();

try {
    $pdo = getDBConnection();
    
    // Get query parameters
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? intval($_GET['category']) : 0;
    
    // Build query
    $sql = "
        SELECT 
            p.id,
            p.name,
            p.description,
            p.category_id,
            c.name as category_name,
            p.price,
            p.image,
            p.is_available,
            p.created_at,
            p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    ";
    
    $params = [];
    
    if (!empty($search)) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if ($category > 0) {
        $sql .= " AND p.category_id = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY p.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Fetch sizes for each product
    $sizeStmt = $pdo->prepare("SELECT id, size_name, price FROM product_sizes WHERE product_id = ? ORDER BY price DESC");
    
    $result = [];
    foreach ($products as $p) {
        $categoryName = strtolower($p['category_name'] ?? '');
        $isPizzaOrDrinks = in_array($categoryName, ['pizza', 'drinks']);
        
        $sizes = [];
        // Always fetch sizes for pizza/drinks categories
        if ($isPizzaOrDrinks) {
            $sizeStmt->execute([intval($p['id'])]);
            $sizesData = $sizeStmt->fetchAll();
            foreach ($sizesData as $s) {
                $sizes[] = [
                    'id' => intval($s['id']),
                    'name' => $s['size_name'],
                    'price' => intval($s['price'])
                ];
            }
        }
        
        // hasSizes is true only if product actually has sizes
        $hasSizes = count($sizes) > 0;
        
        $result[] = [
            'id' => intval($p['id']),
            'name' => $p['name'],
            'description' => $p['description'],
            'categoryId' => intval($p['category_id']),
            'categoryName' => $p['category_name'],
            'price' => intval($p['price']),
            'image' => $p['image'],
            'isAvailable' => (bool)$p['is_available'],
            'hasSizes' => $hasSizes,
            'sizes' => $sizes,
            'createdAt' => $p['created_at'],
            'updatedAt' => $p['updated_at']
        ];
    }
    
    sendResponse([
        'success' => true,
        'products' => $result
    ]);
    
} catch (Exception $e) {
    sendError('Failed to fetch products: ' . $e->getMessage(), 500);
}
?>
