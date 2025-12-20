<?php
// Customer Featured Products API - Get popular pizzas only
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

require_once '../../admin/config.php';

try {
    $pdo = getDBConnection();
    
    // Fetch popular PIZZAS only (most ordered or newest)
    $stmt = $pdo->query("
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.image,
            c.name as category_name,
            COALESCE(SUM(oi.quantity), 0) as total_ordered,
            (SELECT MIN(ps.price) FROM product_sizes ps WHERE ps.product_id = p.id) as min_size_price
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        WHERE p.is_available = 1
        AND LOWER(c.name) = 'pizza'
        GROUP BY p.id, p.name, p.description, p.price, p.image, c.name
        ORDER BY total_ordered DESC, p.created_at DESC
        LIMIT 8
    ");
    $products = $stmt->fetchAll();
    
    // Prepare statement for sizes
    $sizeStmt = $pdo->prepare("SELECT size_name, price FROM product_sizes WHERE product_id = ? ORDER BY price ASC");

    echo json_encode([
        'success' => true,
        'products' => array_map(function($p) use ($sizeStmt) {
            $sizes = [];
            $minPrice = floatval($p['price']);
            
            // Fetch sizes if available
            $sizeStmt->execute([intval($p['id'])]);
            $sizesData = $sizeStmt->fetchAll();
            foreach ($sizesData as $s) {
                $sizes[$s['size_name']] = intval($s['price']);
            }
            // Get minimum price from sizes if available
            if (!empty($sizes)) {
                $minPrice = min(array_values($sizes));
            }

            return [
                'id' => intval($p['id']),
                'name' => $p['name'],
                'description' => $p['description'],
                'price' => $minPrice,
                'basePrice' => floatval($p['price']),
                'image' => $p['image'],
                'category' => $p['category_name'],
                'isPopular' => intval($p['total_ordered']) > 0,
                'hasSizes' => !empty($sizes),
                'sizes' => $sizes
            ];
        }, $products)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch featured products'
    ]);
}
?>
