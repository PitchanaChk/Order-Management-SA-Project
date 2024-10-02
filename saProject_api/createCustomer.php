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

    $customerTaxId = $data['customerTaxId'];
    $name = $data['name'];
    $phone = $data['phone'];
    $email = $data['email'];
    $address = $data['address'];

    if (empty($customerTaxId) || empty($name) || empty($phone) || empty($email) || empty($address)) {
        echo json_encode(['error' => 'All fields are required']);
        $conn->close();
        exit; 
    }

    $sql = "INSERT INTO Customer (customerTaxId, name, phone, email, address)
            VALUES ('$customerTaxId', '$name', '$phone', '$email', '$address')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => 'Customer created successfully']);
    } else {
        echo json_encode(['error' => 'Error: ' . $conn->error]);
    }

    $conn->close();
?>
