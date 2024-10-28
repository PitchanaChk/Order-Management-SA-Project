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

    $countQuery = "SELECT COUNT(*) AS count FROM Employees";
    $result = $conn->query($countQuery);

    if ($result) {
        $row = $result->fetch_assoc();
        $currentCount = (int)$row['count'];
        $employeeId = 'EP' . str_pad($currentCount + 1, 3, '0', STR_PAD_LEFT); 
    } else {
        die(json_encode(['error' => 'Failed to count product details: ' . $conn->error]));
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $name = $data['name'];
    $phone = $data['phone'];
    $address = $data['address'];
    $role = $data['role'];
    $username = $data['username'];
    $password = $data['password'];
    

    if (empty($employeeId) || empty($name) || empty($phone) || empty($address) || empty($role) || empty($username) || empty($password) ) {
        echo json_encode(['error' => 'All fields are required']);
        $conn->close();
        exit; 
    }

    $sql = "INSERT INTO Employees (employeeId, name, phone, address, role, username, password)
            VALUES ('$employeeId', '$name', '$phone', '$address', '$role', '$username', '$password')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => 'Customer created successfully']);
    } else {
        echo json_encode(['error' => 'Error: ' . $conn->error]);
    }

    $conn->close();
?>
