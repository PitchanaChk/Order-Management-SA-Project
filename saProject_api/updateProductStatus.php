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
    $productDetailId = $data['productDetailId'];
    $status = $data['status'];

    if (empty($productDetailId) || empty($status)) {
        echo json_encode(['error' => 'Product ID and status are required']);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("UPDATE ProductDetails SET status = ? WHERE productDetailId = ?");
    $stmt->bind_param("ss", $status, $productDetailId);

    if ($stmt->execute()) {
        echo json_encode(['success' => 'Status updated successfully']);
    } else {
        echo json_encode(['error' => 'Error: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
?>
