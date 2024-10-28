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
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT 
                d.deliveryId, 
                d.purchaseOrderId, 
                d.deliveryDate, 
                p.orderStatus 
            FROM Delivery d 
            INNER JOIN PurchaseOrder p 
            ON d.purchaseOrderId = p.purchaseOrderId
            WHERE p.orderStatus IN ('Production Completed', 'In Delivery Process')
         ";
    $result = $conn->query($sql);

    $delivery = [];

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $delivery[] = $row;
        }
    } else {
        $delivery = [];
    }

    $conn->close();
    echo json_encode($delivery);
?>
