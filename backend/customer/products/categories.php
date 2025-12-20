<?php
// Customer Categories API - Get all categories
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

require_once '../../admin/config.php';

try {
    $pdo = getDBConnection();
    
    // Fetch all categories with product counts
    $stmt = $pdo->query("
        SELECT 
            c.id,
            c.name,
            c.description,
            COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_available = 1
        GROUP BY c.id, c.name, c.description
        HAVING product_count > 0
        ORDER BY c.name
    ");
    $categories = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'categories' => array_map(function($c) {
            return [
                'id' => intval($c['id']),
                'name' => $c['name'],
                'description' => $c['description'],
                'productCount' => intval($c['product_count'])
            ];
        }, $categories)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch categories'
    ]);
}
?>
