<?php
require_once '../config.php';
requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();
    
    if ($method === 'GET') {
        // Get all categories
        $stmt = $pdo->query("
            SELECT 
                c.id,
                c.name,
                c.description,
                COUNT(p.id) as product_count,
                c.created_at
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
            ORDER BY c.name ASC
        ");
        $categories = $stmt->fetchAll();
        
        sendResponse([
            'success' => true,
            'categories' => array_map(function($c) {
                return [
                    'id' => intval($c['id']),
                    'name' => $c['name'],
                    'description' => $c['description'],
                    'productCount' => intval($c['product_count']),
                    'createdAt' => $c['created_at']
                ];
            }, $categories)
        ]);
    } 
    else if ($method === 'POST') {
        // Create category
        $data = getJSONInput();
        
        if (empty($data['name'])) {
            sendError('Category name is required');
        }
        
        $name = trim($data['name']);
        $description = trim($data['description'] ?? '');
        
        $stmt = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
        $stmt->execute([$name, $description]);
        
        $categoryId = $pdo->lastInsertId();
        
        sendResponse([
            'success' => true,
            'message' => 'Category created successfully',
            'category' => [
                'id' => intval($categoryId),
                'name' => $name,
                'description' => $description,
                'productCount' => 0
            ]
        ], 201);
    }
    else if ($method === 'PUT') {
        // Update category
        $data = getJSONInput();
        
        if (empty($data['id'])) {
            sendError('Category ID is required');
        }
        
        $id = intval($data['id']);
        $name = isset($data['name']) ? trim($data['name']) : null;
        $description = isset($data['description']) ? trim($data['description']) : null;
        
        // Check if category exists
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            sendError('Category not found', 404);
        }
        
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
        
        if (empty($updates)) {
            sendError('No fields to update');
        }
        
        $params[] = $id;
        $sql = "UPDATE categories SET " . implode(", ", $updates) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        sendResponse([
            'success' => true,
            'message' => 'Category updated successfully'
        ]);
    }
    else if ($method === 'DELETE') {
        // Delete category
        $data = getJSONInput();
        
        if (empty($data['id'])) {
            sendError('Category ID is required');
        }
        
        $id = intval($data['id']);
        
        // Check if category has products
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            sendError('Cannot delete category with existing products');
        }
        
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        
        sendResponse([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
    
} catch (Exception $e) {
    sendError('Operation failed', 500);
}
?>
