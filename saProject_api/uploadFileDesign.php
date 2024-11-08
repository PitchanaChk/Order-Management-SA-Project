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

    if (!isset($_FILES['file']) || !isset($_POST['productDetailId'])) {
        throw new Exception('Missing required fields: file or productDetailId');
    }

    $productDetailId = $_POST['productDetailId'];
 
    $sqlCheck = "SELECT productDetailId FROM ProductDetails WHERE productDetailId = ?";
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("s", $productDetailId);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows === 0) {
        throw new Exception('No matching productDetailId found in the database.');
    }
    $stmtCheck->close();

    $file = $_FILES['file'];
    if ($file['error'] !== 0) {
        throw new Exception('File upload error code: ' . $file['error']);
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPG, PNG and PDF files are allowed.');
    }

    $uploadDir = __DIR__ . '/uploadsDesign/';
    if (!file_exists($uploadDir) && !mkdir($uploadDir, 0777, true)) {
        throw new Exception('Failed to create uploads directory');
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $uniqueFileName = $productDetailId . '_' . time() . '.' . $extension;
    $uploadPath = $uploadDir . $uniqueFileName;
    $dbPath = 'uploadsDesign/' . $uniqueFileName;

    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to move uploaded file');
    }

    $stmt = $conn->prepare("UPDATE ProductDetails SET productPhoto = ?, status = 'Designing Completed' WHERE productDetailId = ?");
    if (!$stmt) {
        throw new Exception('Database prepare failed: ' . $conn->error);
    }

    $stmt->bind_param("ss", $dbPath, $productDetailId);
    
    if (!$stmt->execute()) {
        throw new Exception('Database update failed: ' . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('No record was updated. Invalid productDetailId.');
    }

    $stmt->close();
    $conn->close();

    sendJsonResponse('success', 'File uploaded successfully', [
        'image_link' => $dbPath,
        'productDetailId' => $productDetailId
    ]);

} catch (Exception $e) {
    error_log("Upload Error: " . $e->getMessage());
    http_response_code(500);
    sendJsonResponse('error', $e->getMessage());
}
?>
