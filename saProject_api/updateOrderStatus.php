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
        /*elseif ($orderStatus === "Delivered") {
            $pendingStatus = "Pending Payment";
            $stmt_update = $conn->prepare("UPDATE PurchaseOrder SET orderStatus = ? WHERE purchaseOrderId = ?");
            $stmt_update->bind_param("ss", $pendingStatus, $purchaseOrderId);

            if ($stmt_update->execute()) {
                echo json_encode(['success' => 'Order status updated to Pending Payment']);


                $countQuery = "SELECT COUNT(*) AS count FROM Payment";
                $result = $conn->query($countQuery);

                if ($result) {
                    $row = $result->fetch_assoc();
                    $currentCount = (int)$row['count'];
                    $paymentId = 'PAY' . str_pad($currentCount + 1, 3, '00', STR_PAD_LEFT); 
                } else {
                    die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
                }

                $amountPaid = NULL; 
                $paymentDate = NULL;

                $stmt_payment = $conn->prepare("INSERT INTO Payment (paymentId, purchaseOrderId, amountPaid, paymentDate) VALUES (?, ?, ?, ?)");
                $stmt_payment->bind_param("ssss", $paymentId, $purchaseOrderId, $amountPaid, $paymentDate);

                if ($stmt_payment->execute()) {
                    echo json_encode(['success' => 'Payment created successfully']);
                } else {
                    echo json_encode(['error' => 'Error creating payment: ' . $stmt_payment->error]);
                }

                $stmt_payment->close();
            } else {
                echo json_encode(['error' => 'Error updating order status to Pending Payment: ' . $stmt_update->error]);
            }

            $stmt_update->close();
        }*/
        elseif ($orderStatus === "Delivered") {
            $countQuery = "SELECT COUNT(*) AS count FROM Payment";
            $result = $conn->query($countQuery);

            if ($result) {
                $row = $result->fetch_assoc();
                $currentCount = (int)$row['count'];
                $paymentId = 'PAY' . str_pad($currentCount + 1, 3, '00', STR_PAD_LEFT); 
            } else {
                die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
            }

            $amountPaid = NULL; 
            $paymentDate = NULL;

            $stmt_payment = $conn->prepare("INSERT INTO Payment (paymentId, purchaseOrderId, amountPaid, paymentDate) VALUES (?, ?, ?, ?)");
            $stmt_payment->bind_param("ssss", $paymentId, $purchaseOrderId, $amountPaid, $paymentDate);

            if ($stmt_payment->execute()) {
                echo json_encode(['success' => 'Payment created successfully']);
            } else {
                echo json_encode(['error' => 'Error creating payment: ' . $stmt_payment->error]);
            }
            
        } else {
            echo json_encode(['error' => 'Error updating order status to Pending Payment: ' . $stmt_update->error]);
            $stmt_update->close();
        }
    } else {
        echo json_encode(['error' => 'Error updating status: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
?>
