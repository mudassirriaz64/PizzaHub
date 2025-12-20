<?php
require_once '../../admin/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>
