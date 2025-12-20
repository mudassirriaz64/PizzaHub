<?php
require_once '../config.php';

$data = getJSONInput();

if (empty($data['username']) || empty($data['password'])) {
    sendError('Username and password are required');
}

$username = trim($data['username']);
$password = $data['password'];

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT id, username, password, name FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        sendError('Invalid credentials', 401);
    }
    
    if (!password_verify($password, $admin['password'])) {
        sendError('Invalid credentials', 401);
    }
    
    // Create secure session
    createSession($admin['id'], $admin['name'], $admin['username']);

    
    // Log the login action
    logAuditAction($pdo, $admin['id'], 'login', 'Admin logged into the system');
    
    sendResponse([
        'success' => true,
        'message' => 'Login successful',
        'admin' => [
            'id' => $admin['id'],
            'name' => $admin['name'],
            'username' => $admin['username']
        ]
    ]);
    
} catch (Exception $e) {
    sendError('Login failed', 500);
}
?>
