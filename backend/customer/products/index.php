<?php
// Customer Products API - Get all available products
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

require_once '../../admin/config.php';

try {
    $pdo = getDBConnection();
    
    // Fetch all available products with category info
    $stmt = $pdo->query("
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.image,
            p.is_available,
            p.category_id,
            c.name as category_name,
            p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_available = 1
        ORDER BY c.name, p.name
    ");
    $products = $stmt->fetchAll();
    
    // Prepare statement for sizes
    $sizeStmt = $pdo->prepare("SELECT size_name, price FROM product_sizes WHERE product_id = ? ORDER BY price ASC");
    
    $result = [];
    foreach ($products as $p) {
        $sizes = [];
        $minPrice = floatval($p['price']);
        
        // Always fetch sizes for all products
        $sizeStmt->execute([intval($p['id'])]);
        $sizesData = $sizeStmt->fetchAll();
        foreach ($sizesData as $s) {
            $sizes[$s['size_name']] = intval($s['price']);
        }
        // Get minimum price from sizes if available
        if (!empty($sizes)) {
            $minPrice = min(array_values($sizes));
        }
        
        $result[] = [
            'id' => intval($p['id']),
            'name' => $p['name'],
            'description' => $p['description'],
            'price' => $minPrice,
            'basePrice' => floatval($p['price']),
            'image' => $p['image'],
            'isAvailable' => (bool)$p['is_available'],
            'categoryId' => intval($p['category_id']),
            'categoryName' => $p['category_name'],
            'hasSizes' => !empty($sizes),
            'sizes' => $sizes
        ];
    }
    
    echo json_encode([
        'success' => true,
        'products' => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch products'
    ]);
}
?>
