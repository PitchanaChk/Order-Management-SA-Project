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

    if (isset($_GET['quotationId'])) {
        $quotationId = $_GET['quotationId'];

        // Query to fetch quotation details
        $quotationQuery = "SELECT quotationId, quotationDate, statusQuotation FROM Quotation WHERE quotationId = ?";
        $itemsQuery = "SELECT orderItemId, itemName, pricePerUnit, quantity FROM OrderItem WHERE quotationId = ?";

        if ($stmt = $conn->prepare($quotationQuery)) {
            $stmt->bind_param("s", $quotationId);
            $stmt->execute();
            $result = $stmt->get_result();
            $quotation = $result->fetch_assoc();
            $stmt->close();
        }

        if ($stmt = $conn->prepare($itemsQuery)) {
            $stmt->bind_param("s", $quotationId);
            $stmt->execute();
            $result = $stmt->get_result();
            $items = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
        }

        if ($quotation) {
            // Combine quotation details with its items
            $quotation['items'] = $items;
            echo json_encode($quotation);
        } else {
            echo json_encode(['error' => 'Quotation not found']);
        }
    } else {
        echo json_encode(['error' => 'Quotation ID is required']);
    }
?>
