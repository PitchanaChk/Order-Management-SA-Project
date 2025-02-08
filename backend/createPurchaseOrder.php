<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

function sendJsonResponse($status, $message, $data = null) {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "projectSA";

    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    if (!isset($_FILES['file']) || !isset($_POST['quotationId'])) {
        throw new Exception('Missing required fields: file, quotationId');
    }

    $countQuery = "SELECT COUNT(*) AS count FROM PurchaseOrder";
    $result = $conn->query($countQuery);

    if ($result) {
        $row = $result->fetch_assoc();
        $currentCount = (int)$row['count'];
        $purchaseOrderId = 'PO' . str_pad($currentCount + 1, 3, '0', STR_PAD_LEFT); 
    } else {
        die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
    }

    $quotationId = $_POST['quotationId'];
    $orderStatus = 'Purchase Order Received';
    $datePO = date('Y-m-d');

    $file = $_FILES['file'];
    if ($file['error'] !== 0) {
        throw new Exception('File upload error code: ' . $file['error']);
    }

    $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only PDF, PNG, and JPEG files are allowed.');
    }

    $uploadDir = __DIR__ . '/uploadsPO/';
    if (!file_exists($uploadDir) && !mkdir($uploadDir, 0777, true)) {
        throw new Exception('Failed to create uploads directory');
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $uniqueFileName = $purchaseOrderId . '_' . time() . '.' . $extension;
    $uploadPath = $uploadDir . $uniqueFileName;
    $dbPath = 'uploadsPO/' . $uniqueFileName;

    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to move uploaded file');
    }

    $stmt = $conn->prepare("INSERT INTO PurchaseOrder (purchaseOrderId, quotationId, orderStatus, purchaseOrderPDF, datePO) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception('Database prepare failed: ' . $conn->error);
    }

    $stmt->bind_param("sssss", $purchaseOrderId, $quotationId, $orderStatus, $dbPath, $datePO);
    
    if (!$stmt->execute()) {
        throw new Exception('Database insert failed: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    sendJsonResponse('success', 'Purchase order created successfully', [
        'pdf_link' => $dbPath,
        'quotationId' => $quotationId
    ]);

} catch (Exception $e) {
    error_log("Upload Error: " . $e->getMessage());
    http_response_code(500);
    sendJsonResponse('error', $e->getMessage());
}
?>
