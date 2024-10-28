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

    $username = $_GET['username'] ?? null; 
    $result = array();

    if ($username) {
        $sql = $conn->prepare("SELECT name FROM Employees WHERE username = ?");
        $sql->bind_param("s", $username);
        $sql->execute();
        $res = $sql->get_result();

        if ($res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $result = array("name" => $row['name']);
        } else {
            $result = array("name" => null); // No user found
        }
    } else {
        $result = array("error" => "No username provided");
    }

    $conn->close();
    $response[] = array("result" => $result);
    echo json_encode($response);
?>
