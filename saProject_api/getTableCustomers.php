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
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT customerTaxId AS id, name, phone, email, address FROM Customer";
    $result = $conn->query($sql);

    $customers = [];

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
    } else {
        $customers = [];
    }

    $conn->close();
    echo json_encode($customers);
?>
