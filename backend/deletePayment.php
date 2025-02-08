<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "projectSA";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
$purchaseOrderId = $data['purchaseOrderId'];

if (empty($purchaseOrderId)) {
    echo json_encode(['error' => 'Purchase Order ID is required']);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("DELETE FROM Payment WHERE purchaseOrderId = ?");
$stmt->bind_param("s", $purchaseOrderId);

if ($stmt->execute()) {
    echo json_encode(['success' => 'Payment record deleted successfully']);
} else {
    echo json_encode(['error' => 'Failed to delete payment record: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
