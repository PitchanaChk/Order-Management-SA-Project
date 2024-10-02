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
    $imageLink = $data['productPhoto'];

    $stmt = $conn->prepare("UPDATE ProductDetails SET productPhoto = ? WHERE productDetailId = ?");
    $stmt->bind_param("ss", $imageLink, $productDetailId);

    if ($stmt->execute()) {
        echo json_encode(['success' => 'Image link updated successfully']);
    } else {
        echo json_encode(['error' => 'Database update error: ' . $stmt->error]);
    }

    $conn->close();
?>
