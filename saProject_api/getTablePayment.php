<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "projectSA";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$productDetailId = $_GET['productDetailId'];

// Query to select payments with orderStatus = Delivered
$query = "SELECT 
            p.paymentId, 
            p.purchaseOrderId, 
            p.amountPaid, 
            po.orderStatus 
          FROM Payment p 
          INNER JOIN PurchaseOrder po 
          ON p.purchaseOrderId = po.purchaseOrderId
          WHERE po.orderStatus = 'Delivered'";

$result = mysqli_query($conn, $query);

$payments = [];
while ($row = mysqli_fetch_assoc($result)) {
    $payments[] = $row;
}

// If we found payments with Delivered status, update to Pending Payment
if (!empty($payments)) {
    foreach ($payments as $payment) {
        $purchaseOrderId = $payment['purchaseOrderId'];

        // Update orderStatus to Pending Payment
        $updateQuery = "UPDATE PurchaseOrder SET orderStatus = 'Pending Payment' WHERE purchaseOrderId = ?";
        $stmt_update = $conn->prepare($updateQuery);
        $stmt_update->bind_param("s", $purchaseOrderId);

        if ($stmt_update->execute()) {
            // You can log the success message if needed
        } else {
            echo json_encode(['error' => 'Error updating order status: ' . $stmt_update->error]);
        }
        
        $stmt_update->close();
    }
}

// Now query to get payments with orderStatus = Pending Payment
$queryPendingPayments = "SELECT 
                            p.paymentId, 
                            p.purchaseOrderId, 
                            p.amountPaid, 
                            po.orderStatus 
                         FROM Payment p 
                         INNER JOIN PurchaseOrder po 
                         ON p.purchaseOrderId = po.purchaseOrderId
                         WHERE po.orderStatus = 'Pending Payment'";

$resultPending = mysqli_query($conn, $queryPendingPayments);

$pendingPayments = [];
while ($row = mysqli_fetch_assoc($resultPending)) {
    $pendingPayments[] = $row;
}

// Return only the pending payments
echo json_encode($pendingPayments);

$conn->close();
?>
