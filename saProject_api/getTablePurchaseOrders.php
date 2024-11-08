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

    $query = "SELECT purchaseOrderId, quotationId, orderStatus, purchaseOrderPDF
              FROM PurchaseOrder 
              ORDER BY FIELD(orderStatus, 
                  'Purchase Order Received', 
                  'Editing', 
                  'Production Completed', 
                  'Edit Product', 
                  'Delivered', 
                  'Pending Payment', 
                  'Payment Completed')";


    $result = mysqli_query($conn, $query);

    $quotations = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $quotations[] = $row;
    }

    echo json_encode($quotations);
?>
