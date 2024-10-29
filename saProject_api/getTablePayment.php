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

$query = "SELECT 
            p.paymentId, 
            p.purchaseOrderId, 
            p.amountPaid, 
            p.paymentDateTime,
            p.paymentSlip,
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

if (!empty($payments)) {
    foreach ($payments as $payment) {
        $purchaseOrderId = $payment['purchaseOrderId'];

        $updateQuery = "UPDATE PurchaseOrder SET orderStatus = 'Pending Payment' WHERE purchaseOrderId = ?";
        $stmt_update = $conn->prepare($updateQuery);
        $stmt_update->bind_param("s", $purchaseOrderId);

        if ($stmt_update->execute()) {
        } else {
            echo json_encode(['error' => 'Error updating order status: ' . $stmt_update->error]);
        }
        
        $stmt_update->close();
    }
}

$queryPendingPayments = "SELECT 
                            p.paymentId, 
                            p.purchaseOrderId, 
                            p.amountPaid, 
                            p.paymentDateTime,
                            p.paymentSlip,
                            po.orderStatus 
                         FROM Payment p 
                         INNER JOIN PurchaseOrder po 
                         ON p.purchaseOrderId = po.purchaseOrderId
                         WHERE po.orderStatus IN ('Pending Payment', 'Payment Completed')
                         ORDER BY FIELD(po.orderStatus, 'Pending Payment', 'Payment Completed')";


$resultPending = mysqli_query($conn, $queryPendingPayments);

$pendingPayments = [];
while ($row = mysqli_fetch_assoc($resultPending)) {
    $pendingPayments[] = $row;
}

echo json_encode($pendingPayments);

$conn->close();
?>
