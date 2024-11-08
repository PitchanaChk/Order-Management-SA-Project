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

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['purchaseOrderId']) && !empty($_GET['purchaseOrderId'])) {
            $purchaseOrderId = $_GET['purchaseOrderId'];

            $sql = "SELECT paymentId, purchaseOrderId, amountPaid, paymentDateTime, paymentSlip 
                    FROM Payment 
                    WHERE purchaseOrderId = ?";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $purchaseOrderId);

            if ($stmt->execute()) {
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $paymentDetails = $result->fetch_assoc();
                    echo json_encode($paymentDetails);
                } else {
                    echo json_encode(["error" => "No payment details found for this order."]);
                }
            } else {
                echo json_encode(["error" => "Failed to execute query."]);
            }

            $stmt->close();
        } else {
            echo json_encode(["error" => "purchaseOrderId parameter is missing or empty."]);
        }
    } else {
        echo json_encode(["error" => "Invalid request method."]);
    }

    $conn->close();
?>
