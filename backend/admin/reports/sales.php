<?php
require_once '../config.php';
requireAdminAuth();

$period = isset($_GET['period']) ? trim($_GET['period']) : 'daily';
$startDate = isset($_GET['start_date']) ? trim($_GET['start_date']) : null;
$endDate = isset($_GET['end_date']) ? trim($_GET['end_date']) : null;
$export = isset($_GET['export']) ? trim($_GET['export']) : null;

try {
    $pdo = getDBConnection();
    
    // Determine date range
    $today = date('Y-m-d');
    switch ($period) {
        case 'weekly':
            $start = date('Y-m-d', strtotime('-7 days'));
            $end = $today;
            break;
        case 'monthly':
            $start = date('Y-m-01');
            $end = $today;
            break;
        case 'custom':
            $start = $startDate ?: date('Y-m-01');
            $end = $endDate ?: $today;
            break;
        default: // daily
            $start = $today;
            $end = $today;
    }
    
    // Get sales summary
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total), 0) as total_revenue,
            COALESCE(SUM(discount), 0) as total_discounts,
            COALESCE(SUM(tax), 0) as total_tax,
            COALESCE(AVG(total), 0) as average_order_value,
            SUM(CASE WHEN order_type = 'online' THEN 1 ELSE 0 END) as online_orders,
            SUM(CASE WHEN order_type = 'instore' THEN 1 ELSE 0 END) as instore_orders
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND payment_status = 'paid'
        AND status = 'completed'
    ");
    $stmt->execute([$start, $end]);
    $summary = $stmt->fetch();
    
    // Get daily sales breakdown
    $stmt = $pdo->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            SUM(total) as revenue
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND payment_status = 'paid'
        AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$start, $end]);
    $dailySales = $stmt->fetchAll();
    
    // Get top selling products
    $stmt = $pdo->prepare("
        SELECT 
            p.name,
            SUM(oi.quantity) as quantity_sold,
            SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.payment_status = 'paid'
        AND o.status = 'completed'
        GROUP BY p.id, p.name
        ORDER BY quantity_sold DESC
        LIMIT 10
    ");
    $stmt->execute([$start, $end]);
    $topProducts = $stmt->fetchAll();
    
    // Get sales by category
    $stmt = $pdo->prepare("
        SELECT 
            c.name as category,
            SUM(oi.quantity) as quantity_sold,
            SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.payment_status = 'paid'
        AND o.status = 'completed'
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
    ");
    $stmt->execute([$start, $end]);
    $categoryBreakdown = $stmt->fetchAll();
    
    // Handle exports
    if ($export === 'pdf') {
        generatePDFReport($summary, $dailySales, $topProducts, $categoryBreakdown, $start, $end, $period);
        exit;
    } elseif ($export === 'excel') {
        generateExcelReport($summary, $dailySales, $topProducts, $categoryBreakdown, $start, $end, $period);
        exit;
    }
    
    sendResponse([
        'success' => true,
        'period' => $period,
        'dateRange' => [
            'start' => $start,
            'end' => $end
        ],
        'summary' => [
            'totalOrders' => intval($summary['total_orders']),
            'totalRevenue' => floatval($summary['total_revenue']),
            'totalDiscounts' => floatval($summary['total_discounts']),
            'totalTax' => floatval($summary['total_tax']),
            'averageOrderValue' => floatval($summary['average_order_value']),
            'onlineOrders' => intval($summary['online_orders']),
            'instoreOrders' => intval($summary['instore_orders'])
        ],
        'dailySales' => array_map(function($d) {
            return [
                'date' => $d['date'],
                'orders' => intval($d['orders']),
                'revenue' => floatval($d['revenue'])
            ];
        }, $dailySales),
        'topProducts' => array_map(function($p) {
            return [
                'name' => $p['name'],
                'quantitySold' => intval($p['quantity_sold']),
                'revenue' => floatval($p['revenue'])
            ];
        }, $topProducts),
        'categoryBreakdown' => array_map(function($c) {
            return [
                'category' => $c['category'],
                'quantitySold' => intval($c['quantity_sold']),
                'revenue' => floatval($c['revenue'])
            ];
        }, $categoryBreakdown)
    ]);
    
} catch (Exception $e) {
    sendError('Failed to generate report: ' . $e->getMessage(), 500);
}

function generatePDFReport($summary, $dailySales, $topProducts, $categoryBreakdown, $start, $end, $period) {
    // Output as HTML that can be printed to PDF by the browser
    header('Content-Type: text/html; charset=utf-8');
    
    $html = '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>PizzaHub Sales Report - ' . ucfirst($period) . '</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: Arial, sans-serif; 
                padding: 40px;
                background: #fff;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #e94560;
                padding-bottom: 20px;
            }
            h1 { 
                color: #e94560; 
                font-size: 32px;
                margin-bottom: 10px;
            }
            .period {
                color: #666;
                font-size: 16px;
            }
            .summary { 
                background-color: #f9f9f9; 
                padding: 20px; 
                margin: 30px 0;
                border-radius: 8px;
                border: 1px solid #ddd;
            }
            .summary h2 {
                color: #333;
                margin-bottom: 15px;
                font-size: 20px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            .summary-item {
                padding: 10px;
            }
            .summary-item strong {
                color: #e94560;
                display: block;
                margin-bottom: 5px;
            }
            h2 {
                color: #333;
                margin: 30px 0 15px 0;
                font-size: 22px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td { 
                padding: 12px; 
                border: 1px solid #ddd; 
                text-align: left;
            }
            th { 
                background-color: #e94560;
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #999;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
            @media print {
                body { padding: 20px; }
                .no-print { display: none; }
            }
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e94560;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(233, 69, 96, 0.3);
            }
            .print-button:hover {
                background: #d63851;
            }
        </style>
        <script>
            function printReport() {
                window.print();
            }
        </script>
    </head>
    <body>
        <button class="print-button no-print" onclick="printReport()">🖨️ Print / Save as PDF</button>
        
        <div class="header">
            <h1>🍕 PizzaHub Sales Report</h1>
            <p class="period"><strong>Period:</strong> ' . ucfirst($period) . ' (' . $start . ' to ' . $end . ')</p>
            <p class="period">Generated on: ' . date('F j, Y \a\t g:i A') . '</p>
        </div>
        
        <div class="summary">
            <h2>📊 Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <strong>Total Orders</strong>
                    <span>' . $summary['total_orders'] . ' orders</span>
                </div>
                <div class="summary-item">
                    <strong>Total Revenue</strong>
                    <span>Rs. ' . number_format($summary['total_revenue'], 2) . '</span>
                </div>
                <div class="summary-item">
                    <strong>Average Order Value</strong>
                    <span>Rs. ' . number_format($summary['average_order_value'], 2) . '</span>
                </div>
                <div class="summary-item">
                    <strong>Total Discounts</strong>
                    <span>Rs. ' . number_format($summary['total_discounts'], 2) . '</span>
                </div>
                <div class="summary-item">
                    <strong>Total Tax Collected</strong>
                    <span>Rs. ' . number_format($summary['total_tax'], 2) . '</span>
                </div>
                <div class="summary-item">
                    <strong>Net Revenue</strong>
                    <span>Rs. ' . number_format($summary['total_revenue'] - $summary['total_discounts'], 2) . '</span>
                </div>
            </div>
        </div>
        
        <h2>🏆 Top Selling Products</h2>
        <table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th style="text-align: center;">Quantity Sold</th>
                    <th style="text-align: right;">Revenue</th>
                </tr>
            </thead>
            <tbody>';
    
    if (empty($topProducts)) {
        $html .= '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">No products sold in this period</td></tr>';
    } else {
        foreach ($topProducts as $product) {
            $html .= '<tr>
                <td>' . htmlspecialchars($product['name']) . '</td>
                <td style="text-align: center;">' . $product['quantity_sold'] . '</td>
                <td style="text-align: right;">Rs. ' . number_format($product['revenue'], 2) . '</td>
            </tr>';
        }
    }
    
    $html .= '</tbody>
        </table>
        
        <h2>📁 Category Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th style="text-align: center;">Quantity Sold</th>
                    <th style="text-align: right;">Revenue</th>
                </tr>
            </thead>
            <tbody>';
    
    if (empty($categoryBreakdown)) {
        $html .= '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">No categories data available</td></tr>';
    } else {
        foreach ($categoryBreakdown as $category) {
            $html .= '<tr>
                <td>' . htmlspecialchars($category['category']) . '</td>
                <td style="text-align: center;">' . $category['quantity_sold'] . '</td>
                <td style="text-align: right;">Rs. ' . number_format($category['revenue'], 2) . '</td>
            </tr>';
        }
    }
    
    $html .= '</tbody>
        </table>';
    
    // Add daily sales table if available
    if (!empty($dailySales)) {
        $html .= '
        <h2>📅 Daily Sales Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th style="text-align: center;">Orders</th>
                    <th style="text-align: right;">Revenue</th>
                </tr>
            </thead>
            <tbody>';
        
        foreach ($dailySales as $day) {
            $html .= '<tr>
                <td>' . date('F j, Y', strtotime($day['date'])) . '</td>
                <td style="text-align: center;">' . $day['orders'] . '</td>
                <td style="text-align: right;">Rs. ' . number_format($day['revenue'], 2) . '</td>
            </tr>';
        }
        
        $html .= '</tbody>
        </table>';
    }
    
    $html .= '
        <div class="footer">
            <p>PizzaHub - Sales Report System</p>
            <p>This report is confidential and intended for internal use only.</p>
        </div>
    </body>
    </html>';
    
    echo $html;
}

function generateExcelReport($summary, $dailySales, $topProducts, $categoryBreakdown, $start, $end, $period) {
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="sales-report-' . $period . '-' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Header
    fputcsv($output, ['PizzaHub Sales Report']);
    fputcsv($output, ['Period', ucfirst($period) . ' (' . $start . ' to ' . $end . ')']);
    fputcsv($output, []);
    
    // Summary
    fputcsv($output, ['Summary']);
    fputcsv($output, ['Total Orders', $summary['total_orders']]);
    fputcsv($output, ['Total Revenue', 'Rs. ' . number_format($summary['total_revenue'], 2)]);
    fputcsv($output, ['Average Order Value', 'Rs. ' . number_format($summary['average_order_value'], 2)]);
    fputcsv($output, ['Total Discounts', 'Rs. ' . number_format($summary['total_discounts'], 2)]);
    fputcsv($output, ['Total Tax', 'Rs. ' . number_format($summary['total_tax'], 2)]);
    fputcsv($output, []);
    
    // Daily Sales
    fputcsv($output, ['Daily Sales']);
    fputcsv($output, ['Date', 'Orders', 'Revenue']);
    foreach ($dailySales as $day) {
        fputcsv($output, [$day['date'], $day['orders'], 'Rs. ' . number_format($day['revenue'], 2)]);
    }
    fputcsv($output, []);
    
    // Top Products
    fputcsv($output, ['Top Selling Products']);
    fputcsv($output, ['Product Name', 'Quantity Sold', 'Revenue']);
    foreach ($topProducts as $product) {
        fputcsv($output, [$product['name'], $product['quantity_sold'], 'Rs. ' . number_format($product['revenue'], 2)]);
    }
    fputcsv($output, []);
    
    // Category Breakdown
    fputcsv($output, ['Category Breakdown']);
    fputcsv($output, ['Category', 'Quantity Sold', 'Revenue']);
    foreach ($categoryBreakdown as $category) {
        fputcsv($output, [$category['category'], $category['quantity_sold'], 'Rs. ' . number_format($category['revenue'], 2)]);
    }
    
    fclose($output);
}
?>
