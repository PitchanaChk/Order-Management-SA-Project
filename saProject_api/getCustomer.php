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

    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    $sql = "SELECT customerTaxId AS id, name, phone, email, address FROM Customer WHERE customerTaxId = $id";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $customer = $result->fetch_assoc();
        echo json_encode($customer);
    } else {
        echo json_encode(['error' => 'Customer not found']);
    }

    $conn->close();
?>
