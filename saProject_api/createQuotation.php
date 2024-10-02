<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "projectSA";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die(json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]));
}

if (!isset($data['productDetailId'], $data['quotationDate'], $data['quotationItems'])) {
    die(json_encode(['error' => 'Missing required fields']));
}

$productDetailId = $conn->real_escape_string($data['productDetailId']);
$quotationDate = $conn->real_escape_string($data['quotationDate']);  
$quotationItems = $data['quotationItems'];

$conn->begin_transaction();

try {
    $countQuery = "SELECT COUNT(*) as count FROM Quotation WHERE productDetailId = ?";
    $stmtCount = $conn->prepare($countQuery);
    $stmtCount->bind_param("s", $productDetailId);
    $stmtCount->execute();
    $resultCount = $stmtCount->get_result();
    $countData = $resultCount->fetch_assoc();
    $existingCount = $countData['count'];

    $quotationId = 'Q' . $productDetailId . '0' . ($existingCount + 1);

    $quotationQuery = "INSERT INTO Quotation (quotationId, productDetailId, quotationDate) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($quotationQuery);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("sss", $quotationId, $productDetailId, $quotationDate); 
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $itemQuery = "INSERT INTO OrderItem (orderItemId, quotationId, itemName, pricePerUnit, quantity) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($itemQuery);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    foreach ($quotationItems as $item) {
        $orderItemId = $conn->real_escape_string($item['orderItemId']);
        $itemName = $conn->real_escape_string($item['itemName']);
        $pricePerUnit = floatval($item['pricePerUnit']);
        $quantity = intval($item['quantity']);

        $stmt->bind_param("sssdi", $orderItemId, $quotationId, $itemName, $pricePerUnit, $quantity);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
    }

    $conn->commit();
    echo json_encode(["message" => "Quotation created successfully!", "quotationId" => $quotationId]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "An error occurred: " . $e->getMessage()]);
}

$conn->close();
?>
