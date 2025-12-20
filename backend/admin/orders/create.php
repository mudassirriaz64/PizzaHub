<?php
require_once '../config.php';
requireAdminAuth();

$data = getJSONInput();

// Validate required fields
if (empty($data['items']) || !is_array($data['items'])) {
    sendError('Order items are required');
}

$orderType = isset($data['orderType']) ? $data['orderType'] : 'instore';
$deliveryType = isset($data['deliveryType']) ? $data['deliveryType'] : 'pickup';
$deliveryAddress = isset($data['deliveryAddress']) ? trim($data['deliveryAddress']) : null;
$discount = isset($data['discount']) ? floatval($data['discount']) : 0;
$paymentMethod = isset($data['paymentMethod']) ? $data['paymentMethod'] : 'cash';
$paymentStatus = isset($data['paymentStatus']) ? $data['paymentStatus'] : 'paid';
$userId = isset($data['userId']) ? intval($data['userId']) : null;
$customerName = isset($data['customerName']) ? trim($data['customerName']) : null;

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();
    
    // Calculate totals
    $subtotal = 0;
    $itemsToInsert = [];
    
    foreach ($data['items'] as $item) {
        if (empty($item['productId']) || empty($item['quantity'])) {
            throw new Exception('Invalid item data');
        }
        
        $quantity = intval($item['quantity']);
        $productId = intval($item['productId']);
        $sizeName = isset($item['sizeName']) ? $item['sizeName'] : null;
        
        // Determine price: use size price if available, otherwise use product price
        $price = 0;
        
        if ($sizeName) {
            // Get price from product_sizes table
            $stmt = $pdo->prepare("
                SELECT ps.price 
                FROM product_sizes ps 
                WHERE ps.product_id = ? AND ps.size_name = ?
            ");
            $stmt->execute([$productId, $sizeName]);
            $sizeData = $stmt->fetch();
            
            if ($sizeData) {
                $price = floatval($sizeData['price']);
            } else {
                throw new Exception("Size '$sizeName' not found for product ID: $productId");
            }
        } else {
            // Get product base price
            $stmt = $pdo->prepare("SELECT price FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();
            
            if (!$product) {
                throw new Exception("Product not found: $productId");
            }
            
            $price = floatval($product['price']);
        }
        
        $itemSubtotal = $price * $quantity;
        $subtotal += $itemSubtotal;
        
        $itemsToInsert[] = [
            'productId' => $productId,
            'quantity' => $quantity,
            'price' => $price,
            'subtotal' => $itemSubtotal,
            'sizeName' => $sizeName
        ];
    }
    
    // Calculate tax (15% for cash, 5% for card)
    $taxRate = $paymentMethod === 'cash' ? 0.15 : 0.05;
    
    // Discount is percentage-based now
    $discountAmount = $subtotal * ($discount / 100);
    
    $tax = ($subtotal - $discountAmount) * $taxRate;
    $total = $subtotal - $discountAmount + $tax;
    
    // Create order
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            user_id, customer_name, order_type, status, delivery_type, delivery_address,
            subtotal, discount, tax, total, payment_status, payment_method
        ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $userId,
        $customerName,
        $orderType,
        $deliveryType,
        $deliveryAddress,
        $subtotal,
        $discountAmount,
        $tax,
        $total,
        $paymentStatus,
        $paymentMethod
    ]);
    
    $orderId = $pdo->lastInsertId();
    
    // Insert order items
    $stmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, size_name, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($itemsToInsert as $item) {
        $stmt->execute([
            $orderId,
            $item['productId'],
            $item['sizeName'], // This was added to itemsToInsert in previous step
            $item['quantity'],
            $item['price'],
            $item['subtotal']
        ]);
    }
    
    // Generate invoice
    $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad($orderId, 4, '0', STR_PAD_LEFT);
    $stmt = $pdo->prepare("INSERT INTO invoices (order_id, invoice_number) VALUES (?, ?)");
    $stmt->execute([$orderId, $invoiceNumber]);
    
    $pdo->commit();
    
    // Log the action and create notification
    $orderNumber = 'ORD-' . str_pad($orderId, 3, '0', STR_PAD_LEFT);
    logAuditAction($pdo, $_SESSION['admin_id'], 'create', "Created new order: $orderNumber for " . ($customerName ?: 'Guest'));

    sendResponse([
        'success' => true,
        'message' => 'Order created successfully',
        'order' => [
            'id' => intval($orderId),
            'orderNumber' => 'ORD-' . str_pad($orderId, 3, '0', STR_PAD_LEFT),
            'invoiceNumber' => $invoiceNumber,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $total
        ]
    ], 201);
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError('Failed to create order: ' . $e->getMessage(), 500);
}
?>
