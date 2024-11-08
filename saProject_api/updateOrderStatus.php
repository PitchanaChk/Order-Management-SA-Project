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
    $orderStatus = $data['orderStatus'];

    if (empty($purchaseOrderId) || empty($orderStatus)) {
        echo json_encode(['error' => 'Purchase Order ID and status are required']);
        $conn->close();
        exit;
    }
    $stmt = $conn->prepare("UPDATE PurchaseOrder SET orderStatus = ? WHERE purchaseOrderId = ?");
    $stmt->bind_param("ss", $orderStatus, $purchaseOrderId);

    if ($stmt->execute()) {
        echo json_encode(['success' => 'Status updated successfully']);

        
        if ($orderStatus === "Production Completed") {

            $countQuery = "SELECT COUNT(*) AS count FROM Delivery";
            $result = $conn->query($countQuery);

            if ($result) {
                $row = $result->fetch_assoc();
                $currentCount = (int)$row['count'];
                $deliveryId = 'DEL' . str_pad($currentCount + 1, 3, '00', STR_PAD_LEFT); 
            } else {
                die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
            }

            $deliveryDate = date("Y-m-d"); 

            $stmt_delivery = $conn->prepare("INSERT INTO Delivery (deliveryId, purchaseOrderId, deliveryDate) VALUES (?, ?, ?)");
            $stmt_delivery->bind_param("sss", $deliveryId, $purchaseOrderId, $deliveryDate);

            if ($stmt_delivery->execute()) {
                echo json_encode(['success' => 'Delivery created successfully']);
            } else {
                echo json_encode(['error' => 'Error creating delivery: ' . $stmt_delivery->error]);
            }

            $stmt_delivery->close();
        }

        elseif ($orderStatus === "Delivered") {
            $updateStatusQuery = "UPDATE purchaseOrder SET orderStatus = 'Pending Payment' WHERE purchaseOrderId = ?";
            $stmt_update = $conn->prepare($updateStatusQuery);
            $stmt_update->bind_param("s", $purchaseOrderId);
        
            if ($stmt_update->execute()) {
                $response['success'] .= ', Order status updated to Pending Payment successfully';
            } else {
                $response['error'] = 'Failed to update order status: ' . $stmt_update->error;
            }
        }
        
        
    } else {
        echo json_encode(['error' => 'Error updating status: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
?>
