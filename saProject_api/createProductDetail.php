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

    $countQuery = "SELECT COUNT(*) AS count FROM ProductDetails";
    $result = $conn->query($countQuery);

    if ($result) {
        $row = $result->fetch_assoc();
        $currentCount = (int)$row['count'];
        $productDetailId = 'P' . str_pad($currentCount + 1, 3, '0', STR_PAD_LEFT); 
    } else {
        die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $customerTaxId = $data['customerTaxId'];
    $title = $data['title'];
    $description = $data['description'];
    $status = $data['status'];
    $productPhoto = !empty($data['productPhoto']) ? $data['productPhoto'] : null; 

    if (empty($customerTaxId) || empty($title) || empty($description) || empty($status)) {
        echo json_encode(['error' => 'All fields are required']);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO ProductDetails (productDetailId, customerTaxId, title, description, status, productPhoto) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $productDetailId, $customerTaxId, $title, $description, $status, $productPhoto);

    if ($stmt->execute()) {
        echo json_encode(['success' => 'Product created successfully']);
    } else {
        echo json_encode(['error' => 'Error: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
?>
