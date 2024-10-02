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

    $productDetailId = isset($_GET['id']) ? $_GET['id'] : '';

    $sql = "SELECT productDetailId, customerTaxId, title, description, status, productPhoto FROM ProductDetails WHERE productDetailId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $productDetailId);
    $stmt->execute();
    $result = $stmt->get_result();

    $product = $result->fetch_assoc();

    if ($product) {
        echo json_encode($product);
    } else {
        echo json_encode(['error' => 'Product not found']);
    }

    $stmt->close();
    $conn->close();
?>
