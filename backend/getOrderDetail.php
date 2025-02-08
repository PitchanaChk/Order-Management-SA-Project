<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");

    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "projectSA";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    try {
        if (isset($_GET['purchaseOrderId'])) {
            $purchaseOrderId = $_GET['purchaseOrderId'];

            $sql = "
                SELECT 
                    Customer.customerTaxId, 
                    Customer.name, 
                    Customer.phone, 
                    Customer.email, 
                    Customer.address,
                    ProductDetails.title, 
                    ProductDetails.description, 
                    ProductDetails.status, 
                    ProductDetails.productPhoto,
                    Quotation.quotationDate,
                    PurchaseOrder.purchaseOrderId, 
                    PurchaseOrder.quotationId, 
                    PurchaseOrder.orderStatus, 
                    PurchaseOrder.purchaseOrderPDF, 
                    PurchaseOrder.datePO
                FROM 
                    PurchaseOrder
                INNER JOIN 
                    Quotation ON PurchaseOrder.quotationId = Quotation.quotationId
                INNER JOIN 
                    ProductDetails ON Quotation.productDetailId = ProductDetails.productDetailId
                INNER JOIN 
                    Customer ON ProductDetails.customerTaxId = Customer.customerTaxId
                WHERE 
                    PurchaseOrder.purchaseOrderId = ?
            ";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $purchaseOrderId);  

            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $orderDetail = $result->fetch_assoc();
                echo json_encode($orderDetail);
            } else {
                echo json_encode(['error' => 'Order not found']);
            }

        } else {
            echo json_encode(['error' => 'Invalid purchaseOrderId']);
        }

    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }

    $conn->close();
?>
