<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'pizzahub_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// CORS Headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
}

// Session configuration
ini_set('session.gc_maxlifetime', 1800); // 30 minutes
ini_set('session.cookie_lifetime', 1800); // 30 minutes
ini_set('session.cookie_lifetime', 1800); // 30 minutes
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Session timeout and validation
define('SESSION_TIMEOUT', 1800); // 30 minutes in seconds

function validateSession() {
    // Check if session exists
    if (!isset($_SESSION['admin_id'])) {
        return false;
    }
    
    // Check session timeout (last activity)
    if (isset($_SESSION['last_activity'])) {
        $elapsed = time() - $_SESSION['last_activity'];
        if ($elapsed > SESSION_TIMEOUT) {
            // Session expired
            session_unset();
            session_destroy();
            return false;
        }
    }
    
    // Validate session fingerprint (IP and User Agent)
    $currentFingerprint = md5($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']);
    if (!isset($_SESSION['fingerprint'])) {
        // Old session without fingerprint, invalidate it
        session_unset();
        session_destroy();
        return false;
    }
    
    if ($_SESSION['fingerprint'] !== $currentFingerprint) {
        // Session hijacking attempt detected
        session_unset();
        session_destroy();
        return false;
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    
    return true;
}

function createSession($adminId, $adminName, $adminUsername) {
    // Regenerate session ID to prevent session fixation
    session_regenerate_id(true);
    
    // Set session variables
    $_SESSION['admin_id'] = $adminId;
    $_SESSION['admin_name'] = $adminName;
    $_SESSION['admin_username'] = $adminUsername;
    $_SESSION['last_activity'] = time();
    $_SESSION['fingerprint'] = md5($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']);
}

// Helper functions
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

function getJSONInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

function isAdminAuthenticated() {
    return validateSession() && isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
}

function requireAdminAuth() {
    if (!isAdminAuthenticated()) {
        sendError('Unauthorized', 401);
    }
}

function getRealIpAddress() {
    // Check for proxy headers in order of preference
    $headers = [
        'HTTP_CF_CONNECTING_IP',    // Cloudflare
        'HTTP_X_REAL_IP',            // Nginx proxy
        'HTTP_X_FORWARDED_FOR',      // Most common proxy header
        'HTTP_CLIENT_IP',            // Proxy servers
        'HTTP_X_FORWARDED',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'                // Fallback to direct connection
    ];
    
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = $_SERVER[$header];
            
            // If X-Forwarded-For contains multiple IPs, take the first one (client IP)
            if ($header === 'HTTP_X_FORWARDED_FOR' && strpos($ip, ',') !== false) {
                $ips = explode(',', $ip);
                $ip = trim($ips[0]);
            }
            
            // Validate IP address
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
            
            // If validation fails but it's still an IP format, use it (for local testing)
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    
    return 'Unknown';
}

function logAuditAction($pdo, $adminId, $action, $description) {
    try {
        $ipAddress = getRealIpAddress();
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (admin_id, action, description, ip_address)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$adminId, $action, $description, $ipAddress]);
    } catch (Exception $e) {
        // Silently fail - don't break the main operation
        error_log('Audit log failed: ' . $e->getMessage());
    }
}
?>
