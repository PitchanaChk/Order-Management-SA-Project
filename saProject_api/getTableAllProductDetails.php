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

    $sql = "SELECT productDetailId, title, status, productPhoto 
            FROM ProductDetails 
            WHERE status IN ('Waiting for Design', 'Editing')
            ORDER BY FIELD(status, 'Waiting for Design', 'Editing')";

    $result = $conn->query($sql);

    $productDetailsAll = [];

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $productDetailsAll[] = $row;
        }
    } else {
        $productDetailsAll = [];
    }

    $conn->close();
    echo json_encode($productDetailsAll);
?>
