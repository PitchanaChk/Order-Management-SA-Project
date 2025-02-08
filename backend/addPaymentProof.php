<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "projectSA";

$conn = new mysqli($servername, $username, $password, $dbname);


$countQuery = "SELECT COUNT(*) AS count FROM Payment";
    $result = $conn->query($countQuery);

    if ($result) {
        $row = $result->fetch_assoc();
        $currentCount = (int)$row['count'];
        $paymentId = 'PAY' . str_pad($currentCount + 1, 3, '00', STR_PAD_LEFT); 
    } else {
        die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
    }




if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $amount = $_POST['amount'];
    $paymentDateTime = $_POST['transferDate']; 
    $paymentId = $_POST['paymentId']; 
    $purchaseOrderId = $_POST['purchaseOrderId'];

    if (isset($_FILES['transferImage'])) {

        $file = $_FILES['transferImage']; 
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $uniqueFileName = $paymentId . '_' . time() . '.' . $extension;
        $uploadDir = 'uploadsPayment/';
        $uploadFile = $uploadDir . $uniqueFileName; 
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (move_uploaded_file($file['tmp_name'], $uploadFile)) {
            $stmt = $conn->prepare("UPDATE Payment SET amountPaid = ?, paymentDateTime = ?, paymentSlip = ? WHERE paymentId = ?");
            $stmt->bind_param("ssss", $amount, $paymentDateTime, $uploadFile, $paymentId);

            if ($stmt->execute()) {
                $updateStatusStmt = $conn->prepare("UPDATE PurchaseOrder SET orderStatus = ? WHERE purchaseOrderId = ?");
                $newStatus = "Payment Completed";
                $updateStatusStmt->bind_param("ss", $newStatus, $purchaseOrderId); 
                $updateStatusStmt->execute();

                
                $updateStatusStmt->close();

                echo json_encode(['success' => 'Payment proof added successfully and order status updated']);
            } else {
                echo json_encode(['error' => 'Failed to add payment proof: ' . $stmt->error]);
            }

            $stmt->close();
        } else {
            echo json_encode(['error' => 'Failed to upload image']);
        }
    } else {
        echo json_encode(['error' => 'Transfer image not provided']);
    }
}

$conn->close();
?>
