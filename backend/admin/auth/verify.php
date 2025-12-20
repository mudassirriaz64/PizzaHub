<?php
require_once '../config.php';

// Validate session first
if (!validateSession()) {
    sendResponse(['authenticated' => false], 401);
}

if (isAdminAuthenticated()) {
    sendResponse([
        'authenticated' => true,
        'admin' => [
            'id' => $_SESSION['admin_id'],
            'name' => $_SESSION['admin_name'],
            'username' => $_SESSION['admin_username']
        ]
    ]);
} else {
    sendResponse(['authenticated' => false], 401);
}
?>
